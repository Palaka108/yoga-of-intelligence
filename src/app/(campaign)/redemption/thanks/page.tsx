import type { Metadata } from 'next';
import Link from 'next/link';
import { EVENT, MAPS_URL } from '@/lib/redemption-event';
import Grain from '../_components/Grain';
import Marquee from '../_components/Marquee';
import ShareButton from '../_components/ShareButton';
import Waveform from '../_components/Waveform';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yogaofintelligence.com';
const shareUrl = `${siteUrl.replace(/\/$/, '')}/redemption`;

export const metadata: Metadata = {
  title: `You’re in — ${EVENT.title}`,
  description: EVENT.og.description,
  // A confirmation page has nothing to offer search; keep it out of the index.
  robots: { index: false, follow: false },
};

function Meta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[11px] uppercase tracking-[0.22em] ${className}`}>
      {children}
    </span>
  );
}

export default function ThanksPage() {
  return (
    <main className="relative flex min-h-[100svh] flex-col overflow-hidden bg-redemption-ink px-5 py-10 sm:px-8 lg:px-14">
      <Grain />

      <div className="pointer-events-none absolute inset-x-0 top-1/3 z-0 opacity-[0.045]">
        <Marquee words={['REDEMPTION', 'SEE YOU THERE', 'BROOKLYN']} />
      </div>

      <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-10">
        <Meta className="text-redemption-vermilion">Confirmed</Meta>

        <h1 className="rdm-display mt-6 font-grotesk text-[clamp(3.4rem,19vw,11rem)] font-black text-redemption-ivory">
          You’re
          <br />
          <span className="text-redemption-vermilion">in.</span>
        </h1>

        <Waveform className="mt-8 text-redemption-ivory/25" />

        <p className="mt-8 max-w-xl font-editorial text-[clamp(1.3rem,4.5vw,2rem)] italic leading-snug text-redemption-ivory/85">
          Check your inbox for the confirmation. Then put it in your calendar before life gets in
          the way.
        </p>

        {/* event card */}
        <div className="mt-12 border-t border-redemption-ivory/15 pt-8">
          <p className="font-grotesk text-[clamp(1.9rem,8vw,3.4rem)] font-black uppercase leading-none tracking-[-0.03em]">
            {EVENT.title}
          </p>

          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt>
                <Meta className="text-redemption-ivory/40">When</Meta>
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-redemption-ivory/85">
                {EVENT.dateLabel}
                <br />
                {EVENT.timeLabel}
              </dd>
            </div>
            <div>
              <dt>
                <Meta className="text-redemption-ivory/40">Where</Meta>
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-redemption-ivory/85">
                {EVENT.venue.street}
                <br />
                {EVENT.venue.city}, {EVENT.venue.region}
              </dd>
            </div>
            <div>
              <dt>
                <Meta className="text-redemption-ivory/40">Admission</Meta>
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-redemption-ivory/85">
                {EVENT.admissionLong}
              </dd>
            </div>
            <div>
              <dt>
                <Meta className="text-redemption-ivory/40">Includes</Meta>
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-redemption-ivory/85">
                {EVENT.includes.join(' · ')}
              </dd>
            </div>
          </dl>
        </div>

        {/* actions */}
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href="/api/redemption/ics"
            className="w-full bg-redemption-vermilion px-6 py-4 text-center font-mono text-xs
                       font-semibold uppercase tracking-[0.2em] text-redemption-ivory
                       transition-colors duration-300 hover:bg-redemption-vermilion-deep sm:w-auto"
          >
            Add to calendar
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border border-redemption-ivory/30 px-6 py-4 text-center font-mono text-xs
                       uppercase tracking-[0.2em] text-redemption-ivory transition-colors duration-300
                       hover:border-redemption-vermilion hover:text-redemption-vermilion sm:w-auto"
          >
            Directions ↗
          </a>
          <ShareButton url={shareUrl} />
        </div>

        {EVENT.venueRsvpUrl && (
          <div className="mt-12 border-t border-redemption-ivory/15 pt-8">
            <Meta className="text-redemption-ivory/40">One optional extra</Meta>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-redemption-ivory/70">
              You’re on our list — that part is done. The evening runs inside{' '}
              {EVENT.venueName}’s Tuesday programme, and they keep their own headcount for
              seating and prasadam. Adding your name there too helps them plan.
            </p>
            <a
              href={EVENT.venueRsvpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block border-b border-redemption-ivory/40 pb-1 font-mono
                         text-[11px] uppercase tracking-[0.22em] text-redemption-ivory/70
                         transition-colors hover:border-redemption-vermilion
                         hover:text-redemption-vermilion"
            >
              Also tell the venue ↗
            </a>
          </div>
        )}

        <p className="mt-10 max-w-xl text-sm leading-relaxed text-redemption-ivory/50">
          One more thing: this is better with someone else. Send it to the friend who always
          starts the conversation you end up thinking about for a week.
        </p>
      </div>

      <footer className="relative z-20 mx-auto w-full max-w-4xl border-t border-redemption-ivory/12 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Meta className="text-redemption-ivory/50">
            {EVENT.brand} · {EVENT.brandPhrase}
          </Meta>
          <Link
            href="/redemption"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-redemption-ivory/40
                       transition-colors hover:text-redemption-vermilion"
          >
            ← Back to the event
          </Link>
        </div>
      </footer>
    </main>
  );
}
