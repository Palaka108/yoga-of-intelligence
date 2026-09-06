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

const EXPLORE = [
  {
    n: '01',
    title: 'YOU ARE NOT MERELY YOUR MIND',
    body: 'If you can watch a thought arrive, you are not the thought. So what is the relationship between the one who is aware and everything moving through awareness?',
  },
  {
    n: '02',
    title: 'DESIRE',
    body: 'Are we directing desire — or being directed by it?',
  },
  {
    n: '03',
    title: 'CONDITIONING',
    body: 'An old model of three forces colouring everything we perceive and choose — clarity, craving, and inertia. Once you can name which one is driving, it stops driving unseen.',
  },
  {
    n: '04',
    title: 'REDIRECTION',
    body: 'Not silencing the mind. Not wanting less. Pointing the same attention somewhere that changes what it does to you.',
  },
];

const TIMELINE = [
  { time: '7:00', label: 'ARRIVE + CONNECT' },
  { time: '', label: 'MUSIC + KIRTAN' },
  { time: '', label: 'DESIRE, CONDITIONING + FREEDOM' },
  { time: '', label: 'MIND, SELF + SĀṄKHYA' },
  { time: '', label: 'MANTRA' },
  { time: '', label: 'FREE VEGETARIAN FEAST + COMMUNITY' },
  { time: '9:00', label: 'CLOSE' },
];

const FOR_YOU = [
  'curious about consciousness.',
  'trying to understand your own mind.',
  'interested in meditation but tired of clichés.',
  'drawn to philosophy, music or self-exploration.',
  'new to all of this.',
  'or simply looking for a meaningful Tuesday night in Brooklyn.',
];

