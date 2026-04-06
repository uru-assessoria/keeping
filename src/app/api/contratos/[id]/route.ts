import { sqlToContratoType } from '@/app/types/contrato';
import { sqlToContratoType as sqlToItemContratoType } from '@/app/types/item-contrato';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const contratoRows = await sql`
    SELECT
      contrato.*,
      cliente.razao_social AS cliente_razao_social
    FROM contrato
    JOIN cliente ON cliente.id = contrato.id_cliente
    WHERE contrato.id = ${id}
  `;

  if (contratoRows.length === 0)
    return NextResponse.json(
      { error: 'Contrato não encontrado' },
      { status: 404 },
    );

  const itens = await sql`
    SELECT * FROM item_contrato WHERE id_contrato = ${id}
  `;

  return NextResponse.json({
    contrato: sqlToContratoType(contratoRows[0]),
    clienteNome: contratoRows[0].cliente_razao_social,
    itens: itens.map(sqlToItemContratoType),
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const { id } = await context.params;
  const itens = Array.isArray(body.itens) ? body.itens : [];

  await sql`
    UPDATE contrato SET
      id_cliente = ${body.idCliente},
      valor_plano = ${body.valorPlano}
    WHERE id = ${id}
  `;

  await sql`DELETE FROM item_contrato WHERE id_contrato = ${id}`;

  for (const item of itens) {
    await sql`
      INSERT INTO item_contrato (
        id_contrato,
        numero_provisorio,
        franquia,
        operadora,
        valor,
        portabilidade
      ) VALUES (
        ${id},
        ${item.numeroProvisorio},
        ${item.franquia},
        ${item.operadora},
        ${item.valor},
        ${item.portabilidade}
      )
    `;
  }

  return NextResponse.json({ message: 'Contrato atualizado com sucesso' });
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  await sql`DELETE FROM item_contrato WHERE id_contrato = ${id}`;
  await sql`DELETE FROM contrato WHERE id = ${id}`;

  return NextResponse.json({ message: 'Contrato excluído com sucesso' });
}
