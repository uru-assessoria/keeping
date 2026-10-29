import { db } from "@/db";
import { cliente, titulo } from "@/db/schema";
import { emitirTitulo, EmitirTituloParams, formatStatus } from "@/lib/unicred";
import { createTituloManualSchema } from "@/lib/schemas";
import { gerarSeuNumeroManual, montarPagador } from "@/lib/titulo-helpers";
import { getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!rateLimit(`titulo-manual:${session?.id ?? "anonimo"}`, 20, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Limite de emissões manuais por hora excedido" },
        { status: 429 },
      );
    }

    const body = await request.json();
    const data = createTituloManualSchema.parse(body);

    const [clienteAtual] = await db
      .select({
        id: cliente.id,
        razaoSocial: cliente.razaoSocial,
        documento: cliente.documento,
        email: cliente.email,
        endereco: cliente.endereco,
        entidadeJuridica: cliente.entidadeJuridica,
        razaoSocialRepresentante: cliente.razaoSocialRepresentante,
        ativo: cliente.ativo,
      })
      .from(cliente)
      .where(eq(cliente.id, data.idCliente));

    if (!clienteAtual) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    if (!clienteAtual.ativo) {
      return NextResponse.json({ error: "Cliente está inativo" }, { status: 400 });
    }

    const seuNumero = gerarSeuNumeroManual(clienteAtual.id);
    const referenciaMes = data.vencimento.slice(0, 7);
    const pagador = montarPagador(clienteAtual);

    // Insere antes de chamar a Unicred: se a emissão falhar depois, o título
    // local fica registrado como REJEITADO em vez de órfão na Unicred.
    const [novoTitulo] = await db
      .insert(titulo)
      .values({
        idContrato: null,
        idCliente: clienteAtual.id,
        origem: "MANUAL",
        descricao: data.descricao || null,
        seuNumero,
        valor: data.valor,
        vencimento: new Date(data.vencimento),
        status: "EM_PROCESSAMENTO",
        referenciaMes,
      })
      .returning();

    const params: EmitirTituloParams = {
      seuNumero,
      valor: data.valor,
      vencimento: data.vencimento,
      pagador,
      jurosValor: data.jurosValor,
      multaValor: data.multaValor,
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
      console.error(`Erro ao emitir título manual ${novoTitulo.id} na Unicred:`, emissaoError);
      return NextResponse.json(
        { error: "Erro ao emitir título na Unicred", tituloId: novoTitulo.id },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Erro ao criar título manual:", error);
    return NextResponse.json({ error: "Erro ao criar título manual" }, { status: 500 });
  }
}
