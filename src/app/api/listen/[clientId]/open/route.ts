import { NextResponse, type NextRequest } from 'next/server';
import { reportedListenIsComplete } from '@/lib/listen-gate';
import { resolveListenDay } from '@/lib/listen-day';
import { allowListen, listenStoreKind } from '@/lib/listen-store';
import { findListenClient, questionForDay } from '@/lib/listen-weeks';
import { clientIpFrom } from '@/lib/session-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Returns today's question only after the player reports a real listen.
 * The question is not rendered in the page HTML before that.
 */
export async function POST(request: NextRequest, { params }: { params: { clientId: string } }) {
  const person = findListenClient(params.clientId);
  if (!person) {
    return NextResponse.json({ error: 'missing' }, { status: 404 });
  }

  try {
    const allowed = await allowListen('open', clientIpFrom(request.headers, request.ip));
    if (allowed === 'rate') {
      return NextResponse.json({ error: 'rate' }, { status: 429 });
    }
  } catch (error) {
    console.error('Listen open rate check failed', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  let body: { day?: unknown; playedSeconds?: unknown; durationSeconds?: unknown; coverage?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'body' }, { status: 400 });
  }

  const requested = typeof body.day === 'number' ? body.day : Number(body.day);
  const dayState = resolveListenDay(person.week, Number.isInteger(requested) ? requested : null);
  if (dayState.state !== 'ready') {
    return NextResponse.json({ error: 'closed' }, { status: 403 });
  }
  if (person.week.calendar && requested !== dayState.day) {
    return NextResponse.json({ error: 'day' }, { status: 409 });
  }

  const played = Number(body.playedSeconds);
  const duration = Number(body.durationSeconds);
  const coverage = Number(body.coverage);
  if (!reportedListenIsComplete(played, duration, coverage)) {
    return NextResponse.json({ error: 'unlistened' }, { status: 400 });
  }

  const question = questionForDay(person, dayState.day);
  if (!question) return NextResponse.json({ error: 'day' }, { status: 400 });

  return NextResponse.json(
    { ok: true, day: dayState.day, question, store: listenStoreKind() },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
