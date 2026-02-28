import { create } from 'zustand';

interface AudioState {
  isPlaying: boolean;
  hasInteracted: boolean;
  volume: number;
  audioElement: HTMLAudioElement | null;
  setPlaying: (playing: boolean) => void;
  setInteracted: () => void;
  setVolume: (volume: number) => void;
  initAudio: (src: string) => void;
  togglePlay: () => void;
  fadeOut: (durationMs?: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  hasInteracted: false,
  volume: 0.3,
  audioElement: null,

  setPlaying: (playing) => set({ isPlaying: playing }),
  setInteracted: () => set({ hasInteracted: true }),
  setVolume: (volume) => {
    const el = get().audioElement;
    if (el) el.volume = volume;
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
    audio.volume = get().volume;
    set({ audioElement: audio });
  },

  togglePlay: () => {
    const { audioElement, isPlaying } = get();
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
      set({ isPlaying: false });
    } else {
      audioElement.play().then(() => set({ isPlaying: true }));
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
