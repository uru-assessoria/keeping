import { sqlToContratoType } from '@/app/types/contrato';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

const sql = neon(`${process.env.DATABASE_URL}`);

function calcularVencimento(dataFormalizacao: string, entidadeJuridica: boolean): string {
  const data = new Date(dataFormalizacao);
  const meses = entidadeJuridica ? 24 : 12;
  data.setMonth(data.getMonth() + meses);
  return data.toISOString().split('T')[0];
}

export async function GET() {
  const contratos = await sql`
    SELECT
      contrato.id,
      contrato.id_cliente,
      contrato.valor_plano,
      contrato.formalizacao,
      cliente.razao_social AS cliente_razao_social,
      cliente.entidade_juridica
    FROM contrato
    JOIN cliente ON cliente.id = contrato.id_cliente
  `;

  const payload = contratos.map((row: any) => {
    const vencimento = calcularVencimento(row.formalizacao, row.entidade_juridica);
    return {
      ...sqlToContratoType(row),
      vencimento,
      clienteNome: row.cliente_razao_social,
      entidadeJuridica: row.entidade_juridica,
    };
  });

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const body = await request.json();
  const itens = Array.isArray(body.itens) ? body.itens : [];

  // Buscar dados do cliente para determinar duração do contrato
  const clienteRows = await sql`
    SELECT entidade_juridica FROM cliente WHERE id = ${body.idCliente}
  `;

  if (clienteRows.length === 0) {
    return NextResponse.json(
      { error: 'Cliente não encontrado' },
      { status: 404 },
    );
  }

  const entidadeJuridica = clienteRows[0].entidade_juridica;
  const vencimento = calcularVencimento(body.formalizacao, entidadeJuridica);

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
