/** Calendar day for a listening week. Day 1 is startDate in the person's time zone. */

const DAY_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'] as const;

export const LISTEN_DAYS = 7;

export function dayWord(day: number): string {
  return DAY_WORDS[day - 1] ?? String(day);
}

export function isoDateInTimeZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const year = get('year');
  const month = get('month');
  const day = get('day');
  if (!year || !month || !day) {
    throw new Error('Could not read the calendar date.');
  }
  return `${year}-${month}-${day}`;
}

function utcDayNumber(iso: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Not a calendar date: ${iso}`);
  return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000);
}

/** Whole days from startDate to `now` in timeZone. Negative before the start. */
export function daysFromStart(startDate: string, timeZone: string, now = new Date()): number {
  const today = isoDateInTimeZone(now, timeZone);
  return utcDayNumber(today) - utcDayNumber(startDate);
}

export type ListenDay =
  | { state: 'ready'; day: number }
  | { state: 'before'; opensOn: string }
  | { state: 'after' };

/**
 * Demo weeks (`calendar: false`) follow `?day=` so the gate can be tested.
 * A real week follows the calendar and ignores a requested day.
 */
export function resolveListenDay(
  week: { calendar: boolean; startDate: string; timeZone: string },
  requested: number | null,
  now = new Date()
): ListenDay {
  if (!week.calendar) {
    const day = requested && Number.isInteger(requested) && requested >= 1 && requested <= LISTEN_DAYS ? requested : 1;
    return { state: 'ready', day };
  }

  const diff = daysFromStart(week.startDate, week.timeZone, now);
  if (diff < 0) return { state: 'before', opensOn: week.startDate };
  if (diff > LISTEN_DAYS - 1) return { state: 'after' };
  return { state: 'ready', day: diff + 1 };
}

export function formatListenDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function parseDayParam(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const day = Number(raw);
  if (!Number.isInteger(day)) return null;
  return day;
}
