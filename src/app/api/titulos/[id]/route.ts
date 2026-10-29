import { db } from "@/db";
import { cliente, contrato, titulo } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tituloId = Number(id);

    if (Number.isNaN(tituloId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [row] = await db
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
        mensagemErro: titulo.mensagemErro,
        contrato: {
          id: contrato.id,
          status: contrato.status,
          valorTotal: contrato.valorTotal,
          formalizacao: contrato.formalizacao,
          vencimento: contrato.vencimento,
        },
        cliente: {
          razaoSocial: cliente.razaoSocial,
          documento: cliente.documento,
          email: cliente.email,
          telefone: cliente.telefone,
        },
      })
      .from(titulo)
      .leftJoin(cliente, eq(titulo.idCliente, cliente.id))
      .leftJoin(contrato, eq(titulo.idContrato, contrato.id))
      .where(eq(titulo.id, tituloId));

    if (!row) {
      return NextResponse.json({ error: "Título não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...row,
      contrato: row.contrato?.id ? row.contrato : null,
    });
  } catch (error) {
    console.error("Erro ao buscar título:", error);
    return NextResponse.json(
      { error: "Erro ao buscar título" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tituloId = Number(id);

    if (Number.isNaN(tituloId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [tituloAtual] = await db
      .select({ id: titulo.id, status: titulo.status })
      .from(titulo)
      .where(eq(titulo.id, tituloId));

    if (!tituloAtual) {
      return NextResponse.json({ error: "Título não encontrado" }, { status: 404 });
    }

    if (tituloAtual.status === "LIQUIDADO") {
      return NextResponse.json(
        { error: "Título liquidado não pode ser excluído" },
        { status: 400 },
      );
    }

    // Exclusão lógica: preserva o registro financeiro para auditoria em vez
    // de apagar fisicamente a linha.
    await db
      .update(titulo)
      .set({ status: "CANCELADO", dataAtualizacao: new Date() })
      .where(eq(titulo.id, tituloId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir título:", error);
    return NextResponse.json(
      { error: "Erro ao excluir título" },
      { status: 500 },
    );
  }
}
