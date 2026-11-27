import 'server-only';
import { createHash, randomBytes } from 'crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'fs/promises';
import path from 'path';
import { getRedis } from '@/lib/session-store';

/**
 * Notes from /listen/<client>.
 *
 * Same Upstash Redis the session pages already use (UPSTASH_REDIS_REST_URL
 * and UPSTASH_REDIS_REST_TOKEN, or the older KV_REST_API_* pair). No new
 * service. In local development, with Redis unset, notes are written under
 * .data/listen so the page can be tried on this machine. Production without
 * Redis does not pretend a note was kept.
 */

const ENTRY_KEY = 'yoi:listen:entry';
const LATEST_KEY = 'yoi:listen:latest';
const IDS_KEY = 'yoi:listen:ids';
const AUDIO_PREFIX = 'yoi:listen:audio:';
const MAX_AUDIO_BYTES = 450_000;
const MAX_INDEX = 2_000;
const WRITE_LIMIT = 30;
const OPEN_LIMIT = 80;
const WINDOW_SECONDS = 60 * 60;

export type TranscriptStatus = 'text' | 'transcribed' | 'pending' | 'failed' | 'unavailable';

export type ListenEntry = {
  id: string;
  client_id: string;
  client_name: string;
  week_id: string;
  week_label: string;
  song_title: string;
  day: number;
  question: string;
  kind: 'voice' | 'text';
  transcript: string | null;
  transcript_status: TranscriptStatus;
  audio_content_type: string | null;
  audio_bytes: number | null;
  recording_seconds: number | null;
  created_at: string;
};

export type ListenAudio = {
  bytes: Buffer;
  contentType: string;
};

export function maxAudioBytes(): number {
  return MAX_AUDIO_BYTES;
}

export function listenStoreKind(): 'redis' | 'file' | 'none' {
  if (getRedis()) return 'redis';
  if (fileDir()) return 'file';
  return 'none';
}

export function createListenId(): string {
  return `lst_${randomBytes(9).toString('base64url')}`;
}

export function isListenId(id: string): boolean {
  return /^lst_[A-Za-z0-9_-]{10,24}$/.test(id);
}

function dayField(clientId: string, weekId: string, day: number): string {
  return `${clientId}:${weekId}:${day}`;
}

function fileDir(): string | null {
  if (getRedis()) return null;
  // A laptop can keep notes without Redis. Production cannot: the disk there
  // does not last, so a missing Redis stays an honest failure.
  if (process.env.NODE_ENV === 'production') return null;
  const override = process.env.LISTEN_STORE_DIR?.trim();
  if (override) return override;
  return path.join(process.cwd(), '.data', 'listen');
}

type LatestMap = Record<string, string>;

async function ensureFileDir(): Promise<string> {
  const dir = fileDir();
  if (!dir) throw new Error('Listening store is not configured.');
  await mkdir(path.join(dir, 'entries'), { recursive: true });
  await mkdir(path.join(dir, 'audio'), { recursive: true });
  return dir;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(value), 'utf8');
  await rename(tmp, file);
}

function parseEntry(value: unknown): ListenEntry | null {
  let record = value;
  if (typeof record === 'string') {
    try {
      record = JSON.parse(record);
    } catch {
      return null;
    }
  }
  if (!record || typeof record !== 'object') return null;
  const entry = record as Partial<ListenEntry>;
  if (typeof entry.id !== 'string' || !isListenId(entry.id)) return null;
  if (typeof entry.client_id !== 'string' || typeof entry.week_id !== 'string') return null;
  if (typeof entry.day !== 'number' || typeof entry.question !== 'string') return null;
  if (entry.kind !== 'voice' && entry.kind !== 'text') return null;
  return entry as ListenEntry;
}

