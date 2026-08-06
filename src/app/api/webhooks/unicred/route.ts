import { db } from "@/db";
import { titulo } from "@/db/schema";
import { decryptWebhook, mapWebhookStatus, UnicredWebhookPayload } from "@/lib/unicred";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import crypto from "crypto";

const UNICRED_WEBHOOK_API_KEY = process.env.UNICRED_WEBHOOK_API_KEY;
const UNICRED_WEBHOOK_SECRET_KEY = process.env.UNICRED_WEBHOOK_SECRET_KEY;

export async function POST(request: Request) {
  const responseUuid = crypto.randomUUID();

  try {
    const apiKey = request.headers.get("x-api-key");

    if (!UNICRED_WEBHOOK_API_KEY || !UNICRED_WEBHOOK_SECRET_KEY) {
      console.error("Configuração de webhook Unicred ausente");
      return new NextResponse(responseUuid, {
        status: 202,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (apiKey !== UNICRED_WEBHOOK_API_KEY) {
      console.error("Webhook Unicred: x-api-key inválido");
      return new NextResponse(responseUuid, {
        status: 202,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const encryptedPayload = await request.text();
    if (!encryptedPayload) {
      console.error("Webhook Unicred: payload vazio");
      return new NextResponse(responseUuid, {
        status: 202,
        headers: { "Content-Type": "text/plain" },
      });
    }

    let payload: UnicredWebhookPayload;
    try {
      payload = decryptWebhook(
        encryptedPayload,
        UNICRED_WEBHOOK_API_KEY,
        UNICRED_WEBHOOK_SECRET_KEY,
      );
    } catch (decryptError) {
      console.error("Webhook Unicred: erro ao descriptografar payload", decryptError);
      return new NextResponse(responseUuid, {
        status: 202,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (!payload?.titulo?.uuidTitulo) {
      console.error("Webhook Unicred: payload sem uuidTitulo");
      return new NextResponse(responseUuid, {
        status: 202,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const status = mapWebhookStatus(payload.titulo.codigoSituacao);

    const [tituloExistente] = await db
      .select({ id: titulo.id })
      .from(titulo)
      .where(eq(titulo.idUnicred, payload.titulo.uuidTitulo));

    if (tituloExistente) {
      await db
        .update(titulo)
        .set({
          status,
          statusUnicred: status,
          codigoBarras: payload.titulo.codigoBarras || null,
          linhaDigitavel: payload.titulo.linhaDigitavel || null,
          nossoNumero: payload.titulo.nossoNumero || null,
          qrCodePix: payload.titulo.qrCodePix || null,
          idempotenciaWebhook: payload.uuidRequisicaoWebhook || null,
          dataAtualizacao: new Date(),
        })
        .where(eq(titulo.id, tituloExistente.id));
    } else {
      // Tenta localizar pelo seuNumero como fallback
      const [porSeuNumero] = await db
        .select({ id: titulo.id })
        .from(titulo)
        .where(eq(titulo.seuNumero, payload.titulo.seuNumero));

      if (porSeuNumero) {
        await db
          .update(titulo)
          .set({
            idUnicred: payload.titulo.uuidTitulo,
            status,
            statusUnicred: status,
            codigoBarras: payload.titulo.codigoBarras || null,
            linhaDigitavel: payload.titulo.linhaDigitavel || null,
            nossoNumero: payload.titulo.nossoNumero || null,
            qrCodePix: payload.titulo.qrCodePix || null,
            idempotenciaWebhook: payload.uuidRequisicaoWebhook || null,
            dataAtualizacao: new Date(),
          })
          .where(eq(titulo.id, porSeuNumero.id));
      } else {
        console.warn(
          `Webhook Unicred: título não encontrado para uuid ${payload.titulo.uuidTitulo} / seuNumero ${payload.titulo.seuNumero}`,
        );
      }
    }

    return new NextResponse(responseUuid, {
      status: 202,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Webhook Unicred: erro inesperado", error);
    return new NextResponse(responseUuid, {
      status: 202,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
