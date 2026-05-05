import { db } from "@/db";
import { cliente, contrato, itemContrato } from "@/db/schema";
import { buildPaginatedResponse, ilike } from "@/lib/pagination";
import { createContratoSchema, paginationSchema } from "@/lib/schemas";
import { count, desc, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit, search } = paginationSchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || "",
  });

  function calcularVencimento(
    dataFormalizacao: Date,
    entidadeJuridica: boolean | null,
  ): string {
    const data = dataFormalizacao;
    const meses = entidadeJuridica ? 24 : 12;
    data.setMonth(data.getMonth() + meses);
    return data.toISOString().split("T")[0];
  }

  const offset = (page - 1) * limit;

  const whereClause = search
    ? or(ilike(cliente.razaoSocial, search), ilike(contrato.valorPlano, search))
    : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(contrato)
    .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
    .where(whereClause);

  const rows = await db
    .select({
      id: contrato.id,
      idCliente: contrato.idCliente,
      valorPlano: contrato.valorPlano,
      formalizacao: contrato.formalizacao,
      clienteNome: cliente.razaoSocial,
    })
    .from(contrato)
    .leftJoin(cliente, eq(contrato.idCliente, cliente.id))
    .where(whereClause)
    .orderBy(desc(contrato.id))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(
    buildPaginatedResponse(rows, totalResult.count, page, limit),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = createContratoSchema.parse(body);

  const [result] = await db
    .insert(contrato)
    .values({
      idCliente: data.idCliente,
      valorPlano: data.valorPlano,
      formalizacao: new Date(data.formalizacao),
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