export async function allowListen(bucket: 'write' | 'open', ip: string): Promise<'ok' | 'rate' | 'nostore'> {
  const redis = getRedis();
  if (!redis) return fileDir() ? 'ok' : 'nostore';

  const hashed = createHash('sha256').update(ip).digest('hex').slice(0, 24);
  const key = `yoi:listen:rate:${bucket}:${hashed}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, WINDOW_SECONDS);
  const limit = bucket === 'write' ? WRITE_LIMIT : OPEN_LIMIT;
  return count <= limit ? 'ok' : 'rate';
}

export async function saveListenEntry(entry: ListenEntry, audio: Buffer | null): Promise<void> {
  if (audio && audio.length > MAX_AUDIO_BYTES) {
    throw new Error('Recording is too large.');
  }

  const redis = getRedis();
  if (redis) {
    if (audio && entry.audio_content_type) {
      await redis.set(`${AUDIO_PREFIX}${entry.id}`, { b64: audio.toString('base64') });
    }
    try {
      await redis.hset(ENTRY_KEY, { [entry.id]: entry });
      await redis.hset(LATEST_KEY, { [dayField(entry.client_id, entry.week_id, entry.day)]: entry.id });
      await redis.lpush(IDS_KEY, entry.id);
      await redis.ltrim(IDS_KEY, 0, MAX_INDEX - 1);
    } catch (error) {
      if (audio) await deleteListenAudio(entry.id);
      throw error;
    }
    return;
  }

  const dir = await ensureFileDir();
  if (audio) {
    await writeFile(path.join(dir, 'audio', `${entry.id}.bin`), audio);
  }
  await writeJson(path.join(dir, 'entries', `${entry.id}.json`), entry);
  const latest = await readJson<LatestMap>(path.join(dir, 'latest.json'), {});
  latest[dayField(entry.client_id, entry.week_id, entry.day)] = entry.id;
  await writeJson(path.join(dir, 'latest.json'), latest);
  const order = await readJson<string[]>(path.join(dir, 'order.json'), []);
  order.unshift(entry.id);
  await writeJson(path.join(dir, 'order.json'), order.slice(0, MAX_INDEX));
}

export async function updateListenTranscript(
  id: string,
  transcript: string | null,
  status: TranscriptStatus
): Promise<ListenEntry | null> {
  const current = await getListenEntry(id);
  if (!current) return null;
  const next: ListenEntry = { ...current, transcript, transcript_status: status };
  const redis = getRedis();
  if (redis) {
    await redis.hset(ENTRY_KEY, { [id]: next });
    return next;
  }
  const dir = fileDir();
  if (!dir) return null;
  await writeJson(path.join(dir, 'entries', `${id}.json`), next);
  return next;
}

export async function getListenEntry(id: string): Promise<ListenEntry | null> {
  if (!isListenId(id)) return null;
  const redis = getRedis();
  if (redis) {
    const value = await redis.hget<unknown>(ENTRY_KEY, id);
    return parseEntry(value);
  }
  const dir = fileDir();
  if (!dir) return null;
  return parseEntry(await readJson<unknown | null>(path.join(dir, 'entries', `${id}.json`), null));
}

export async function latestForDay(clientId: string, weekId: string, day: number): Promise<ListenEntry | null> {
  const field = dayField(clientId, weekId, day);
  const redis = getRedis();
  if (redis) {
    const id = await redis.hget<string>(LATEST_KEY, field);
    if (typeof id !== 'string') return null;
    return getListenEntry(id);
  }
  const dir = fileDir();
  if (!dir) return null;
  const latest = await readJson<LatestMap>(path.join(dir, 'latest.json'), {});
  const id = latest[field];
  if (!id) return null;
  return getListenEntry(id);
}

export async function answeredDays(clientId: string, weekId: string): Promise<number[]> {
  const prefix = `${clientId}:${weekId}:`;
  let fields: string[] = [];
  const redis = getRedis();
  if (redis) {
    const all = await redis.hgetall<Record<string, unknown>>(LATEST_KEY);
    fields = all ? Object.keys(all) : [];
  } else {
    const dir = fileDir();
    if (!dir) return [];
    const latest = await readJson<LatestMap>(path.join(dir, 'latest.json'), {});
    fields = Object.keys(latest);
  }
  const days = fields
    .filter((field) => field.startsWith(prefix))
    .map((field) => Number(field.slice(prefix.length)))
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 7);
  return Array.from(new Set(days)).sort((a, b) => a - b);
}

export async function listListenEntries(limit = 100): Promise<ListenEntry[]> {
  const redis = getRedis();
  if (redis) {
    const ids = await redis.lrange<string>(IDS_KEY, 0, Math.max(0, limit - 1));
    if (!ids?.length) return [];
    const rows = await Promise.all(ids.map((id) => getListenEntry(id)));
    return rows.filter((entry): entry is ListenEntry => entry !== null);
  }
  const dir = fileDir();
  if (!dir) return [];
  const order = await readJson<string[]>(path.join(dir, 'order.json'), []);
  const rows = await Promise.all(order.slice(0, limit).map((id) => getListenEntry(id)));
  return rows.filter((entry): entry is ListenEntry => entry !== null);
}

export async function readListenAudio(id: string): Promise<ListenAudio | null> {
  const entry = await getListenEntry(id);
  if (!entry?.audio_content_type || !entry.audio_bytes) return null;

  const redis = getRedis();
  if (redis) {
    const value = await redis.get<{ b64?: string } | string>(`${AUDIO_PREFIX}${id}`);
    const b64 = typeof value === 'string' ? value : value?.b64;
    if (typeof b64 !== 'string' || !b64) return null;
    const bytes = Buffer.from(b64, 'base64');
    if (!bytes.length) return null;
    return { bytes, contentType: entry.audio_content_type };
  }

  const dir = fileDir();
  if (!dir) return null;
  try {
    const bytes = await readFile(path.join(dir, 'audio', `${id}.bin`));
    return { bytes, contentType: entry.audio_content_type };
  } catch {
    return null;
  }
}

export async function deleteListenAudio(id: string): Promise<void> {
  if (!isListenId(id)) return;
  const redis = getRedis();
  if (redis) {
    await redis.del(`${AUDIO_PREFIX}${id}`);
    return;
  }
  const dir = fileDir();
  if (!dir) return;
  await rm(path.join(dir, 'audio', `${id}.bin`), { force: true });
}
