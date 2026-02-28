'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/use-user';
import { useModuleProgress } from '@/hooks/use-module-progress';
import { createClient } from '@/lib/supabase-client';
import SequenceCard from '@/components/module/SequenceCard';

interface ModuleData {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  intro_video_url: string | null;
}

interface SequenceData {
  id: string;
  sequence_number: number;
  title: string;
  description: string | null;
  sequence_type: string;
  content_url: string | null;
  content_text: string | null;
  content_image_url: string | null;
  instructions: string | null;
  requires_upload: boolean;
  requires_instructor_response: boolean;
}

export default function ModulePage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const { user } = useUser();
  const { progress, loading: progressLoading, completeSequence, setAwaitingResponse } =
    useModuleProgress(moduleId, user?.id);
  const [module, setModule] = useState<ModuleData | null>(null);
  const [sequences, setSequences] = useState<SequenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSequence, setActiveSequence] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModule() {
      const supabase = createClient();

      const { data: rawModuleData } = await supabase
        .from('yoi_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      const { data: rawSeqData } = await supabase
        .from('yoi_module_sequences')
        .select('*')
        .eq('module_id', moduleId)
        .order('sequence_number');

      const moduleData = rawModuleData as unknown as ModuleData | null;
      const seqData = rawSeqData as unknown as SequenceData[] | null;

      if (moduleData) setModule(moduleData);
      if (seqData) setSequences(seqData);
      setLoading(false);
    }

    fetchModule();
  }, [moduleId]);

  if (loading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Module not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Module Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="text-xs text-sacred-gold/60 uppercase tracking-widest mb-2">
          Module Journey
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-light gold-text mb-3">
          {module.title}
        </h1>
        {module.subtitle && (
          <p className="font-display text-lg text-white/40">{module.subtitle}</p>
        )}
        {module.description && (
          <p className="mt-4 text-white/30 max-w-2xl leading-relaxed">
            {module.description}
          </p>
        )}
      </motion.div>

      {/* Sequence Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-sacred-gold/30 via-sacred-gold/10 to-transparent" />

        <div className="space-y-6">
          {sequences.map((sequence, index) => {
            const seqProgress = progress.find(
              (p) => p.sequenceId === sequence.id
            );
            const status = seqProgress?.status ?? (index === 0 ? 'unlocked' : 'locked');

            return (
              <SequenceCard
                key={sequence.id}
                sequence={sequence}
                index={index}
                status={status}
                isActive={activeSequence === sequence.id}
                onActivate={() => setActiveSequence(sequence.id)}
                onComplete={() => completeSequence(sequence.id)}
                onAwaitingResponse={() => setAwaitingResponse(sequence.id)}
                userId={user?.id}
                moduleId={moduleId}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
