import 'server-only';

import { hasElevenLabsKey } from '@/lib/elevenlabs-agent';
import {
  PROGRAM_DAYS,
  progressFromConversations,
  progressFromOverride,
  progressFromStoredDay,
  type ConversationSignal,
  type DayProgress,
} from '@/lib/session-days';
import { programInfo } from '@/lib/session-participants';
import {
  clearDayOverride,
  getDayOverride,
  getRedis,
  rememberStoredDay,
  setDayOverride,
  type DayOverride,
} from '@/lib/session-store';

const CACHE_SECONDS = 120;
const memoryCache = new Map<string, { at: number; progress: DayProgress }>();

export type ResolvedDay = DayProgress & {
  source: 'automatic' | 'override' | 'stored';
};

type DayPerson = {
  client_id: string;
  agent_id: string;
  day: number;
  program: string;
};

export async function resolveSessionDay(person: DayPerson): Promise<ResolvedDay> {
  const total = programInfo(person.program).days ?? PROGRAM_DAYS;
  const override = await readOverride(person.client_id);
  if (override) {
    return { ...progressFromOverride(override, total), source: 'override' };
  }

  if (!hasElevenLabsKey() || !person.agent_id.trim()) {
    return { ...progressFromStoredDay(person.day, total), source: 'stored' };
  }

  try {
    const progress = await cachedProgress(person.agent_id.trim(), total);
    await rememberStoredDay(person.client_id, progress.day);
    return { ...progress, source: 'automatic' };
  } catch (error) {
    console.error('Session day lookup failed', error instanceof Error ? error.name : 'unknown');
    return { ...progressFromStoredDay(person.day, total), source: 'stored' };
  }
}

export async function saveDayOverride(clientId: string, value: DayOverride): Promise<void> {
  await setDayOverride(clientId, value);
}

export async function resetDayOverride(clientId: string, agentId = ''): Promise<void> {
  await clearDayOverride(clientId);
  memoryCache.clear();
  const redis = getRedis();
  const trimmed = agentId.trim();
  if (!redis || !trimmed) return;
  try {
    await redis.del(`yoi:session:day-api:${trimmed}:${PROGRAM_DAYS}`);
  } catch (error) {
    console.error('Day cache clear failed', error instanceof Error ? error.name : 'unknown');
  }
}

async function readOverride(clientId: string): Promise<DayOverride | null> {
  try {
    return await getDayOverride(clientId);
  } catch (error) {
    console.error('Day override read failed', error instanceof Error ? error.name : 'unknown');
    return null;
  }
}

async function cachedProgress(agentId: string, total: number): Promise<DayProgress> {
  const key = `${agentId}:${total}`;
  const now = Date.now();
  const memorized = memoryCache.get(key);
  if (memorized && now - memorized.at < CACHE_SECONDS * 1000) return memorized.progress;

  const redis = getRedis();
  const redisKey = `yoi:session:day-api:${agentId}:${total}`;
  if (redis) {
    try {
      const cached = await redis.get<DayProgress | string>(redisKey);
      const progress = typeof cached === 'string' ? parseCached(cached) : cached;
      if (progress && typeof progress.day === 'number' && typeof progress.completed === 'number') {
        memoryCache.set(key, { at: now, progress });
        return progress;
      }
    } catch (error) {
      console.error('Day cache read failed', error instanceof Error ? error.name : 'unknown');
    }
  }

  const conversations = await listAgentConversations(agentId);
  const progress = progressFromConversations(conversations, total);
  memoryCache.set(key, { at: now, progress });
  if (redis) {
    try {
      await redis.set(redisKey, progress, { ex: CACHE_SECONDS });
    } catch (error) {
      console.error('Day cache write failed', error instanceof Error ? error.name : 'unknown');
    }
  }
  return progress;
}

function parseCached(value: string): DayProgress | null {
  try {
    const parsed = JSON.parse(value) as DayProgress;
    if (!parsed || typeof parsed.day !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

async function listAgentConversations(agentId: string): Promise<ConversationSignal[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY');

  const summaries: Summary[] = [];
  let cursor = '';
  for (let page = 0; page < 8; page += 1) {
    const url = new URL('https://api.elevenlabs.io/v1/convai/conversations');
    url.searchParams.set('agent_id', agentId);
    url.searchParams.set('page_size', '100');
    url.searchParams.append('data_collection_ids', 'session_number');
    if (cursor) url.searchParams.set('cursor', cursor);

    const response = await fetch(url, {
      headers: { 'xi-api-key': apiKey },
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`ElevenLabs conversations failed (${response.status})`);

    const body = (await response.json()) as {
      conversations?: Summary[];
      has_more?: boolean;
      next_cursor?: string | null;
    };
    summaries.push(...(body.conversations ?? []));
    if (!body.has_more || !body.next_cursor) break;
    cursor = body.next_cursor;
  }

  const needsDetail = summaries
    .filter((item) => item.status === 'done' && readSummaryNumber(item) == null)
    .sort((a, b) => (b.start_time_unix_secs ?? 0) - (a.start_time_unix_secs ?? 0))
    .slice(0, 12);

  const details = await Promise.all(needsDetail.map((item) => fetchDetail(item.conversation_id, apiKey)));
  const detailById = new Map(details.filter((item): item is Summary => item != null).map((item) => [item.conversation_id, item]));

  return summaries.map((item) => detailById.get(item.conversation_id) ?? item);
}

type Summary = ConversationSignal & {
  conversation_id?: string;
  start_time_unix_secs?: number;
};

function readSummaryNumber(item: Summary): number | null {
  const raw = item.data_collection_results?.session_number;
  if (raw == null) return null;
  if (typeof raw === 'object' && raw && 'value' in raw) {
    const value = (raw as { value?: unknown }).value;
    return typeof value === 'number' || typeof value === 'string' ? Number(value) || null : null;
  }
  return typeof raw === 'number' || typeof raw === 'string' ? Number(raw) || null : null;
}

async function fetchDetail(conversationId: string | undefined, apiKey: string): Promise<Summary | null> {
  if (!conversationId) return null;
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conversationId)}`,
      {
        headers: { 'xi-api-key': apiKey },
        cache: 'no-store',
        signal: AbortSignal.timeout(8_000),
      }
    );
    if (!response.ok) return null;
    const body = (await response.json()) as Summary & {
      metadata?: { call_duration_secs?: number };
      analysis?: ConversationSignal['analysis'];
    };
    return {
      ...body,
      conversation_id: conversationId,
      call_duration_secs: body.call_duration_secs ?? body.metadata?.call_duration_secs,
      data_collection_results: body.data_collection_results ?? body.analysis?.data_collection_results,
    };
  } catch (error) {
    console.error('Conversation detail failed', error instanceof Error ? error.name : 'unknown');
    return null;
  }
}
