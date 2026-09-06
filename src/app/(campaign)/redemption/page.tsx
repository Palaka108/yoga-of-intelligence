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
      className={`font-mono text-[11px] uppercase leading-relaxed tracking-[0.22em] ${className}`}
    >
      {children}
    </span>
  );
}

/* The three parts of the evening. Kirtan is glossed on first appearance and
   left alone after that — it is the music, not a separate item from it. */
const EXPERIENCE = [
  { label: 'LIVE KIRTAN', note: 'Call-and-response mantra music' },
  { label: 'INTERACTIVE PHILOSOPHY', note: 'Ideas explored together, not a lecture' },
  { label: 'VEGETARIAN DINNER', note: 'Food, conversation and community afterward' },
];

/* Shape of the night, not a run-of-show. Only the 7-9 bounds are real times. */
const TIMELINE = [
  { time: '7 PM', label: 'ARRIVE + LIVE KIRTAN' },
  { time: '', label: 'CONVERSATION + PHILOSOPHY' },
  { time: '', label: 'VEGETARIAN DINNER + COMMUNITY' },
  { time: '9 PM', label: 'CLOSE' },
];

const EXPLORE = [
  {
    n: '01',
    title: 'YOU ARE NOT MERELY YOUR MIND',
    body: 'If you can watch a thought arrive, you are not the thought. So who is watching?',
  },
  {
    n: '02',
    title: 'DESIRE',
    body: 'Are you choosing your desires — or are they choosing you?',
  },
  {
    n: '03',
    title: 'CONDITIONING',
    body: 'An ancient model of three forces colouring what we perceive and choose: clarity, craving, inertia.',
  },
  {
    n: '04',
    title: 'REDIRECTION',
    body: 'Not silencing the mind. Not wanting less. Aiming the same attention somewhere else.',
  },
];

const CURIOUS = ['CONSCIOUSNESS', 'THE MIND', 'MEDITATION', 'MUSIC', 'PHILOSOPHY'];

