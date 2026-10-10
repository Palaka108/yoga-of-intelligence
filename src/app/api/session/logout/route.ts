import { NextResponse, type NextRequest } from 'next/server';
import { PARTICIPANT_COOKIE, destroySession, participantCookieOptions } from '@/lib/session-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  await destroySession(request.cookies.get(PARTICIPANT_COOKIE)?.value);
  const response = NextResponse.redirect(new URL('/session/login', request.url), 303);
  response.cookies.set(PARTICIPANT_COOKIE, '', participantCookieOptions(0));
  return response;
}
