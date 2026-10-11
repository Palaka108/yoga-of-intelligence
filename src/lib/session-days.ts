/** A finished reflection is eight minutes. */
export const MIN_COMPLETED_SECONDS = 480;

export const PROGRAM_DAYS = 5;

export const NEW_YORK_TIME_ZONE = 'America/New_York';

export type ConversationSignal = {
  status?: string;
  call_duration_secs?: number;
  /** Unix seconds when the conversation started. */
  start_time_unix_secs?: number;
};

export type DayProgress = {
  /** Day shown on the page, 1–5. Stays 5 once the program is finished. */
  day: number;
  total: number;
  /** Calendar days that already have a finished sitting. */
  completed: number;
  finished: boolean;
  /** Passed to the voice agent. A finished program still sends "5". */
  sessionNumber: string;
};

/**
 * A sitting counts when it is done and at least eight minutes.
 * Several sittings on the same New York calendar day count once.
 * The current day is that count plus one, capped at 5.
 */
export function progressFromConversations(
  conversations: ConversationSignal[],
  total = PROGRAM_DAYS
): DayProgress {
  const dates = new Set<string>();

  for (const conversation of conversations) {
    if (conversation.status !== 'done') continue;
    if (durationSeconds(conversation) < MIN_COMPLETED_SECONDS) continue;
    const date = newYorkCalendarDay(conversation.start_time_unix_secs);
    if (date) dates.add(date);
  }

  const completed = Math.min(total, dates.size);
  const finished = completed >= total;
  const day = finished ? total : completed + 1;
  return {
    day,
    total,
    completed,
    finished,
    sessionNumber: String(day),
  };
}

export function progressFromStoredDay(day: number, total = PROGRAM_DAYS): DayProgress {
  const current = clampDay(day, total);
  return {
    day: current,
    total,
    completed: current - 1,
    finished: false,
    sessionNumber: String(current),
  };
}

export function progressFromOverride(value: number | 'complete', total = PROGRAM_DAYS): DayProgress {
  if (value === 'complete') {
    return {
      day: total,
      total,
      completed: total,
      finished: true,
      sessionNumber: String(total),
    };
  }
  return progressFromStoredDay(value, total);
}

/** Calendar date in America/New_York, as YYYY-MM-DD. */
export function newYorkCalendarDay(unixSecs: number | undefined): string | null {
  if (typeof unixSecs !== 'number' || !Number.isFinite(unixSecs)) return null;
  const date = new Date(unixSecs * 1000);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: NEW_YORK_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  if (!year || !month || !day) return null;
  return `${year}-${month}-${day}`;
}

function durationSeconds(conversation: ConversationSignal): number {
  const duration = conversation.call_duration_secs;
  return typeof duration === 'number' && Number.isFinite(duration) ? duration : 0;
}

function clampDay(day: number, total: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(total, Math.max(1, Math.trunc(day)));
}
