import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { PARTICIPANT_COOKIE, readSession } from '@/lib/session-auth';
import { resolveParticipant } from '@/lib/session-directory';
import { sessionPath, type PublicParticipant } from '@/lib/session-participants';

export type SessionAccess =
  | { mode: 'missing'; ownPath?: string }
  | { mode: 'signin'; nextPath: string }
  | { mode: 'other'; ownPath: string }
  | { mode: 'open'; person: PublicParticipant };

/**
 * The voice widget is returned only when the session cookie belongs to this
 * profile. A guessed URL, or someone else's login, does not receive the agent.
 */
export const sessionAccess = cache(async (raw: string | null | undefined): Promise<SessionAccess> => {
  const person = await resolveParticipant(raw);
  let sessionClientId: string | null = null;
  try {
    sessionClientId = await readSession(cookies().get(PARTICIPANT_COOKIE)?.value);
  } catch (error) {
    console.error('Participant session read failed', error instanceof Error ? error.name : 'unknown');
  }

  if (!person?.agent_id) {
    return sessionClientId ? { mode: 'missing', ownPath: sessionPath(sessionClientId) } : { mode: 'missing' };
  }

  if (!sessionClientId) {
    return { mode: 'signin', nextPath: sessionPath(person.client_id) };
  }

  if (sessionClientId !== person.client_id.toLowerCase()) {
    return { mode: 'other', ownPath: sessionPath(sessionClientId) };
  }

  return { mode: 'open', person };
});
