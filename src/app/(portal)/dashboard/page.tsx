'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Lock, CheckCircle, Clock } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase-client';

interface Module {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  intro_video_url: string | null;
  module_order: number;
  total_sequences: number;
}

interface ModuleWithProgress extends Module {
  completedSequences: number;
  currentStatus: string;
}

export default function DashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const currentUser = user;

    async function fetchModules() {
      const supabase = createClient();

      const { data: rawModulesData } = await supabase
        .from('yoi_modules')
        .select('*')
        .eq('status', 'published')
        .order('module_order');

      const modulesData = rawModulesData as unknown as Module[] | null;

      if (modulesData) {
        const withProgress = await Promise.all(
          modulesData.map(async (mod) => {
            const { data: rawProgress } = await supabase
              .from('yoi_user_progress')
              .select('status')
              .eq('user_id', currentUser.id)
              .eq('module_id', mod.id);

            const progress = rawProgress as unknown as { status: string }[] | null;
            const completed = progress?.filter((p) => p.status === 'completed').length ?? 0;
            const awaiting = progress?.some((p) => p.status === 'awaiting_response');
            const currentStatus = awaiting
              ? 'awaiting'
              : completed === mod.total_sequences
              ? 'completed'
              : completed > 0
              ? 'in_progress'
              : 'not_started';

            return {
              ...mod,
              completedSequences: completed,
              currentStatus,
            } as ModuleWithProgress;
          })
        );

        setModules(withProgress);
      }
      setLoading(false);
    }

    fetchModules();
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section with Video */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        {/* Video in Glassmorphism Card */}
        <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl mb-8">
          <div className="aspect-video max-h-[420px] bg-sacred-black flex items-center justify-center">
            <video
              className="w-full h-full object-contain"
              controls
              playsInline
              preload="metadata"
            >
              <source
                src="https://qwlbbcrjdpuxkavwyjyg.supabase.co/storage/v1/object/public/yoi-content/intro/meditation-intro.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* Subtle gradient at bottom for blending */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-sacred-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Welcome & Profile */}
        <div className="flex items-start gap-6">
          {/* Avatar with glow */}
          <div className="shrink-0">
            {profile?.avatar_url ? (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-sacred-gold/20 blur-xl scale-150" />
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? ''}
                  className="relative w-20 h-20 rounded-full avatar-glow object-cover border-2 border-sacred-gold/30"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-sacred-indigo border-2 border-sacred-gold/30 flex items-center justify-center avatar-glow">
                <span className="text-2xl font-display text-sacred-gold">
                  {profile?.full_name?.[0] ?? '?'}
                </span>
              </div>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-white/90 mb-2">
              Welcome, {profile?.full_name?.split(' ')[0] ?? 'Seeker'}
            </h1>
            <p className="text-white/40 max-w-xl leading-relaxed">
              The journey through consciousness is not about reaching an ideal state,
              but recognizing what is already possible — and surrendering what is impossible
              for the individual to control. The witness observes all three.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Modules Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2 className="font-display text-2xl text-white/70 mb-8">Your Modules</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Link href={`/module/${module.id}`}>
                <div
                  className={`glass-panel-hover p-6 h-full flex flex-col ${
                    module.currentStatus === 'completed' ? 'sequence-completed' : ''
                  } ${module.currentStatus === 'awaiting' ? 'sequence-awaiting' : ''}`}
                >
                  {/* Module number */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-sacred-gold/60 uppercase tracking-widest">
                      Module {module.module_order}
                    </span>
                    {module.currentStatus === 'completed' && (
                      <CheckCircle size={18} className="text-emerald-400" />
                    )}
                    {module.currentStatus === 'awaiting' && (
                      <Clock size={18} className="text-amber-400" />
                    )}
                    {module.currentStatus === 'not_started' && index > 0 && (
                      <Lock size={18} className="text-white/20" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl text-white/90 mb-1">
                    {module.title}
                  </h3>
                  {module.subtitle && (
                    <p className="text-sm text-sacred-gold/60 mb-3">{module.subtitle}</p>
                  )}

                  {/* Description */}
                  <p className="text-sm text-white/40 mb-6 flex-1 line-clamp-3">
                    {module.description}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs text-white/30 mb-2">
                      <span>Progress</span>
                      <span>
                        {module.completedSequences}/{module.total_sequences}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-glass-white overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-gold"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(module.completedSequences / module.total_sequences) * 100}%`,
                        }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 flex items-center gap-2 text-sacred-gold text-sm">
                    <Play size={14} />
                    <span>
                      {module.currentStatus === 'completed'
                        ? 'Review'
                        : module.currentStatus === 'awaiting'
                        ? 'Awaiting Response'
                        : module.currentStatus === 'in_progress'
                        ? 'Continue'
                        : 'Begin'}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
