/** A finished reflection is eight minutes. Shorter calls still count when they recorded a session number. */
export const MIN_COMPLETED_SECONDS = 480;

export const PROGRAM_DAYS = 5;

export type ConversationSignal = {
  status?: string;
  call_duration_secs?: number;
  /** List or detail payload. Values may be raw days or `{ value }` results. */
  data_collection_results?: Record<string, unknown> | null;
  analysis?: {
    data_collection_results?: Record<string, unknown> | null;
  } | null;
  conversation_initiation_client_data?: {
    dynamic_variables?: Record<string, unknown> | null;
  } | null;
};

export type DayProgress = {
  /** Day shown on the page, 1–5. Stays 5 once the program is finished. */
  day: number;
  total: number;
  /** Distinct days already completed. */
  completed: number;
  finished: boolean;
  /** Passed to the voice agent. A finished program still sends "5". */
  sessionNumber: string;
};

/**
 * Current day is the count of distinct completed days, plus one, capped at 5.
 * Several conversations of the same day count once. Long calls that never
 * recorded a session number are treated as repeats of day 1, so three
 * unnumbered Day 1 sittings still leave the person on day 2.
 */
export function progressFromConversations(
  conversations: ConversationSignal[],
  total = PROGRAM_DAYS
): DayProgress {
  const days = new Set<number>();
  let unnumberedLong = 0;

  for (const conversation of conversations) {
    const numbered = readSessionNumber(conversation, total);
    const collected = hasSessionNumberResult(conversation);
    const longDone = conversation.status === 'done' && durationSeconds(conversation) >= MIN_COMPLETED_SECONDS;

    if (numbered != null && (collected || longDone)) {
      days.add(numbered);
      continue;
    }
    if (longDone) unnumberedLong += 1;
  }

  if (unnumberedLong > 0 && !days.has(1)) days.add(1);

  const completed = Math.min(total, days.size);
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

function durationSeconds(conversation: ConversationSignal): number {
  const duration = conversation.call_duration_secs;
  return typeof duration === 'number' && Number.isFinite(duration) ? duration : 0;
}

function hasSessionNumberResult(conversation: ConversationSignal): boolean {
  return readCollected(conversation.data_collection_results) != null
    || readCollected(conversation.analysis?.data_collection_results) != null;
}

function readSessionNumber(conversation: ConversationSignal, total: number): number | null {
  return (
    readCollected(conversation.data_collection_results, total)
    ?? readCollected(conversation.analysis?.data_collection_results, total)
    ?? parseDay(conversation.conversation_initiation_client_data?.dynamic_variables?.session_number, total)
  );
}

function readCollected(results: Record<string, unknown> | null | undefined, total = PROGRAM_DAYS): number | null {
  if (!results) return null;
  const raw = results.session_number ?? results.sessionNumber;
  if (raw == null) return null;
  if (typeof raw === 'object' && 'value' in raw) {
    return parseDay((raw as { value?: unknown }).value, total);
  }
  return parseDay(raw, total);
}

function parseDay(value: unknown, total: number): number | null {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string' && /^\d+$/.test(value.trim())
      ? Number(value.trim())
      : Number.NaN;
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > total) return null;
  return parsed;
}

function clampDay(day: number, total: number): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(total, Math.max(1, Math.trunc(day)));
}
