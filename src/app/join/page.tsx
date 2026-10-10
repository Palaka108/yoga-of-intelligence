import type { Metadata } from 'next';
import { isSignupReady } from '@/lib/elevenlabs-agent';
import { joinCodeRequired, type JoinError } from '@/lib/session-join';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Join — Untherapy',
  robots: { index: false, follow: false },
};

const VIDEO_URL =
  'https://qwlbbcrjdpuxkavwyjyg.supabase.co/storage/v1/object/public/yoi-content/intro/water-background.mp4';

const ERRORS: Record<JoinError, string> = {
  name: 'Please enter your name.',
  email: 'That email does not look quite right.',
  code: 'That code did not match.',
  rate: 'Too many tries just now. Wait a little while, then try again.',
  unavailable: 'Sign-up is not open yet. Ask Palaka for your personal link.',
  failed: 'Something got in the way. Ask Palaka for your personal link.',
};

function messageFor(error: string | undefined): string | null {
  if (!error) return null;
  return error in ERRORS ? ERRORS[error as JoinError] : null;
}

export default function JoinPage({ searchParams }: { searchParams: { error?: string } }) {
  const open = isSignupReady();
  const codeRequired = joinCodeRequired();
  const message = messageFor(searchParams.error);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-sacred-black">
      <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-rose-900/35 via-pink-900/30 to-slate-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,130,214,0.14)_0%,transparent_68%)]" />

      <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 py-10">
        <div className="animate-fade-in w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="font-display text-sm uppercase tracking-[0.28em] text-white/45">
            Yoga of Intelligence
          </p>
          <h1 className="font-display mx-auto mt-5 max-w-xs text-balance text-[1.85rem] font-light leading-snug text-white/90">
            Untherapy — 5-Day Reflection
          </h1>
          <div className="mx-auto my-6 h-px w-24 bg-gradient-to-r from-transparent via-sacred-gold/50 to-transparent" />

          {!open ? (
            <p className="text-lg leading-relaxed text-white/80">
              Ask Palaka for your personal link.
            </p>
          ) : (
            <form action="/api/join" method="post" className="space-y-4 text-left">
              <p className="text-center text-base leading-relaxed text-white/75">
                Leave your name and a quiet page will be opened for you.
              </p>
              {message ? <p className="text-center text-sm text-sacred-gold-light">{message}</p> : null}
              <div>
                <label htmlFor="name" className="mb-2 block text-sm text-white/60">
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  maxLength={80}
                  autoComplete="name"
                  className="input-sacred"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-white/60">
                  Email <span className="text-white/35">optional</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={200}
                  autoComplete="email"
                  className="input-sacred"
                />
              </div>
              {codeRequired ? (
                <div>
                  <label htmlFor="code" className="mb-2 block text-sm text-white/60">
                    Code from Palaka
                  </label>
                  <input
                    id="code"
                    name="code"
                    required
                    autoComplete="off"
                    className="input-sacred"
                  />
                </div>
              ) : null}
              <button type="submit" className="btn-sacred mt-2 w-full">
                Open my page
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
