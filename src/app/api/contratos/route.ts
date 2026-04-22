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
  for (const row of contratos) {
    const itens = await sql`
      SELECT * FROM item_contrato WHERE id_contrato = ${row.id}
    `;
    let totalProduto=0;
    for (const item of itens) {
      const produtoRows = await sql`
        SELECT * FROM produto WHERE id = ${item.id_produto}
      `;
      item.produto = produtoRows[0];
      totalProduto += parseFloat ((produtoRows[0]?.valor || 0)+'');
    }
    row.valor_total = parseFloat (row.valor_plano+'')+totalProduto;
  }

  const payload = contratos.map((row: any) => {
    const vencimento = calcularVencimento(row.formalizacao, row.entidade_juridica);
    return {
      ...sqlToContratoType(row),
      vencimento,
      clienteNome: row.cliente_razao_social,
      entidadeJuridica: row.entidade_juridica,
      valorTotal: row.valor_total, // Ajuste para usar valor_plano como valorTotal
    };
  });

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const itens = Array.isArray(body.itens) ? body.itens : [];

    if (!body.idCliente || body.taxaManutencao === undefined || !body.formalizacao) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 },
      );
    }

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
      VALUES (${body.idCliente}, ${body.taxaManutencao}, ${body.formalizacao})
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
      if (item.numeroProvisorio || item.idProduto) {
        await sql`
          INSERT INTO item_contrato (
            id_contrato,
            numero_provisorio,
            id_produto
          ) VALUES (
            ${contratoId},
            ${item.numeroProvisorio || ''},
            ${item.idProduto || 0}
          )
        `;
      }
    }

    return NextResponse.json({ id: contratoId }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json(
      { error: 'Erro ao criar contrato', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 },
    );
  }
}
