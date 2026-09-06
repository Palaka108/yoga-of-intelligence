import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase-middleware';

export async function middleware(request: NextRequest) {
  // Public campaign routes are fully static and must never pay for an auth
  // round-trip (they take paid ad traffic) or be caught by portal gating.
  if (request.nextUrl.pathname.startsWith('/redemption')) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|redemption|api/redemption|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|ogg|wav)$).*)',
  ],
};
