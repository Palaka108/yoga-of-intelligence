import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'crypto';

export const OWNER_COOKIE = 'yoi_session_owner';

/** Server-only password for /admin/clients. Unset keeps the list locked. */
export function ownerPassword(): string | null {
  const value = process.env.SESSION_OWNER_PASSWORD?.trim();
  return value ? value : null;
}

export function passwordsMatch(input: string, expected: string): boolean {
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export function createOwnerToken(password: string): string {
  return createHmac('sha256', password).update('yoi-session-owner-v1').digest('hex');
}

export function isOwnerUnlocked(cookieValue: string | undefined): boolean {
  const password = ownerPassword();
  if (!password || !cookieValue) return false;

  const expected = createOwnerToken(password);
  const given = Buffer.from(cookieValue);
  const actual = Buffer.from(expected);
  if (given.length !== actual.length) return false;
  return timingSafeEqual(given, actual);
}
