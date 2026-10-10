import type { Metadata } from 'next';
import AuthShell from '@/components/session/AuthShell';
import { isSignupReady } from '@/lib/elevenlabs-agent';
import { joinCodeRequired, type JoinError } from '@/lib/session-join';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Join — Untherapy',
  robots: { index: false, follow: false },
};

const ERRORS: Record<JoinError, string> = {
  name: 'Please enter your name.',
  email: 'Please enter a valid email.',
  password: 'Use 8 to 72 characters, and enter the password the same way twice.',
  code: 'That code did not match.',
  rate: 'Too many tries just now. Wait a little while, then try again.',
  unavailable: 'Sign-up is not open yet. Ask Palaka for your personal link.',
  failed: 'Something got in the way. Ask Palaka for your personal link.',
  taken: 'That email already has a page.',
  signin: 'Your page is ready. Sign in to open it.',
};

export default function JoinPage({ searchParams }: { searchParams: { error?: string } }) {
  const open = isSignupReady();
  const codeRequired = joinCodeRequired();
  const error = searchParams.error;
  const message = error && error in ERRORS ? ERRORS[error as JoinError] : null;

  return (
    <AuthShell title="Untherapy — 5-Day Reflection">
      {!open ? (
        <div>
          <p className="text-lg leading-relaxed text-white/80">Ask Palaka for your personal link.</p>
          <p className="mt-5 text-sm text-white/55">
            Already have a page?{' '}
            <a href="/session/login" className="text-sacred-gold-light underline-offset-4 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      ) : (
        <form action="/api/join" method="post" className="space-y-4 text-left">
          <p className="text-center text-base leading-relaxed text-white/75">
            Leave your name and a quiet page will be opened for you.
          </p>
          {message ? <p className="text-center text-sm text-sacred-gold-light">{message}</p> : null}
          {error === 'taken' ? (
            <p className="text-center text-sm text-white/70">
              <a href="/session/login" className="text-sacred-gold-light underline-offset-4 hover:underline">
                Sign in instead
              </a>
            </p>
          ) : null}
          {error === 'signin' ? (
            <p className="text-center text-sm text-white/70">
              <a href="/session/login" className="text-sacred-gold-light underline-offset-4 hover:underline">
                Sign in
              </a>
            </p>
          ) : null}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-white/60">
              Your name
            </label>
            <input id="name" name="name" required maxLength={80} autoComplete="name" className="input-sacred" />
          </div>
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
          {codeRequired ? (
            <div>
              <label htmlFor="code" className="mb-2 block text-sm text-white/60">
                Code from Palaka
              </label>
              <input id="code" name="code" required autoComplete="off" className="input-sacred" />
            </div>
          ) : null}
          <button type="submit" className="btn-sacred mt-2 w-full">
            Open my page
          </button>
          <p className="text-center text-sm text-white/55">
            Already have a page?{' '}
            <a href="/session/login" className="text-sacred-gold-light underline-offset-4 hover:underline">
              Sign in
            </a>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
