import type { Metadata } from 'next';
import AuthShell from '@/components/session/AuthShell';
import { claimPreview, type ClaimError } from '@/lib/session-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Choose a password — Untherapy',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

const ERRORS: Record<ClaimError, string> = {
  invite: 'This link has expired or was already used. Ask Palaka for a new one.',
  email: 'Please enter a valid email.',
  password: 'Use 8 to 72 characters, and enter the password the same way twice.',
  taken: 'That email already has a page. Sign in instead, or ask Palaka.',
  rate: 'Too many tries just now. Wait a little while, then try again.',
  unavailable: 'This link cannot be used yet. Ask Palaka.',
  failed: 'Something got in the way. Ask Palaka for a new link.',
};

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  const token = searchParams.token ?? '';
  const preview = token ? await claimPreview(token) : { ok: false as const };
  const error = searchParams.error;
  const message = error && error in ERRORS ? ERRORS[error as ClaimError] : null;

  if (!preview.ok) {
    return (
      <AuthShell title="This link has expired">
        <p className="text-base leading-relaxed text-white/80">
          {message ?? 'Ask Palaka for a new one-time link.'}
        </p>
        <a href="/session/login" className="btn-sacred mt-8 w-full">
          Sign in
        </a>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a password">
      <form action="/api/session/claim" method="post" className="space-y-4 text-left">
        <p className="text-center text-base leading-relaxed text-white/75">
          This link works once. After you set a password, you can sign in with it.
        </p>
        {message ? <p className="text-center text-sm text-sacred-gold-light">{message}</p> : null}
        <input type="hidden" name="token" value={token} />
        {preview.needsEmail ? (
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-white/60">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              autoCapitalize="none"
              className="input-sacred"
            />
          </div>
        ) : null}
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-white/60">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            className="input-sacred"
          />
          <p className="mt-2 text-xs text-white/40">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="password_confirm" className="mb-2 block text-sm text-white/60">
            Password again
          </label>
          <input
            id="password_confirm"
            name="password_confirm"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            className="input-sacred"
          />
        </div>
        <button type="submit" className="btn-sacred mt-2 w-full">
          Save and open my page
        </button>
      </form>
    </AuthShell>
  );
}
