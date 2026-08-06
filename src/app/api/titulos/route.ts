import { db } from "@/db";
import { cliente, contrato, titulo } from "@/db/schema";
import {
  emitirTitulo,
  EmitirTituloParams,
  formatStatus,
  Pagador,
} from "@/lib/unicred";
import { buildPaginatedResponse, ilike } from "@/lib/pagination";
import { createTituloSchema, listTitulosQuerySchema } from "@/lib/schemas";
import { count, desc, eq, and, or } from "drizzle-orm";
import { NextResponse } from "next/server";

function limparDocumento(documento: string): string {
  return documento.replace(/\D/g, "");
}

function ultimoDiaDoMes(referenciaMes: string): string {
  const [ano, mes] = referenciaMes.split("-").map(Number);
  const data = new Date(ano, mes, 0);
  return data.toISOString().split("T")[0];
}

function gerarSeuNumero(idContrato: number, referenciaMes: string): string {
  const numero = `C${idContrato}-${referenciaMes.replace("-", "")}`;
  return numero.slice(0, 15);
}

function parseEndereco(endereco: string) {
  const padrao = /^(.*?),?\s*(\d+)\s*-?\s*(.*?)\s*-?\s*(.*?)\s*-\s*([A-Z]{2})\s*(\d{8})?$/i;
  const match = endereco.match(padrao);

  if (match) {
    return {
      logradouro: match[1]?.trim() || endereco,
      numero: match[2]?.trim() || "0",
      bairro: match[3]?.trim() || "Centro",
      cidade: match[4]?.trim() || "Cidade",
      uf: match[5]?.toUpperCase() || "SP",
      cep: limparDocumento(match[6] || "00000000"),
    };
  }

  return {
    logradouro: endereco,
    numero: "0",
    bairro: "Centro",
    cidade: "Cidade",
    uf: "SP",
    cep: "00000000",
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search, status, referenciaMes } =
      listTitulosQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        search: searchParams.get("search") || "",
        status: searchParams.get("status") || undefined,
        referenciaMes: searchParams.get("referenciaMes") || undefined,
      });

    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(cliente.razaoSocial, search),
          ilike(contrato.razaoSocialCliente, search),
          ilike(titulo.seuNumero, search),
        ),
      );
    }

    if (status) {
      whereConditions.push(eq(titulo.status, status));
    }

    if (referenciaMes) {
      whereConditions.push(eq(titulo.referenciaMes, referenciaMes));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(titulo)
      .leftJoin(contrato, eq(titulo.idContrato, contrato.id))
      .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: titulo.id,
        idContrato: titulo.idContrato,
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
        clienteNome: contrato.razaoSocialCliente,
      })
      .from(titulo)
      .leftJoin(contrato, eq(titulo.idContrato, contrato.id))
      .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
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

    const [tituloExistente] = await db
      .select({ id: titulo.id })
      .from(titulo)
      .where(
        and(
          eq(titulo.idContrato, data.idContrato),
          eq(titulo.referenciaMes, data.referenciaMes),
        ),
      );

    if (tituloExistente) {
      return NextResponse.json(
        { error: "Já existe um título para este contrato e mês de referência" },
        { status: 409 },
      );
    }

    const vencimento = ultimoDiaDoMes(data.referenciaMes);
    const seuNumero = gerarSeuNumero(data.idContrato, data.referenciaMes);
    const valor = Number(contratoAtual.valorTotal);

    const endereco = parseEndereco(clienteAtual.endereco);

    const pagador: Pagador = {
      nomeRazaoSocial: clienteAtual.razaoSocial,
      tipoPessoa: clienteAtual.entidadeJuridica ? "J" : "F",
      tipoDocumento: clienteAtual.entidadeJuridica ? "CNPJ" : "CPF",
      numeroDocumento: limparDocumento(clienteAtual.documento),
      nomeFantasia: clienteAtual.entidadeJuridica
        ? clienteAtual.razaoSocialRepresentante || clienteAtual.razaoSocial
        : undefined,
      email: clienteAtual.email,
      endereco: {
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
        cep: endereco.cep,
      },
    };

    const params: EmitirTituloParams = {
      seuNumero,
      valor,
      vencimento,
      pagador,
    };

    const resposta = await emitirTitulo(params);

    const [novoTitulo] = await db
      .insert(titulo)
      .values({
        idContrato: data.idContrato,
        idUnicred: resposta.id_titulo,
        seuNumero,
        valor,
        vencimento: new Date(vencimento),
        status: "EM_PROCESSAMENTO",
        referenciaMes: data.referenciaMes,
      })
      .returning();

    return NextResponse.json(
      {
        ...novoTitulo,
        statusFormatado: formatStatus(novoTitulo.status),
        respostaUnicred: resposta,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar título:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar título",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
