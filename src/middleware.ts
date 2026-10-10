import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase-middleware';

function noindex(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public campaign routes are fully static and must never pay for an auth
  // round-trip (they take paid ad traffic) or be caught by portal gating.
  if (pathname.startsWith('/redemption')) {
    return NextResponse.next();
  }

  // Personal session links stay outside the Supabase portal login.
  // The voice page itself checks the participant cookie.
  if (
    pathname === '/session' ||
    pathname.startsWith('/session/') ||
    pathname === '/join' ||
    pathname.startsWith('/join/') ||
    pathname === '/api/join' ||
    pathname === '/api/session' ||
    pathname.startsWith('/api/session/')
  ) {
    const response = noindex(NextResponse.next());
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }

  // /admin/clients is gated by SESSION_OWNER_PASSWORD, not portal login,
  // so instructor accounts never see private notes.
  if (pathname === '/admin/clients' || pathname.startsWith('/admin/clients/')) {
    const response = noindex(NextResponse.next());
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|redemption|api/redemption|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|ogg|wav)$).*)',
  ],
};
