import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value; // Preluăm rolul din cookie
  const { pathname } = request.nextUrl;

  // Redirecționare automată de pe "/" dacă ești logat
  if (pathname === '/' && token && role) {
    const dashboardRoute = 
      role === 'ADMIN' ? '/admin' : 
      role === 'PROFESOR' ? '/profesor' : 
      '/student';
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // Verificarea rutei protejate 
  // Verificăm existența token-ului pentru orice rută protejată
  const protectedRoutes = ['/admin', '/profesor', '/student'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protecție bazată pe ROL (Logica de autorizare)
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/profesor', request.url)); // Sau unde are voie
  }

  if (pathname.startsWith('/profesor') && role !== 'PROFESOR') {
    const fallback = role === 'ADMIN' ? '/admin' : '/student';
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  if (pathname.startsWith('/student') && role !== 'STUDENT') {
    const fallback = role === 'ADMIN' ? '/admin' : '/profesor';
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/profesor/:path*', '/student/:path*'],
};