import type { Metadata } from 'next';
import SessionScreen from '@/components/session/SessionScreen';
import { sessionAccess } from '@/lib/session-access';

export const dynamic = 'force-dynamic';

function rawId(clientId: string): string {
  try {
    return decodeURIComponent(clientId);
  } catch {
    return clientId;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { clientId: string };
}): Promise<Metadata> {
  const access = await sessionAccess(rawId(params.clientId));
  return {
    title: access.mode === 'open' ? `${access.person.name} — Untherapy` : 'Untherapy — 5-Day Reflection',
    robots: { index: false, follow: false },
  };
}

export default async function SessionClientPage({ params }: { params: { clientId: string } }) {
  const access = await sessionAccess(rawId(params.clientId));
  return <SessionScreen access={access} />;
}
