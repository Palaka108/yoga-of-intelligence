'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Pause, Check, X } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase-client';
import { useUser } from '@/hooks/use-user';
import { useRecorderStore } from '@/stores/recorder-store';

type RecorderState = 'idle' | 'recording' | 'review';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return 'audio/webm';
}

export default function VoiceRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const { user } = useUser();
  const { highlightPulse, contextModuleId, contextSequenceId } =
    useRecorderStore();
  const supabase = createBrowserClient();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState('review');
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(250);
      setState('recording');
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      setError('Microphone access denied. Please allow mic permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;
    if (!audioElRef.current) {
      audioElRef.current = new Audio(audioUrl);
      audioElRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioElRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const discard = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setDuration(0);
    setState('idle');
  }, [audioUrl]);

  const save = useCallback(async () => {
    if (!audioBlob || !user) return;
    setIsSaving(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const ext = audioBlob.type.includes('webm') ? 'webm' : 'mp4';
      const path = `${user.id}/reflections/${timestamp}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('yoi-videos')
        .upload(path, audioBlob, {
          contentType: audioBlob.type,
          cacheControl: '3600',
        });

      if (uploadErr) throw uploadErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from('yoi-videos').getPublicUrl(path);

      const { error: insertErr } = await supabase
        .from('yoi_voice_reflections')
        .insert({
          user_id: user.id,
          module_id: contextModuleId,
          sequence_id: contextSequenceId,
          audio_url: publicUrl,
          duration_seconds: duration,
        } as any);

      if (insertErr) throw insertErr;

      discard();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save reflection');
    } finally {
      setIsSaving(false);
    }
  }, [
    audioBlob,
    user,
    duration,
    contextModuleId,
    contextSequenceId,
    supabase,
    discard,
  ]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Error message */}
      {error && (
        <div className="bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-lg max-w-[240px] backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Review panel */}
      {state === 'review' && (
        <div className="bg-sacred-deep/95 backdrop-blur-xl border border-glass-border rounded-2xl p-4 w-64 shadow-2xl animate-fade-in">
          <p className="text-white/60 text-xs mb-3 font-display">
            Voice Reflection — {formatDuration(duration)}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-sacred-gold/20 flex items-center justify-center text-sacred-gold hover:bg-sacred-gold/30 transition-colors"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <div className="flex-1 h-1 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-sacred-gold/50 w-full" />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={discard}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-white/50 hover:text-red-400 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={12} />
              Discard
            </button>
            <button
              onClick={save}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-sacred-gold bg-sacred-gold/10 hover:bg-sacred-gold/20 transition-colors disabled:opacity-50"
            >
              <Check size={12} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={state === 'idle' ? startRecording : state === 'recording' ? stopRecording : undefined}
        disabled={state === 'review'}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300
          ${
            state === 'recording'
              ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-500/30 animate-pulse'
              : state === 'review'
              ? 'bg-sacred-deep/80 opacity-50 cursor-default'
              : highlightPulse
              ? 'bg-sacred-gold/20 border-2 border-sacred-gold ring-4 ring-sacred-gold/30 scale-110'
              : 'bg-sacred-deep/80 backdrop-blur-xl border border-glass-border hover:border-sacred-gold/30 hover:bg-sacred-gold/10'
          }
        `}
      >
        {state === 'recording' ? (
          <div className="flex flex-col items-center">
            <Square size={16} className="text-white" />
            <span className="text-[9px] text-white/80 mt-0.5">
              {formatDuration(duration)}
            </span>
          </div>
        ) : (
          <Mic
            size={20}
            className={
              highlightPulse ? 'text-sacred-gold' : 'text-white/60'
            }
          />
        )}
      </button>
    </div>
  );
}
