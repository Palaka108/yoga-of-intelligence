import 'server-only';
import {
  findSeed,
  seededProfiles,
  toPublic,
  type ParticipantProfile,
  type PublicParticipant,
} from '@/lib/session-participants';
import { getStoredProfile, isStoreConfigured, listStoredProfiles } from '@/lib/session-store';

/** Seed first, then Redis. Nia resolves even when the store is unset or down. */
export async function resolveParticipant(
  raw: string | null | undefined
): Promise<PublicParticipant | null> {
  const seeded = findSeed(raw);
  if (seeded) return toPublic(seeded);

  const key = (raw ?? '').trim();
  if (!key) return null;

  try {
    const stored = await getStoredProfile(key.toLowerCase());
    return stored ? toPublic(stored) : null;
  } catch (error) {
    console.error('Session store read failed', error instanceof Error ? error.name : 'unknown');
    return null;
  }
}

export async function listProfilesForOwner(): Promise<{
  profiles: ParticipantProfile[];
  storeConfigured: boolean;
  storeError: boolean;
}> {
  const seeds = seededProfiles.map((person) => ({ ...person }));
  if (!isStoreConfigured()) {
    return { profiles: seeds, storeConfigured: false, storeError: false };
  }

  try {
    const stored = await listStoredProfiles();
    const seedIds = new Set(seeds.map((person) => person.client_id.toLowerCase()));
    const signups = stored
      .filter((person) => !seedIds.has(person.client_id.toLowerCase()))
      .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
    return { profiles: [...signups, ...seeds], storeConfigured: true, storeError: false };
  } catch (error) {
    console.error('Session store list failed', error instanceof Error ? error.name : 'unknown');
    return { profiles: seeds, storeConfigured: true, storeError: true };
  }
}
