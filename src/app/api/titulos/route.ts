import { db } from "@/db";
import { cliente, contrato, titulo } from "@/db/schema";
import { emitirTitulo, EmitirTituloParams, formatStatus } from "@/lib/unicred";
import { buildPaginatedResponse, ilike } from "@/lib/pagination";
import { createTituloSchema, listTitulosQuerySchema } from "@/lib/schemas";
import {
  gerarSeuNumero,
  montarPagador,
  ultimoDiaDoMes,
} from "@/lib/titulo-helpers";
import { count, desc, eq, and, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search, status, referenciaMes, origem } =
      listTitulosQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        search: searchParams.get("search") || "",
        status: searchParams.get("status") || undefined,
        referenciaMes: searchParams.get("referenciaMes") || undefined,
        origem: searchParams.get("origem") || undefined,
      });

    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(cliente.razaoSocial, search),
          ilike(titulo.seuNumero, search),
          ilike(titulo.descricao, search),
        ),
      );
    }

    if (status) {
      whereConditions.push(eq(titulo.status, status));
    }

    if (referenciaMes) {
      whereConditions.push(eq(titulo.referenciaMes, referenciaMes));
    }

    if (origem) {
      whereConditions.push(eq(titulo.origem, origem));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(titulo)
      .leftJoin(cliente, eq(titulo.idCliente, cliente.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: titulo.id,
        idContrato: titulo.idContrato,
        idCliente: titulo.idCliente,
        origem: titulo.origem,
        descricao: titulo.descricao,
        idUnicred: titulo.idUnicred,
        seuNumero: titulo.seuNumero,
        valor: titulo.valor,
        vencimento: titulo.vencimento,
        status: titulo.status,
        statusUnicred: titulo.statusUnicred,
        referenciaMes: titulo.referenciaMes,
        codigoBarras: titulo.codigoBarras,
        linhaDigitavel: titulo.linhaDigitavel,
        nossoNumero: titulo.nossoNumero,
        qrCodePix: titulo.qrCodePix,
        dataCriacao: titulo.dataCriacao,
        dataAtualizacao: titulo.dataAtualizacao,
        clienteNome: cliente.razaoSocial,
      })
      .from(titulo)
      .leftJoin(cliente, eq(titulo.idCliente, cliente.id))
      .where(whereClause)
      .orderBy(desc(titulo.id))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(buildPaginatedResponse(rows, totalResult.count, page, limit));
  } catch (error) {
    console.error("Erro ao listar títulos:", error);
    return NextResponse.json(
      { error: "Erro ao listar títulos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createTituloSchema.parse(body);

    const [contratoAtual] = await db
      .select({
        id: contrato.id,
        idCliente: contrato.idCliente,
        valorTotal: contrato.valorTotal,
        status: contrato.status,
        razaoSocialCliente: contrato.razaoSocialCliente,
        formalizacao: contrato.formalizacao,
        vencimento: contrato.vencimento,
      })
      .from(contrato)
      .where(eq(contrato.id, data.idContrato));

    if (!contratoAtual) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 },
      );
    }

    if (contratoAtual.status !== "signed") {
      return NextResponse.json(
        { error: "O contrato precisa estar assinado para gerar título" },
        { status: 400 },
      );
    }

    const mesFormalizacao = contratoAtual.formalizacao.toISOString().slice(0, 7);
    const mesVencimentoContrato = contratoAtual.vencimento.toISOString().slice(0, 7);
    if (data.referenciaMes < mesFormalizacao || data.referenciaMes > mesVencimentoContrato) {
      return NextResponse.json(
        {
          error: `O mês de referência deve estar entre ${mesFormalizacao} e ${mesVencimentoContrato} (vigência do contrato)`,
        },
        { status: 400 },
      );
    }

    const [clienteAtual] = await db
      .select({
        razaoSocial: cliente.razaoSocial,
        documento: cliente.documento,
        email: cliente.email,
        endereco: cliente.endereco,
        entidadeJuridica: cliente.entidadeJuridica,
        razaoSocialRepresentante: cliente.razaoSocialRepresentante,
      })
      .from(cliente)
      .where(eq(cliente.id, contratoAtual.idCliente));

    if (!clienteAtual) {
      return NextResponse.json(
        { error: "Cliente do contrato não encontrado" },
        { status: 404 },
      );
    }

    const vencimento = ultimoDiaDoMes(data.referenciaMes);
    const seuNumero = gerarSeuNumero(data.idContrato, data.referenciaMes);
    const valor = Number(contratoAtual.valorTotal);
    // Valida o pagador (pode lançar por CPF/CNPJ inválido) antes de inserir
    // qualquer registro local.
    const pagador = montarPagador(clienteAtual);

    // Insere o título localmente ANTES de chamar a Unicred: a constraint
    // única (id_contrato, referencia_mes) decide atomicamente quem "ganha"
    // sob concorrência, e evita título órfão na Unicred se o INSERT falhar
    // depois da emissão (o contrário do fluxo anterior).
    let novoTitulo;
    try {
      [novoTitulo] = await db
        .insert(titulo)
        .values({
          idContrato: data.idContrato,
          idCliente: contratoAtual.idCliente,
          origem: "CONTRATO",
          seuNumero,
          valor,
          vencimento: new Date(vencimento),
          status: "EM_PROCESSAMENTO",
          referenciaMes: data.referenciaMes,
        })
        .returning();
    } catch (insertError) {
      if ((insertError as { code?: string }).code === "23505") {
        return NextResponse.json(
          { error: "Já existe um título para este contrato e mês de referência" },
          { status: 409 },
        );
      }
      throw insertError;
    }

    const params: EmitirTituloParams = {
      seuNumero,
      valor,
      vencimento,
      pagador,
    };

    try {
      const resposta = await emitirTitulo(params);

      const [atualizado] = await db
        .update(titulo)
        .set({ idUnicred: resposta.id_titulo, dataAtualizacao: new Date() })
        .where(eq(titulo.id, novoTitulo.id))
        .returning();

      return NextResponse.json(
        {
          ...atualizado,
          statusFormatado: formatStatus(atualizado.status),
          respostaUnicred: resposta,
        },
        { status: 201 },
      );
    } catch (emissaoError) {
      const mensagem =
        emissaoError instanceof Error ? emissaoError.message : "Erro desconhecido";
      await db
        .update(titulo)
        .set({ status: "REJEITADO", mensagemErro: mensagem, dataAtualizacao: new Date() })
        .where(eq(titulo.id, novoTitulo.id));
      console.error(`Erro ao emitir título ${novoTitulo.id} na Unicred:`, emissaoError);
      return NextResponse.json(
        { error: "Erro ao emitir título na Unicred", tituloId: novoTitulo.id },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Erro ao criar título:", error);
    return NextResponse.json({ error: "Erro ao criar título" }, { status: 500 });
  }
}
