import { db } from "@/db";
import { cliente } from "@/db/schema";
import { buildPaginatedResponse, ilike } from "@/lib/pagination";
import { createClienteSchema, paginationSchema } from "@/lib/schemas";
import { count, desc, eq, or } from "drizzle-orm";
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
        ilike(cliente.razaoSocial, search),
        ilike(cliente.documento, search),
        ilike(cliente.email, search),
      )
    : eq(cliente.ativo, true);

  const [totalResult] = await db
    .select({ count: count() })
    .from(cliente)
    .where(whereClause);

  const rows = await db
    .select()
    .from(cliente)
    .where(whereClause)
    .orderBy(desc(cliente.id))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(
    buildPaginatedResponse(rows, totalResult.count, page, limit),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = createClienteSchema.parse(body);

  const [result] = await db
    .insert(cliente)
    .values({
      ...data,
      razaoSocialRepresentante: data.razaoSocialRepresentante || null,
      documentoRepresentante: data.documentoRepresentante || null,
    })
    .returning();

  return NextResponse.json(result, { status: 201 });
}
