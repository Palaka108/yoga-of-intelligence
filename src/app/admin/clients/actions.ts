'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  OWNER_COOKIE,
  createOwnerToken,
  ownerPassword,
  passwordsMatch,
} from '@/lib/session-owner-auth';

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
