import { clienteToSqlType, sqlToClienteType } from '@/app/types/cliente';
import { neon } from '@neondatabase/serverless';

import { NextResponse } from 'next/server';

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET() {
  return NextResponse.json(
    (await sql`SELECT * FROM cliente WHERE ativo = true`).map(sqlToClienteType),
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = (
    await sql`
    INSERT INTO 
      cliente (razao_social, documento, data_nascimento, razao_social_representante, documento_representante, email, endereco, telefone, entidade_juridica) 
    VALUES (${body.razaoSocial}, ${body.documento}, ${body.dataNascimento}, ${body.razaoSocialRepresentante}, ${body.documentoRepresentante}, ${body.email}, ${body.endereco}, ${body.telefone}, ${body.entidadeJuridica})`
  ).map((c) => ({ ...c, razaoSocial: c.razao_social }));
  return NextResponse.json(result[0], { status: 201 });
}
