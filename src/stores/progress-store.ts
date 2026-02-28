import { create } from 'zustand';
import type { SequenceStatus } from '@/types/database';

interface SequenceProgress {
  sequenceId: string;
  status: SequenceStatus;
}

interface ProgressState {
  moduleProgress: Record<string, SequenceProgress[]>;
  currentModuleId: string | null;
  currentSequenceId: string | null;
  setModuleProgress: (moduleId: string, progress: SequenceProgress[]) => void;
  setCurrentModule: (moduleId: string) => void;
  setCurrentSequence: (sequenceId: string) => void;
  getSequenceStatus: (moduleId: string, sequenceId: string) => SequenceStatus;
  canAccessSequence: (moduleId: string, sequenceIndex: number) => boolean;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  moduleProgress: {},
  currentModuleId: null,
  currentSequenceId: null,

  setModuleProgress: (moduleId, progress) =>
    set((state) => ({
      moduleProgress: { ...state.moduleProgress, [moduleId]: progress },
    })),

  setCurrentModule: (moduleId) => set({ currentModuleId: moduleId }),
  setCurrentSequence: (sequenceId) => set({ currentSequenceId: sequenceId }),

  getSequenceStatus: (moduleId, sequenceId) => {
    const progress = get().moduleProgress[moduleId];
    if (!progress) return 'locked';
    const seq = progress.find((p) => p.sequenceId === sequenceId);
    return seq?.status ?? 'locked';
  },

  canAccessSequence: (moduleId, sequenceIndex) => {
    const progress = get().moduleProgress[moduleId];
    if (!progress) return sequenceIndex === 0;
    if (sequenceIndex === 0) return true;
    const prevSeq = progress[sequenceIndex - 1];
    return prevSeq?.status === 'completed';
  },
}));
