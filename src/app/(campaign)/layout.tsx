import type { Metadata } from 'next';
import './redemption.css';
import { Archivo, Instrument_Serif } from 'next/font/google';
import { EVENT } from '@/lib/redemption-event';
import MetaPixel from './redemption/_components/MetaPixel';

/**
 * Campaign route group. Fonts are scoped here so the authenticated portal
 * bundle is untouched — the display faces only download on /redemption.
 * JetBrains Mono comes from the root layout and is reused for metadata.
 */
const grotesk = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-grotesk',
  display: 'swap',
});

const editorial = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yogaofintelligence.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: EVENT.og.title,
  description: EVENT.og.description,
  alternates: { canonical: '/redemption' },
  openGraph: {
    title: EVENT.og.title,
    description: EVENT.og.description,
    url: '/redemption',
    siteName: EVENT.brand,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: EVENT.og.title,
    description: EVENT.og.description,
  },
  robots: { index: true, follow: true },
};

export default function CampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rdm-root ${grotesk.variable} ${editorial.variable} min-h-screen bg-redemption-ink font-grotesk text-redemption-ivory antialiased`}
    >
      <MetaPixel />
      {children}
    </div>
  );
}
