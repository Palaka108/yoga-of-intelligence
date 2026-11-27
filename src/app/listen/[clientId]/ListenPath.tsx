'use client';

import { useEffect, useRef, useState } from 'react';
import MorningScene from '@/app/listen/[clientId]/MorningScene';
import { remainingPhrase } from '@/lib/listen-copy';
import { createListenGate, type ListenGate } from '@/lib/listen-gate';

export type KeptNote = {
  question: string;
  transcript: string | null;
  kind: 'voice' | 'text';
  transcriptStatus: 'text' | 'transcribed' | 'pending' | 'failed' | 'unavailable';
};

type Props = {
  clientId: string;
  kicker: string;
  day: number | null;
  songUrl: string;
  songTitle: string;
  verse: string;
  answeredDays: number[];
  opensOn: string | null;
  closed: boolean;
  sent: KeptNote | null;
};

type TalkState = 'idle' | 'recording' | 'review';
type Proof = { played: number; duration: number; coverage: number };

const SAVE_ERRORS: Record<string, string> = {
  unlistened: 'The song still needs to play through before this can be sent.',
  short: 'That recording was too short. Say a little more, or write it.',
  large: 'That recording is too long to keep. A shorter note, or a few written words, will do.',
  rate: 'That’s enough for this hour. You can try again later.',
  nostore: 'This note could not be kept yet. The response store is not connected.',
  unavailable: 'The send didn’t finish. Reload in a moment, and send it again if it isn’t there.',
  day: 'The day turned over. Reload the page for today’s question.',
  closed: 'This week isn’t open for a new note.',
  text: 'Write a little more than that.',
};

function micFailure(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return 'The microphone stayed closed. You can allow it in the browser settings, or write the answer here.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No microphone was found. You can write the answer here.';
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return 'The microphone is busy in another app. You can write the answer here.';
  }
  return 'This browser could not record. You can write the answer here.';
}

function pickMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'];
  return types.find((type) => MediaRecorder.isTypeSupported(type));
}

