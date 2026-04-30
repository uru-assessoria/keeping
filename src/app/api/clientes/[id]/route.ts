import { db } from '@/db';
import { cliente } from '@/db/schema';
import { updateClienteSchema } from '@/lib/schemas';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const rows = await db
    .select()
    .from(cliente)
    .where(eq(cliente.id, Number(id)));

  if (rows.length === 0)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const rows = await db
    .select()
    .from(cliente)
    .where(eq(cliente.id, Number(id)));

  if (rows.length === 0)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  await db
    .update(cliente)
    .set({ ativo: false })
    .where(eq(cliente.id, Number(id)));

  return NextResponse.json({ message: 'Cliente excluído com sucesso' });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await context.params;
  const data = updateClienteSchema.parse(body);

  const [result] = await db
    .update(cliente)
    .set({
      ...data,
      razaoSocialRepresentante:
        data.razaoSocialRepresentante === ''
          ? null
          : data.razaoSocialRepresentante,
      documentoRepresentante:
        data.documentoRepresentante === ''
          ? null
          : data.documentoRepresentante,
    })
    .where(eq(cliente.id, Number(id)))
    .returning();

  return NextResponse.json(result, { status: 200 });
}
