import { NextResponse } from 'next/server';
import { sealData } from 'iron-session';
import { serialize } from 'cookie';
import Database from 'better-sqlite3';
import Usuario from '@/app/types/usuario';
import { hash } from 'crypto';
import { neon } from '@neondatabase/serverless';

const sql = neon(`${process.env.DATABASE_URL}`);

export async function POST(req: Request) {
  const body = await req.json();
  const { ADM_PASSWORD, ADM_LOGIN, IRON_SESSION_PASSWORD, NODE_ENV } =
    process.env;

  const { email, password } = body;
  const [admin] = await sql`SELECT * FROM usuario WHERE login = ${email}`;

  if (email === admin.login && password == admin.senha) {
    // Session data
    const sessionData = { userId: 1, email };

    // Encrypt session data
    const encryptedSessionData = await sealData(sessionData, {
      password: IRON_SESSION_PASSWORD!,
    });
    //console.log('Encrypted Session Data:', encryptedSessionData);

    // Serialize cookie
    const cookie = serialize('session', encryptedSessionData, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });

    // Create response and set cookie
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set('Set-Cookie', cookie);
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
