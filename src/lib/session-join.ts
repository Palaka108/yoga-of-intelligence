import 'server-only';
import { randomBytes } from 'crypto';
import { passwordsMatch } from '@/lib/session-owner-auth';
import { findSeed, normalizeId, type ParticipantProfile } from '@/lib/session-participants';
import { allowJoinAttempt, isStoreConfigured, profileExists, saveNewProfile } from '@/lib/session-store';
import { deleteAgent, duplicateTemplateAgent, hasElevenLabsKey } from '@/lib/elevenlabs-agent';

export type JoinError = 'name' | 'email' | 'code' | 'rate' | 'unavailable' | 'failed';

export type JoinResult = { ok: true; clientId: string } | { ok: false; error: JoinError };

const CLIENT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function joinCodeRequired(): boolean {
  return Boolean(process.env.JOIN_CODE?.trim());
}

export function cleanDisplayName(raw: string): string | null {
  const name = raw.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  if (name.length < 1 || name.length > 80) return null;
  return name;
}

export function cleanEmail(raw: string): { ok: true; email?: string } | { ok: false } {
  const email = raw.trim();
  if (!email) return { ok: true };
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false };
  return { ok: true, email };
}

/** Slug of the name plus a short random suffix. Never the bare name. */
export function makeClientId(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  const suffix = randomBytes(3).toString('hex');
  const base = slug || 'friend';
  return `${base}-${suffix}`;
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function joinCodeMatches(input: string): boolean {
  const expected = process.env.JOIN_CODE?.trim() ?? '';
  if (!expected) return true;
  return passwordsMatch(input, expected);
}

async function allocateClientId(name: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const clientId = makeClientId(name);
    if (!CLIENT_ID_PATTERN.test(clientId)) continue;
    if (findSeed(clientId)) continue;
    if (await profileExists(clientId)) continue;
    return clientId;
  }
  throw new Error('Could not allocate a client id');
}

/**
 * Create a profile only after a real signup. The ElevenLabs agent is
 * duplicated here and nowhere else.
 */
export async function signupFromForm(form: FormData, ip: string): Promise<JoinResult> {
  if (!isStoreConfigured() || !hasElevenLabsKey()) {
    return { ok: false, error: 'unavailable' };
  }

  let allowed = false;
  try {
    allowed = await allowJoinAttempt(ip);
  } catch (error) {
    console.error('Join rate limit failed', error instanceof Error ? error.name : 'unknown');
    return { ok: false, error: 'unavailable' };
  }
  if (!allowed) return { ok: false, error: 'rate' };

  const name = cleanDisplayName(String(form.get('name') ?? ''));
  if (!name) return { ok: false, error: 'name' };

  const emailResult = cleanEmail(String(form.get('email') ?? ''));
  if (!emailResult.ok) return { ok: false, error: 'email' };

  if (!joinCodeMatches(String(form.get('code') ?? ''))) {
    return { ok: false, error: 'code' };
  }

  let clientId = '';
  let agentId = '';
  try {
    clientId = await allocateClientId(name);
    if (normalizeId(clientId) === 'nia' || findSeed(clientId)) {
      return { ok: false, error: 'failed' };
    }

    agentId = await duplicateTemplateAgent(name);

    const profile: ParticipantProfile = {
      client_id: clientId,
      name,
      program: '5-day-trial',
      start_date: utcToday(),
      day: 1,
      agent_id: agentId,
      notes: '',
      email: emailResult.email,
      created_at: new Date().toISOString(),
    };

    const saved = await saveNewProfile(profile);
    if (!saved) {
      await deleteAgent(agentId);
      return { ok: false, error: 'failed' };
    }

    return { ok: true, clientId };
  } catch (error) {
    console.error('Signup failed', error instanceof Error ? error.name : 'unknown');
    if (agentId) await deleteAgent(agentId);
    return { ok: false, error: 'failed' };
  }
}
