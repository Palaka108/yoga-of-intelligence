/**
 * A signal line: the page's recurring rule is an amplitude trace rather than
 * a plain border. Breathes slowly; frozen flat under reduced motion.
 */
export default function Waveform({
  className = '',
  stroke = 'currentColor',
}: {
  className?: string;
  stroke?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      className={`h-8 w-full ${className}`}
    >
      <path
        className="wave-trace"
        d="M0 20 H120 l14 -13 l14 26 l14 -19 l14 12 l14 -22 l14 28 l14 -9 H420 l12 -16 l12 30 l12 -24 l12 14 l12 -8 H700 l16 -20 l16 34 l16 -26 l16 12 H900 l14 -11 l14 22 l14 -16 l14 9 H1200"
        fill="none"
        stroke={stroke}
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}
