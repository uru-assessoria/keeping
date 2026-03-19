import Cliente from '@/app/types/cliente';
import Database, { Database as Database3 } from 'better-sqlite3';
import { NextResponse } from 'next/server';

let db: Database3 = new Database('./db.sqlite');

export async function GET() {
  return NextResponse.json(db.prepare('SELECT * FROM cliente').all());
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = db
    .prepare('INSERT INTO cliente (razaoSocial, documento) VALUES (?, ?)')
    .run(body.razaoSocial, body.documento);
  return NextResponse.json(
    {
      razaoSocial: body.razaoSocial,
      documento: body.documento,
      id: result.lastInsertRowid,
    },
    { status: 201 },
  );
}
