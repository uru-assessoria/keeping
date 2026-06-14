import { db } from "@/db";
import {
  cliente,
  contrato,
  itemContrato,
  produto,
} from "@/db/schema";
import {
  submitForSignature,
  SubmitSignatureParams,
} from "@/lib/zapsign";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

interface SubmitSignatureRequest {
  pdfBase64: string;
}

export async function POST(
  request: Request,
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

    const body: SubmitSignatureRequest = await request.json();
    
    if (!body.pdfBase64) {
      return NextResponse.json(
        { error: "PDF em base64 é obrigatório" },
        { status: 400 }
      );
    }

    // Fetch contrato com cliente
    const contratoData = await db
      .select()
      .from(contrato)
      .where(eq(contrato.id, contratoId))
      .leftJoin(cliente, eq(contrato.idCliente, cliente.id));

    if (contratoData.length === 0) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    const contratoRow = contratoData[0];
    const clienteRow = contratoRow.cliente;

    if (!clienteRow) {
      return NextResponse.json(
        { error: "Cliente do contrato não encontrado" },
        { status: 404 }
      );
    }

    if (!clienteRow.email) {
      return NextResponse.json(
        { error: "Cliente não possui email cadastrado" },
        { status: 400 }
      );
    }

    // Submit to Zapsign
    const submitParams: SubmitSignatureParams = {
      pdfBase64: body.pdfBase64,
      documentName: `Contrato #${contratoId} - ${clienteRow.razaoSocial}`,
      signerPhone: clienteRow.telefone,
      signerEmail: clienteRow.email,
      signerName: clienteRow.razaoSocialRepresentante || clienteRow.razaoSocial,
    };

    //console.log('param',submitParams);

    const zapsignResponse = await submitForSignature(submitParams);

    const signerToken = zapsignResponse.signers[0]?.token || "";
    const signUrl = zapsignResponse.signers[0]?.sign_url || "";

    await db
      .update(contrato)
      .set({
        zapsignDocumentToken: zapsignResponse.token,
        status: zapsignResponse.status,
      })
      .where(eq(contrato.id, contratoId));

    return NextResponse.json(
      {
        success: true,
        document: {
          ///id: stored[0]?.id,
          documentToken: zapsignResponse.token,
          status: zapsignResponse.status,
          signUrl,
          message:
            "Documento enviado para assinatura com sucesso. Link enviado por email e WhatsApp.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao submeter contrato para assinatura:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Erro ao submeter contrato para assinatura",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro desconhecido ao submeter contrato para assinatura" },
      { status: 500 }
    );
  }
}
