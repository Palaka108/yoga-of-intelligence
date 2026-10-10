import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Journey — Yoga of Intelligence',
  description:
    'Follow the Untherapy process, from conceptions and the senses to the path inward.',
};

const VIDEO_URL =
  'https://qwlbbcrjdpuxkavwyjyg.supabase.co/storage/v1/object/public/yoi-content/intro/water-background.mp4';

const STEPS = [
  {
    title: 'We never meet raw facts',
    caption: 'We meet conceptions.',
    src: '/journey/01-conceptions.webp',
    alt: 'Diagram titled Conceptions. Three nested layers: the objective world, then the senses and the mind, then concepts. A note says we never meet raw facts, we meet conceptions.',
  },
  {
    title: 'Senses as conceptual frameworks',
    caption: 'From −10 to +10.',
    src: '/journey/02-senses.webp',
    alt: 'Diagram of the senses as a spectrum from negative ten to positive ten. Sight, taste, smell, touch, and hearing are shown as conceptual frameworks, with the body in the center.',
  },
  {
    title: 'Qualia',
    caption: 'The qualities experience is made of.',
    src: '/journey/03-qualia.webp',
    alt: 'Diagram titled Qualia. Taste, smell, sight, hearing, and touch pass through the mind and become concepts.',
  },
  {
    title: 'Reality hidden within the appearance',
    caption: 'What appears is not the whole of what is.',
    src: '/journey/04-appearance.webp',
    alt: 'Diagram of phenomena and noumena. The senses and the manifest world are in front. Reality is hidden within the appearance.',
  },
  {
    title: 'Anatomy of the inner life',
    caption: 'The subtle body, from the senses upward.',
    src: '/journey/05-subtle-body.webp',
    alt: 'Diagram of the subtle body. From the bottom: the senses, the mind, the intellect, the ego, and the moral sense. The soul is shown behind them.',
  },
  {
    title: 'The illusion of outside-in',
    caption: 'Change flows top-down.',
    src: '/journey/06-outside-in.webp',
    alt: 'Diagram showing change flowing downward from the moral sense through ego, intellect, and mind to the senses, rather than from the outside in.',
  },
  {
    title: 'You are not your experience',
    caption: 'The seer is not the seen.',
    src: '/journey/07-seer.webp',
    alt: 'Diagram split between the seer and the seen. The witness stands on one side. Sensations, the mind, thoughts, judgments, and the body are on the other.',
  },
  {
    title: 'Untherapy',
    caption: 'Walking the path inward.',
    src: '/journey/08-path-inward.webp',
    alt: 'Diagram titled Untherapy. A spiral path moves inward from the world and the senses toward the self.',
  },
  {
    title: 'Days 1 and 2',
    caption: 'The world as conception, then as the senses.',
    src: '/journey/09-days-1-2.webp',
    alt: 'Two steps. Day 1: the world is your conception. Day 2: the world is your senses. Each day names a practice of telling the truth.',
  },
  {
    title: 'Days 3 and 4',
    caption: 'The world as thought, then as belief.',
    src: '/journey/10-days-3-4.webp',
    alt: 'Two steps. Day 3: the world is your thoughts. Day 4: the world is your beliefs. Each day names a practice of telling the truth.',
  },
  {
    title: 'Day 5',
    caption: 'The world as ego. The witness remains.',
    src: '/journey/11-day-5.webp',
    alt: 'Day 5: the world is your ego. The witness is shown apart from the seen, with a practice of telling the truth.',
  },
] as const;

export default function JourneyPage() {
  return (
    <div className="relative min-h-[100svh] bg-sacred-black">
      <video autoPlay muted loop playsInline className="fixed inset-0 h-full w-full object-cover">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-gradient-to-b from-rose-900/40 via-pink-900/35 to-slate-950/85" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.12),transparent_55%)]" />

      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">
        <header className="mx-auto max-w-xl text-center">
          <a
            href="/"
            className="font-display text-sm uppercase tracking-[0.28em] text-white/45 transition-colors hover:text-white/70"
          >
            Yoga of Intelligence
          </a>
          <h1 className="font-display mt-4 text-5xl font-light gold-text sm:text-6xl">The Journey</h1>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Follow the Untherapy process, one step at a time.
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-sacred-gold/50 to-transparent" />
        </header>

        <ol className="mt-12 space-y-14">
          {STEPS.map((step, index) => (
            <li key={step.src}>
              <p className="font-display text-sm uppercase tracking-[0.22em] text-sacred-gold">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="font-display mt-2 text-3xl font-light leading-tight text-white sm:text-4xl">
                {step.title}
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-white/70">{step.caption}</p>
              <img
                src={step.src}
                alt={step.alt}
                width={1600}
                height={894}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="mt-5 h-auto w-full rounded-2xl border border-white/15 bg-black/20 shadow-2xl"
              />
            </li>
          ))}
        </ol>

        <section className="mt-16 rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <h2 className="font-display text-3xl font-light text-white/90">When you are ready</h2>
          <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-white/70">
            A quiet page will be opened for you.
          </p>
          <a href="/join" className="btn-sacred mt-6 w-full sm:w-auto">
            Join the reflection
          </a>
        </section>
      </main>
    </div>
  );
}
