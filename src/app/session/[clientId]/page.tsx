import type { Metadata } from 'next';
import SessionScreen from '@/components/session/SessionScreen';
import { resolveParticipant } from '@/lib/session-directory';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { clientId: string };
}): Promise<Metadata> {
  const person = await resolveParticipant(decodeURIComponent(params.clientId));
  return {
    title: person ? `${person.name} — Untherapy` : 'Your link — Yoga of Intelligence',
    robots: { index: false, follow: false },
  };
}

export default async function SessionClientPage({ params }: { params: { clientId: string } }) {
  const person = await resolveParticipant(decodeURIComponent(params.clientId));
  return <SessionScreen person={person} />;
}
