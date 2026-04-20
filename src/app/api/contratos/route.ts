import { sqlToContratoType } from '@/app/types/contrato';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(`${process.env.DATABASE_URL}`);

export async function GET() {
  const contratos = await sql`
    SELECT
      contrato.id,
      contrato.id_cliente,
      contrato.valor_plano,
      contrato.formalizacao,
      cliente.razao_social AS cliente_razao_social
    FROM contrato
    JOIN cliente ON cliente.id = contrato.id_cliente
  `;

  const payload = contratos.map((row: any) => ({
    ...sqlToContratoType(row),
    clienteNome: row.cliente_razao_social,
  }));

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const body = await request.json();
  const itens = Array.isArray(body.itens) ? body.itens : [];

  const result = await sql`
    INSERT INTO contrato (id_cliente, valor_plano, formalizacao)
    VALUES (${body.idCliente}, ${body.valorPlano}, ${body.formalizacao})
    RETURNING id
  `;

  const contratoId = result[0]?.id;
  if (!contratoId) {
    return NextResponse.json(
      { error: 'Falha ao criar contrato' },
      { status: 500 },
    );
  }

  for (const item of itens) {
    await sql`
      INSERT INTO item_contrato (
        id_contrato,
        numero_provisorio,
        id_produto
      ) VALUES (
        ${contratoId},
        ${item.numeroProvisorio},
        ${item.idProduto}
      )
    `;
  }

  return NextResponse.json({ id: contratoId }, { status: 201 });
}
