'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Lock, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase-client';
import GoalsWidget from '@/components/dashboard/GoalsWidget';

/* ============================================
   Types
   ============================================ */
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

/* ============================================
   Sky Background — looping ambient video
   ============================================ */
function SkyBackground() {
  return (
    <div className="sky-bg-container" aria-hidden="true">
      {/*
        Sky video: Replace src with your compressed sky/cloud loop.
        Use a short (10-30s) MP4, under 5MB, with gentle cloud drift.
        Fallback: CSS gradient if video fails to load.
      */}
      <video
        className="sky-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster=""
      >
        {/* Replace with your actual sky video URL */}
        <source
          src="https://qwlbbcrjdpuxkavwyjyg.supabase.co/storage/v1/object/public/yoi-content/bg/sky-loop.mp4"
          type="video/mp4"
        />
      </video>

      {/* Fallback animated gradient if video doesn't load */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a0a0f]"
        style={{ zIndex: -1 }}
      />

      {/* Depth overlay — darkens edges, adds atmosphere */}
      <div className="sky-bg-overlay" />
    </div>
  );
}

/* ============================================
   Dashboard Page — Meditation Portal
   ============================================ */
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

  /* Loading state */
  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <SkyBackground />
        <div className="w-10 h-10 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Seeker';

  return (
    <>
      {/* Immersive sky background */}
      <SkyBackground />

      {/* Main content — scrollable, above background */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-6 sm:py-10">

        {/* ========== Glass Portal Panel ========== */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass-portal w-[90%] max-w-[600px] p-5 sm:p-8 flex flex-col items-center gap-6"
        >

          {/* ---- Vertical Video ---- */}
          <div className="video-portrait-container w-full">
            <video
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

            {/* Bottom gradient fade over video */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[rgba(10,15,30,0.7)] to-transparent pointer-events-none rounded-b-2xl" />
          </div>

          {/* ---- Welcome Text ---- */}
          <div className="text-center w-full">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="font-display text-3xl sm:text-4xl font-light text-white/90 leading-tight mb-3"
            >
              Welcome, {firstName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-white/40 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-body"
            >
              The journey through consciousness is not about reaching an ideal state,
              but recognizing what is already possible — and surrendering what is impossible
              for the individual to control.
            </motion.p>

            {/* Decorative divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-5 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-sacred-gold/40 to-transparent"
            />
          </div>

          {/* ---- Module Cards ---- */}
          <div className="w-full flex flex-col gap-3 mt-1">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.12, duration: 0.5 }}
              >
                <Link href={`/module/${module.id}`} className="block">
                  <div
                    className={`glass-portal-inner p-4 sm:p-5 flex flex-col gap-3 ${
                      module.currentStatus === 'completed' ? 'border-emerald-500/20' : ''
                    } ${module.currentStatus === 'awaiting' ? 'border-amber-500/20' : ''}`}
                  >
                    {/* Top row: module label + status icon */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-sacred-gold/50 uppercase tracking-[0.2em] font-body">
                        Module {module.module_order}
                      </span>

                      {module.currentStatus === 'completed' && (
                        <CheckCircle size={16} className="text-emerald-400/80" />
                      )}
                      {module.currentStatus === 'awaiting' && (
                        <Clock size={16} className="text-amber-400/80 animate-pulse-slow" />
                      )}
                      {module.currentStatus === 'not_started' && index > 0 && (
                        <Lock size={14} className="text-white/15" />
                      )}
                    </div>

                    {/* Title + subtitle */}
                    <div>
                      <h3 className="font-display text-lg sm:text-xl text-white/90 leading-snug">
                        {module.title}
                      </h3>
                      {module.subtitle && (
                        <p className="text-xs text-sacred-gold/40 mt-0.5">{module.subtitle}</p>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-white/25 mb-1.5 font-body">
                        <span>Progress</span>
                        <span>
                          {module.completedSequences}/{module.total_sequences}
                        </span>
                      </div>
                      <div className="h-[3px] rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-sacred-gold/80 to-sacred-gold-light/60"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(module.completedSequences / module.total_sequences) * 100}%`,
                          }}
                          transition={{ delay: 1.2 + index * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>

                    {/* CTA row */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5 text-sacred-gold text-xs sm:text-sm font-body">
                        <Play size={12} />
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
                      <ChevronRight size={14} className="text-white/15" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* ---- Goals Widget ---- */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="w-full"
            >
              <GoalsWidget userId={user.id} />
            </motion.div>
          )}

          {/* ---- Primary CTA (Begin Module 1) ---- */}
          {modules.length > 0 && modules[0].currentStatus !== 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="w-full mt-2"
            >
              <Link href={`/module/${modules[0].id}`} className="block">
                <button className="btn-sacred w-full text-sm sm:text-base py-3.5 rounded-2xl">
                  {modules[0].currentStatus === 'in_progress'
                    ? 'Continue Your Practice'
                    : modules[0].currentStatus === 'awaiting'
                    ? 'View Module 1'
                    : 'Begin Module 1'}
                </button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom breathing spacer */}
        <div className="h-12 sm:h-20" />
      </div>
    </>
  );
}
