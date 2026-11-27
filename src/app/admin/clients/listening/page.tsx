import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { listListenEntries, listenStoreKind, type ListenEntry, type TranscriptStatus } from '@/lib/listen-store';
import { isOwnerUnlocked, OWNER_COOKIE, ownerPassword } from '@/lib/session-owner-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Listening notes — Yoga of Intelligence',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

function when(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  }).format(date);
}

function transcriptLine(entry: ListenEntry): string {
  if (entry.transcript) return entry.transcript;
  const status: Record<TranscriptStatus, string> = {
    text: 'No written words were saved.',
    transcribed: 'No words came back.',
    pending: 'The audio is saved. Transcription has not been written yet.',
    failed: 'The audio is saved. Transcription did not finish.',
    unavailable: 'The audio is saved. Transcription needs ELEVENLABS_API_KEY.',
  };
  return status[entry.transcript_status];
}

export default async function ListeningNotesPage() {
  const configured = Boolean(ownerPassword());
  const unlocked = isOwnerUnlocked(cookies().get(OWNER_COOKIE)?.value);
  const store = listenStoreKind();
  let notes: ListenEntry[] = [];
  let failed = false;
  if (unlocked) {
    try {
      notes = await listListenEntries(100);
    } catch (error) {
      failed = true;
      console.error('Listen review failed', error instanceof Error ? error.name : 'unknown');
    }
  }

  return (
    <div className="relative min-h-[100svh] bg-sacred-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.14),transparent_55%)]" />
      <main className="relative z-10 mx-auto w-full max-w-lg px-5 py-10 sm:py-14">
        <p className="font-display text-sm uppercase tracking-[0.28em] text-white/40">Yoga of Intelligence</p>
        <h1 className="font-display mt-3 text-4xl font-light gold-text">Listening notes</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          Daily answers from the weekly song. These stay off the participant pages.
        </p>

        {!configured || !unlocked ? (
          <section className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="font-display text-2xl font-light text-white/90">Locked</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              {configured
                ? 'Open the participant list with the owner password, then come back here.'
                : 'Set SESSION_OWNER_PASSWORD on the server, then open the participant list.'}
            </p>
            <a href="/admin/clients" className="btn-sacred mt-5 inline-flex">
              Participant list
            </a>
          </section>
        ) : (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-white/60">
              <a href="/admin/clients" className="text-sacred-gold-light underline-offset-4 hover:underline">
                Back to participants
              </a>
            </p>
            {store === 'none' ? (
              <p className="rounded-2xl border border-sacred-gold/30 bg-white/5 px-4 py-3 text-sm text-sacred-gold-light">
                Redis is not connected, so notes cannot be kept on the server. Set UPSTASH_REDIS_REST_URL and
                UPSTASH_REDIS_REST_TOKEN.
              </p>
            ) : null}
            {store === 'file' ? (
              <p className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/65">
                Redis is not connected. Notes on this machine are in the local development store only.
              </p>
            ) : null}
            {failed ? (
              <p className="rounded-2xl border border-sacred-gold/30 bg-white/5 px-4 py-3 text-sm text-sacred-gold-light">
                The note store did not respond.
              </p>
            ) : null}
            {notes.length === 0 && !failed ? (
              <p className="text-sm text-white/55">No listening notes yet.</p>
            ) : null}
            {notes.map((entry) => (
              <article key={entry.id} className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl">
                <h2 className="font-display text-3xl font-light text-white">{entry.client_name}</h2>
                <p className="mt-1 font-mono text-xs text-sacred-gold">
                  {entry.client_id} · day {entry.day} · {entry.kind}
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-white/40">When</dt>
                    <dd className="text-white/85">
                      {when(entry.created_at)} · {entry.week_label}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Song</dt>
                    <dd className="text-white/85">{entry.song_title}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Question</dt>
                    <dd className="text-white/85">{entry.question}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Words</dt>
                    <dd className="whitespace-pre-wrap text-white/85">{transcriptLine(entry)}</dd>
                  </div>
                  {entry.kind === 'voice' && entry.audio_bytes ? (
                    <div>
                      <dt className="text-white/40">Audio</dt>
                      <dd className="text-white/85">
                        <audio controls preload="none" src={`/admin/clients/listening/audio/${entry.id}`} className="mt-2 w-full" />
                        <a
                          href={`/admin/clients/listening/audio/${entry.id}?download=1`}
                          className="mt-2 inline-block text-sacred-gold-light underline-offset-4 hover:underline"
                        >
                          Download
                        </a>
                        <span className="mt-1 block text-xs text-white/45">
                          {entry.audio_content_type}
                          {entry.recording_seconds != null ? ` · ${entry.recording_seconds}s` : ''}
                        </span>
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-white/40">Page</dt>
                    <dd>
                      <a
                        href={`/listen/${entry.client_id}`}
                        className="break-all text-sacred-gold-light underline-offset-4 hover:underline"
                      >
                        /listen/{entry.client_id}
                      </a>
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
