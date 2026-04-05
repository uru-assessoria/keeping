import { NextRequest, NextResponse } from 'next/server';
import { unsealData } from 'iron-session';
import { cookies } from 'next/headers';

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/'];

export default async function proxy(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('session')?.value;

  if (!cookie) {
    if (req.nextUrl.pathname !== '/') {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    } else {
      return NextResponse.next();
    }
  }
  const session = await unsealData<{ id: number; email: string }>(cookie!, {
    password: process.env.IRON_SESSION_PASSWORD!,
  });
  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.id &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
