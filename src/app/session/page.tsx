import type { Metadata } from 'next';
import SessionScreen from '@/components/session/SessionScreen';
import { resolveParticipant } from '@/lib/session-directory';
import { firstQueryValue } from '@/lib/session-participants';

export const dynamic = 'force-dynamic';

type Search = { c?: string | string[] };

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const person = await resolveParticipant(firstQueryValue(searchParams.c));
  return {
    title: person ? `${person.name} — Untherapy` : 'Your link — Yoga of Intelligence',
    robots: { index: false, follow: false },
  };
}

export default async function SessionQueryPage({ searchParams }: { searchParams: Search }) {
  const person = await resolveParticipant(firstQueryValue(searchParams.c));
  return <SessionScreen person={person} />;
}
