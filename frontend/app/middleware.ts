import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROLES = ['COLLEGE_ADMIN', 'SUPER_ADMIN'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;

  // ❌ No token → login
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login?role=admin', request.url));
  }

  try {
    // Decode JWT payload (no verification here – backend already does that)
    const payloadBase64 = accessToken.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

    const userRole = payload.role;

    // ❌ Not an admin role
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL('/student', request.url));
    }

    // ✅ Authorized admin
    return NextResponse.next();
  } catch (error) {
    // Invalid token → force relogin
    return NextResponse.redirect(new URL('/login?role=admin', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
