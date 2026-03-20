import Cliente from '@/app/types/cliente';
import Database, { Database as Database3 } from 'better-sqlite3';
import { NextResponse } from 'next/server';

let db: Database3 = new Database('./db.sqlite');

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const cliente = db.prepare('SELECT * FROM cliente WHERE id = ?').get(id);
  console.log('cliente:', JSON.stringify(cliente));
  if (!cliente)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const cliente = db.prepare('SELECT * FROM cliente WHERE id = ?').get(id);
  console.log('cliente:', JSON.stringify(cliente));
  if (!cliente)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  db.prepare('DELETE FROM cliente WHERE id = ?').run(id);
  return NextResponse.json({ message: 'Cliente excluído com sucesso' });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await context.params;
  const result = db
    .prepare('UPDATE cliente SET razaoSocial = ?, documento = ? WHERE id = ?')
    .run(body.razaoSocial, body.documento, id);
  return NextResponse.json(
    {
      razaoSocial: body.razaoSocial,
      documento: body.documento,
      id: result.lastInsertRowid,
    },
    { status: 201 },
  );
}