export default function RedemptionPage() {
  return (
    <main className="relative overflow-x-hidden">
      <StickyCta />

      {/* ==========================================================
          01 — HERO
          ========================================================== */}
      <section className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-redemption-ink px-5 pb-7 pt-5 sm:px-8 sm:pb-8 sm:pt-7 lg:px-14">
        <Grain />

        {/* ghosted signal words behind the type */}
        <div className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center gap-2 opacity-[0.035]">
          <Marquee words={['DESIRE', 'MIND', 'IDENTITY']} />
          <Marquee words={['SIGNAL', 'FREEDOM', 'CONSCIOUSNESS']} reverse />
          <Marquee words={['WHO IS WATCHING?', 'NOISE', 'REDEMPTION']} />
        </div>

        {/* --- top rail --- */}
        <header className="relative z-20 flex items-start justify-between gap-4">
          <div>
            <Meta className="block text-redemption-ivory/60">{EVENT.brand} presents</Meta>
            <Meta className="mt-1 block text-redemption-ivory/30">{EVENT.brandPhrase}</Meta>
          </div>
          <Meta className="shrink-0 border border-redemption-vermilion px-3 py-2 text-redemption-vermilion">
            {EVENT.admission}
          </Meta>
        </header>

        {/* --- the poster --- */}
        <div className="relative z-20 py-4 sm:py-10">
          <h1 className="rdm-display rdm-hero-title font-grotesk text-[clamp(3.35rem,17vw,13.5rem)] font-black text-redemption-ivory">
            <span className="block">Who</span>
            <span className="block">Owns</span>
            <span className="block">Your</span>
            <span className="-mr-[8vw] block text-redemption-vermilion">Mind?</span>
          </h1>

          <div className="rdm-hero-sub mt-5 max-w-2xl sm:mt-8">
            <Waveform className="h-6 text-redemption-ivory/25 sm:h-8" />
            <p className="mt-4 font-editorial text-[clamp(1.3rem,4.3vw,2.9rem)] italic leading-[1.15] text-redemption-ivory/85 sm:mt-6">
              {EVENT.subtitle}
            </p>
            <Meta className="mt-3 block text-redemption-ivory/55 sm:mt-6">
              Desire · Consciousness · Freedom
            </Meta>
          </div>
        </div>

        {/* --- metadata + CTA --- */}
        <div className="relative z-20">
          <p className="rdm-hero-title-sm font-grotesk text-[clamp(2rem,9vw,4.5rem)] font-black uppercase leading-none tracking-[-0.03em] text-redemption-ivory">
            {EVENT.title}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-redemption-ivory/15 pt-4 sm:mt-7 sm:gap-y-5 sm:pt-6 sm:grid-cols-4">
            {[
              ['Date', EVENT.dateShort],
              ['Time', EVENT.timeShort],
              ['Where', 'Brooklyn'],
              ['Admission', 'Free entry'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>
                  <Meta className="text-redemption-ivory/40">{label}</Meta>
                </dt>
                <dd className="mt-1 font-grotesk text-lg font-bold uppercase tracking-tight text-redemption-ivory sm:text-xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <a
            href="#rsvp"
            className="mt-6 block w-full bg-redemption-vermilion px-8 py-4 text-center font-mono text-sm sm:mt-8 sm:py-5
                       font-semibold uppercase tracking-[0.18em] text-redemption-ivory
                       transition-colors duration-300 hover:bg-redemption-vermilion-deep sm:text-base"
          >
            Reserve your spot — free
          </a>

          <Meta className="mt-4 block text-center text-redemption-ivory/55 sm:mt-6 sm:text-left">
            {EVENT.includes.join(' • ')}
          </Meta>
          <Meta className="mt-2 block text-center text-redemption-ivory/40 sm:text-left">
            Free to attend · Donations welcome
          </Meta>
        </div>
      </section>

      <div id="hero-sentinel" aria-hidden />

      {/* ==========================================================
          02 — THE QUESTION
          ========================================================== */}
      <section className="relative overflow-hidden bg-redemption-ink px-5 py-24 sm:px-8 sm:py-32 lg:px-14">
        <Grain opacity={0.1} />
        <div className="relative z-20 mx-auto max-w-5xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">01 — The question</Meta>
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
            <div className="ml-auto mt-16 max-w-md sm:mt-24">
              <hr className="rdm-rule mb-6 text-redemption-ivory" />
              <p className="text-base leading-relaxed text-redemption-ivory/70 sm:text-lg">
                If you can watch your thoughts, who is doing the watching? And are you choosing
                your desires — or are they choosing you?
              </p>
              <Meta className="mt-6 block text-redemption-vermilion">
                Know the knower
              </Meta>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==========================================================
          03 — THE TENSION  (paper)
          ========================================================== */}
      <section className="bg-redemption-paper px-5 py-24 text-redemption-ink sm:px-8 sm:py-36 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">02 — The tension</Meta>
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <Reveal>
                <h2 className="font-grotesk text-[clamp(2.1rem,7vw,4.6rem)] font-black uppercase leading-[0.95] tracking-[-0.04em]">
                  We think freedom means
                  <br />
                  getting what we want.
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-8 font-editorial text-[clamp(1.8rem,6vw,3.6rem)] italic leading-[1.1] text-redemption-vermilion">
                  But what if the question isn’t that we want — it’s what our wanting is aimed
                  at?
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-4 lg:pt-4">
              <Reveal delay={240}>
                <hr className="rdm-rule mb-6" />
                <p className="text-base leading-relaxed text-redemption-ink/75">
                  Why do the things we chase for freedom so often end up running the schedule?
                </p>
                <p className="mt-5 text-base leading-relaxed text-redemption-ink/75">
                  And why do we spend years acquiring things that time quietly takes back?
                </p>
                <Meta className="mt-8 block text-redemption-ink/45">
                  One evening · No prerequisites
                </Meta>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          04 — THE TURN  (the hinge: accent takes the full ground)
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

          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal delay={180}>
                <p className="font-editorial text-[clamp(1.5rem,5vw,2.6rem)] italic leading-[1.15]">
                  Freedom isn’t emptying the mind. It’s changing what owns it.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-5 lg:pt-3">
              <Reveal delay={240}>
                <p className="text-base leading-relaxed text-redemption-ink/80">
                  Nothing here asks you to want less, think less, or feel less. The proposal is
                  stranger and more useful than that: the same attention that gets captured can
                  be aimed — and aiming it somewhere else changes what it does to you.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          05 — THE EXPERIENCE
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

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <ul className="lg:col-span-7">
              {[
                { label: 'LIVE MUSIC', note: '' },
                { label: 'KIRTAN', note: 'call-and-response mantra music' },
                { label: 'STORY', note: '' },
                { label: 'INTERACTIVE PHILOSOPHY', note: 'you talk too' },
                { label: 'MANTRA', note: '' },
                { label: 'FREE VEGETARIAN FEAST', note: '' },
              ].map((item, i) => (
                <Reveal as="li" key={item.label} delay={i * 80}>
                  <div className="flex items-baseline gap-5 border-b border-redemption-ivory/12 py-5">
                    <Meta className="w-8 shrink-0 text-redemption-ivory/30">
                      {String(i + 1).padStart(2, '0')}
                    </Meta>
                    <span>
                      <span className="font-grotesk text-[clamp(1.3rem,5vw,2.4rem)] font-bold uppercase leading-tight tracking-[-0.02em] text-redemption-ivory">
                        {item.label}
                      </span>
                      {item.note && (
                        <span className="mt-1 block font-editorial text-base italic text-redemption-ivory/45 sm:text-lg">
                          {item.note}
                        </span>
                      )}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>

            <div className="lg:col-span-5 lg:pt-6">
              <Reveal delay={200}>
                <p className="font-editorial text-[clamp(1.35rem,4.5vw,1.9rem)] italic leading-[1.35] text-redemption-ivory/85">
                  The evening moves between music, discussion, philosophy and participatory
                  mantra.
                </p>
                <p className="mt-6 text-base leading-relaxed text-redemption-ivory/65">
                  It is not a lecture. Nobody sits at the front for two hours while you take
                  notes. Sound opens the room, an idea gets put on the table, we argue about it,
                  and then we sing — and the singing turns out to be part of the argument.
                </p>
                <p className="mt-5 text-base leading-relaxed text-redemption-ivory/65">
                  You don’t have to believe anything to join in. Listen, try it, and notice what
                  happens to your attention. That’s the whole instruction.
                </p>
                <Meta className="mt-8 block text-redemption-ivory/40">
                  Come as you are · Stay as long as you like
                </Meta>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          05 — WHAT WE'LL EXPLORE  (paper)
          ========================================================== */}
      <section className="bg-redemption-paper px-5 py-24 text-redemption-ink sm:px-8 sm:py-36 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">05 — What we’ll explore</Meta>
          </Reveal>

          <div className="mt-14 space-y-0">
            {EXPLORE.map((item, i) => (
              <Reveal key={item.n} delay={i * 90}>
                <article
                  className={`grid gap-4 border-t border-redemption-ink/20 py-10 sm:grid-cols-12 sm:gap-8 ${
                    i % 2 === 1 ? 'sm:pl-[8%]' : ''
                  }`}
                >
                  <div className="sm:col-span-2">
                    <span className="font-grotesk text-[clamp(2.4rem,7vw,4rem)] font-black leading-none tracking-tighter text-redemption-vermilion">
                      {item.n}
                    </span>
                  </div>
                  <div className="sm:col-span-10">
                    <h3 className="font-grotesk text-[clamp(1.5rem,5.5vw,2.7rem)] font-black uppercase leading-[1.02] tracking-[-0.03em]">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-redemption-ink/75 sm:text-lg">
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
          06 — AN ANCIENT MAP OF A MODERN PROBLEM
          ========================================================== */}
      <section className="relative overflow-hidden bg-redemption-ink px-5 py-24 sm:px-8 sm:py-36 lg:px-14">
        <Grain opacity={0.12} />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 opacity-[0.04]">
          <Marquee words={['SĀṄKHYA', 'OBSERVER', 'MACHINERY']} reverse />
        </div>

        <div className="relative z-20 mx-auto max-w-6xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">06 — An ancient map of a modern problem</Meta>
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
                  an old conversation asked a surprisingly modern question: what actually binds
                  the mind — and what makes consciousness free?
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-5 lg:pt-4">
              <Reveal delay={220}>
                <hr className="rdm-rule mb-6 text-redemption-ivory" />
                <p className="text-base leading-relaxed text-redemption-ivory/70">
                  The evening draws on a dialogue between a teacher, Kapila, and his mother,
                  Devahūti, and on the analytical system it belongs to — Sāṅkhya, a map of how
                  attention, desire and identity actually operate.
                </p>
                <p className="mt-5 text-base leading-relaxed text-redemption-ivory/70">
                  She asks him a direct question: how does a person get free? What comes back
                  isn’t a belief system. It’s an analysis — and it holds up unreasonably well
                  against a Tuesday in 2026.
                </p>
                <Meta className="mt-8 block text-redemption-ivory/40">
                  No background required · Nothing to sign up to
                </Meta>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          07 — WHAT YOUR NIGHT LOOKS LIKE  (paper)
          ========================================================== */}
      <section className="bg-redemption-paper-deep px-5 py-24 text-redemption-ink sm:px-8 sm:py-36 lg:px-14">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">07 — What your night looks like</Meta>
          </Reveal>

          <Reveal>
            <h2 className="mt-10 font-grotesk text-[clamp(2rem,8vw,4.4rem)] font-black uppercase leading-[0.95] tracking-[-0.04em]">
              Two hours,
              <br />
              seven movements.
            </h2>
          </Reveal>

          <ol className="mt-14">
            {TIMELINE.map((row, i) => (
              <Reveal as="li" key={row.label} delay={i * 70}>
                <div className="flex items-baseline gap-5 border-t border-redemption-ink/25 py-6 sm:gap-10">
                  <span className="w-14 shrink-0 font-mono text-sm tabular-nums text-redemption-vermilion sm:w-20 sm:text-base">
                    {row.time || '·'}
                  </span>
                  <span className="font-grotesk text-[clamp(1.05rem,4.2vw,1.9rem)] font-bold uppercase leading-tight tracking-[-0.015em]">
                    {row.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal>
            <p className="mt-8 border-t border-redemption-ink/25 pt-6 text-sm leading-relaxed text-redemption-ink/60">
              Doors at 7:00, close at 9:00. The order is the shape of the evening rather than a
              stopwatch — some nights the music runs long, and that is usually a good sign.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==========================================================
          08 — WHO THIS IS FOR
          ========================================================== */}
      <section className="relative overflow-hidden bg-redemption-ink px-5 py-24 sm:px-8 sm:py-36 lg:px-14">
        <Grain opacity={0.1} />
        <div className="relative z-20 mx-auto max-w-6xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">08 — Who this is for</Meta>
          </Reveal>

          <Reveal>
            <h2 className="mt-10 font-grotesk text-[clamp(2.2rem,9vw,5.5rem)] font-black uppercase leading-[0.92] tracking-[-0.04em]">
              Come if you’re…
            </h2>
          </Reveal>

          <ul className="mt-12 max-w-3xl">
            {FOR_YOU.map((line, i) => (
              <Reveal as="li" key={line} delay={i * 80}>
                <p className="border-b border-redemption-ivory/12 py-5 font-editorial text-[clamp(1.3rem,4.6vw,2.2rem)] italic leading-snug text-redemption-ivory/85">
                  {line}
                </p>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={160}>
            <div className="mt-16 border-l-2 border-redemption-vermilion pl-6 sm:ml-auto sm:max-w-lg">
              <p className="font-grotesk text-[clamp(1.1rem,4vw,1.7rem)] font-bold uppercase leading-tight tracking-[-0.01em] text-redemption-ivory">
                No previous experience.
                <br />
                No need to know Sanskrit.
                <br />
                No need to know how to sing.
              </p>
              <p className="mt-5 font-editorial text-[clamp(1.5rem,5vw,2.4rem)] italic text-redemption-vermilion">
                Just come curious.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==========================================================
          09 — THE FEAST  (paper, warm)
          ========================================================== */}
      <section className="bg-redemption-paper px-5 py-24 text-redemption-ink sm:px-8 sm:py-36 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Meta className="text-redemption-vermilion">09 — The feast</Meta>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Reveal>
                <p className="font-editorial text-[clamp(1.8rem,6vw,3.2rem)] italic leading-[1.1]">
                  And yes —
                </p>
                <h2 className="mt-2 font-grotesk text-[clamp(2.6rem,11vw,7.5rem)] font-black uppercase leading-[0.86] tracking-[-0.045em]">
                  We’re
                  <br />
                  <span className="text-redemption-vermilion">feeding you.</span>
                </h2>
              </Reveal>
            </div>

            <div className="lg:col-span-4">
              <Reveal delay={180}>
                <hr className="rdm-rule mb-6" />
                <p className="font-grotesk text-xl font-black uppercase tracking-tight">
                  Free vegetarian feast. Because good conversations shouldn’t end hungry.
                </p>
                <p className="mt-5 text-base leading-relaxed text-redemption-ink/75">
                  Cooked fresh, served hot, eaten together. The night does not end with a
                  conclusion — it ends with a plate in your hand and a conversation you did not
                  plan on having.
                </p>
                <p className="mt-5 text-base leading-relaxed text-redemption-ink/75">
                  There is no ticket and no charge. The evening runs on donations, so give
                  something if it moved you and nothing if it didn’t — both are genuinely fine.
                </p>
                <Meta className="mt-7 block text-redemption-ink/45">
                  Bring a friend · Bring an appetite
                </Meta>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          10 — HOST  (editorial profile; awaiting final copy)
          ========================================================== */}
      <section className="bg-redemption-paper px-5 pb-24 text-redemption-ink sm:px-8 sm:pb-36 lg:px-14">
        <div className="mx-auto max-w-6xl border-t border-redemption-ink/20 pt-16">
          <Reveal>
            <Meta className="text-redemption-vermilion">10 — Your host</Meta>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <Reveal>
                {/* Placeholder frame — replace with the final portrait. */}
                <div className="flex aspect-[4/5] w-full items-center justify-center border border-redemption-ink/25 bg-redemption-paper-deep">
                  <Meta className="px-6 text-center text-redemption-ink/40">
                    Host portrait
                    <br />
                    to be supplied
                  </Meta>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7 lg:pt-6">
              <Reveal delay={140}>
                <h2 className="font-grotesk text-[clamp(1.8rem,6vw,3.4rem)] font-black uppercase leading-[0.98] tracking-[-0.035em]">
                  Host name
                  <span className="text-redemption-vermilion">.</span>
                </h2>
                <p className="mt-6 font-editorial text-[clamp(1.3rem,4.4vw,2rem)] italic leading-snug text-redemption-ink/80">
                  Biography to be supplied.
                </p>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-redemption-ink/60">
                  This section is a placeholder. Send the final portrait and bio and it drops
                  straight in — the layout is built for roughly 60–120 words plus a short
                  standfirst line.
                </p>
                <Meta className="mt-8 block text-redemption-ink/40">
                  {EVENT.brand} · {EVENT.brandPhrase}
                </Meta>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          11 — FINAL CTA + RSVP
          ========================================================== */}
      <section
        id="rsvp-section"
        className="relative overflow-hidden bg-redemption-ink px-5 py-24 sm:px-8 sm:py-32 lg:px-14"
      >
        <Grain opacity={0.14} />
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-0 opacity-[0.05]">
          <Marquee words={['REDEMPTION', 'FREE', 'BROOKLYN']} />
        </div>

        <div className="relative z-20 mx-auto max-w-6xl">
          <Reveal>
            <h2 className="rdm-display font-grotesk text-[clamp(2.6rem,13vw,9rem)] font-black text-redemption-ivory">
              Who owns
              <br />
              <span className="text-redemption-vermilion">your mind?</span>
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-8 font-editorial text-[clamp(1.4rem,5vw,2.5rem)] italic leading-snug text-redemption-ivory/85">
              There’s one way to start finding out.
              <br />
              Come experience it.
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
                  It’s free. It takes ten seconds.
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
            <Meta className="text-redemption-ivory/50">
              {EVENT.brand} · {EVENT.brandPhrase}
            </Meta>
            <Meta className="text-redemption-ivory/35">
              {EVENT.dateShort} · {EVENT.timeShort} · {EVENT.venue.city}
            </Meta>
          </div>
          <p className="mt-6 max-w-2xl text-xs leading-relaxed text-redemption-ivory/35">
            A special {EVENT.brand} presentation taking place during a Tuesday Bhakti Night
            programme in Brooklyn. Contact details collected on this page are used to confirm
            your spot and send reminders for this event only.
          </p>
        </div>
      </footer>
    </main>
  );
}
