import 'server-only';

/**
 * Speech to text for a listening-path voice note.
 *
 * Reuses ELEVENLABS_API_KEY from the Untherapy voice pages. The model is
 * Scribe (scribe_v3), for ordinary speech. This is a reflection practice,
 * not a clinical recording, so the medical model is not used.
 *
 * TODO(listen): when ELEVENLABS_API_KEY is missing, or Scribe does not
 * answer, the audio is still saved and the transcript stays empty. The
 * review page says so. No second key is required.
 */

export type TranscriptAttempt =
  | { ok: true; text: string }
  | { ok: false; reason: 'unavailable' | 'failed' };

export async function transcribeReflection(bytes: Buffer, contentType: string): Promise<TranscriptAttempt> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: 'unavailable' };
  if (bytes.length < 800) return { ok: false, reason: 'failed' };

  const form = new FormData();
  const type = contentType || 'application/octet-stream';
  const blob = new Blob([new Uint8Array(bytes)], { type });
  form.set('model_id', 'scribe_v3');
  form.set('language_code', 'en');
  form.set('file', blob, `reflection.${extensionFor(type)}`);

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey },
      body: form,
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error(`Listen transcription failed (${response.status})`);
      return { ok: false, reason: 'failed' };
    }
    const body = (await response.json()) as { text?: unknown };
    if (typeof body.text !== 'string' || !body.text.trim()) {
      return { ok: false, reason: 'failed' };
    }
    return { ok: true, text: body.text.trim().slice(0, 8_000) };
  } catch (error) {
    console.error('Listen transcription failed', error instanceof Error ? error.name : 'unknown');
    return { ok: false, reason: 'failed' };
  }
}

function extensionFor(contentType: string): string {
  if (contentType.includes('mp4') || contentType.includes('aac') || contentType.includes('m4a')) return 'm4a';
  if (contentType.includes('ogg')) return 'ogg';
  if (contentType.includes('wav')) return 'wav';
  return 'webm';
}
