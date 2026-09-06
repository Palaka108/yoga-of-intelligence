'use client';

import Script from 'next/script';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Meta Pixel — renders nothing until NEXT_PUBLIC_META_PIXEL_ID is set in the
 * environment, so the integration can ship now and be switched on later
 * without a code change.
 *
 * PageView fires on load. `Lead` is NOT fired here: it is fired once, by
 * trackLead(), only after the RSVP endpoint returns a success.
 */
export default function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}

/**
 * Fire the standard Meta `Lead` event for one confirmed registration.
 * `eventId` is shared with the stored row so a later server-side Conversions
 * API call deduplicates against this browser event.
 */
export function trackLead(eventId: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', 'Lead', { content_name: 'REDEMPTION RSVP' }, { eventID: eventId });
}
