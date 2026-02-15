// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'; 
export function middleware(request: NextRequest) {
  // Extragem token-ul din Cookies
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Definim rutele care necesită autentificare
  const protectedRoutes = ['/admin', '/profesor', '/student'];
  
  // Verificăm dacă ruta curentă începe cu una din rutele protejate
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // Dacă vrea să acceseze o rută protejată dar nu are token, trimite-l la Home
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configurăm pe ce rute să ruleze middleware-ul
export const config = {
  matcher: [
    '/admin/:path*',
    '/profesor/:path*',
    '/student/:path*',
  ],
};