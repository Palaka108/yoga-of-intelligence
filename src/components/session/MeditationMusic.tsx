'use client';

import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const TRACK_SRC = '/music/so-many-forms-instrumental.mp3';
const DEFAULT_VOLUME = 0.25;
const FADE_MS = 2000;

/**
 * A plain media element, not a Web Audio graph. The voice widget owns the
 * microphone and its own playback element; this track only sets volume on
 * itself so a call does not have to share or suspend an audio context.
 */
export default function MeditationMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const wantPlayRef = useRef(false);
  const fadingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const resumeAtRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = DEFAULT_VOLUME;

    const keepPlaying = () => {
      if (!wantPlayRef.current || !audio.paused) return;
      const now = Date.now();
      if (now - resumeAtRef.current < 400) return;
      resumeAtRef.current = now;
      void audio.play().catch(() => {
        wantPlayRef.current = false;
        setPlaying(false);
      });
    };

    audio.addEventListener('pause', keepPlaying);
    return () => {
      audio.removeEventListener('pause', keepPlaying);
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function cancelFade() {
    fadingRef.current = false;
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }

  function fadeIn() {
    const audio = audioRef.current;
    if (!audio) return;
    cancelFade();
    fadingRef.current = true;
    audio.volume = 0;
    const start = performance.now();
    const step = (now: number) => {
      const el = audioRef.current;
      if (!el || !fadingRef.current) return;
      const t = Math.min(1, (now - start) / FADE_MS);
      const eased = 1 - (1 - t) * (1 - t);
      el.volume = volumeRef.current * eased;
      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      fadingRef.current = false;
      el.volume = volumeRef.current;
    };
    frameRef.current = requestAnimationFrame(step);
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (wantPlayRef.current) {
      wantPlayRef.current = false;
      cancelFade();
      audio.pause();
      audio.volume = volumeRef.current;
      setPlaying(false);
      return;
    }

    wantPlayRef.current = true;
    audio.volume = 0;
    try {
      await audio.play();
    } catch {
      wantPlayRef.current = false;
      audio.volume = volumeRef.current;
      setPlaying(false);
      return;
    }
    setPlaying(true);
    fadeIn();
  }

  function onVolume(next: number) {
    const level = Math.min(1, Math.max(0, next));
    volumeRef.current = level;
    setVolume(level);
    const audio = audioRef.current;
    if (!audio || fadingRef.current) return;
    audio.volume = level;
  }

  return (
    <section
      aria-label="Meditation music"
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-3.5 rounded-3xl border border-sacred-gold/60 bg-slate-950/80 px-3.5 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_28px_rgba(201,168,76,0.22)] backdrop-blur-xl">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause meditation music' : 'Play meditation music'}
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-sacred-gold bg-sacred-gold/20 text-sacred-gold-light transition hover:bg-sacred-gold/30 active:scale-95 ${playing ? '' : 'session-music-invite'}`}
        >
          {playing ? <Pause className="h-6 w-6" aria-hidden /> : <Play className="ml-0.5 h-7 w-7" aria-hidden />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base leading-snug text-white">Meditation music · So Many Forms (instrumental)</p>
          <p className="mt-0.5 text-xs tracking-wide text-sacred-gold-light">Start the music here.</p>
          <label className="mt-2 flex items-center gap-2">
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              aria-label="Volume"
              onChange={(event) => onVolume(Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer accent-sacred-gold"
            />
          </label>
        </div>
        <audio ref={audioRef} className="sr-only" src={TRACK_SRC} loop preload="none" />
      </div>
    </section>
  );
}
