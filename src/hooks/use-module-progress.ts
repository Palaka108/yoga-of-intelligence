'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useProgressStore } from '@/stores/progress-store';
import type { SequenceStatus } from '@/types/database';

export function useModuleProgress(moduleId: string, userId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const { setModuleProgress, moduleProgress } = useProgressStore();

  const fetchProgress = useCallback(async () => {
    if (!userId || !moduleId) return;
    const supabase = createClient();

    // Get all sequences for this module
    const { data: rawSequences } = await supabase
      .from('yoi_module_sequences')
      .select('id, sequence_number')
      .eq('module_id', moduleId)
      .order('sequence_number');

    // Get user progress for this module
    const { data: rawProgress } = await supabase
      .from('yoi_user_progress')
      .select('sequence_id, status')
      .eq('user_id', userId)
      .eq('module_id', moduleId);

    const sequences = rawSequences as unknown as { id: string; sequence_number: number }[] | null;
    const progress = rawProgress as unknown as { sequence_id: string; status: string }[] | null;

    if (sequences) {
      const progressMap = new Map(
        progress?.map((p) => [p.sequence_id, p.status as SequenceStatus]) ?? []
      );

      const fullProgress = sequences.map((seq, index) => {
        const existingStatus = progressMap.get(seq.id);
        let status: SequenceStatus = 'locked';

        if (existingStatus) {
          status = existingStatus;
        } else if (index === 0 && !existingStatus) {
          status = 'unlocked';
        }

        return {
          sequenceId: seq.id,
          status,
        };
      });

      setModuleProgress(moduleId, fullProgress);
    }

    setLoading(false);
  }, [moduleId, userId, setModuleProgress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const completeSequence = useCallback(
    async (sequenceId: string) => {
      if (!userId) return;
      const supabase = createClient();

      // Upsert progress as completed
      await (supabase.from('yoi_user_progress') as any).upsert(
        {
          user_id: userId,
          module_id: moduleId,
          sequence_id: sequenceId,
          status: 'completed' as SequenceStatus,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,module_id,sequence_id' }
      );

      // Unlock next sequence
      const currentProgress = moduleProgress[moduleId];
      if (currentProgress) {
        const currentIndex = currentProgress.findIndex(
          (p) => p.sequenceId === sequenceId
        );
        if (currentIndex < currentProgress.length - 1) {
          const nextSeq = currentProgress[currentIndex + 1];
          await (supabase.from('yoi_user_progress') as any).upsert(
            {
              user_id: userId,
              module_id: moduleId,
              sequence_id: nextSeq.sequenceId,
              status: 'unlocked' as SequenceStatus,
            },
            { onConflict: 'user_id,module_id,sequence_id' }
          );
        }
      }

      await fetchProgress();
    },
    [userId, moduleId, moduleProgress, fetchProgress]
  );

  const setAwaitingResponse = useCallback(
    async (sequenceId: string) => {
      if (!userId) return;
      const supabase = createClient();

      await (supabase.from('yoi_user_progress') as any).upsert(
        {
          user_id: userId,
          module_id: moduleId,
          sequence_id: sequenceId,
          status: 'awaiting_response' as SequenceStatus,
        },
        { onConflict: 'user_id,module_id,sequence_id' }
      );

      await fetchProgress();
    },
    [userId, moduleId, fetchProgress]
  );

  return {
    progress: moduleProgress[moduleId] ?? [],
    loading,
    completeSequence,
    setAwaitingResponse,
    refreshProgress: fetchProgress,
  };
}
