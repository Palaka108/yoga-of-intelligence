import 'server-only';
import { isoDateInTimeZone, LISTEN_DAYS } from '@/lib/listen-day';

/**
 * One week of the listening path, per person.
 *
 * Add someone by copying the demo entry:
 * - `clientId` is the link: /listen/<clientId>
 * - `calendar: true` and `startDate` (YYYY-MM-DD) make day 1 that date
 *   in `timeZone`, then the next six midnights. Day 7 is the update.
 * - `songUrl` is a path on this site (`/listen/her-song.mp3`) or an https link
 *   to the Suno file. Put a file in `public/listen/` if you host it here.
 * - `questions` has exactly seven strings, day 1 through day 7.
 * - Change `week.id` when the song changes, so earlier notes stay filed
 *   under the old week.
 *
 * The demo uses `calendar: false`, so /listen/demo?day=3 opens that day,
 * and a 12-second original tone so the gate can be heard all the way through.
 * That file is not a Suno track and not someone else's recording.
 */

export type ListenWeek = {
  id: string;
  label: string;
  /** When true, the day follows startDate. Demo weeks stay on ?day=. */
  calendar: boolean;
  startDate: string;
  timeZone: string;
  songUrl: string;
  songTitle: string;
  /** Plain words for the week's verse. Not a quotation of the Gita. */
  verse: string;
  questions: string[];
};

export type ListenClient = {
  clientId: string;
  name: string;
  week: ListenWeek;
};

const CLIENT_ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const listenClients: ListenClient[] = [
  {
    clientId: 'demo',
    name: 'Demo',
    week: {
      id: 'demo-lamp',
      label: 'Week one',
      calendar: false,
      startDate: '2026-11-27',
      timeZone: 'America/New_York',
      songUrl: '/listen/demo-song.mp3',
      songTitle: 'The Lamp That\nDoes Not Flicker',
      verse: 'Your verse this week: a steady lamp in a windless place.',
      questions: [
        'While the song played, where did your mind go first?',
        'What did you hear or feel in your body, before you named it?',
        'Where did you feel steady today?',
        'What flickered, and what stayed still?',
        'Where did you rush, and where did you let something be?',
        'What is one small place that felt windless?',
        'What stayed with you this week, what changed, and what do you want next?',
      ],
    },
  },
];

function safeSongUrl(url: string): boolean {
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('..')) return true;
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function assertClients(list: ListenClient[]) {
  const seen = new Set<string>();
  for (const person of list) {
    if (!CLIENT_ID.test(person.clientId)) {
      throw new Error(`Listening client id "${person.clientId}" should be lowercase words and dashes.`);
    }
    if (seen.has(person.clientId)) {
      throw new Error(`Listening client "${person.clientId}" is listed twice.`);
    }
    seen.add(person.clientId);
    if (!person.name.trim()) throw new Error(`Listening client "${person.clientId}" needs a name.`);

    const week = person.week;
    if (!week.id.trim() || !week.label.trim()) {
      throw new Error(`Listening client "${person.clientId}" needs a week id and label.`);
    }
    if (!DATE.test(week.startDate)) {
      throw new Error(`Listening client "${person.clientId}" needs a YYYY-MM-DD start date.`);
    }
    isoDateInTimeZone(new Date(), week.timeZone);
    if (!safeSongUrl(week.songUrl)) {
      throw new Error(`Song URL for "${person.clientId}" must be a site path or https.`);
    }
    if (!week.songTitle.trim() || !week.verse.trim()) {
      throw new Error(`Listening client "${person.clientId}" needs a song title and a verse.`);
    }
    if (week.questions.length !== LISTEN_DAYS || week.questions.some((q) => !q.trim())) {
      throw new Error(`Listening client "${person.clientId}" needs exactly seven questions.`);
    }
  }
}

assertClients(listenClients);

export function normalizeClientId(raw: string): string {
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    value = raw;
  }
  return value.trim().toLowerCase();
}

export function findListenClient(raw: string | null | undefined): ListenClient | null {
  const key = normalizeClientId(raw ?? '');
  if (!key) return null;
  return listenClients.find((person) => person.clientId === key) ?? null;
}

export function questionForDay(person: ListenClient, day: number): string | null {
  if (!Number.isInteger(day) || day < 1 || day > LISTEN_DAYS) return null;
  return person.week.questions[day - 1] ?? null;
}
