import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value; // Retrieve the role from the cookie
  const { pathname } = request.nextUrl;

  // Automatic redirection from "/" if the user is already logged in
  if (pathname === '/' && token && role) {
    const dashboardRoute = 
      role === 'ADMIN' ? '/admin' : 
      role === 'PROFESOR' ? '/profesor' : 
      '/student';
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // Protected route validation
  // Check for the existence of the token for any protected route
  const protectedRoutes = ['/admin', '/profesor', '/student'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ROLE-based protection (Authorization logic)
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/profesor', request.url));
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