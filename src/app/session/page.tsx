import type { Metadata } from 'next';
import SessionScreen from '@/components/session/SessionScreen';
import { sessionAccess } from '@/lib/session-access';
import { firstQueryValue } from '@/lib/session-participants';

export const dynamic = 'force-dynamic';

type Search = { c?: string | string[] };

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const access = await sessionAccess(firstQueryValue(searchParams.c));
  return {
    title: access.mode === 'open' ? `${access.person.name} — Untherapy` : 'Untherapy — 5-Day Reflection',
    robots: { index: false, follow: false },
  };
}

export default async function SessionQueryPage({ searchParams }: { searchParams: Search }) {
  const access = await sessionAccess(firstQueryValue(searchParams.c));
  return <SessionScreen access={access} />;
}
