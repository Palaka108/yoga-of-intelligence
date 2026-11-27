import { NextResponse, type NextRequest } from 'next/server';
import { reportedListenIsComplete } from '@/lib/listen-gate';
import { resolveListenDay } from '@/lib/listen-day';
import {
  allowListen,
  createListenId,
  listenStoreKind,
  latestForDay,
  maxAudioBytes,
  saveListenEntry,
  updateListenTranscript,
  type ListenEntry,
} from '@/lib/listen-store';
import { transcribeReflection } from '@/lib/listen-transcribe';
import { findListenClient, questionForDay } from '@/lib/listen-weeks';
import { clientIpFrom } from '@/lib/session-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

function cleanText(raw: string): string | null {
  const text = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  if (text.length < 2 || text.length > 4_000) return null;
  return text;
}

export async function POST(request: NextRequest, { params }: { params: { clientId: string } }) {
  const person = findListenClient(params.clientId);
  if (!person) return json({ error: 'missing' }, 404);
  if (listenStoreKind() === 'none') return json({ error: 'nostore' }, 503);

  try {
    const allowed = await allowListen('write', clientIpFrom(request.headers, request.ip));
    if (allowed === 'nostore') return json({ error: 'nostore' }, 503);
    if (allowed === 'rate') return json({ error: 'rate' }, 429);
  } catch (error) {
    console.error('Listen rate check failed', error instanceof Error ? error.name : 'unknown');
    return json({ error: 'unavailable' }, 503);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'body' }, 400);
  }

  const requested = Number(form.get('day'));
  const dayState = resolveListenDay(person.week, Number.isInteger(requested) ? requested : null);
  if (dayState.state !== 'ready') return json({ error: 'closed' }, 403);
  if (person.week.calendar && requested !== dayState.day) return json({ error: 'day' }, 409);

  const day = dayState.day;
  const question = questionForDay(person, day);
  if (!question) return json({ error: 'day' }, 400);

  const played = Number(form.get('played_seconds'));
  const duration = Number(form.get('duration_seconds'));
  const coverage = Number(form.get('coverage'));
  let alreadyKept = false;
  try {
    alreadyKept = Boolean(await latestForDay(person.clientId, person.week.id, day));
  } catch (error) {
    console.error('Listen lookup failed', error instanceof Error ? error.name : 'unknown');
  }
  // A second note on a day they already finished does not ask for another full listen.
  if (!alreadyKept && !reportedListenIsComplete(played, duration, coverage)) {
    return json({ error: 'unlistened' }, 400);
  }

  const kind = String(form.get('kind') ?? '');
  const id = createListenId();
  const created_at = new Date().toISOString();
  const base = {
    id,
    client_id: person.clientId,
    client_name: person.name,
    week_id: person.week.id,
    week_label: person.week.label,
    song_title: person.week.songTitle.replace(/\s*\n\s*/g, ' '),
    day,
    question,
    created_at,
  };

  try {
    if (kind === 'text') {
      const transcript = cleanText(String(form.get('transcript') ?? ''));
      if (!transcript) return json({ error: 'text' }, 400);
      const entry: ListenEntry = {
        ...base,
        kind: 'text',
        transcript,
        transcript_status: 'text',
        audio_content_type: null,
        audio_bytes: null,
        recording_seconds: null,
      };
      await saveListenEntry(entry, null);
      return json({ ok: true, id, question, transcript, transcriptStatus: 'text' });
    }

    if (kind !== 'voice') return json({ error: 'kind' }, 400);

    const file = form.get('audio');
    if (!(file instanceof File)) return json({ error: 'audio' }, 400);
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length < 800) return json({ error: 'short' }, 400);
    if (bytes.length > maxAudioBytes()) return json({ error: 'large' }, 413);

    const contentType = file.type && file.type.startsWith('audio/') ? file.type : 'application/octet-stream';
    const recording = Number(form.get('recording_seconds'));
    const entry: ListenEntry = {
      ...base,
      kind: 'voice',
      transcript: null,
      transcript_status: 'pending',
      audio_content_type: contentType,
      audio_bytes: bytes.length,
      recording_seconds: Number.isFinite(recording) ? Math.max(0, Math.round(recording)) : null,
    };
    await saveListenEntry(entry, bytes);

    // TODO(listen): transcription is best-effort on top of the saved audio.
    // A missing key or a failed Scribe call leaves the note in the review list.
    const attempt = await transcribeReflection(bytes, contentType);
    const transcript = attempt.ok ? attempt.text : null;
    const transcriptStatus = attempt.ok ? 'transcribed' : attempt.reason;
    const updated = await updateListenTranscript(id, transcript, transcriptStatus);
    return json({
      ok: true,
      id,
      question,
      transcript: updated?.transcript ?? transcript,
      transcriptStatus: updated?.transcript_status ?? transcriptStatus,
    });
  } catch (error) {
    console.error('Listen save failed', error instanceof Error ? error.name : 'unknown');
    const message = error instanceof Error ? error.message : '';
    if (message === 'Recording is too large.') return json({ error: 'large' }, 413);
    return json({ error: 'unavailable' }, 503);
  }
}
