import { sqlToContratoType } from '@/app/types/contrato';
import { sqlToProdutoContratoType } from '@/app/types/produto-contrato';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(`${process.env.DATABASE_URL}`);

function calcularVencimento(dataFormalizacao: string, entidadeJuridica: boolean): string {
  const data = new Date(dataFormalizacao);
  const meses = entidadeJuridica ? 24 : 12;
  data.setMonth(data.getMonth() + meses);
  return data.toISOString().split('T')[0];
}

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const contratoRows = await sql`
    SELECT
      contrato.*,
      cliente.razao_social AS cliente_razao_social,
      cliente.entidade_juridica
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

  const vencimento = calcularVencimento(
    contratoRows[0].formalizacao,
    contratoRows[0].entidade_juridica,
  );

  return NextResponse.json({
    contrato: { ...sqlToContratoType(contratoRows[0]), vencimento },
    clienteNome: contratoRows[0].cliente_razao_social,
    itens: itens.map(sqlToProdutoContratoType),
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
      valor_plano = ${body.valorPlano},
      formalizacao = ${body.formalizacao}
    WHERE id = ${id}
  `;

  await sql`DELETE FROM item_contrato WHERE id_contrato = ${id}`;

  for (const item of itens) {
    await sql`
      INSERT INTO item_contrato (
        id_contrato,
        numero_provisorio,
        id_produto
      ) VALUES (
        ${id},
        ${item.numeroProvisorio},
        ${item.idProduto}
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
