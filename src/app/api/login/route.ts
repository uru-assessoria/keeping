import { db } from '@/db';
import { usuario } from '@/db/schema';
import { loginSchema } from '@/lib/schemas';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { sealData } from 'iron-session';
import { serialize } from 'cookie';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const BCRYPT_PREFIX_REGEX = /^\$2[aby]?\$/;

// Senhas antigas foram gravadas como MD5 puro. Aceitamos o hash legado uma
// última vez e migramos silenciosamente para bcrypt, sem exigir que o
// usuário troque a senha.
async function verificarSenha(
  senhaDigitada: string,
  hashArmazenado: string,
): Promise<boolean> {
  if (BCRYPT_PREFIX_REGEX.test(hashArmazenado)) {
    return bcrypt.compare(senhaDigitada, hashArmazenado);
  }
  const legadoMd5 = createHash('md5').update(senhaDigitada).digest('hex');
  return legadoMd5 === hashArmazenado;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = loginSchema.parse(body);

  const ip = getClientIp(req);
  // Limite por IP+email (alvo específico) e um limite mais largo por IP
  // (evita que o atacante contorne o primeiro variando o e-mail tentado).
  const dentroDoLimite =
    rateLimit(`login:${ip}:${email.toLowerCase()}`, 10, 5 * 60 * 1000) &&
    rateLimit(`login-ip:${ip}`, 30, 5 * 60 * 1000);
  if (!dentroDoLimite) {
    return NextResponse.json(
      { success: false, error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 },
    );
  }

  const { IRON_SESSION_PASSWORD, NODE_ENV } = process.env;

  const rows = await db
    .select()
    .from(usuario)
    .where(eq(usuario.login, email));

  const user = rows[0];

  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const senhaValida = await verificarSenha(password, user.senha);

  if (email === user.login && senhaValida) {
    if (!BCRYPT_PREFIX_REGEX.test(user.senha)) {
      const novoHash = await bcrypt.hash(password, 12);
      await db.update(usuario).set({ senha: novoHash }).where(eq(usuario.id, user.id));
    }

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
