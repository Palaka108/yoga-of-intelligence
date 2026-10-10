import 'server-only';
import { createHash } from 'crypto';
import { Redis } from '@upstash/redis';
import { type ParticipantProfile } from '@/lib/session-participants';

/** One hash of every signup. Seeds are not written here. */
const PROFILES_KEY = 'yoi:session:profiles';
const JOIN_LIMIT = 8;
const JOIN_WINDOW_SECONDS = 60 * 60;

let redisClient: Redis | null | undefined;

/**
 * Upstash Redis from the Vercel Marketplace (UPSTASH_REDIS_REST_URL / TOKEN).
 * KV_REST_API_URL / TOKEN are accepted for an older Vercel KV store.
 * Returns null when neither pair is set, so seeded pages still render.
 */
export function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    redisClient = null;
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

export function isStoreConfigured(): boolean {
  return getRedis() !== null;
}

function parseProfile(value: unknown): ParticipantProfile | null {
  let record = value;
  if (typeof record === 'string') {
    try {
      record = JSON.parse(record);
    } catch {
      return null;
    }
  }
  if (!record || typeof record !== 'object') return null;

  const person = record as Partial<ParticipantProfile>;
  if (typeof person.client_id !== 'string' || !person.client_id.trim()) return null;
  if (typeof person.name !== 'string' || !person.name.trim()) return null;
  if (typeof person.agent_id !== 'string' || !person.agent_id.trim()) return null;

  return {
    client_id: person.client_id.trim(),
    name: person.name.trim(),
    aliases: Array.isArray(person.aliases)
      ? person.aliases.filter((alias): alias is string => typeof alias === 'string')
      : undefined,
    program: typeof person.program === 'string' && person.program ? person.program : '5-day-trial',
    start_date: typeof person.start_date === 'string' ? person.start_date : '',
    day: typeof person.day === 'number' && Number.isFinite(person.day) ? person.day : 1,
    agent_id: person.agent_id.trim(),
    notes: typeof person.notes === 'string' ? person.notes : undefined,
    email: typeof person.email === 'string' ? person.email : undefined,
    created_at: typeof person.created_at === 'string' ? person.created_at : undefined,
  };
}

export async function getStoredProfile(clientId: string): Promise<ParticipantProfile | null> {
  const redis = getRedis();
  if (!redis) return null;
  const value = await redis.hget<unknown>(PROFILES_KEY, clientId);
  const person = parseProfile(value);
  if (!person) return null;
  if (person.client_id.toLowerCase() !== clientId.toLowerCase()) return null;
  return person;
}

export async function listStoredProfiles(): Promise<ParticipantProfile[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = await redis.hgetall<Record<string, unknown>>(PROFILES_KEY);
  if (!all) return [];
  return Object.values(all)
    .map((value) => parseProfile(value))
    .filter((person): person is ParticipantProfile => person !== null);
}

export async function profileExists(clientId: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const exists = await redis.hexists(PROFILES_KEY, clientId);
  return exists === 1;
}

/** Insert only. Returns false when that client_id is already stored. */
export async function saveNewProfile(profile: ParticipantProfile): Promise<boolean> {
  const redis = getRedis();
  if (!redis) throw new Error('Signup store is not configured.');
  const created = await redis.hsetnx(PROFILES_KEY, profile.client_id, profile);
  return created === 1;
}

/**
 * Basic per-IP limit so a script cannot mint agents.
 * Fails closed when Redis is missing or errors.
 */
export async function allowJoinAttempt(ip: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  const hashed = createHash('sha256').update(ip).digest('hex').slice(0, 24);
  const key = `yoi:session:join:${hashed}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, JOIN_WINDOW_SECONDS);
  }
  return count <= JOIN_LIMIT;
}

export const JOIN_RATE_LIMIT = JOIN_LIMIT;
export const JOIN_RATE_WINDOW_SECONDS = JOIN_WINDOW_SECONDS;