function elapsedLabel(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export default function ListenPath({
  clientId,
  kicker,
  day,
  songUrl,
  songTitle,
  verse,
  answeredDays,
  opensOn,
  closed,
  sent,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gateRef = useRef<ListenGate | null>(null);
  const durationRef = useRef(0);
  const openGateRef = useRef<(duration: number) => void>(() => {});
  const proofRef = useRef<Proof | null>(null);
  const openedRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingRef = useRef(false);
  const wantRecord = useRef(false);
  const pendingToggle = useRef(false);
  const modeRef = useRef<'hold' | 'toggle'>('hold');
  const holdStart = useRef(0);
  const startedAt = useRef(0);
  const stopRef = useRef<() => void>(() => {});
  const reviewUrl = useRef<string | null>(null);
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const [duration, setDuration] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [covered, setCovered] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [songError, setSongError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const [openAttempt, setOpenAttempt] = useState(0);
  const [question, setQuestion] = useState<string | null>(sent?.question ?? null);
  const [kept, setKept] = useState<KeptNote | null>(sent);
  const [revising, setRevising] = useState(false);
  const [talk, setTalk] = useState<TalkState>('idle');
  const [hint, setHint] = useState('Press and talk');
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [reviewPlaying, setReviewPlaying] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [textOpen, setTextOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  openGateRef.current = (nextDuration: number) => {
    const gate = gateRef.current;
    if (!gate || openedRef.current || day == null) return;
    openedRef.current = true;
    proofRef.current = {
      played: gate.coveredSeconds(nextDuration),
      duration: nextDuration,
      coverage: gate.coverage(),
    };
    setOpen(true);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let timer = 0;

    const sample = (kind: 'tick' | 'anchor') => {
      const gate = gateRef.current;
      if (!gate) return;
      const wall = performance.now();
      const snap = {
        mediaTime: audio.currentTime || 0,
        wallMs: wall,
        paused: audio.paused,
        rate: audio.playbackRate || 1,
        seeking: audio.seeking,
      };
      if (kind === 'anchor') gate.anchor(snap.mediaTime, wall);
      else gate.tick(snap);
      const nextDuration = durationRef.current;
      setPlayhead(snap.mediaTime);
      setCovered(gate.coveredSeconds(nextDuration));
      if (gate.unlocks(nextDuration)) openGateRef.current(nextDuration);
    };

    const onMeta = () => {
      const next = audio.duration;
      if (!Number.isFinite(next) || next <= 0) return;
      durationRef.current = next;
      setDuration(next);
      if (!gateRef.current) gateRef.current = createListenGate(next);
    };
    const onPlay = () => {
      if (audio.playbackRate !== 1) audio.playbackRate = 1;
      setPlaying(true);
      sample('anchor');
      window.clearInterval(timer);
      timer = window.setInterval(() => sample('tick'), 200);
    };
    const onPause = () => {
      window.clearInterval(timer);
      setPlaying(false);
      sample('anchor');
    };
    const onSeeking = () => sample('anchor');
    const onSeeked = () => sample('anchor');
    const onEnded = () => {
      window.clearInterval(timer);
      setPlaying(false);
      const gate = gateRef.current;
      const nextDuration = durationRef.current;
      if (!gate) return;
      gate.tick({
        mediaTime: Number.isFinite(audio.currentTime) ? audio.currentTime : nextDuration,
        wallMs: performance.now(),
        paused: false,
        rate: audio.playbackRate || 1,
        seeking: false,
      });
      gate.finish(nextDuration);
      setPlayhead(audio.currentTime || nextDuration);
      setCovered(gate.coveredSeconds(nextDuration));
      if (gate.unlocks(nextDuration)) openGateRef.current(nextDuration);
    };
    const onRate = () => {
      if (audio.playbackRate !== 1) audio.playbackRate = 1;
    };
    const onError = () => setSongError('The song didn’t load. Check the link, then try again.');

    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('seeking', onSeeking);
    audio.addEventListener('seeked', onSeeked);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('ratechange', onRate);
    audio.addEventListener('error', onError);
    audio.playbackRate = 1;
    if (audio.readyState >= 1) onMeta();

    return () => {
      window.clearInterval(timer);
      audio.pause();
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('seeking', onSeeking);
      audio.removeEventListener('seeked', onSeeked);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('ratechange', onRate);
      audio.removeEventListener('error', onError);
    };
  }, [songUrl]);

  useEffect(() => {
    if (!open || question || day == null) return;
    const proof = proofRef.current;
    if (!proof) return;
    const ac = new AbortController();
    setOpening(true);
    setOpenError(null);
    (async () => {
      try {
        const response = await fetch(`/api/listen/${encodeURIComponent(clientId)}/open`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day,
            playedSeconds: proof.played,
            durationSeconds: proof.duration,
            coverage: proof.coverage,
          }),
          signal: ac.signal,
        });
        const body = (await response.json().catch(() => null)) as { question?: unknown; error?: string } | null;
        if (!response.ok || typeof body?.question !== 'string') {
          setOpenError(
            body?.error === 'rate'
              ? 'That’s enough for this hour. You can try again later.'
              : 'The question didn’t open. Stay here and try again.'
          );
          return;
        }
        setQuestion(body.question);
      } catch {
        if (!ac.signal.aborted) setOpenError('The question didn’t open. Stay here and try again.');
      } finally {
        if (!ac.signal.aborted) setOpening(false);
      }
    })();
    return () => ac.abort();
  }, [open, question, clientId, day, openAttempt]);

  useEffect(() => {
    if (talk !== 'recording') return;
    const id = window.setInterval(() => {
      const seconds = (Date.now() - startedAt.current) / 1000;
      setElapsed(seconds);
      if (seconds >= 90) stopRef.current();
    }, 200);
    return () => window.clearInterval(id);
  }, [talk]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop();
        } catch {
          stopTracks(streamRef.current);
        }
      } else {
        stopTracks(streamRef.current);
      }
      if (reviewUrl.current) URL.revokeObjectURL(reviewUrl.current);
    };
  }, []);

  useEffect(() => {
    if (!textOpen) return;
    textRef.current?.focus();
  }, [textOpen]);

  function stopRecorder() {
    wantRecord.current = false;
    pendingToggle.current = false;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        stopTracks(streamRef.current);
        recordingRef.current = false;
        setTalk('idle');
      }
      return;
    }
    recordingRef.current = false;
  }
  stopRef.current = stopRecorder;

  function beginRecorder(stream: MediaStream) {
    const mime = pickMime();
    let recorder: MediaRecorder;
    try {
      recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch {
      try {
        recorder = new MediaRecorder(stream);
      } catch (error) {
        stopTracks(stream);
        setMicError(micFailure(error));
        setTextOpen(true);
        return;
      }
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => {
      stopTracks(stream);
      recordingRef.current = false;
      setMicError('The recording stopped. You can try again, or write the answer.');
      setTextOpen(true);
      setTalk('idle');
    };
    recorder.onstop = () => {
      stopTracks(stream);
      streamRef.current = null;
      recordingRef.current = false;
      const type = recorder.mimeType || mime || 'audio/webm';
      const blob = new Blob(chunks, { type });
      const seconds = (Date.now() - startedAt.current) / 1000;
      setElapsed(seconds);
      if (blob.size < 800 || seconds < 0.4) {
        setMicError('That was very short. Say a little more, or write it.');
        setTextOpen(true);
        setTalk('idle');
        return;
      }
      if (reviewUrl.current) URL.revokeObjectURL(reviewUrl.current);
      const url = URL.createObjectURL(blob);
      reviewUrl.current = url;
      setAudioBlob(blob);
      setAudioUrl(url);
      setTalk('review');
      setHint('Press and talk');
    };

    try {
      // No timeslice. A timeslice yields empty clips on some mobile Safari versions.
      recorder.start();
    } catch (error) {
      stopTracks(stream);
      setMicError(micFailure(error));
      setTextOpen(true);
      return;
    }

    streamRef.current = stream;
    recorderRef.current = recorder;
    recordingRef.current = true;
    startedAt.current = Date.now();
    setElapsed(0);
    setMicError(null);
    setTalk('recording');
    if (pendingToggle.current) {
      modeRef.current = 'toggle';
      pendingToggle.current = false;
      setHint('Tap to finish');
    } else {
      setHint('Release to finish');
    }
  }

  async function armRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicError('This browser could not record. You can write the answer here.');
      setTextOpen(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      if (!wantRecord.current && !pendingToggle.current) {
        stopTracks(stream);
        return;
      }
      beginRecorder(stream);
    } catch (error) {
      wantRecord.current = false;
      pendingToggle.current = false;
      setMicError(micFailure(error));
      setTextOpen(true);
    }
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || talk === 'review' || sending) return;
    event.preventDefault();
    event.currentTarget.focus();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* capture can fail on a lost pointer */
    }
    if (recordingRef.current && modeRef.current === 'toggle') {
      stopRecorder();
      return;
    }
    if (recordingRef.current) return;
    wantRecord.current = true;
    pendingToggle.current = false;
    modeRef.current = 'hold';
    holdStart.current = performance.now();
    void armRecording();
  }

  function onPointerUp() {
    const held = performance.now() - holdStart.current;
    if (!recordingRef.current) {
      if (held < 450) pendingToggle.current = true;
      else wantRecord.current = false;
      return;
    }
    if (modeRef.current === 'toggle') return;
    if (held < 450) {
      modeRef.current = 'toggle';
      setHint('Tap to finish');
      return;
    }
    stopRecorder();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    if (talk === 'review' || sending) return;
    event.preventDefault();
    if (recordingRef.current) {
      stopRecorder();
      return;
    }
    wantRecord.current = true;
    pendingToggle.current = true;
    modeRef.current = 'toggle';
    void armRecording();
  }

  function discardRecording() {
    if (reviewAudioRef.current) {
      reviewAudioRef.current.pause();
    }
    if (reviewUrl.current) URL.revokeObjectURL(reviewUrl.current);
    reviewUrl.current = null;
    setAudioBlob(null);
    setAudioUrl(null);
    setReviewPlaying(false);
    setTalk('idle');
    setHint('Press and talk');
    setMicError(null);
  }

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    setSongError(null);
    if (!audio.paused) {
      audio.pause();
      return;
    }
    audio.playbackRate = 1;
    try {
      await audio.play();
    } catch {
      setSongError('Tap play once more to start the song.');
    }
  }

  async function toggleReview() {
    const clip = reviewAudioRef.current;
    if (!clip) return;
    if (!clip.paused) {
      clip.pause();
      setReviewPlaying(false);
      return;
    }
    try {
      await clip.play();
      setReviewPlaying(true);
    } catch {
      setMicError('The playback needs another tap.');
    }
  }

  async function send(kind: 'voice' | 'text') {
    if (sending || day == null) return;
    const proof = proofRef.current;
    setSending(true);
    setSendError(null);
    try {
      const body = new FormData();
      body.set('day', String(day));
      body.set('kind', kind);
      body.set('played_seconds', String(proof?.played ?? 0));
      body.set('duration_seconds', String(proof?.duration ?? 0));
      body.set('coverage', String(proof?.coverage ?? 0));
      if (kind === 'text') {
        body.set('transcript', text);
      } else if (audioBlob) {
        const type = audioBlob.type || 'audio/webm';
        const ext = type.includes('mp4') || type.includes('aac') ? 'm4a' : 'webm';
        body.set('audio', audioBlob, `note.${ext}`);
        body.set('recording_seconds', String(elapsed));
      } else {
        setSendError('Record a note, or write it, before sending.');
        setSending(false);
        return;
      }

      const response = await fetch(`/api/listen/${encodeURIComponent(clientId)}`, {
        method: 'POST',
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        transcript?: string | null;
        transcriptStatus?: KeptNote['transcriptStatus'];
        question?: string;
      } | null;
      if (!response.ok) {
        setSendError(SAVE_ERRORS[payload?.error ?? ''] ?? 'The send didn’t finish. You can try again.');
        if (payload?.error === 'nostore' || payload?.error === 'short') setTextOpen(true);
        return;
      }
      setKept({
        question: typeof payload?.question === 'string' ? payload.question : question ?? '',
        transcript: typeof payload?.transcript === 'string' ? payload.transcript : null,
        kind,
        transcriptStatus: payload?.transcriptStatus ?? (kind === 'text' ? 'text' : 'pending'),
      });
      setRevising(false);
      discardRecording();
      setText('');
      setTextOpen(false);
    } catch {
      setSendError('The send didn’t finish. You can try again.');
    } finally {
      setSending(false);
    }
  }

  const seekBlocked = !open && !kept && duration > 0 && playhead > covered + 1.25;
  const answering = Boolean(question) && (revising || (open && !kept));
  const showRing = day != null && !opensOn && !closed && !kept && !open;
  const knob = duration > 0 ? Math.min(100, Math.max(0, (playhead / duration) * 100)) : 0;
  const titleLines = songTitle.split('\n');
  const gateState = kept && !revising ? 'sent' : opensOn ? 'before' : closed ? 'after' : answering ? 'open' : open ? 'opening' : 'locked';

  const statusLine =
    kept && !revising
      ? 'Today’s note is with Palaka.'
      : answering
        ? 'The song finished. Today’s question is open.'
        : songError
          ? songError
          : seekBlocked
            ? 'Skipping ahead keeps the question closed.'
            : playing
              ? 'The song is playing.'
              : opensOn
                ? `The first question opens on ${opensOn}.`
                : closed
                  ? 'This week of listening is complete.'
                  : 'The question opens when the song finishes.';

  return (
    <main className="listen-sheet" data-gate={gateState}>
      <p className="sr-only" role="status">
        {statusLine}
      </p>
      <h1 className="listen-kicker">{kicker}</h1>
      {day != null ? (
        <ol className="listen-ticks" aria-label={`Day ${day} of 7`}>
          {Array.from({ length: 7 }, (_, index) => {
            const number = index + 1;
            const state =
              answeredDays.includes(number) || (kept != null && number === day) ? 'kept' : number === day ? 'today' : 'quiet';
            return (
              <li key={number} data-state={state}>
                <span className="sr-only">
                  Day {number}
                  {state === 'today' ? ', today' : state === 'kept' ? ', kept' : ''}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      <figure className="listen-frame">
        <MorningScene />
      </figure>

      <h2 className="listen-title">
        {titleLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>
      <p className="listen-verse">{verse}</p>

      <div className="listen-player">
        <button
          type="button"
          className="listen-play"
          onClick={() => void togglePlay()}
          aria-label={playing ? 'Pause the song' : 'Play the song'}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <rect x="2" y="1" width="3.2" height="12" rx="0.4" fill="#3c332b" />
              <rect x="8.8" y="1" width="3.2" height="12" rx="0.4" fill="#3c332b" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M4 2.2 L11.5 7 L4 11.8 Z" fill="#3c332b" />
            </svg>
          )}
        </button>
        <div className="listen-track" aria-hidden="true">
          <div className="listen-knob" style={{ left: `${knob}%` }} />
        </div>
      </div>
      <audio ref={audioRef} className="listen-audio" src={songUrl} preload="metadata" playsInline />

      {seekBlocked ? <p className="listen-note">Skipping ahead keeps the question closed.</p> : null}
      {songError ? <p className="listen-error">{songError}</p> : null}

      {showRing ? (
        <div className="listen-ring">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="102" r="78" fill="none" stroke="#3c332b" strokeOpacity="0.18" strokeWidth="1.4" />
            <path
              d="M100 24 C146 26 176 52 176 100 C176 146 146 176 100 178 C54 180 26 150 24 102 C22 58 52 26 100 24"
              fill="none"
              stroke="#3c332b"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <p className="listen-ring-copy">
            <span>Listen to unlock,</span>
            <span>{duration > 0 ? remainingPhrase(duration - covered) : 'when the song finishes'}</span>
          </p>
        </div>
      ) : null}

      <section className={`listen-card${answering ? ' is-open' : ''}${kept && !revising ? ' is-kept' : ''}${answering || (kept && revising) ? ' listen-in' : ''}`}>
        {kept && !revising ? (
          <>
            <p className="listen-label">With Palaka</p>
            <p className="listen-question">{kept.question}</p>
            {kept.transcript ? <p className="listen-kept">{kept.transcript}</p> : <p className="listen-kept">Your voice is with him.</p>}
            {kept.kind === 'voice' && !kept.transcript ? (
              <p className="listen-note">The words will be written beside the recording.</p>
            ) : null}
            <button type="button" className="listen-again" onClick={() => setRevising(true)}>
              Send a different note
            </button>
          </>
        ) : opensOn ? (
          <p>
            <span className="listen-label">Your first question opens on {opensOn}.</span> The song can wait here until then.
          </p>
        ) : closed ? (
          <p>
            <span className="listen-label">This week is complete.</span> Palaka has what you sent, and he’ll choose what comes next.
          </p>
        ) : answering && question ? (
          <>
            <p className="listen-label">Today’s reflection</p>
            <p className="listen-question" data-question="open">
              {question}
            </p>
          </>
        ) : (
          <>
            <LockIcon />
            <p>
              <span className="listen-label">Today’s reflection</span> opens when the song finishes.
            </p>
          </>
        )}
      </section>

      {open && !question ? (
        <div className="listen-review">
          {opening ? <p className="listen-note">Opening today’s question.</p> : null}
          {openError ? <p className="listen-error">{openError}</p> : null}
          {openError ? (
            <button type="button" className="listen-ghost" onClick={() => setOpenAttempt((value) => value + 1)}>
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {answering ? (
        <div className="listen-in">
          {talk !== 'review' ? (
            <button
              type="button"
              className={`listen-talk${talk === 'recording' ? ' is-recording' : ''}`}
              aria-pressed={talk === 'recording'}
              aria-label={talk === 'recording' ? hint : 'Press and talk'}
              disabled={sending}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
            >
              <MicIcon />
              <span>{talk === 'recording' ? `${hint} ${elapsedLabel(elapsed)}` : 'Press and talk'}</span>
            </button>
          ) : (
            <div className="listen-review">
              <audio
                ref={reviewAudioRef}
                src={audioUrl ?? undefined}
                playsInline
                preload="auto"
                onEnded={() => setReviewPlaying(false)}
              />
              <button type="button" className="listen-ghost" onClick={() => void toggleReview()}>
                {reviewPlaying ? 'Pause' : 'Play back'}
              </button>
              <button type="button" className="listen-ghost" onClick={discardRecording} disabled={sending}>
                Record again
              </button>
              <button type="button" className="listen-send" onClick={() => void send('voice')} disabled={sending || !audioBlob}>
                {sending ? 'Sending…' : 'Send this'}
              </button>
            </div>
          )}

          {micError ? <p className="listen-error">{micError}</p> : null}
          {sendError ? <p className="listen-error">{sendError}</p> : null}

          {talk !== 'review' ? (
            textOpen ? (
              <div className="listen-write">
                <label htmlFor="listen-text">Or write it</label>
                <textarea
                  ref={textRef}
                  id="listen-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  maxLength={4000}
                  placeholder="A sentence is enough."
                />
                <button
                  type="button"
                  className="listen-send"
                  style={{ marginTop: '0.75rem' }}
                  disabled={sending || text.trim().length < 2}
                  onClick={() => void send('text')}
                >
                  {sending ? 'Sending…' : 'Send this'}
                </button>
              </div>
            ) : (
              <button type="button" className="listen-alt" onClick={() => setTextOpen(true)}>
                Write it instead
              </button>
            )
          ) : null}
        </div>
      ) : null}

      <p className="listen-foot">A reflection practice, not therapy.</p>
    </main>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true" style={{ flex: '0 0 auto', marginTop: 2 }}>
      <rect x="3.2" y="11" width="15.6" height="12" rx="2.2" fill="none" stroke="#3c332b" strokeWidth="1.6" />
      <path d="M6.5 11 V8.2 a4.5 4.5 0 0 1 9 0 V11" fill="none" stroke="#3c332b" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="11" cy="16.2" r="1.3" fill="#3c332b" />
      <path d="M11 17.4 V20" stroke="#3c332b" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="28" height="36" viewBox="0 0 28 36" aria-hidden="true">
      <rect x="9" y="2" width="10" height="18" rx="5" fill="none" stroke="#4e332d" strokeWidth="1.7" />
      <path d="M5.5 16.5 a8.5 8.5 0 0 0 17 0" fill="none" stroke="#4e332d" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14 25.2 V31" stroke="#4e332d" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 31.5 H19" stroke="#4e332d" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
