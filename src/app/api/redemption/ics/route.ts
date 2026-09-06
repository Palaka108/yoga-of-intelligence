import { EVENT } from '@/lib/redemption-event';

export const runtime = 'nodejs';

/** RFC 5545 requires CRLF line endings and folding of long lines. */
function fold(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length > 73) {
    parts.push(' ' + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  if (rest) parts.push(' ' + rest);
  return parts.join('\r\n');
}

function escape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yogaofintelligence.com';
  const eventUrl = `${siteUrl.replace(/\/$/, '')}/redemption`;

  const description = [
    `${EVENT.songSubtitle} — ${EVENT.subtitle}.`,
    '',
    EVENT.og.description,
    '',
    `Admission: ${EVENT.admissionLong}`,
    eventUrl,
  ].join('\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yoga of Intelligence//REDEMPTION//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${EVENT.slug}@yogaofintelligence.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${EVENT.startUtc}`,
    `DTEND:${EVENT.endUtc}`,
    `SUMMARY:${escape(`${EVENT.title} — ${EVENT.songSubtitle}`)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(`${EVENT.venue.street}, ${EVENT.venue.city}, ${EVENT.venue.region}`)}`,
    `URL:${eventUrl}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(`${EVENT.title} tonight — ${EVENT.timeShort}, ${EVENT.venue.city}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Response(lines.map(fold).join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="redemption.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
