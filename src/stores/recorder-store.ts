import { create } from 'zustand';

interface RecorderState {
  contextModuleId: string | null;
  contextSequenceId: string | null;
  highlightPulse: boolean;
  setContext: (moduleId: string | null, sequenceId: string | null) => void;
  triggerPulse: () => void;
}

export const useRecorderStore = create<RecorderState>((set) => ({
  contextModuleId: null,
  contextSequenceId: null,
  highlightPulse: false,

  setContext: (moduleId, sequenceId) =>
    set({ contextModuleId: moduleId, contextSequenceId: sequenceId }),

  triggerPulse: () => {
    set({ highlightPulse: true });
    setTimeout(() => set({ highlightPulse: false }), 3000);
  },
}));
