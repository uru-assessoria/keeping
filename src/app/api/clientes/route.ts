import Cliente from '@/app/types/cliente';
import { neon } from '@neondatabase/serverless';

import { NextResponse } from 'next/server';

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET() {
  return NextResponse.json(
    (await sql`SELECT * FROM cliente WHERE ativo = true`).map((c) => ({
      ...c,
      razaoSocial: c.razao_social,
    })),
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = (
    await sql`INSERT INTO cliente (razao_social, documento, ativo) VALUES (${body.razaoSocial}, ${body.documento}, true)`
  ).map((c) => ({ ...c, razaoSocial: c.razao_social }));
  return NextResponse.json(result[0], { status: 201 });
}
