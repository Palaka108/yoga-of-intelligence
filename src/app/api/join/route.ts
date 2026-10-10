import { NextResponse, type NextRequest } from 'next/server';
import {
  PARTICIPANT_COOKIE,
  PARTICIPANT_SESSION_SECONDS,
  clientIpFrom,
  participantCookieOptions,
} from '@/lib/session-auth';
import { signupFromForm } from '@/lib/session-join';
import { sessionPath } from '@/lib/session-participants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const result = await signupFromForm(form, clientIpFrom(request.headers, request.ip));

  if (result.ok) {
    const response = NextResponse.redirect(new URL(sessionPath(result.clientId), request.url), 303);
    response.cookies.set(
      PARTICIPANT_COOKIE,
      result.sessionToken,
      participantCookieOptions(PARTICIPANT_SESSION_SECONDS)
    );
    return response;
  }

  const back = new URL('/join', request.url);
  back.searchParams.set('error', result.error);
  return NextResponse.redirect(back, 303);
}
