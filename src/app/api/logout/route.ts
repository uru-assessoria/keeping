import { NextResponse } from 'next/server';
import { sealData } from 'iron-session';
import { serialize } from 'cookie';
import Database from 'better-sqlite3';
import Usuario from '@/app/types/usuario';
import { hash } from 'crypto';

export async function POST(req: Request) {
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: -1, // This removes the cookie
  });

  return response;
}
