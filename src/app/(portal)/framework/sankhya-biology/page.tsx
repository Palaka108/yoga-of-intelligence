'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Dna,
  BookOpenText,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import FrameworkPartCard from '@/components/framework/FrameworkPartCard';
import {
  FRAMEWORK_TITLE,
  FRAMEWORK_SUBTITLE,
  FRAMEWORK_INTRO,
  frameworkParts,
  FINAL_SYNTHESIS,
} from '@/lib/sankhya-biology-framework';

export default function SankhyaBiologyFrameworkPage() {
  const [expandAll, setExpandAll] = useState(false);
  const [showSynthesis, setShowSynthesis] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a0a0f] -z-10" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs transition-colors mb-8 font-body"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sacred-gold/5 border border-sacred-gold/10">
              <Dna size={12} className="text-sacred-gold/50" />
              <span className="text-[10px] text-sacred-gold/50 uppercase tracking-widest font-body">
                Analytical Framework
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10">
              <BookOpenText size={12} className="text-blue-400/50" />
              <span className="text-[10px] text-blue-400/50 uppercase tracking-widest font-body">
                Shabda-Backed
              </span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-light text-white/90 leading-tight mb-3">
            {FRAMEWORK_TITLE}
          </h1>

          <p className="text-sm text-sacred-gold/40 font-body leading-relaxed max-w-2xl">
            {FRAMEWORK_SUBTITLE}
          </p>

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-5 w-16 h-px bg-gradient-to-r from-sacred-gold/40 via-sacred-gold/20 to-transparent"
          />

          {/* Introduction */}
          <div className="mt-6 glass-portal-inner p-5">
            <p className="text-sm text-white/35 leading-relaxed font-body">
              {FRAMEWORK_INTRO}
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <span className="text-xs text-white/20 font-body">
            {frameworkParts.length} parts
          </span>
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="flex items-center gap-1.5 text-[10px] text-sacred-gold/40 hover:text-sacred-gold/60 transition-colors uppercase tracking-widest font-body"
          >
            {expandAll ? (
              <>
                <ChevronUp size={12} />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Expand All
              </>
            )}
          </button>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-sacred-gold/30 via-sacred-gold/10 to-transparent" />

          <div className="space-y-6" key={expandAll ? 'expanded' : 'collapsed'}>
            {frameworkParts.map((part, index) => (
              <FrameworkPartCard
                key={part.partNumber}
                part={part}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Final Synthesis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12"
        >
          <button
            onClick={() => setShowSynthesis(!showSynthesis)}
            className="w-full glass-portal-inner p-5 sm:p-6 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-sacred-gold/50" />
                <h2 className="font-display text-xl text-white/80">
                  {FINAL_SYNTHESIS.title}
                </h2>
              </div>
              {showSynthesis ? (
                <ChevronUp size={16} className="text-white/30" />
              ) : (
                <ChevronDown size={16} className="text-white/30" />
              )}
            </div>
          </button>

          {showSynthesis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-portal-inner p-5 sm:p-6 mt-2"
            >
              <p className="text-sm text-white/40 mb-4 leading-relaxed">
                {FINAL_SYNTHESIS.disclaimer}
              </p>

              <ul className="space-y-2 mb-6">
                {FINAL_SYNTHESIS.supportedPrinciples.map((principle, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-white/50"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-sacred-gold/40" />
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>

              {/* For a 15-year-old */}
              <div className="bg-sacred-gold/[0.03] border border-sacred-gold/[0.08] rounded-xl p-4 mb-5">
                <p className="text-[10px] text-sacred-gold/40 uppercase tracking-widest font-body mb-2">
                  For a 15-year-old
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  {FINAL_SYNTHESIS.forFifteenYearOld}
                </p>
              </div>

              {/* Next Steps */}
              <div>
                <p className="text-[10px] text-white/25 uppercase tracking-widest font-body mb-2">
                  Next Steps
                </p>
                <ul className="space-y-1.5">
                  {FINAL_SYNTHESIS.nextSteps.map((step, i) => (
                    <li
                      key={i}
                      className="text-sm text-white/30 flex items-start gap-2"
                    >
                      <span className="text-sacred-gold/30">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-16" />
      </div>
    </div>
  );
}
