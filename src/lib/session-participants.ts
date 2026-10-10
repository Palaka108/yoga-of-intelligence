import 'server-only';

/**
 * Seeded Untherapy profiles. These pages work before Redis is connected.
 *
 * Nia is the only seed. Her agent already exists, so nothing is created
 * for her at build or startup.
 *
 * Everyone else uses /join. That flow duplicates the template agent,
 * then stores the new profile in Redis. Do not add volunteers here —
 * an entry in this file does not create an agent.
 *
 * To change Nia's agent, edit `agent_id` on her entry.
 * `notes` are owner-only and are never rendered on a participant page.
 */

export interface ParticipantProfile {
  client_id: string;
  name: string;
  aliases?: string[];
  program: string;
  /** Calendar date the program started, YYYY-MM-DD. */
  start_date: string;
  /** Current day or session number. */
  day: number;
  /** ElevenLabs agent embedded on this person's page. */
  agent_id: string;
  /** Private. Never render this on a participant page. */
  notes?: string;
  /** Private. Collected at signup, shown only on the owner list. */
  email?: string;
  /** ISO time the signup was stored. Seeds omit this. */
  created_at?: string;
}

/** Fields safe to render on a participant page. */
export interface PublicParticipant {
  client_id: string;
  name: string;
  program: string;
  start_date: string;
  day: number;
  agent_id: string;
}

export interface ProgramInfo {
  title: string;
  label: string;
  days: number | null;
}

export const PROGRAMS: Record<string, ProgramInfo> = {
  '5-day-trial': {
    title: 'Untherapy — 5-Day Reflection',
    label: '5-Day Reflection',
    days: 5,
  },
};

export const seededProfiles: ParticipantProfile[] = [
  {
    client_id: 'nia',
    name: 'Nia',
    program: '5-day-trial',
    start_date: '2026-10-10',
    day: 1,
    agent_id: 'agent_0601m4kwdncne98v4pmbspb6hy9v',
    notes: 'Seeded profile. This page works before the signup store is connected.',
  },
];

export function normalizeId(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function assertSeed(list: ParticipantProfile[]) {
  const seen = new Map<string, string>();
  for (const person of list) {
    if (!person.agent_id.trim()) {
      throw new Error(`Seeded profile "${person.client_id}" is missing agent_id.`);
    }
    const keys = [person.client_id, ...(person.aliases ?? [])];
    for (const key of keys) {
      const normalized = normalizeId(key);
      if (!normalized) {
        throw new Error(`Seeded profile "${person.client_id}" has an empty id.`);
      }
      const owner = seen.get(normalized);
      if (owner) {
        throw new Error(`Session id "${key}" is used by both "${owner}" and "${person.client_id}".`);
      }
      seen.set(normalized, person.client_id);
    }
  }
}

assertSeed(seededProfiles);

export function findSeed(raw: string | null | undefined): ParticipantProfile | null {
  const key = normalizeId(raw);
  if (!key) return null;
  return (
    seededProfiles.find((person) => {
      if (normalizeId(person.client_id) === key) return true;
      return (person.aliases ?? []).some((alias) => normalizeId(alias) === key);
    }) ?? null
  );
}

export function toPublic(person: ParticipantProfile): PublicParticipant {
  return {
    client_id: person.client_id.trim(),
    name: person.name.trim(),
    program: person.program,
    start_date: person.start_date,
    day: person.day,
    agent_id: person.agent_id.trim(),
  };
}

export function programInfo(program: string): ProgramInfo {
  return (
    PROGRAMS[program] ?? {
      title: program,
      label: program,
      days: null,
    }
  );
}

export function dayLabel(program: string, day: number): string {
  const info = programInfo(program);
  const current = Number.isFinite(day) ? String(day) : '—';
  return info.days ? `Day ${current} of ${info.days}` : `Day ${current}`;
}

export function formatSessionDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return isoDate;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function firstQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function sessionPath(clientId: string): string {
  return `/session/${encodeURIComponent(clientId)}`;
}

export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yogaofintelligence.com';
  return raw.replace(/\/$/, '');
}

export function sessionUrl(clientId: string): string {
  return `${siteOrigin()}${sessionPath(clientId)}`;
}

export function joinUrl(): string {
  return `${siteOrigin()}/join`;
}
