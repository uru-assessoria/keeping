import { db } from "@/db";
import { titulo } from "@/db/schema";
import { consultarStatus, formatStatus } from "@/lib/unicred";
import { deveAplicarNovoStatus } from "@/lib/titulo-helpers";
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

    const [tituloAtual] = await db
      .select({
        id: titulo.id,
        idUnicred: titulo.idUnicred,
        status: titulo.status,
      })
      .from(titulo)
      .where(eq(titulo.id, tituloId));

    if (!tituloAtual) {
      return NextResponse.json({ error: "Título não encontrado" }, { status: 404 });
    }

    if (!tituloAtual.idUnicred) {
      return NextResponse.json(
        { error: "Título ainda não possui ID da Unicred" },
        { status: 400 },
      );
    }

    const statusUnicred = await consultarStatus(tituloAtual.idUnicred);

    const statusConsultado = mapStatus(statusUnicred.status || tituloAtual.status);
    // Polling não pode regredir um status mais avançado já confirmado por
    // webhook (ex.: EM_PROCESSAMENTO atrasado chegando depois de LIQUIDADO).
    const novoStatus = deveAplicarNovoStatus(tituloAtual.status, statusConsultado)
      ? statusConsultado
      : tituloAtual.status;

    const [atualizado] = await db
      .update(titulo)
      .set({
        status: novoStatus,
        statusUnicred: statusUnicred.status || tituloAtual.status,
        codigoBarras: statusUnicred.codBarras || null,
        linhaDigitavel: statusUnicred.linhaDigitavel || null,
        nossoNumero: statusUnicred.nossoNumero || null,
        qrCodePix: statusUnicred.qrCodePix || null,
        dataAtualizacao: new Date(),
      })
      .where(eq(titulo.id, tituloId))
      .returning();

    return NextResponse.json({
      ...atualizado,
      statusFormatado: formatStatus(atualizado.status),
      statusUnicred: statusUnicred,
    });
  } catch (error) {
    console.error("Erro ao consultar status do título:", error);
    return NextResponse.json(
      { error: "Erro ao consultar status do título" },
      { status: 500 },
    );
  }
}

function mapStatus(statusUnicred?: string): string {
  switch (statusUnicred) {
    case "ABERTO":
      return "ABERTO";
    case "LIQUIDADO":
      return "LIQUIDADO";
    case "BAIXADO":
      return "BAIXADO";
    case "EM_PROCESSAMENTO":
      return "EM_PROCESSAMENTO";
    default:
      return statusUnicred || "EM_PROCESSAMENTO";
  }
}
