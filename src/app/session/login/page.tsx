import type { Metadata } from 'next';
import AuthShell from '@/components/session/AuthShell';
import { sessionIdFromNext } from '@/lib/session-auth';
import { sessionPath } from '@/lib/session-participants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in — Untherapy',
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  credentials: 'That email and password did not match.',
  rate: 'Too many tries just now. Wait a little while, then try again.',
  unavailable: 'Sign-in is not open yet. Ask Palaka for your personal link.',
};

export default function SessionLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const message = searchParams.error ? ERRORS[searchParams.error] : null;
  const nextId = sessionIdFromNext(searchParams.next);
  const nextValue = nextId ? sessionPath(nextId) : '';

  return (
    <AuthShell title="Sign in">
      <form action="/api/session/login" method="post" className="space-y-4 text-left">
        <p className="text-center text-base leading-relaxed text-white/75">
          Use the email and password for your page.
        </p>
        {message ? <p className="text-center text-sm text-sacred-gold-light">{message}</p> : null}
        {nextValue ? <input type="hidden" name="next" value={nextValue} /> : null}
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
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-white/60">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            maxLength={72}
            autoComplete="current-password"
            className="input-sacred"
          />
        </div>
        <button type="submit" className="btn-sacred mt-2 w-full">
          Sign in
        </button>
      </form>
      <p className="mt-5 text-sm text-white/55">
        <a href="/session/forgot" className="text-sacred-gold-light underline-offset-4 hover:underline">
          Forgot password
        </a>
      </p>
      <p className="mt-3 text-sm text-white/55">
        New here?{' '}
        <a href="/join" className="text-sacred-gold-light underline-offset-4 hover:underline">
          Open a page
        </a>
      </p>
    </AuthShell>
  );
}
