import { create } from 'zustand';

interface AudioState {
  isPlaying: boolean;
  isMuted: boolean;
  hasInteracted: boolean;
  volume: number;
  audioElement: HTMLAudioElement | null;
  currentSrc: string | null;
  setPlaying: (playing: boolean) => void;
  setInteracted: () => void;
  setVolume: (volume: number) => void;
  initAudio: (src: string) => void;
  ensureAudio: (src: string) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  fadeOut: (durationMs?: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  isMuted: false,
  hasInteracted: false,
  volume: 0.4,
  audioElement: null,
  currentSrc: null,

  setPlaying: (playing) => set({ isPlaying: playing }),
  setInteracted: () => set({ hasInteracted: true }),
  setVolume: (volume) => {
    const el = get().audioElement;
    if (el && !get().isMuted) el.volume = volume;
    set({ volume });
  },

  initAudio: (src: string) => {
    const existing = get().audioElement;
    if (existing) {
      existing.pause();
      existing.src = '';
    }
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = get().isMuted ? 0 : get().volume;
    set({ audioElement: audio, currentSrc: src });
  },

  // Idempotent init — only creates a new element if src changed
  ensureAudio: (src: string) => {
    const { audioElement, currentSrc } = get();
    if (audioElement && currentSrc === src) return;
    get().initAudio(src);
  },

  togglePlay: () => {
    const { audioElement, isPlaying } = get();
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
      set({ isPlaying: false });
    } else {
      audioElement.play().then(() => set({ isPlaying: true })).catch(() => {});
    }
  },

  toggleMute: () => {
    const { audioElement, isMuted, volume } = get();
    if (!audioElement) return;
    if (isMuted) {
      audioElement.volume = volume;
      set({ isMuted: false });
    } else {
      audioElement.volume = 0;
      set({ isMuted: true });
    }
  },

  fadeOut: (durationMs = 2000) => {
    const { audioElement } = get();
    if (!audioElement) return;
    const startVol = audioElement.volume;
    const steps = 20;
    const stepTime = durationMs / steps;
    const stepVol = startVol / steps;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      audioElement.volume = Math.max(0, startVol - stepVol * current);
      if (current >= steps) {
        clearInterval(interval);
        audioElement.pause();
        audioElement.volume = startVol;
        set({ isPlaying: false });
      }
    }, stepTime);
  },
}));
