import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { resolveParticipant } from '@/lib/session-directory';
import { findSeed, siteOrigin } from '@/lib/session-participants';
import {
  getRedis,
  getStoredProfile,
  isStoreConfigured,
  listStoredProfiles,
  setStoredProfileEmail,
} from '@/lib/session-store';

/**
 * Participant accounts are separate from the Supabase portal login at /login
 * and from the owner cookie on /admin/clients.
 *
 * Nia (and anyone who already has a profile but no password) claims or resets
 * with a one-time link the owner generates. The first visitor to /session/nia
 * must not be able to set her password, because that URL is guessable.
 */

export const PARTICIPANT_COOKIE = 'yoi_participant';
export const PARTICIPANT_SESSION_SECONDS = 60 * 60 * 24 * 30;
export const INVITE_TTL_SECONDS = 60 * 60 * 24 * 7;

const AUTH_KEY = 'yoi:session:auth';
const BCRYPT_COST = 12;
const LOGIN_LIMIT = 10;
const FORGOT_LIMIT = 5;
const CLAIM_LIMIT = 20;
const WINDOW_SECONDS = 60 * 60;

/** Precomputed bcrypt hash so a missing account still pays for a compare. */
const DUMMY_HASH = '$2b$12$MuyJm/I2XSzybE8t2f0.fuAX5m/jbxCR5gxibkHWExTewOdm0f9ne';

export type AuthRecord = {
  email: string;
  password_hash: string;
};

export type AccountSummary = {
  email: string;
  hasPassword: boolean;
};

function emailKey(email: string): string {
  return `yoi:session:email:${email}`;
}

function sessionKey(token: string): string {
  return `yoi:session:sid:${token}`;
}

function inviteKey(hash: string): string {
  return `yoi:session:invite:${hash}`;
}

function inviteForKey(clientId: string): string {
  return `yoi:session:invite-for:${clientId}`;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 200) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

/** 8–72 characters, no control characters, and within bcrypt's 72-byte limit. */
export function cleanPassword(raw: string): string | null {
  if (raw.length < 8 || raw.length > 72) return null;
  if (Buffer.byteLength(raw) > 72) return null;
  if (/[\u0000-\u001F\u007F]/.test(raw)) return null;
  return raw;
}

export function participantCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export function clientIpFrom(headers: Headers, fallback?: string | null): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return fallback || 'unknown';
}

/**
 * Only a same-site session path is accepted. Returns the client id it names,
 * never a foreign URL.
 */
