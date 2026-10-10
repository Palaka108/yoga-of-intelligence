import type { Metadata } from 'next';
import AuthShell from '@/components/session/AuthShell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reset password — Untherapy',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string };
}) {
  const sent = searchParams.sent === '1';
  const rate = searchParams.error === 'rate';
  const unavailable = searchParams.error === 'unavailable';

  return (
    <AuthShell title="Reset password">
      {sent ? (
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-white/80">
            If that email has a page, check your inbox for a link. It expires in a week. You can also
            ask Palaka to send you one.
          </p>
          <a href="/session/login" className="btn-sacred w-full">
            Back to sign in
          </a>
        </div>
      ) : (
        <form action="/api/session/forgot" method="post" className="space-y-4 text-left">
          <p className="text-center text-base leading-relaxed text-white/75">
            Enter the email on your page. If email is set up here, a one-time link will be sent.
            Otherwise ask Palaka.
          </p>
          {rate ? (
            <p className="text-center text-sm text-sacred-gold-light">
              Too many tries just now. Wait a little while, then try again.
            </p>
          ) : null}
          {unavailable ? (
            <p className="text-center text-sm text-sacred-gold-light">
              Reset is not open yet. Ask Palaka for a link.
            </p>
          ) : null}
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
          <button type="submit" className="btn-sacred mt-2 w-full">
            Email me a link
          </button>
          <p className="text-center text-sm text-white/55">
            <a href="/session/login" className="text-sacred-gold-light underline-offset-4 hover:underline">
              Back to sign in
            </a>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
