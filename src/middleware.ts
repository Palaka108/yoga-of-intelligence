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

  // Personal session links and the shared signup link are public.
  if (
    pathname === '/session' ||
    pathname.startsWith('/session/') ||
    pathname === '/join' ||
    pathname.startsWith('/join/') ||
    pathname === '/api/join'
  ) {
    return noindex(NextResponse.next());
  }

  // /admin/clients is gated by SESSION_OWNER_PASSWORD, not portal login,
  // so instructor accounts never see private notes.
  if (pathname === '/admin/clients' || pathname.startsWith('/admin/clients/')) {
    return noindex(NextResponse.next());
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|redemption|api/redemption|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|ogg|wav)$).*)',
  ],
};
