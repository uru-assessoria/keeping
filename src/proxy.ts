import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/'];

// API routes that must remain reachable without a session:
// login/logout establish or clear the session itself, and the Unicred
// webhook authenticates via its own x-api-key + encrypted payload.
const publicApiPrefixes = ['/api/login', '/api/logout', '/api/webhooks/unicred'];

// Exige igualdade exata ou fronteira de "/" - evita que um prefixo como
// "/api/login" libere acidentalmente uma rota futura "/api/loginhistory".
function isPublicApiPath(path: string): boolean {
  return publicApiPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith('/api')) {
    if (isPublicApiPath(path)) {
      return NextResponse.next();
    }
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 2. Check if the current route is protected or public
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const session = await getSession();

  if (!session?.id) {
    if (path !== '/') {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    return NextResponse.next();
  }

  // 3. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // 4. Redirect to /dashboard if the user is authenticated
  if (isPublicRoute && session?.id && !path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
};