export function sessionIdFromNext(raw: string | null | undefined): string | null {
  if (!raw || raw.length > 200) return null;
  if (!raw.startsWith('/session') || raw.startsWith('//')) return null;
  if (raw.includes('\\') || raw.includes('://') || raw.includes('@')) return null;

  let url: URL;
  try {
    url = new URL(raw, 'https://yogaofintelligence.com');
  } catch {
    return null;
  }

  let id = '';
  if (url.pathname === '/session') {
    id = url.searchParams.get('c') ?? '';
  } else {
    const match = /^\/session\/([^/]+)$/.exec(url.pathname);
    if (!match) return null;
    try {
      id = decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  }

  if (!/^[\w.-]{1,80}$/.test(id)) return null;
  return id;
}

export function claimPath(token: string): string {
  return `/session/claim?token=${encodeURIComponent(token)}`;
}

export function claimUrl(token: string): string {
  return `${siteOrigin()}${claimPath(token)}`;
}

export function canSendResetEmail(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

async function allowRate(bucket: string, ip: string, limit: number): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const hashed = sha256(ip).slice(0, 24);
  const key = `yoi:session:${bucket}:${hashed}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, WINDOW_SECONDS);
  return count <= limit;
}

function parseAuth(value: unknown): AuthRecord | null {
  let record = value;
  if (typeof record === 'string') {
    try {
      record = JSON.parse(record);
    } catch {
      return null;
    }
  }
  if (!record || typeof record !== 'object') return null;
  const email = (record as { email?: unknown }).email;
  const passwordHash = (record as { password_hash?: unknown }).password_hash;
  if (typeof email !== 'string' || typeof passwordHash !== 'string') return null;
  if (!passwordHash.startsWith('$2')) return null;
  return { email: email.trim().toLowerCase(), password_hash: passwordHash };
}

export async function getAuth(clientId: string): Promise<AuthRecord | null> {
  const redis = getRedis();
  if (!redis) return null;
  const value = await redis.hget<unknown>(AUTH_KEY, clientId.toLowerCase());
  return parseAuth(value);
}

export async function saveAuth(clientId: string, record: AuthRecord): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error('Signup store is not configured.');
  await redis.hset(AUTH_KEY, {
    [clientId.toLowerCase()]: {
      email: record.email.trim().toLowerCase(),
      password_hash: record.password_hash,
    },
  });
}

export async function reserveEmail(email: string, clientId: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) throw new Error('Signup store is not configured.');
  const created = await redis.set(emailKey(email), clientId.toLowerCase(), { nx: true });
  return created === 'OK';
}

export async function releaseEmail(email: string, clientId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const current = await redis.get<string>(emailKey(email));
  if (typeof current === 'string' && current.toLowerCase() === clientId.toLowerCase()) {
    await redis.del(emailKey(email));
  }
}

async function lookupClientByEmail(email: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  const id = await redis.get<string>(emailKey(email));
  if (typeof id !== 'string' || !id.trim()) return null;
  return id.trim().toLowerCase();
}

/** Index first, then profiles saved before accounts existed. */
export async function findClientIdByEmail(email: string): Promise<string | null> {
  const indexed = await lookupClientByEmail(email);
  if (indexed) return indexed;

  const stored = await listStoredProfiles();
  const found = stored.find((person) => person.email?.trim().toLowerCase() === email);
  return found ? found.client_id.toLowerCase() : null;
}

export async function accountSummaries(clientIds: string[]): Promise<Record<string, AccountSummary>> {
  const out: Record<string, AccountSummary> = {};
  await Promise.all(
    clientIds.map(async (id) => {
      try {
        const auth = await getAuth(id);
        if (!auth) return;
        out[id.toLowerCase()] = { email: auth.email, hasPassword: true };
      } catch (error) {
        console.error('Account lookup failed', error instanceof Error ? error.name : 'unknown');
      }
    })
  );
  return out;
}

export async function createSession(clientId: string): Promise<string> {
  const redis = getRedis();
  if (!redis) throw new Error('Signup store is not configured.');
  const token = randomBytes(32).toString('base64url');
  await redis.set(sessionKey(token), clientId.toLowerCase(), { ex: PARTICIPANT_SESSION_SECONDS });
  return token;
}

export async function readSession(token: string | undefined): Promise<string | null> {
  if (!token || token.length < 20 || token.length > 200) return null;
  if (!/^[\w.-]+$/.test(token)) return null;
  const redis = getRedis();
  if (!redis) return null;
  const id = await redis.get<string>(sessionKey(token));
  if (typeof id !== 'string' || !id.trim()) return null;
  return id.trim().toLowerCase();
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  const redis = getRedis();
  if (!redis) return;
  await redis.del(sessionKey(token));
}

/** One active invite per person. A new link invalidates the previous one. */
export async function createInvite(clientId: string): Promise<string> {
  const redis = getRedis();
  if (!redis) throw new Error('Signup store is not configured.');
  const id = clientId.toLowerCase();
  const token = randomBytes(32).toString('base64url');
  const hash = sha256(token);
  const previous = await redis.get<string>(inviteForKey(id));
  await redis.set(inviteKey(hash), id, { ex: INVITE_TTL_SECONDS });
  await redis.set(inviteForKey(id), hash, { ex: INVITE_TTL_SECONDS });
  if (typeof previous === 'string' && previous && previous !== hash) {
    await redis.del(inviteKey(previous));
  }
  return token;
}

export async function lookupInvite(token: string): Promise<string | null> {
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) return null;
  const redis = getRedis();
  if (!redis) return null;
  const hash = sha256(token);
  const id = await redis.get<string>(inviteKey(hash));
  if (typeof id !== 'string' || !id.trim()) return null;
  const current = await redis.get<string>(inviteForKey(id.trim().toLowerCase()));
  if (typeof current !== 'string' || !hashesMatch(current, hash)) return null;
  return id.trim().toLowerCase();
}

export async function clearInvites(clientId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const id = clientId.toLowerCase();
  const hash = await redis.get<string>(inviteForKey(id));
  if (typeof hash === 'string' && hash) {
    await redis.del(inviteKey(hash));
  }
  await redis.del(inviteForKey(id));
}

export async function claimPreview(token: string): Promise<{ ok: false } | { ok: true; needsEmail: boolean }> {
  const clientId = await lookupInvite(token);
  if (!clientId) return { ok: false };
  const person = await resolveParticipant(clientId);
  if (!person) return { ok: false };
  const auth = await getAuth(clientId);
  const seeded = findSeed(clientId);
  const email = auth?.email || seeded?.email;
  if (email) return { ok: true, needsEmail: false };

  const storedEmail = await emailOnStoredProfile(clientId);
  return { ok: true, needsEmail: !storedEmail };
}

async function emailOnStoredProfile(clientId: string): Promise<string | null> {
  const person = await getStoredProfile(clientId);
  return person?.email ? normalizeEmail(person.email) : null;
}

async function profileEmail(clientId: string): Promise<string | null> {
  const seeded = findSeed(clientId);
  if (seeded?.email) return normalizeEmail(seeded.email);
  return emailOnStoredProfile(clientId);
}

export async function sendResetEmail(to: string, link: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return false;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'Your Untherapy page',
        text: [
          'Use this link to set a password for your Untherapy page.',
          'It works once and expires in 7 days.',
          '',
          link,
          '',
          'If you did not ask for this, you can ignore it.',
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error(`Reset email failed (${response.status})`);
    }
    return response.ok;
  } catch (error) {
    console.error('Reset email failed', error instanceof Error ? error.name : 'unknown');
    return false;
  }
}

export type LoginResult =
  | { ok: true; token: string; clientId: string }
  | { ok: false; error: 'credentials' | 'rate' | 'unavailable' };

export async function loginWithPassword(emailRaw: string, password: string, ip: string): Promise<LoginResult> {
  if (!isStoreConfigured()) return { ok: false, error: 'unavailable' };

  let allowed = false;
  try {
    allowed = await allowRate('login', ip, LOGIN_LIMIT);
  } catch (error) {
    console.error('Login rate limit failed', error instanceof Error ? error.name : 'unknown');
    return { ok: false, error: 'unavailable' };
  }
  if (!allowed) return { ok: false, error: 'rate' };

  const email = normalizeEmail(emailRaw);
  const withinLimit = password.length > 0 && password.length <= 72 && Buffer.byteLength(password) <= 72;
  let clientId: string | null = null;
  let auth: AuthRecord | null = null;
  try {
    clientId = email ? await findClientIdByEmail(email) : null;
    auth = clientId ? await getAuth(clientId) : null;
  } catch (error) {
    console.error('Login lookup failed', error instanceof Error ? error.name : 'unknown');
    return { ok: false, error: 'unavailable' };
  }

  const hash = auth?.password_hash ?? DUMMY_HASH;
  let compared = false;
  try {
    compared = await bcrypt.compare(withinLimit ? password : 'x', hash);
  } catch (error) {
    console.error('Password compare failed', error instanceof Error ? error.name : 'unknown');
  }
  if (!auth || !email || !clientId || !withinLimit || !compared || auth.email !== email) {
    return { ok: false, error: 'credentials' };
  }

  try {
    const token = await createSession(clientId);
    return { ok: true, token, clientId };
  } catch (error) {
    console.error('Login session failed', error instanceof Error ? error.name : 'unknown');
    return { ok: false, error: 'unavailable' };
  }
}

export async function requestPasswordResetFor(emailRaw: string, ip: string): Promise<'ok' | 'rate' | 'unavailable'> {
  if (!isStoreConfigured()) return 'unavailable';

  let allowed = false;
  try {
    allowed = await allowRate('forgot', ip, FORGOT_LIMIT);
  } catch (error) {
    console.error('Reset rate limit failed', error instanceof Error ? error.name : 'unknown');
    return 'unavailable';
  }
  if (!allowed) return 'rate';

  const email = normalizeEmail(emailRaw);
  if (!email || !canSendResetEmail()) return 'ok';

  try {
    const clientId = await findClientIdByEmail(email);
    if (!clientId) return 'ok';
    const auth = await getAuth(clientId);
    const known = auth?.email || (await profileEmail(clientId));
    if (!known || known !== email) return 'ok';
    const token = await createInvite(clientId);
    const sent = await sendResetEmail(known, claimUrl(token));
    if (!sent) await clearInvites(clientId);
  } catch (error) {
    console.error('Reset request failed', error instanceof Error ? error.name : 'unknown');
  }
  return 'ok';
}

export type ClaimError = 'invite' | 'email' | 'password' | 'taken' | 'rate' | 'unavailable' | 'failed';

export type ClaimResult = { ok: true; token: string; clientId: string } | { ok: false; error: ClaimError };

export async function applyClaim(form: FormData, ip: string): Promise<ClaimResult> {
  if (!isStoreConfigured()) return { ok: false, error: 'unavailable' };

  let allowed = false;
  try {
    allowed = await allowRate('claim', ip, CLAIM_LIMIT);
  } catch (error) {
    console.error('Claim rate limit failed', error instanceof Error ? error.name : 'unknown');
    return { ok: false, error: 'unavailable' };
  }
  if (!allowed) return { ok: false, error: 'rate' };

  const inviteToken = String(form.get('token') ?? '');
  const clientId = await lookupInvite(inviteToken);
  if (!clientId) return { ok: false, error: 'invite' };

  const person = await resolveParticipant(clientId);
  if (!person || person.client_id.toLowerCase() !== clientId) {
    return { ok: false, error: 'invite' };
  }

  const password = cleanPassword(String(form.get('password') ?? ''));
  const confirm = String(form.get('password_confirm') ?? '');
  if (!password || password !== confirm) return { ok: false, error: 'password' };

  const auth = await getAuth(clientId);
  const existingEmail = auth?.email || (await profileEmail(clientId));
  let email = existingEmail;
  let reserved = false;

  if (!email) {
    email = normalizeEmail(String(form.get('email') ?? ''));
    if (!email) return { ok: false, error: 'email' };
  }

  const indexed = await lookupClientByEmail(email);
  if (indexed && indexed !== clientId) return { ok: false, error: 'taken' };
  if (!indexed) {
    reserved = await reserveEmail(email, clientId);
    if (!reserved) return { ok: false, error: 'taken' };
  }

  try {
    await saveAuth(clientId, { email, password_hash: await hashPassword(password) });
    await setStoredProfileEmail(clientId, email);
    await clearInvites(clientId);
    const token = await createSession(clientId);
    return { ok: true, token, clientId };
  } catch (error) {
    console.error('Claim failed', error instanceof Error ? error.name : 'unknown');
    if (reserved) await releaseEmail(email, clientId);
    return { ok: false, error: 'failed' };
  }
}
