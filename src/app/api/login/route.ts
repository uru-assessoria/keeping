import { db } from '@/db';
import { usuario } from '@/db/schema';
import { loginSchema } from '@/lib/schemas';
import { sealData } from 'iron-session';
import { serialize } from 'cookie';
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = loginSchema.parse(body);

  const { IRON_SESSION_PASSWORD, NODE_ENV } = process.env;

  const rows = await db
    .select()
    .from(usuario)
    .where(eq(usuario.login, email));

  const user = rows[0];

  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const hashedPassword = createHash('md5').update(password).digest('hex');

  if (email === user.login && hashedPassword === user.senha) {
    const sessionData = { id: user.id, email };

    const encryptedSessionData = await sealData(sessionData, {
      password: IRON_SESSION_PASSWORD!,
    });

    const cookie = serialize('session', encryptedSessionData, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set('Set-Cookie', cookie);
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
