import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ListenPath, { type KeptNote } from '@/app/listen/[clientId]/ListenPath';
import { dayWord, formatListenDate, parseDayParam, resolveListenDay } from '@/lib/listen-day';
import { answeredDays, latestForDay, type ListenEntry } from '@/lib/listen-store';
import { findListenClient } from '@/lib/listen-weeks';

export const dynamic = 'force-dynamic';

function rawId(clientId: string): string {
  try {
    return decodeURIComponent(clientId);
  } catch {
    return clientId;
  }
}

function keptFrom(entry: ListenEntry | null): KeptNote | null {
  if (!entry) return null;
  return {
    question: entry.question,
    transcript: entry.transcript,
    kind: entry.kind,
    transcriptStatus: entry.transcript_status,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { clientId: string };
}): Promise<Metadata> {
  const person = findListenClient(rawId(params.clientId));
  const title = person ? person.week.songTitle.replace(/\s*\n\s*/g, ' ') : 'Listening';
  return {
    title: `${title} — Untherapy`,
    robots: { index: false, follow: false },
  };
}

export default async function ListenClientPage({
  params,
  searchParams,
}: {
  params: { clientId: string };
  searchParams: { day?: string | string[] };
}) {
  const person = findListenClient(rawId(params.clientId));
  if (!person) notFound();

  const requested = person.week.calendar ? null : parseDayParam(searchParams.day);
  const today = resolveListenDay(person.week, requested);
  const day = today.state === 'ready' ? today.day : null;

  let kept: KeptNote | null = null;
  let marks: number[] = [];
  if (day) {
    try {
      const [entry, days] = await Promise.all([
        latestForDay(person.clientId, person.week.id, day),
        answeredDays(person.clientId, person.week.id),
      ]);
      kept = keptFrom(entry);
      marks = days;
    } catch (error) {
      console.error('Listen page read failed', error instanceof Error ? error.name : 'unknown');
    }
  }

  const kicker =
    today.state === 'ready'
      ? `${person.week.label}, Day ${dayWord(today.day)} of seven`
      : person.week.label;

  return (
    <ListenPath
      key={`${person.week.id}:${day ?? today.state}`}
      clientId={person.clientId}
      kicker={kicker}
      day={day}
      songUrl={person.week.songUrl}
      songTitle={person.week.songTitle}
      verse={person.week.verse}
      answeredDays={marks}
      opensOn={today.state === 'before' ? formatListenDate(today.opensOn) : null}
      closed={today.state === 'after'}
      sent={kept}
    />
  );
}
