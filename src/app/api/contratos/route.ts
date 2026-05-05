import { db } from "@/db";
import { cliente, contrato, itemContrato, produto } from "@/db/schema";
import { buildPaginatedResponse, ilike } from "@/lib/pagination";
import { createContratoSchema, paginationSchema } from "@/lib/schemas";
import { count, desc, eq, inArray, or, and, gte, lte, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

function calcularVencimento(
  dataFormalizacao: Date,
  entidadeJuridica: boolean | null,
): Date {
  const data = new Date(dataFormalizacao);
  const meses = entidadeJuridica ? 24 : 12;
  data.setMonth(data.getMonth() + meses);
  return data;
}

async function calcularValorTotal(
  itens: Array<{ idProduto: number }>,
  taxaManutencao: number,
) {
  if (itens.length === 0) return taxaManutencao;

  const produtoIds = Array.from(new Set(itens.map((item) => item.idProduto)));
  const produtosEncontrados = await db
    .select({ id: produto.id, valor: produto.valor })
    .from(produto)
    .where(inArray(produto.id, produtoIds));

  if (produtosEncontrados.length !== produtoIds.length) {
    throw new Error("Produto inválido em itens do contrato");
  }

  const valoresPorProduto = new Map(
    produtosEncontrados.map((item) => [item.id, Number(item.valor)]),
  );

  const totalProdutos = itens.reduce((sum, item) => {
    return sum + (valoresPorProduto.get(item.idProduto) ?? 0);
  }, 0);

  return totalProdutos + taxaManutencao;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit, search } = paginationSchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || "",
  });

  const filtros = {
    periodoVencimento: searchParams.get("periodoVencimento"), // "30dias", "60dias", "90dias"
    tipoCliente: searchParams.get("tipoCliente"), // "fisica", "juridica"
    ordenacao: searchParams.get("ordenacao"), // "recente", "antigo"
  };

  const offset = (page - 1) * limit;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let whereConditions = [];

  // Filtro de texto (cliente ou taxa)
  if (search) {
    whereConditions.push(
      or(
        ilike(cliente.razaoSocial, search),
        ilike(contrato.razaoSocialCliente, search),
      ),
    );
  }

  // Filtro de período de vencimento
  if (filtros.periodoVencimento) {
    const limite = new Date(hoje);
    if (filtros.periodoVencimento === "30dias") {
      limite.setDate(limite.getDate() + 30);
    } else if (filtros.periodoVencimento === "60dias") {
      limite.setDate(limite.getDate() + 60);
    } else if (filtros.periodoVencimento === "90dias") {
      limite.setDate(limite.getDate() + 90);
    }

    whereConditions.push(
      and(gte(contrato.vencimento, hoje), lte(contrato.vencimento, limite)),
    );
  }

  // Filtro de tipo de cliente
  if (filtros.tipoCliente) {
    const isJuridica = filtros.tipoCliente === "juridica";
    whereConditions.push(eq(cliente.entidadeJuridica, isJuridica));
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(contrato)
    .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
    .where(whereClause);

  // Determinar ordenação
  let orderByClause;
  if (filtros.ordenacao === "recente") {
    orderByClause = desc(contrato.formalizacao);
  } else if (filtros.ordenacao === "antigo") {
    orderByClause = asc(contrato.formalizacao);
  } else {
    orderByClause = desc(contrato.id); // padrão
  }

  const rows = await db
    .select({
      id: contrato.id,
      idCliente: contrato.idCliente,
      taxaManutencao: contrato.taxaManutencao,
      formalizacao: contrato.formalizacao,
      vencimento: contrato.vencimento,
      valorTotal: contrato.valorTotal,
      clienteNome: contrato.razaoSocialCliente,
    })
    .from(contrato)
    .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  return NextResponse.json(
    buildPaginatedResponse(rows, totalResult.count, page, limit),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = createContratoSchema.parse(body);

  const [clienteAtual] = await db
    .select({
      entidadeJuridica: cliente.entidadeJuridica,
      razaoSocial: cliente.razaoSocial,
    })
    .from(cliente)
    .where(eq(cliente.id, data.idCliente));

  if (!clienteAtual) {
    return NextResponse.json(
      { error: "Cliente não encontrado" },
      { status: 400 },
    );
  }

  const vencimento = calcularVencimento(
    new Date(data.formalizacao),
    clienteAtual.entidadeJuridica,
  );

  const valorTotal = await calcularValorTotal(data.itens, data.taxaManutencao);

  const [result] = await db
    .insert(contrato)
    .values({
      idCliente: data.idCliente,
      taxaManutencao: data.taxaManutencao,
      formalizacao: new Date(data.formalizacao),
      vencimento: new Date(vencimento),
      valorTotal,
      razaoSocialCliente: clienteAtual.razaoSocial,
    })
    .returning();

  const contratoId = result.id;

  if (data.itens.length > 0) {
    await db.insert(itemContrato).values(
      data.itens.map((item) => ({
        idContrato: contratoId,
        numeroProvisorio: item.numeroProvisorio,
        idProduto: item.idProduto,
      })),
    );
  }

  return NextResponse.json({ id: contratoId }, { status: 201 });
}
