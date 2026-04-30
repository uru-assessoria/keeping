import { db } from "@/db";
import { produto } from "@/db/schema";
import { buildPaginatedResponse, ilike } from "@/lib/pagination";
import { createProdutoSchema, paginationSchema } from "@/lib/schemas";
import { count, desc, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { page, limit, search } = paginationSchema.parse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search") || "",
  });

  const offset = (page - 1) * limit;

  const whereClause = search
    ? or(
        ilike(produto.franquia, search),
        ilike(produto.operadora, search),
        ilike(produto.descricao, search),
      )
    : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(produto)
    .where(whereClause);

  const rows = await db
    .select()
    .from(produto)
    .where(whereClause)
    .orderBy(desc(produto.id))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(
    buildPaginatedResponse(rows, totalResult.count, page, limit),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = createProdutoSchema.parse(body);

  const [result] = await db.insert(produto).values(data).returning();

  return NextResponse.json(result, { status: 201 });
}
