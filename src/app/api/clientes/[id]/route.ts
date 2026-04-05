import { clienteToSqlType, sqlToClienteType } from '@/app/types/cliente';
import { neon } from '@neondatabase/serverless';
import Database, { Database as Database3 } from 'better-sqlite3';
import { NextResponse } from 'next/server';

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const cliente = (await sql`SELECT * FROM cliente WHERE id = ${id}`).map(
    sqlToClienteType,
  );
  if (cliente.length === 0)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json(cliente[0]);
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const cliente = await sql`SELECT * FROM cliente WHERE id = ${id}`;
  if (cliente.length === 0)
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const result = await sql`UPDATE cliente SET ativo = false WHERE id = ${id}`;

  return NextResponse.json({ message: 'Cliente excluído com sucesso' });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await context.params;

  const result = await sql`UPDATE cliente SET 
     razao_social = ${body.razaoSocial},
     documento = ${body.documento},
     data_nascimento = ${body.dataNascimento},
     razao_social_representante = ${body.razaoSocialRepresentante},
     documento_representante = ${body.documentoRepresentante},
     email = ${body.email},
     endereco = ${body.endereco},
     telefone = ${body.telefone},
     entidade_juridica = ${body.entidadeJuridica}
    WHERE id = ${id}`;
  return NextResponse.json(result[0], { status: 201 });
}
