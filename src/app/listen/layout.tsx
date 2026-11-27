import type { Metadata } from 'next';
import { Karla } from 'next/font/google';
import './listen.css';

const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-karla',
  display: 'swap',
});

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

export default function ListenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`listen-root ${karla.variable}`}>
      <svg className="listen-washes" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <filter id="listen-wash" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="26" />
          </filter>
        </defs>
        <g filter="url(#listen-wash)">
          <ellipse cx="36" cy="90" rx="130" ry="170" fill="#9aafc6" opacity="0.55" />
          <ellipse cx="250" cy="40" rx="90" ry="70" fill="#c5b7c9" opacity="0.28" />
          <ellipse cx="370" cy="460" rx="120" ry="200" fill="#8ea6c2" opacity="0.4" />
          <ellipse cx="300" cy="760" rx="180" ry="150" fill="#b7c4ae" opacity="0.5" />
          <ellipse cx="20" cy="690" rx="100" ry="90" fill="#d2c0ae" opacity="0.35" />
        </g>
      </svg>
      <div className="listen-grain" aria-hidden="true" />
      {children}
    </div>
  );
}
