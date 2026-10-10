import { NextResponse, type NextRequest } from 'next/server';
import { resolveParticipant } from '@/lib/session-directory';
import {
  PARTICIPANT_COOKIE,
  PARTICIPANT_SESSION_SECONDS,
  clientIpFrom,
  loginWithPassword,
  participantCookieOptions,
  sessionIdFromNext,
} from '@/lib/session-auth';
import { sessionPath } from '@/lib/session-participants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const result = await loginWithPassword(
    String(form.get('email') ?? ''),
    String(form.get('password') ?? ''),
    clientIpFrom(request.headers, request.ip)
  );

  const wanted = sessionIdFromNext(String(form.get('next') ?? ''));

  if (!result.ok) {
    const back = new URL('/session/login', request.url);
    back.searchParams.set('error', result.error);
    if (wanted) back.searchParams.set('next', sessionPath(wanted));
    return NextResponse.redirect(back, 303);
  }

  let dest = sessionPath(result.clientId);
  if (wanted) {
    const person = await resolveParticipant(wanted);
    if (person && person.client_id.toLowerCase() === result.clientId.toLowerCase()) {
      dest = sessionPath(person.client_id);
    }
  }

  const response = NextResponse.redirect(new URL(dest, request.url), 303);
  response.cookies.set(
    PARTICIPANT_COOKIE,
    result.token,
    participantCookieOptions(PARTICIPANT_SESSION_SECONDS)
  );
  return response;
}
