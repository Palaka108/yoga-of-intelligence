'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Microscope,
  BookOpenText,
  Lightbulb,
  Quote,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { FrameworkPart } from '@/lib/sankhya-biology-framework';
import ShabdaReference from './ShabdaReference';

interface FrameworkPartCardProps {
  part: FrameworkPart;
  index: number;
}

export default function FrameworkPartCard({ part, index }: FrameworkPartCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index, duration: 0.5 }}
      className="relative"
    >
      {/* Timeline connector dot */}
      <div className="absolute left-6 top-0 w-3 h-3 rounded-full bg-sacred-gold/30 border border-sacred-gold/50 -translate-x-1/2 z-10" />

      <div className="ml-12">
        {/* Card */}
        <div className="glass-portal-inner p-5 sm:p-6">
          {/* Part number + title */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <span className="text-[10px] text-sacred-gold/40 uppercase tracking-[0.2em] font-body">
                Part {part.partNumber}
              </span>
              <h3 className="font-display text-lg sm:text-xl text-white/90 leading-snug mt-1">
                {part.title}
              </h3>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white/60"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Transcript anchor — always visible */}
          <div className="mt-4 flex items-start gap-2.5">
            <Quote size={14} className="text-sacred-gold/40 shrink-0 mt-0.5" />
            <p className="text-sm text-white/50 italic leading-relaxed">
              {part.transcriptAnchor}
            </p>
          </div>

          {/* Scientific point — always visible */}
          <div className="mt-3 flex items-start gap-2.5">
            <Microscope size={14} className="text-blue-400/40 shrink-0 mt-0.5" />
            <p className="text-sm text-white/40 leading-relaxed">
              {part.scientificPoint}
            </p>
          </div>

          {/* Expanded content */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Simple Breakdown */}
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={13} className="text-amber-400/50" />
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-body">
                    Simple Breakdown
                  </span>
                </div>
                <ul className="space-y-1.5 ml-5">
                  {part.simpleBreakdown.map((point, i) => (
                    <li key={i} className="text-sm text-white/35 leading-relaxed flex items-start gap-2">
                      <ArrowDownRight size={11} className="text-sacred-gold/20 shrink-0 mt-1" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Biological example */}
              {part.biologicalExample && (
                <div className="mt-4 bg-blue-500/[0.03] border border-blue-500/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Microscope size={13} className="text-blue-400/50" />
                    <span className="text-[10px] text-blue-300/40 uppercase tracking-widest font-body">
                      Biological Example
                    </span>
                  </div>
                  <p className="text-sm text-white/35 leading-relaxed">
                    {part.biologicalExample}
                  </p>
                </div>
              )}

              {/* Sankhya Parallel */}
              <div className="mt-4 bg-sacred-gold/[0.02] border border-sacred-gold/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpenText size={13} className="text-sacred-gold/50" />
                  <span className="text-[10px] text-sacred-gold/40 uppercase tracking-widest font-body">
                    Sankhya Parallel
                  </span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  {part.sankhyaParallel}
                </p>
                {part.gitaReference && (
                  <p className="text-xs text-sacred-gold/30 mt-2 italic">
                    {part.gitaReference}
                  </p>
                )}
              </div>

              {/* Scientific Convergence */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight size={13} className="text-emerald-400/40" />
                  <span className="text-[10px] text-emerald-300/30 uppercase tracking-widest font-body">
                    Scientific Convergence
                  </span>
                </div>
                <p className="text-sm text-white/35 leading-relaxed">
                  {part.scientificConvergence}
                </p>
              </div>

              {/* Shabda Hub References */}
              <ShabdaReference
                queries={part.shabdaQueries}
                partNumber={part.partNumber}
              />
            </motion.div>
          )}

          {/* Expand hint when collapsed */}
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-3 text-[10px] text-sacred-gold/30 hover:text-sacred-gold/50 transition-colors uppercase tracking-widest font-body"
            >
              Expand full analysis
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
