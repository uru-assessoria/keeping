import { db } from "@/db";
import { cliente, titulo } from "@/db/schema";
import { emitirTitulo, EmitirTituloParams, formatStatus } from "@/lib/unicred";
import { createTituloManualSchema } from "@/lib/schemas";
import { gerarSeuNumeroManual, montarPagador } from "@/lib/titulo-helpers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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

    const params: EmitirTituloParams = {
      seuNumero,
      valor: data.valor,
      vencimento: data.vencimento,
      pagador,
      jurosValor: data.jurosValor,
      multaValor: data.multaValor,
    };

    const resposta = await emitirTitulo(params);

    const [novoTitulo] = await db
      .insert(titulo)
      .values({
        idContrato: null,
        idCliente: clienteAtual.id,
        origem: "MANUAL",
        descricao: data.descricao || null,
        idUnicred: resposta.id_titulo,
        seuNumero,
        valor: data.valor,
        vencimento: new Date(data.vencimento),
        status: "EM_PROCESSAMENTO",
        referenciaMes,
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
    console.error("Erro ao criar título manual:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar título manual",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
