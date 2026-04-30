import { db } from '@/db';
import { produto } from '@/db/schema';
import { updateProdutoSchema } from '@/lib/schemas';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const rows = await db
    .select()
    .from(produto)
    .where(eq(produto.id, Number(id)));

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
    .from(produto)
    .where(eq(produto.id, Number(id)));

  if (rows.length === 0)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  await db.delete(produto).where(eq(produto.id, Number(id)));

  return NextResponse.json({ message: 'Produto excluído com sucesso' });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await context.params;
  const data = updateProdutoSchema.parse(body);

  const [result] = await db
    .update(produto)
    .set(data)
    .where(eq(produto.id, Number(id)))
    .returning();

  return NextResponse.json(result, { status: 200 });
}
