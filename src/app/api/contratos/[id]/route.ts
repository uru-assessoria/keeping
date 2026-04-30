import { db } from '@/db';
import { cliente, contrato, itemContrato } from '@/db/schema';
import { updateContratoSchema } from '@/lib/schemas';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

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
    })
    .from(contrato)
    .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
    .where(eq(contrato.id, contratoId));

  if (rows.length === 0)
    return NextResponse.json(
      { error: 'Contrato não encontrado' },
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

  return NextResponse.json({
    contrato: rows[0],
    itens,
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await context.params;
  const contratoId = Number(id);
  const data = updateContratoSchema.parse(body);

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

  return NextResponse.json({ message: 'Contrato atualizado com sucesso' });
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const contratoId = Number(id);

  await db
    .delete(itemContrato)
    .where(eq(itemContrato.idContrato, contratoId));
  await db.delete(contrato).where(eq(contrato.id, contratoId));

  return NextResponse.json({ message: 'Contrato excluído com sucesso' });
}
