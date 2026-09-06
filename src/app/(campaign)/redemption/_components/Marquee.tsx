/**
 * Ghosted background typography. The words function graphically — they are
 * decoration, not copy, so they are hidden from assistive technology.
 */
export default function Marquee({
  words,
  reverse = false,
  className = '',
}: {
  words: string[];
  reverse?: boolean;
  className?: string;
}) {
  const track = [...words, ...words];

  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none overflow-hidden ${className}`}
    >
      <div
        className={`flex w-max ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        } motion-reduce:animate-none`}
      >
        {track.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="whitespace-nowrap px-6 text-[13vw] font-black uppercase leading-none tracking-[-0.04em] md:text-[8vw]"
          >
            {word}
            <span className="px-6 align-middle text-redemption-vermilion">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
