import { produtoToSqlType, sqlToProdutoType } from '@/app/types/produto';
import { neon } from '@neondatabase/serverless';

import { NextResponse } from 'next/server';

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET() {
  return NextResponse.json(
    (await sql`SELECT * FROM produto`).map(sqlToProdutoType),
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = (
    await sql`
    INSERT INTO
      produto (franquia, operadora, valor, portabilidade, descricao)
    VALUES (${body.franquia}, ${body.operadora}, ${body.valor}, ${body.portabilidade}, ${body.descricao})`
  ).map((p) => ({ ...p, franquia: p.franquia }));
  return NextResponse.json(result[0], { status: 201 });
}