export default function RedemptionPage() {
  return (
    <main className="relative overflow-x-hidden">
      <StickyCta />

      {/* ==========================================================
          HERO
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
        <header className="relative z-20 flex items-start justify-between gap-4">
          {/* Tighter tracking than the standard Meta so the brand line holds
              two lines on a phone instead of three. */}
          <span className="block font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-redemption-ivory/60 sm:tracking-[0.22em]">
            {EVENT.brand} presents
          </span>
          <Meta className="shrink-0 border border-redemption-vermilion px-3 py-2 text-center text-redemption-vermilion">
            {EVENT.admission}
          </Meta>
        </header>

        {/* --- the poster --- */}
        <div className="relative z-20 py-4 sm:py-8">
          {/* One long word: sized to sit inside the gutters at every width
              rather than being clipped by the viewport edge. */}
          <h1 className="rdm-display rdm-hero-title font-grotesk text-[clamp(2.1rem,11vw,9.5rem)] font-black leading-[0.9] tracking-[-0.05em] text-redemption-ivory">
            {EVENT.title}
          </h1>

          <p className="rdm-hero-song mt-3 font-grotesk text-[clamp(1.05rem,4.4vw,2.6rem)] font-bold uppercase leading-tight tracking-[-0.02em] text-redemption-vermilion sm:mt-4">
            {EVENT.songSubtitle}
          </p>

          <div className="rdm-hero-sub mt-5 max-w-2xl sm:mt-7">
            <Waveform className="h-6 text-redemption-ivory/25 sm:h-8" />
            <p className="mt-4 font-editorial text-[clamp(1.2rem,4vw,2.6rem)] italic leading-[1.15] text-redemption-ivory/85 sm:mt-5">
              {EVENT.subtitle}
            </p>
          </div>
        </div>

        {/* --- metadata + CTA --- */}
        <div className="relative z-20">
          {/* Set as two poster lines rather than a three-column grid: the full
              date never fits a third of a phone screen without wrapping. */}
          <p className="border-t border-redemption-ivory/15 pt-4 font-grotesk text-[clamp(1.05rem,4.8vw,2rem)] font-bold uppercase leading-[1.25] tracking-[-0.01em] text-redemption-ivory sm:pt-6">
            Tuesday · September 22
            <br />
            <span className="text-redemption-ivory/65">
              {EVENT.timeShort} · {EVENT.venue.city}
            </span>
          </p>

          <a
            href="#rsvp"
            className="mt-6 block w-full bg-redemption-vermilion px-8 py-4 text-center font-mono text-sm sm:mt-8 sm:py-5
                       font-semibold uppercase tracking-[0.18em] text-redemption-ivory
                       transition-colors duration-300 hover:bg-redemption-vermilion-deep sm:text-base"
          >
            Reserve your spot
          </a>

          <Meta className="mt-4 block text-center text-redemption-ivory/55 sm:mt-6 sm:text-left">
            {EVENT.includes.join(' · ')}
          </Meta>
        </div>
      </section>

      <div id="hero-sentinel" aria-hidden />

      {/* ==========================================================
          01 — THE DOORWAY  (why "Redemption Song")
          ========================================================== */}
      <section className="relative overflow-hidden bg-redemption-ink px-5 py-24 sm:px-8 sm:py-32 lg:px-14">
        <Grain opacity={0.1} />
        <div className="relative z-20 mx-auto max-w-5xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">01 — The doorway</Meta>
          </Reveal>

          <div className="mt-12 sm:mt-16">
            <Reveal>
              <p className="font-grotesk text-[clamp(1.7rem,7vw,4.2rem)] font-black uppercase leading-[1.02] tracking-[-0.04em] text-redemption-ivory">
                A song about freedom.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-2 font-grotesk text-[clamp(1.7rem,7vw,4.2rem)] font-black uppercase leading-[1.02] tracking-[-0.04em] text-redemption-ivory/45">
                An ancient philosophy of consciousness.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-8 font-editorial text-[clamp(1.9rem,8vw,5rem)] italic leading-[1.02] text-redemption-vermilion">
                One question: what does it actually mean to become free?
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==========================================================
          02 — THE QUESTION  (question and tension, one movement)
          ========================================================== */}
      <section className="relative overflow-hidden bg-redemption-ink px-5 py-24 sm:px-8 sm:py-32 lg:px-14">
        <Grain opacity={0.1} />
        <div className="relative z-20 mx-auto max-w-5xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">02 — The question</Meta>
          </Reveal>

          <div className="mt-12 space-y-1 sm:mt-16">
            {['You have thoughts.', 'You have desires.', 'You have habits.'].map((line, i) => (
              <Reveal key={line} delay={i * 120}>
                <p className="font-grotesk text-[clamp(2rem,8vw,5rem)] font-bold uppercase leading-[1.02] tracking-[-0.035em] text-redemption-ivory/35">
                  {line}
                </p>
              </Reveal>
            ))}
            <Reveal delay={420}>
              <p className="pt-6 font-editorial text-[clamp(2.6rem,11vw,7rem)] italic leading-[0.95] text-redemption-vermilion">
                But are they you?
              </p>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="mt-20 max-w-3xl sm:mt-28">
              <hr className="rdm-rule mb-8 text-redemption-ivory" />
              <h2 className="font-grotesk text-[clamp(1.8rem,6vw,3.6rem)] font-black uppercase leading-[0.98] tracking-[-0.04em] text-redemption-ivory">
                We think freedom means
                <br />
                getting what we want.
              </h2>
              <p className="mt-6 font-editorial text-[clamp(1.5rem,5vw,2.8rem)] italic leading-[1.1] text-redemption-vermilion">
                But what if the question is what our wanting is aimed at?
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==========================================================
          02 — THE TURN  (the hinge: accent takes the full ground)
          ========================================================== */}
      <section className="bg-redemption-vermilion px-5 py-24 text-redemption-ink sm:px-8 sm:py-36 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Meta className="text-redemption-ink/60">03 — The turn</Meta>
          </Reveal>

          <Reveal>
            <h2 className="mt-12 font-grotesk text-[clamp(2.3rem,10vw,7rem)] font-black uppercase leading-[0.9] tracking-[-0.045em]">
              Same consciousness.
              <br />
              Different direction.
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <Direction className="mt-10 text-redemption-ink" />
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-10 max-w-3xl font-editorial text-[clamp(1.5rem,5vw,2.6rem)] italic leading-[1.15]">
              Freedom isn’t about eliminating thought or desire. It’s about changing where
              consciousness is directed.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==========================================================
          03 — THE EXPERIENCE  (what the night actually is)
          ========================================================== */}
      <section className="relative overflow-hidden bg-redemption-ink px-5 py-24 sm:px-8 sm:py-36 lg:px-14">
        <Grain opacity={0.1} />
        <div className="relative z-20 mx-auto max-w-6xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">04 — The experience</Meta>
          </Reveal>

          <Reveal>
            <h2 className="mt-12 font-grotesk text-[clamp(2.4rem,10vw,7rem)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
              Don’t just listen.
              <br />
              <span className="text-redemption-vermilion">Experience it.</span>
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="mt-6 font-editorial text-[clamp(1.4rem,4.6vw,2.2rem)] italic leading-snug text-redemption-ivory/80">
              A different kind of Tuesday night in Brooklyn.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <Waveform className="mt-10 text-redemption-vermilion/40" />
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
            <ul className="lg:col-span-7">
              {EXPERIENCE.map((item, i) => (
                <Reveal as="li" key={item.label} delay={i * 80}>
                  <div className="flex items-baseline gap-5 border-b border-redemption-ivory/12 py-5">
                    <Meta className="w-8 shrink-0 text-redemption-ivory/30">
                      {String(i + 1).padStart(2, '0')}
                    </Meta>
                    <span>
                      <span className="font-grotesk text-[clamp(1.3rem,5vw,2.4rem)] font-bold uppercase leading-tight tracking-[-0.02em] text-redemption-ivory">
                        {item.label}
                      </span>
                      <span className="mt-1 block font-editorial text-base italic text-redemption-ivory/45 sm:text-lg">
                        {item.note}
                      </span>
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>

            <div className="lg:col-span-5 lg:pt-4">
              <Reveal delay={200}>
                <p className="text-base leading-relaxed text-redemption-ivory/65">
                  Sound opens the room, an idea gets put on the table, we wrestle with it
                  together — and then we sing. You don’t have to believe anything to join in.
                  Listen, try it, and notice what happens to your attention.
                </p>
              </Reveal>

              <Reveal delay={260}>
                <ol className="mt-10">
                  {TIMELINE.map((row) => (
                    <li key={row.label}>
                      <div className="flex items-baseline gap-4 border-t border-redemption-ivory/12 py-3">
                        <span className="w-12 shrink-0 font-mono text-[11px] uppercase tabular-nums tracking-[0.14em] text-redemption-vermilion">
                          {row.time || '·'}
                        </span>
                        <span className="font-grotesk text-sm font-bold uppercase leading-tight tracking-[-0.01em] text-redemption-ivory/85 sm:text-base">
                          {row.label}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
                <Meta className="mt-6 block text-redemption-ivory/40">
                  The shape of the evening, not a stopwatch
                </Meta>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          04 — THE ANCIENT IDEA  (source + what we'll explore, merged)
          ========================================================== */}
      <section className="relative overflow-hidden bg-redemption-paper px-5 py-24 text-redemption-ink sm:px-8 sm:py-36 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">05 — The ancient idea</Meta>
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <h2 className="font-grotesk text-[clamp(1.9rem,6.5vw,4.2rem)] font-black uppercase leading-[0.98] tracking-[-0.035em]">
                  Thousands of years before algorithms competed for our attention,
                </h2>
              </Reveal>
              <Reveal delay={150}>
                <p className="mt-8 font-editorial text-[clamp(1.5rem,5vw,2.6rem)] italic leading-[1.2] text-redemption-vermilion">
                  an ancient conversation explored a surprisingly modern problem: why do our own
                  desires, habits and senses sometimes seem to run us — and what does freedom
                  from that conditioning actually look like?
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-5 lg:pt-4">
              <Reveal delay={220}>
                <hr className="rdm-rule mb-6" />
                <p className="text-base leading-relaxed text-redemption-ink/75">
                  The evening draws on the dialogue between Kapila and his mother, Devahūti, and
                  on the ancient analytical philosophy of Sāṅkhya.
                </p>
                <p className="mt-5 text-base leading-relaxed text-redemption-ink/75">
                  She asks him how a person gets free. What comes back isn’t a belief system.
                  It’s an analysis — and it holds up unreasonably well against a Tuesday in 2026.
                </p>
              </Reveal>
            </div>
          </div>

          <div className="mt-20 sm:mt-28">
            {EXPLORE.map((item, i) => (
              <Reveal key={item.n} delay={i * 80}>
                <article
                  className={`grid gap-3 border-t border-redemption-ink/20 py-8 sm:grid-cols-12 sm:gap-8 ${
                    i % 2 === 1 ? 'sm:pl-[8%]' : ''
                  }`}
                >
                  <div className="sm:col-span-2">
                    <span className="font-grotesk text-[clamp(2rem,6vw,3.4rem)] font-black leading-none tracking-tighter text-redemption-vermilion">
                      {item.n}
                    </span>
                  </div>
                  <div className="sm:col-span-10">
                    <h3 className="font-grotesk text-[clamp(1.4rem,5vw,2.5rem)] font-black uppercase leading-[1.02] tracking-[-0.03em]">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-redemption-ink/75 sm:text-lg">
                      {item.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
          05 — COME CURIOUS  (who it's for, and the dinner)
          ========================================================== */}
      <section className="bg-redemption-paper-deep px-5 py-24 text-redemption-ink sm:px-8 sm:py-36 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">06 — Come curious</Meta>
          </Reveal>

          <Reveal>
            <h2 className="mt-10 font-grotesk text-[clamp(1.7rem,6vw,3.4rem)] font-black uppercase leading-[0.98] tracking-[-0.035em]">
              Come if you’re curious about:
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {CURIOUS.map((word) => (
                <li
                  key={word}
                  className="font-grotesk text-[clamp(1.4rem,5.5vw,2.6rem)] font-black uppercase tracking-[-0.03em]"
                >
                  {word}
                  <span className="pl-6 text-redemption-vermilion">·</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-xl font-editorial text-[clamp(1.3rem,4.4vw,2rem)] italic leading-snug text-redemption-ink/75">
              …or simply a different kind of Tuesday night in Brooklyn.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-14 border-l-2 border-redemption-vermilion pl-6">
              <p className="font-grotesk text-[clamp(1.05rem,3.8vw,1.6rem)] font-bold uppercase leading-tight tracking-[-0.01em]">
                No previous experience.
                <br />
                No Sanskrit required.
                <br />
                No need to know how to sing.
              </p>
              <p className="mt-4 font-editorial text-[clamp(1.5rem,5vw,2.4rem)] italic text-redemption-vermilion">
                Just come curious.
              </p>
            </div>
          </Reveal>

          {/* --- the dinner --- */}
          <div className="mt-24 border-t border-redemption-ink/20 pt-16 sm:mt-32">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <Reveal>
                  <p className="font-editorial text-[clamp(1.6rem,5.5vw,2.8rem)] italic leading-[1.1]">
                    And yes —
                  </p>
                  <h2 className="mt-2 font-grotesk text-[clamp(2.4rem,10vw,6.5rem)] font-black uppercase leading-[0.86] tracking-[-0.045em]">
                    We’re
                    <br />
                    <span className="text-redemption-vermilion">feeding you.</span>
                  </h2>
                </Reveal>
              </div>

              <div className="lg:col-span-5">
                <Reveal delay={160}>
                  <p className="font-grotesk text-lg font-black uppercase leading-tight tracking-tight sm:text-xl">
                    Vegetarian dinner. Because good conversations shouldn’t end hungry.
                  </p>
                  <p className="mt-5 text-base leading-relaxed text-redemption-ink/75">
                    Cooked fresh, served hot, eaten together. The night doesn’t end with a
                    conclusion — it ends with a plate in your hand and a conversation you didn’t
                    plan on having.
                  </p>
                  <Meta className="mt-7 block text-redemption-ink/45">
                    Donations welcomed · Bring a friend
                  </Meta>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          RSVP  (the close)
          ========================================================== */}
      <section
        id="rsvp-section"
        className="relative overflow-hidden bg-redemption-ink px-5 py-24 sm:px-8 sm:py-32 lg:px-14"
      >
        <Grain opacity={0.14} />
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-0 opacity-[0.05]">
          <Marquee words={['EMANCIPATION', 'BROOKLYN', 'SEPT 22']} />
        </div>

        <div className="relative z-20 mx-auto max-w-6xl">
          <Reveal>
            <h2 className="rdm-display font-grotesk text-[clamp(2.4rem,11vw,8rem)] font-black text-redemption-ivory">
              What does it mean
              <br />
              <span className="text-redemption-vermilion">to be free?</span>
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-8 font-editorial text-[clamp(1.4rem,5vw,2.5rem)] italic leading-snug text-redemption-ivory/85">
              There’s one way to start finding out.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <Waveform className="mt-10 text-redemption-vermilion/40" />
          </Reveal>

          <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-12">
            {/* event card */}
            <div className="lg:col-span-5">
              <Reveal>
                <p className="font-grotesk text-[clamp(1.9rem,7vw,3.2rem)] font-black uppercase leading-none tracking-[-0.03em]">
                  {EVENT.title}
                </p>

                <dl className="mt-8 space-y-5">
                  {[
                    ['When', `${EVENT.dateLabel} · ${EVENT.timeLabel}`],
                    ['Where', `${EVENT.venue.street}, ${EVENT.venue.city}, ${EVENT.venue.region}`],
                    ['Admission', EVENT.admissionLong],
                    ['Includes', EVENT.includes.join(' · ')],
                  ].map(([label, value]) => (
                    <div key={label} className="border-t border-redemption-ivory/15 pt-4">
                      <dt>
                        <Meta className="text-redemption-ivory/40">{label}</Meta>
                      </dt>
                      <dd className="mt-1 text-base leading-relaxed text-redemption-ivory/85">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-block border-b border-redemption-vermilion pb-1 font-mono
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
                <p className="mb-10 mt-4 font-grotesk text-[clamp(1.4rem,5vw,2.2rem)] font-bold uppercase leading-tight tracking-[-0.025em]">
                  It takes ten seconds.
                </p>
                <RsvpForm />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= FOOTER ========================= */}
      <footer className="bg-redemption-ink px-5 pb-28 pt-10 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-6xl border-t border-redemption-ivory/12 pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <Meta className="text-redemption-ivory/50">{EVENT.brand}</Meta>
            <Meta className="text-redemption-ivory/35">
              {EVENT.dateShort} · {EVENT.timeShort} · {EVENT.venue.city}
            </Meta>
          </div>
          <p className="mt-6 max-w-2xl text-xs leading-relaxed text-redemption-ivory/35">
            A special {EVENT.brand} presentation taking place during a Tuesday Bhakti Night
            programme in Brooklyn. Contact details collected on this page are used to confirm
            your spot and send reminders for this event only.
          </p>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-redemption-ivory/25">
            {EVENT.disclaimer}
          </p>
        </div>
      </footer>
    </main>
  );
}
