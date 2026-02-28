'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useAudioStore } from '@/stores/audio-store';

const SacredGeometryScene = dynamic(
  () => import('@/components/geometry/SacredGeometryScene'),
  { ssr: false }
);

export default function SplashPage() {
  const [entered, setEntered] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();
  const { initAudio, togglePlay, setInteracted } = useAudioStore();

  const handleEnter = useCallback(() => {
    setInteracted();
    // Initialize background audio (Gita 3.27 song)
    initAudio('/audio/gita-3-27.mp3');
    togglePlay();
    setEntered(true);
    setTimeout(() => setShowAuth(true), 1200);
  }, [initAudio, togglePlay, setInteracted]);

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-sacred-black">
      {/* Sacred Geometry Background */}
      <SacredGeometryScene />

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-radial from-transparent via-sacred-black/30 to-sacred-black/80" />

      {/* Ambient glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] w-[600px] h-[600px] rounded-full bg-sacred-gold/5 blur-[120px]" />
      <div className="absolute top-1/3 left-1/3 z-[1] w-[300px] h-[300px] rounded-full bg-sacred-violet/5 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <AnimatePresence mode="wait">
          {!entered ? (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center"
            >
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="font-display text-5xl md:text-7xl lg:text-8xl font-light tracking-wide gold-text mb-4"
              >
                Yoga of Intelligence
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="font-display text-xl md:text-2xl text-white/50 tracking-[0.3em] uppercase mb-16"
              >
                Know the Knower
              </motion.p>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="w-32 h-px bg-gradient-to-r from-transparent via-sacred-gold/50 to-transparent mb-16"
              />

              {/* Enter button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                onClick={handleEnter}
                className="group relative px-12 py-4 rounded-full border border-sacred-gold/30
                           bg-sacred-gold/5 backdrop-blur-md
                           transition-all duration-500
                           hover:border-sacred-gold/60 hover:bg-sacred-gold/10
                           hover:shadow-[0_0_40px_rgba(201,168,76,0.2)]"
              >
                <span className="font-display text-lg tracking-[0.2em] uppercase text-sacred-gold group-hover:text-sacred-gold-light transition-colors">
                  Enter
                </span>
              </motion.button>

              {/* Subtle instruction */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="mt-8 text-xs text-white/20 tracking-widest uppercase"
              >
                Click to begin your journey
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="auth-gateway"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center"
            >
              {/* Post-enter title */}
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-display text-4xl md:text-5xl font-light gold-text mb-6"
              >
                Welcome, Seeker
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="font-display text-lg text-white/40 max-w-md mb-12 leading-relaxed"
              >
                The witness awaits. Begin your integration through pranayama,
                reflection, and guided wisdom.
              </motion.p>

              {showAuth && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col gap-4 w-full max-w-xs"
                >
                  <button onClick={handleSignIn} className="btn-sacred text-base">
                    Sign In
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="btn-glass text-base"
                  >
                    Create Account
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-[2] bg-gradient-to-t from-sacred-black to-transparent" />
    </div>
  );
}
