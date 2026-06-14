import { db } from "@/db";
import { contrato } from "@/db/schema";
import { getDocumentStatus } from "@/lib/zapsign";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const contratoId = parseInt(id);

    if (isNaN(contratoId)) {
      return NextResponse.json(
        { error: "ID do contrato inválido" },
        { status: 400 }
      );
    }

    const [contratoRow] = await db
      .select({ zapsignDocumentToken: contrato.zapsignDocumentToken, status: contrato.status })
      .from(contrato)
      .where(eq(contrato.id, contratoId));

    if (!contratoRow) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (!contratoRow.zapsignDocumentToken) {
      return NextResponse.json(
        { error: "Contrato ainda não foi enviado para assinatura" },
        { status: 400 }
      );
    }

    const zapsignDoc = await getDocumentStatus(contratoRow.zapsignDocumentToken);

    // Mapeia status do ZapSign para o domínio do contrato
    const novoStatus = zapsignDoc.status === "completed" || zapsignDoc.status === "signed"
      ? "signed"
      : zapsignDoc.status === "rejected" || zapsignDoc.status === "cancelled"
      ? "rejected"
      : "pending";

    if (novoStatus !== contratoRow.status) {
      await db
        .update(contrato)
        .set({ status: novoStatus })
        .where(eq(contrato.id, contratoId));
    }

    return NextResponse.json({ status: novoStatus });
  } catch (error) {
    console.error("Erro ao verificar status do documento:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Erro ao verificar status", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro desconhecido ao verificar status" },
      { status: 500 }
    );
  }
}
