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
      .leftJoin(contrato, eq(titulo.idContrato, contrato.id))
      .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
      .where(eq(titulo.id, tituloId));

    if (!row) {
      return NextResponse.json({ error: "Título não encontrado" }, { status: 404 });
    }

    return NextResponse.json(row);
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

    await db.delete(titulo).where(eq(titulo.id, tituloId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir título:", error);
    return NextResponse.json(
      { error: "Erro ao excluir título" },
      { status: 500 },
    );
  }
}
