import { db } from "@/db";
import { cliente, contrato, itemContrato } from "@/db/schema";
import { updateContratoSchema } from "@/lib/schemas";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const sql = neon(`${process.env.DATABASE_URL}`);

function calcularVencimento(
  dataFormalizacao: Date,
  entidadeJuridica: boolean | null,
): string {
  const data = dataFormalizacao;
  const meses = entidadeJuridica ? 24 : 12;
  data.setMonth(data.getMonth() + meses);
  return data.toISOString().split("T")[0];
}

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const contratoId = Number(id);

  const rows = await db
    .select({
      id: contrato.id,
      idCliente: contrato.idCliente,
      valorPlano: contrato.valorPlano,
      formalizacao: contrato.formalizacao,
      clienteNome: cliente.razaoSocial,
      entidadeJuridica: cliente.entidadeJuridica,
    })
    .from(contrato)
    .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
    .where(eq(contrato.id, contratoId));

  if (rows.length === 0)
    return NextResponse.json(
      { error: "Contrato não encontrado" },
      { status: 404 },
    );

  const itens = await db
    .select({
      id: itemContrato.id,
      idContrato: itemContrato.idContrato,
      numeroProvisorio: itemContrato.numeroProvisorio,
      idProduto: itemContrato.idProduto,
    })
    .from(itemContrato)
    .where(eq(itemContrato.idContrato, contratoId));

  const vencimento = calcularVencimento(
    rows[0].formalizacao,
    rows[0].entidadeJuridica,
  );

  return NextResponse.json({
    contrato: { ...rows[0], vencimento },
    itens,
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const contratoId = Number(id);
    const data = updateContratoSchema.parse(body);

    if (
      !body.idCliente ||
      body.taxaManutencao === undefined ||
      !body.formalizacao
    ) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 },
      );
    }

    if (data.idCliente || data.valorPlano || data.formalizacao) {
      await db
        .update(contrato)
        .set({
          ...(data.idCliente && { idCliente: data.idCliente }),
          ...(data.valorPlano && { valorPlano: data.valorPlano }),
          ...(data.formalizacao && {
            formalizacao: new Date(data.formalizacao),
          }),
        })
        .where(eq(contrato.id, contratoId));
    }

    if (data.itens) {
      await db
        .delete(itemContrato)
        .where(eq(itemContrato.idContrato, contratoId));

      if (data.itens.length > 0) {
        await db.insert(itemContrato).values(
          data.itens.map((item) => ({
            idContrato: contratoId,
            numeroProvisorio: item.numeroProvisorio,
            idProduto: item.idProduto,
          })),
        );
      }
    }

    return NextResponse.json({ message: "Contrato atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar contrato:", error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar contrato",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const contratoId = Number(id);

  await db.delete(itemContrato).where(eq(itemContrato.idContrato, contratoId));
  await db.delete(contrato).where(eq(contrato.id, contratoId));

  return NextResponse.json({ message: "Contrato excluído com sucesso" });
}
