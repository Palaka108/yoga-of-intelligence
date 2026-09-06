'use client';

import Script from 'next/script';

/**
 * Google tag (gtag.js) for GA4 and/or Google Ads.
 *
 * Nothing is emitted until at least one ID is configured, so the tag can ship
 * now and be switched on later by setting an environment variable — no code
 * change, no redeploy of anything but the env.
 *
 *   NEXT_PUBLIC_GA4_MEASUREMENT_ID        G-XXXXXXXXXX
 *   NEXT_PUBLIC_GOOGLE_ADS_ID             AW-XXXXXXXXX
 *   NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL   the label from the conversion action
 *
 * The RSVP conversion is NOT fired here. It fires once, on the thank-you page,
 * only for a visitor who actually completed the form — see RsvpConversion.
 */
const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const ADS_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

/** Hand-off between the form and the thank-you page. */
export const RSVP_CONVERSION_KEY = 'rdm_rsvp_conversion';

/** How long a completed RSVP stays eligible to be counted. */
const CONVERSION_TTL_MS = 15 * 60 * 1000;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export default function GoogleTag() {
  // gtag.js is loaded once, under whichever ID exists; both are then configured.
  const loaderId = GA4_ID ?? ADS_ID;
  if (!loaderId) return null;

  const config = [
    GA4_ID ? `gtag('config', '${GA4_ID}');` : '',
    ADS_ID ? `gtag('config', '${ADS_ID}');` : '',
  ].join('\n');

  return (
    <>
      <Script
        id="gtag-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${loaderId}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${config}`}
      </Script>
    </>
  );
}

/**
 * Record one completed RSVP.
 *
 * `eventId` is the id already stored on the row and shared with the Meta Lead
 * event, so the same registration can be reconciled across systems and Google
 * can deduplicate a repeat send.
 */
export function recordRsvpConversion(eventId: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  if (GA4_ID) {
    // A GA4 event to mark as a key event and import into Google Ads.
    window.gtag('event', 'emancipation_rsvp', {
      event_id: eventId,
      event_category: 'rsvp',
      event_label: 'emancipation_2026_09_22',
    });
  }

  if (ADS_ID && ADS_LABEL) {
    // A direct Google Ads conversion — counts without waiting on a GA4 import.
    window.gtag('event', 'conversion', {
      send_to: `${ADS_ID}/${ADS_LABEL}`,
      transaction_id: eventId,
    });
  }
}

/**
 * True when this page view followed a genuine, recent RSVP. Consumes the
 * marker, so a refresh or a later direct visit to /redemption/thanks does not
 * count a second conversion.
 */
export function consumeRsvpConversion(): string | null {
  if (typeof window === 'undefined') return null;

  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(RSVP_CONVERSION_KEY);
    // Consume immediately: one completed RSVP may be counted exactly once.
    if (raw) sessionStorage.removeItem(RSVP_CONVERSION_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { eventId?: string; at?: number };
    if (!parsed.eventId) return null;
    if (!parsed.at || Date.now() - parsed.at > CONVERSION_TTL_MS) return null;
    return parsed.eventId;
  } catch {
    return null;
  }
}
