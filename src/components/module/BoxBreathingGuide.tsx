'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PHASE_DURATION = 4; // seconds per phase
const PHASES: { key: Phase; label: string; instruction: string }[] = [
  { key: 'inhale', label: 'Inhale', instruction: 'Breathe in slowly' },
  { key: 'hold-in', label: 'Hold', instruction: 'Gently hold' },
  { key: 'exhale', label: 'Exhale', instruction: 'Release slowly' },
  { key: 'hold-out', label: 'Hold', instruction: 'Rest in stillness' },
];

const phaseColors: Record<Phase, string> = {
  'inhale': 'from-blue-400/30 to-cyan-400/20',
  'hold-in': 'from-purple-400/30 to-indigo-400/20',
  'exhale': 'from-teal-400/30 to-emerald-400/20',
  'hold-out': 'from-slate-400/20 to-gray-400/10',
};

const phaseGlow: Record<Phase, string> = {
  'inhale': 'shadow-[0_0_40px_rgba(96,165,250,0.25)]',
  'hold-in': 'shadow-[0_0_40px_rgba(167,139,250,0.25)]',
  'exhale': 'shadow-[0_0_40px_rgba(45,212,191,0.25)]',
  'hold-out': 'shadow-[0_0_30px_rgba(148,163,184,0.1)]',
};

const phaseScale: Record<Phase, number> = {
  'inhale': 1,
  'hold-in': 1,
  'exhale': 0.55,
  'hold-out': 0.55,
};

export default function BoxBreathingGuide() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(PHASE_DURATION);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentPhase = PHASES[phaseIndex];

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startBreathing = useCallback(() => {
    setIsActive(true);
    setCountdown(PHASE_DURATION);
  }, []);

  const pauseBreathing = useCallback(() => {
    setIsActive(false);
    clearTimer();
  }, [clearTimer]);

  const resetBreathing = useCallback(() => {
    setIsActive(false);
    clearTimer();
    setPhaseIndex(0);
    setCountdown(PHASE_DURATION);
    setCycleCount(0);
  }, [clearTimer]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPhaseIndex((prevPhase) => {
            const next = (prevPhase + 1) % PHASES.length;
            if (next === 0) setCycleCount((c) => c + 1);
            return next;
          });
          return PHASE_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimer();
  }, [isActive, clearTimer]);

  const phaseProgress = 1 - (countdown - 1) / (PHASE_DURATION - 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 h-full flex flex-col justify-between">
      {/* Header — compact */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-white/70 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sacred-gold">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Box Breathing
        </h4>
        {cycleCount > 0 && (
          <span className="text-[10px] text-sacred-gold/60">
            {cycleCount} cycle{cycleCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Breathing Circle — compact */}
      <div className="flex flex-col items-center flex-1 justify-center py-3">
        <div className="relative w-28 h-28 flex items-center justify-center mb-3">
          {/* Outer ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <motion.circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="rgba(201,168,76,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              animate={{
                strokeDashoffset: isActive
                  ? 2 * Math.PI * 46 * (1 - phaseProgress)
                  : 2 * Math.PI * 46,
              }}
              transition={{ duration: 0.3 }}
            />
          </svg>

          {/* Breathing orb */}
          <motion.div
            className={`rounded-full bg-gradient-to-br ${phaseColors[currentPhase.key]} border border-white/10 ${phaseGlow[currentPhase.key]} flex items-center justify-center`}
            animate={{
              width: `${phaseScale[currentPhase.key] * 90}px`,
              height: `${phaseScale[currentPhase.key] * 90}px`,
            }}
            transition={{
              duration: PHASE_DURATION,
              ease: currentPhase.key === 'hold-in' || currentPhase.key === 'hold-out'
                ? 'linear' : 'easeInOut',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={countdown}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.15 }}
                className="font-display text-2xl text-white/80 font-light"
              >
                {isActive ? countdown : ''}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Phase Label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase.key}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-center mb-3"
          >
            <p className="font-display text-base text-white/80">
              {isActive ? currentPhase.label : 'Ready'}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">
              {isActive ? currentPhase.instruction : 'Breathe with the guide'}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Phase dots */}
        <div className="flex gap-1.5 mb-3">
          {PHASES.map((phase, i) => (
            <div
              key={phase.key}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === phaseIndex && isActive
                  ? 'bg-sacred-gold scale-125'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls — compact */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={isActive ? pauseBreathing : startBreathing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-sacred-gold/30
                     bg-sacred-gold/5 text-sacred-gold text-xs
                     hover:bg-sacred-gold/10 hover:border-sacred-gold/50
                     transition-all duration-300"
        >
          {isActive ? <><Pause size={12} /> Pause</> : <><Play size={12} /> {cycleCount > 0 ? 'Resume' : 'Begin'}</>}
        </button>

        {(isActive || cycleCount > 0) && (
          <button
            onClick={resetBreathing}
            className="p-2 rounded-full border border-white/10 text-white/30
                       hover:text-white/50 hover:border-white/20 transition-all duration-300"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
