'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Lock,
  CheckCircle,
  Clock,
  ChevronDown,
  Upload,
  Music,
  Image as ImageIcon,
  Video,
  Heart,
  Activity,
  MessageCircle,
} from 'lucide-react';
import type { SequenceStatus } from '@/types/database';
import VideoUploader from './VideoUploader';
import InstructorResponseView from './InstructorResponseView';

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

interface SequenceCardProps {
  sequence: SequenceData;
  index: number;
  status: SequenceStatus;
  isActive: boolean;
  onActivate: () => void;
  onComplete: () => void;
  onAwaitingResponse: () => void;
  userId: string | undefined;
  moduleId: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  intro_video: <Video size={16} />,
  gift_song: <Music size={16} />,
  canva_reflection: <ImageIcon size={16} />,
  video_upload: <Upload size={16} />,
  instructor_response: <MessageCircle size={16} />,
  movement_integration: <Activity size={16} />,
  love_integration: <Heart size={16} />,
};

const statusStyles: Record<SequenceStatus, string> = {
  locked: 'opacity-40 cursor-not-allowed',
  unlocked: 'cursor-pointer hover:border-sacred-gold/30',
  completed: 'border-emerald-500/20 bg-emerald-500/5',
  awaiting_response: 'border-amber-500/20 bg-amber-500/5',
};

export default function SequenceCard({
  sequence,
  index,
  status,
  isActive,
  onActivate,
  onComplete,
  onAwaitingResponse,
  userId,
  moduleId,
}: SequenceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (status === 'locked') return;
    onActivate();
    setExpanded(!expanded);
  };

  const handleComplete = () => {
    if (sequence.requires_upload) return; // Upload flow handles this
    onComplete();
  };

  const statusIcon = {
    locked: <Lock size={16} className="text-white/20" />,
    unlocked: <Play size={16} className="text-sacred-gold" />,
    completed: <CheckCircle size={16} className="text-emerald-400" />,
    awaiting_response: <Clock size={16} className="text-amber-400" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative pl-16"
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-4 top-6 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${
          status === 'completed'
            ? 'border-emerald-400 bg-emerald-400/20'
            : status === 'awaiting_response'
            ? 'border-amber-400 bg-amber-400/20'
            : status === 'unlocked'
            ? 'border-sacred-gold bg-sacred-gold/20'
            : 'border-white/20 bg-sacred-deep'
        }`}
      >
        {status === 'completed' && (
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        )}
        {status === 'unlocked' && (
          <div className="w-2 h-2 rounded-full bg-sacred-gold animate-pulse" />
        )}
      </div>

      {/* Card */}
      <div
        onClick={handleClick}
        className={`glass-panel border transition-all duration-300 ${statusStyles[status]} ${
          isActive && status !== 'locked' ? 'ring-1 ring-sacred-gold/20 sacred-glow' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-glass-white-10">
              {typeIcons[sequence.sequence_type] ?? <Play size={16} />}
            </div>
            <div>
              <h3 className="font-medium text-white/90 text-sm">
                {sequence.title}
              </h3>
              {sequence.description && (
                <p className="text-xs text-white/40 mt-0.5">
                  {sequence.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {statusIcon[status]}
            {status !== 'locked' && (
              <ChevronDown
                size={16}
                className={`text-white/30 transition-transform duration-200 ${
                  expanded ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && status !== 'locked' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-glass-border pt-4">
                {/* Instructions */}
                {sequence.instructions && (
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    {sequence.instructions}
                  </p>
                )}

                {/* Content: Video */}
                {sequence.content_url && sequence.sequence_type.includes('video') && (
                  <div className="rounded-xl overflow-hidden mb-4 aspect-video bg-sacred-deep">
                    <video
                      src={sequence.content_url}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content: Audio */}
                {sequence.content_url && sequence.sequence_type === 'gift_song' && (
                  <div className="mb-4">
                    <audio
                      src={sequence.content_url}
                      controls
                      className="w-full"
                    />
                  </div>
                )}

                {/* Content: Image */}
                {sequence.content_image_url && (
                  <div className="rounded-xl overflow-hidden mb-4">
                    <img
                      src={sequence.content_image_url}
                      alt={sequence.title}
                      className="w-full object-contain max-h-96"
                    />
                  </div>
                )}

                {/* Content: Text */}
                {sequence.content_text && (
                  <div className="glass-panel p-4 mb-4 text-sm text-white/60 leading-relaxed">
                    {sequence.content_text}
                  </div>
                )}

                {/* Video Upload Component */}
                {sequence.requires_upload && status === 'unlocked' && userId && (
                  <VideoUploader
                    userId={userId}
                    moduleId={moduleId}
                    sequenceId={sequence.id}
                    minSeconds={60}
                    maxSeconds={120}
                    onUploaded={onAwaitingResponse}
                  />
                )}

                {/* Instructor Response View */}
                {sequence.sequence_type === 'instructor_response' && userId && (
                  <InstructorResponseView
                    userId={userId}
                    moduleId={moduleId}
                    sequenceId={sequence.id}
                  />
                )}

                {/* Awaiting indicator */}
                {status === 'awaiting_response' && (
                  <div className="flex items-center gap-2 text-amber-400/80 text-sm py-2">
                    <Clock size={14} className="animate-pulse" />
                    <span>Awaiting instructor response — you will be notified</span>
                  </div>
                )}

                {/* Complete button */}
                {status === 'unlocked' && !sequence.requires_upload && (
                  <button onClick={handleComplete} className="btn-sacred mt-2 w-full">
                    <CheckCircle size={16} />
                    I have completed this step
                  </button>
                )}

                {/* Completed state */}
                {status === 'completed' && (
                  <div className="flex items-center gap-2 text-emerald-400/80 text-sm">
                    <CheckCircle size={14} />
                    <span>Completed</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
