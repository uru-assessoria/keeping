import { produtoToSqlType, sqlToProdutoType } from '@/app/types/produto';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const produto = (await sql`SELECT * FROM produto WHERE id = ${id}`).map(
    sqlToProdutoType,
  );
  if (produto.length === 0)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json(produto[0]);
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const produto = await sql`SELECT * FROM produto WHERE id = ${id}`;
  if (produto.length === 0)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const result = await sql`DELETE FROM produto WHERE id = ${id}`;

  return NextResponse.json({ message: 'Produto excluído com sucesso' });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await context.params;

  const result = await sql`UPDATE produto SET
     franquia = ${body.franquia},
     operadora = ${body.operadora},
     valor = ${body.valor},
     portabilidade = ${body.portabilidade},
     descricao = ${body.descricao}
    WHERE id = ${id}`;
  return NextResponse.json(result[0], { status: 201 });
}
