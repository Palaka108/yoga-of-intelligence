'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  canSendResetEmail,
  claimUrl,
  createInvite,
  getAuth,
  sendResetEmail,
} from '@/lib/session-auth';
import {
  OWNER_COOKIE,
  createOwnerToken,
  isOwnerUnlocked,
  ownerPassword,
  passwordsMatch,
} from '@/lib/session-owner-auth';
import { findSeed } from '@/lib/session-participants';
import { resetDayOverride, saveDayOverride } from '@/lib/session-progress';
import { getStoredProfile, isStoreConfigured, type DayOverride } from '@/lib/session-store';

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/admin/clients',
    maxAge,
  };
}

export async function unlockOwnerList(formData: FormData) {
  const expected = ownerPassword();
  const given = String(formData.get('password') ?? '');

  if (!expected || !passwordsMatch(given, expected)) {
    redirect('/admin/clients?error=1');
  }

  cookies().set(OWNER_COOKIE, createOwnerToken(expected), cookieOptions(60 * 60 * 24 * 14));
  redirect('/admin/clients');
}

export async function lockOwnerList() {
  cookies().set(OWNER_COOKIE, '', cookieOptions(0));
  redirect('/admin/clients');
}

export async function createParticipantInvite(formData: FormData) {
  if (!isOwnerUnlocked(cookies().get(OWNER_COOKIE)?.value)) {
    redirect('/admin/clients');
  }
  if (!isStoreConfigured()) {
    redirect('/admin/clients?error=invite');
  }

  const requested = String(formData.get('client_id') ?? '').trim();
  const seeded = findSeed(requested);
  const stored = seeded ? null : await getStoredProfile(requested.toLowerCase());
  const person = seeded ?? stored;
  if (!person || person.client_id.toLowerCase() !== requested.toLowerCase()) {
    redirect('/admin/clients?error=invite');
  }

  let token = '';
  try {
    token = await createInvite(person.client_id);
  } catch (error) {
    console.error('Invite failed', error instanceof Error ? error.name : 'unknown');
    redirect('/admin/clients?error=invite');
  }

  const auth = await getAuth(person.client_id);
  const email = auth?.email || person.email?.trim().toLowerCase();
  let mailed = '0';
  if (email && canSendResetEmail()) {
    const sent = await sendResetEmail(email, claimUrl(token));
    mailed = sent ? '1' : '0';
  }

  redirect(
    `/admin/clients?invite=${encodeURIComponent(token)}&for=${encodeURIComponent(person.client_id)}&mailed=${mailed}`
  );
}

async function ownerPerson(formData: FormData) {
  if (!isOwnerUnlocked(cookies().get(OWNER_COOKIE)?.value)) return null;
  if (!isStoreConfigured()) return null;
  const requested = String(formData.get('client_id') ?? '').trim();
  const seeded = findSeed(requested);
  const stored = seeded ? null : await getStoredProfile(requested.toLowerCase());
  const person = seeded ?? stored;
  if (!person || person.client_id.toLowerCase() !== requested.toLowerCase()) return null;
  return person;
}

export async function setParticipantDay(formData: FormData) {
  const person = await ownerPerson(formData);
  if (!person) redirect('/admin/clients?error=day');

  const raw = String(formData.get('day') ?? '').trim();
  const value: DayOverride | null = raw === 'complete'
    ? 'complete'
    : /^[1-5]$/.test(raw)
      ? Number(raw)
      : null;
  if (!value) redirect('/admin/clients?error=day');

  try {
    await saveDayOverride(person.client_id, value);
  } catch (error) {
    console.error('Day override failed', error instanceof Error ? error.name : 'unknown');
    redirect('/admin/clients?error=day');
  }
  redirect('/admin/clients');
}

export async function resetParticipantDay(formData: FormData) {
  const person = await ownerPerson(formData);
  if (!person) redirect('/admin/clients?error=day');
  try {
    await resetDayOverride(person.client_id, person.agent_id);
  } catch (error) {
    console.error('Day reset failed', error instanceof Error ? error.name : 'unknown');
    redirect('/admin/clients?error=day');
  }
  redirect('/admin/clients');
}
