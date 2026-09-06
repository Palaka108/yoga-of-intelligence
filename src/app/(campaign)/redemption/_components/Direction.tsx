/**
 * The page's one directional motif: a single signal that reaches a point and
 * takes two paths from it — one continuing outward and thinning away, one
 * bending somewhere else. Same line, different direction.
 *
 * Deliberately abstract. It is a piece of editorial graphic language, not a
 * diagram, and it carries no labels.
 */
export default function Direction({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 190"
      preserveAspectRatio="none"
      className={`h-24 w-full sm:h-32 ${className}`}
    >
      {/* the shared origin — one consciousness */}
      <path
        d="M0 120 H520"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />

      {/* outward: continues on the same line, thinning as it goes */}
      <path
        className="dir-outward"
        d="M520 120 H1200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="7 11"
        opacity="0.4"
        vectorEffect="non-scaling-stroke"
      />

      {/* redirected: the same line, turned */}
      <path
        d="M520 120 C 700 120, 760 34, 1160 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M1136 12 L1176 22 L1136 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* the point where it turns */}
      <circle cx="520" cy="120" r="5" fill="currentColor" />
    </svg>
  );
}
