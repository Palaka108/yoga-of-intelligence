import { NextResponse, type NextRequest } from 'next/server';
import {
  PARTICIPANT_COOKIE,
  PARTICIPANT_SESSION_SECONDS,
  applyClaim,
  clientIpFrom,
  participantCookieOptions,
} from '@/lib/session-auth';
import { sessionPath } from '@/lib/session-participants';

export const dynamic = 'force-dynamic';

function safeToken(raw: string): string | null {
  return /^[A-Za-z0-9_-]{32,128}$/.test(raw) ? raw : null;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const result = await applyClaim(form, clientIpFrom(request.headers, request.ip));

  if (result.ok) {
    const response = NextResponse.redirect(new URL(sessionPath(result.clientId), request.url), 303);
    response.cookies.set(
      PARTICIPANT_COOKIE,
      result.token,
      participantCookieOptions(PARTICIPANT_SESSION_SECONDS)
    );
    return response;
  }

  const back = new URL('/session/claim', request.url);
  const token = safeToken(String(form.get('token') ?? ''));
  if (token && result.error !== 'invite') back.searchParams.set('token', token);
  back.searchParams.set('error', result.error);
  return NextResponse.redirect(back, 303);
}
