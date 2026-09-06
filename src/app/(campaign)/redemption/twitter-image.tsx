import { ImageResponse } from 'next/og';
import { EVENT } from '@/lib/redemption-event';

export const runtime = 'edge';
export const alt =
  'EMANCIPATION — The Yoga of “Redemption Song”. An evening of live kirtan, philosophy and consciousness in Brooklyn, Tuesday September 22. Donations welcome.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * 1200×630 social card, generated at build time from the same event data as
 * the page. System fonts only — no network fetch, so it cannot fail a deploy.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0E0E0E',
          color: '#F4EFE6',
          padding: '58px 64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* top rail */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 19,
              letterSpacing: 5,
              textTransform: 'uppercase',
              color: 'rgba(244,239,230,0.6)',
            }}
          >
            {`${EVENT.brand} presents`}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 19,
              letterSpacing: 5,
              textTransform: 'uppercase',
              color: '#E2431F',
              border: '2px solid #E2431F',
              padding: '8px 16px',
            }}
          >
            Donations welcome
          </div>
        </div>

        {/* the question */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 116,
              fontWeight: 900,
              lineHeight: 0.86,
              letterSpacing: -5,
              textTransform: 'uppercase',
            }}
          >
            {EVENT.title}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 14,
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1,
              textTransform: 'uppercase',
              color: '#E2431F',
            }}
          >
            {EVENT.songSubtitle}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 20,
              fontSize: 28,
              color: 'rgba(244,239,230,0.8)',
            }}
          >
            {EVENT.subtitle}
          </div>
        </div>

        {/* metadata rail */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', height: 2, background: 'rgba(244,239,230,0.2)' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: 22,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: 'rgba(244,239,230,0.55)',
              }}
            >
              {EVENT.venue.street}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                fontSize: 21,
                letterSpacing: 3.5,
                textTransform: 'uppercase',
                color: 'rgba(244,239,230,0.75)',
              }}
            >
              <div style={{ display: 'flex' }}>
                {`${EVENT.dateShort} · ${EVENT.timeShort} · ${EVENT.venue.city}`}
              </div>
              <div style={{ display: 'flex', marginTop: 10, color: '#E2431F' }}>
                Live kirtan · Interactive philosophy · Vegetarian dinner
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
