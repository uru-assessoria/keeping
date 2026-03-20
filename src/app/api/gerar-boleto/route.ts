import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  console.log(
    'Boleto gerado para cliente:',
    body.clienteId,
    'valor:',
    body.valor,
  );
  return NextResponse.json({ success: true });
}
