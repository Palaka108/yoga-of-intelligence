import type { Metadata } from 'next';
import { EVENT, MAPS_URL } from '@/lib/redemption-event';
import Grain from './_components/Grain';
import Direction from './_components/Direction';
import Marquee from './_components/Marquee';
import Reveal from './_components/Reveal';
import RsvpForm from './_components/RsvpForm';
import StickyCta from './_components/StickyCta';
import Waveform from './_components/Waveform';

export const metadata: Metadata = {
  title: EVENT.og.title,
  description: EVENT.og.description,
};

/* Small all-caps metadata — the recurring "liner notes" voice. */
function Meta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`font-mono text-[12px] uppercase leading-relaxed tracking-[0.18em] ${className}`}
    >
      {children}
    </span>
  );
}

/* The three things that happen. Kirtan is glossed once and left alone after:
   it is the music, not a separate item from it. */
const EXPERIENCE = [
  { label: 'LIVE KIRTAN', note: 'Call-and-response mantra music.' },
  {
    label: 'INTERACTIVE PHILOSOPHY',
    note: 'A conversation about desire, consciousness and freedom — not a conventional lecture.',
  },
  { label: 'VEGETARIAN DINNER', note: 'Stay, eat and connect afterward.' },
];

export default function RedemptionPage() {
  return (
    <main className="relative overflow-x-hidden">
      <StickyCta />

      {/* ==========================================================
          1 — HERO
          ========================================================== */}
      <section className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-redemption-ink px-5 pb-7 pt-5 sm:px-8 sm:pb-8 sm:pt-7 lg:px-14">
        <Grain />

        {/* ghosted signal words behind the type */}
        <div className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center gap-2 opacity-[0.035]">
          <Marquee words={['DESIRE', 'MIND', 'IDENTITY']} />
          <Marquee words={['SIGNAL', 'FREEDOM', 'CONSCIOUSNESS']} reverse />
          <Marquee words={['EMANCIPATION', 'NOISE', 'ATTENTION']} />
        </div>

        {/* --- top rail --- */}
        {/* Donations moved down beside the event details: as a boxed badge up
            here it crowded the top of the phone screen and forced the brand
            line onto three lines. */}
        <header className="relative z-20">
          <span className="block font-mono text-[12px] uppercase leading-relaxed tracking-[0.16em] text-redemption-ivory/65">
            {EVENT.brand} presents
          </span>
        </header>

        {/* --- the poster --- */}
        <div className="relative z-20 py-4 sm:py-8">
          {/* One long word: sized to sit inside the gutters at every width
              rather than being clipped by the viewport edge. */}
          <h1 className="rdm-display rdm-hero-title font-grotesk text-[clamp(2.1rem,11vw,9.5rem)] font-black leading-[0.9] tracking-[-0.05em] text-redemption-ivory">
            {EVENT.title}
          </h1>

          <p className="rdm-hero-song mt-3 font-grotesk text-[clamp(1.25rem,5.1vw,2.6rem)] font-bold uppercase leading-tight tracking-[-0.02em] text-redemption-vermilion sm:mt-4">
            {EVENT.songSubtitle}
          </p>

          <div className="rdm-hero-sub mt-5 max-w-2xl sm:mt-7">
            <Waveform className="h-6 text-redemption-ivory/25 sm:h-8" />
            <p className="mt-4 font-editorial text-[clamp(1.35rem,4.6vw,2.6rem)] italic leading-[1.2] text-redemption-ivory/90 sm:mt-5">
              {EVENT.subtitle}
            </p>
          </div>
        </div>

        {/* --- metadata + CTA --- */}
        <div className="relative z-20">
          {/* Set as two poster lines rather than a three-column grid: the full
              date never fits a third of a phone screen without wrapping. */}
          <div className="border-t border-redemption-ivory/15 pt-4 sm:pt-6">
            <p className="font-grotesk text-[clamp(1.05rem,4.8vw,2rem)] font-bold uppercase leading-[1.25] tracking-[-0.01em] text-redemption-ivory">
              Tuesday · September 22
              <br />
              <span className="text-redemption-ivory/70">
                {EVENT.timeShort} · {EVENT.venue.city}
              </span>
            </p>
            <Meta className="mt-2 block text-redemption-vermilion">{EVENT.admission}</Meta>
          </div>

          <a
            href="#rsvp"
            className="mt-5 block w-full bg-redemption-vermilion px-8 py-4 text-center font-mono text-sm sm:mt-7 sm:py-5
                       font-semibold uppercase tracking-[0.18em] text-redemption-ivory
                       transition-colors duration-300 hover:bg-redemption-vermilion-deep sm:text-base"
          >
            Reserve your spot
          </a>

          {/* The line ad traffic actually scans: set larger and looser than
              the metadata voice, and allowed to wrap onto two lines rather
              than being squeezed onto one. */}
          <p className="mt-4 text-balance text-center font-mono text-[15px] uppercase leading-[1.6] tracking-[0.08em] text-redemption-ivory/80 sm:mt-5 sm:text-left sm:text-base sm:tracking-[0.12em]">
            {EVENT.includes.join(' · ')}
          </p>
        </div>
      </section>

      <div id="hero-sentinel" aria-hidden />

      {/* ==========================================================
          2 — THE HOOK  (the whole philosophical setup, once)
          ========================================================== */}
      <section className="relative overflow-hidden bg-redemption-ink px-5 py-16 sm:px-8 sm:py-24 lg:px-14">
        <Grain opacity={0.1} />
        <div className="relative z-20 mx-auto max-w-5xl">
          <Reveal>
            <p className="font-grotesk text-[clamp(1.6rem,6.5vw,3.8rem)] font-black uppercase leading-[1.02] tracking-[-0.04em] text-redemption-ivory">
              A song about freedom.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-2 font-grotesk text-[clamp(1.6rem,6.5vw,3.8rem)] font-black uppercase leading-[1.02] tracking-[-0.04em] text-redemption-ivory/45">
              An ancient philosophy of consciousness.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-8 font-editorial text-[clamp(1.9rem,8vw,4.6rem)] italic leading-[1.02] text-redemption-vermilion sm:mt-10">
              What does it actually mean to become free?
            </p>
          </Reveal>

        </div>
      </section>

      {/* ==========================================================
          3 — THE TURN  (the signature moment; keeps its breathing room)
          ========================================================== */}
      <section className="bg-redemption-vermilion px-5 py-24 text-redemption-ink sm:px-8 sm:py-36 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-grotesk text-[clamp(2.3rem,10vw,7rem)] font-black uppercase leading-[0.9] tracking-[-0.045em]">
              Same consciousness.
              <br />
              Different direction.
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <Direction className="mt-10 text-redemption-ink" />
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-10 max-w-2xl font-editorial text-[clamp(1.45rem,4.9vw,2.4rem)] italic leading-[1.25]">
              Freedom isn’t about emptying the mind or eliminating desire.
              <br className="hidden sm:block" /> It’s about changing what consciousness is
              directed toward.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==========================================================
          4 — THE NIGHT  (what actually happens)
          ========================================================== */}
      <section className="bg-redemption-paper px-5 py-16 text-redemption-ink sm:px-8 sm:py-24 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="font-grotesk text-[clamp(1.9rem,7.5vw,4.4rem)] font-black uppercase leading-[0.95] tracking-[-0.04em]">
              A different kind of
              <br />
              Tuesday night.
            </h2>
          </Reveal>

          <ul className="mt-10 sm:mt-14">
            {EXPERIENCE.map((item, i) => (
              <Reveal as="li" key={item.label} delay={i * 90}>
                <div className="border-t border-redemption-ink/20 py-6 sm:py-7">
                  <p className="font-grotesk text-[clamp(1.3rem,5.5vw,2.6rem)] font-black uppercase leading-tight tracking-[-0.03em]">
                    {item.label}
                  </p>
                  <p className="mt-2 max-w-xl text-base leading-relaxed text-redemption-ink/70 sm:text-lg">
                    {item.note}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={120}>
            <p className="mt-10 max-w-2xl border-t border-redemption-ink/20 pt-6 text-base leading-relaxed text-redemption-ink/70 sm:text-lg">
              Inspired by the dialogue between Kapila and Devahūti in the Śrīmad-Bhāgavatam and
              an ancient yoga psychology called Sāṅkhya.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==========================================================
          5 — COME CURIOUS + RSVP
          ========================================================== */}
      <section
        id="rsvp-section"
        className="relative overflow-hidden bg-redemption-ink px-5 py-16 sm:px-8 sm:py-24 lg:px-14"
      >
        <Grain opacity={0.14} />
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-0 opacity-[0.05]">
          <Marquee words={['EMANCIPATION', 'BROOKLYN', 'SEPT 22']} />
        </div>

        <div className="relative z-20 mx-auto max-w-6xl">
          <Reveal>
            <h2 className="rdm-display font-grotesk text-[clamp(2.6rem,13vw,8rem)] font-black text-redemption-ivory">
              Come curious.
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-6 font-grotesk text-[clamp(1.15rem,4.3vw,1.7rem)] font-bold uppercase leading-[1.35] tracking-[-0.01em] text-redemption-ivory/80">
              No previous experience.
              <br />
              No Sanskrit required.
              <br />
              No need to know how to sing.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <Waveform className="mt-10 text-redemption-vermilion/40" />
          </Reveal>

          <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-12">
            {/* event card */}
            <div className="lg:col-span-5">
              <Reveal>
                <p className="font-grotesk text-[clamp(1.5rem,5.5vw,2.4rem)] font-bold uppercase leading-[1.3] tracking-[-0.02em] text-redemption-ivory">
                  {EVENT.dateLabel}
                  <br />
                  <span className="text-redemption-ivory/65">{EVENT.timeLabel}</span>
                </p>

                <p className="mt-6 text-base leading-relaxed text-redemption-ivory/85">
                  {EVENT.venue.street}
                  <br />
                  {EVENT.venue.city}, {EVENT.venue.region}
                </p>

                <Meta className="mt-6 block text-redemption-vermilion">{EVENT.admission}</Meta>

                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block border-b border-redemption-vermilion pb-1 font-mono
                             text-[11px] uppercase tracking-[0.22em] text-redemption-vermilion"
                >
                  Get directions ↗
                </a>
              </Reveal>
            </div>

            {/* the form */}
            <div className="lg:col-span-7">
              <Reveal delay={120}>
                <Meta className="text-redemption-vermilion">Reserve your spot</Meta>
                <p className="mb-8 mt-3 font-grotesk text-[clamp(1.3rem,4.6vw,2rem)] font-bold uppercase leading-tight tracking-[-0.025em]">
                  It takes ten seconds.
                </p>
                <RsvpForm />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= FOOTER ========================= */}
      <footer className="bg-redemption-ink px-5 pb-28 pt-8 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-6xl border-t border-redemption-ivory/12 pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <Meta className="text-redemption-ivory/50">{EVENT.brand}</Meta>
            <Meta className="text-redemption-ivory/55">
              {EVENT.dateShort} · {EVENT.timeShort} · {EVENT.venue.city}
            </Meta>
          </div>
          <p className="mt-5 max-w-2xl text-[13px] leading-relaxed text-redemption-ivory/60">
            A special {EVENT.brand} presentation taking place during a Tuesday Bhakti Night
            programme in Brooklyn. Contact details collected on this page are used to confirm
            your spot and send reminders for this event only.
          </p>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-redemption-ivory/50">
            {EVENT.disclaimer}
          </p>
        </div>
      </footer>
    </main>
  );
}
