/** A still lake at dawn, painted as flat watercolor shapes. Decorative. */
export default function MorningScene() {
  return (
    <svg viewBox="0 0 640 460" role="img" aria-label="A still lake at dawn, pines along the shore, mountains behind.">
      <defs>
        <linearGradient id="listen-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d5e0ea" />
          <stop offset="55%" stopColor="#f0d2c4" />
          <stop offset="100%" stopColor="#f6e0cf" />
        </linearGradient>
        <linearGradient id="listen-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3d7c8" />
          <stop offset="45%" stopColor="#d5ddd9" />
          <stop offset="100%" stopColor="#c5d0ce" />
        </linearGradient>
      </defs>
      <filter id="listen-paint" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
      </filter>
      <g filter="url(#listen-paint)">
      <rect width="640" height="460" fill="url(#listen-sky)" />
      <ellipse cx="430" cy="168" rx="46" ry="34" fill="#f4c7b2" opacity="0.85" />
      <g fill="#f7f1ea" opacity="0.45">
        <ellipse cx="150" cy="78" rx="70" ry="22" />
        <ellipse cx="210" cy="86" rx="48" ry="16" />
        <ellipse cx="500" cy="70" rx="56" ry="16" />
      </g>
      <path
        d="M0 230 C70 200 120 214 180 176 C250 132 300 188 360 162 C430 132 490 176 560 150 C600 136 620 142 640 136 L640 300 L0 300 Z"
        fill="#c5d2df"
      />
      <path
        d="M0 268 C90 230 150 250 220 214 C290 178 330 230 410 206 C490 182 540 236 640 200 L640 318 L0 318 Z"
        fill="#93a8bb"
        opacity="0.9"
      />
      <path d="M0 300 C80 286 140 292 210 278 C160 250 90 262 40 248 C20 270 0 280 0 300 Z" fill="#3e564c" />
      <g fill="#2d463c">
        <path d="M78 168 L98 248 L58 248 Z" />
        <path d="M78 198 L94 248 L62 248 Z" fill="#3d5a4c" />
        <path d="M118 188 L134 252 L102 252 Z" />
        <path d="M48 196 L62 250 L34 250 Z" fill="#345248" />
        <path d="M148 210 L160 258 L136 258 Z" fill="#314a40" />
      </g>
      <rect x="0" y="292" width="640" height="168" fill="url(#listen-water)" />
      <g opacity="0.4">
        <path d="M70 330 L92 360 L48 360 Z" fill="#6d8a80" />
        <path d="M112 338 L124 366 L100 366 Z" fill="#7d978c" />
      </g>
      <g stroke="#f4ddd0" strokeWidth="1.6" opacity="0.7">
        <line x1="180" y1="324" x2="520" y2="324" />
        <line x1="120" y1="348" x2="560" y2="350" />
        <line x1="160" y1="378" x2="500" y2="376" />
      </g>
      <g fill="#6d7f62" opacity="0.85">
        <path d="M500 300 C506 270 512 250 516 236 C520 258 528 280 534 300 Z" />
        <path d="M528 304 C534 268 540 246 546 228 C550 252 558 278 566 304 Z" />
        <path d="M554 308 C560 276 566 258 570 244 C576 266 582 288 590 310 Z" />
        <path d="M470 308 C474 284 478 270 482 260 C486 274 492 292 498 310 Z" />
      </g>
      <g stroke="#5e5348" strokeWidth="1" opacity="0.35">
        <path d="M486 292 C492 304 498 318 492 334" fill="none" />
        <path d="M574 286 C580 304 586 322 578 340" fill="none" />
      </g>
      </g>
    </svg>
  );
}
