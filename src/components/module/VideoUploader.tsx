'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Video, StopCircle, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase-client';
import { formatDuration } from '@/lib/utils';

interface VideoUploaderProps {
  userId: string;
  moduleId: string;
  sequenceId: string;
  minSeconds: number;
  maxSeconds: number;
  onUploaded: () => void;
}

export default function VideoUploader({
  userId,
  moduleId,
  sequenceId,
  minSeconds,
  maxSeconds,
  onUploaded,
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleUploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      // Validate duration via video element
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          if (video.duration < minSeconds) {
            setError(`Video must be at least ${formatDuration(minSeconds)}`);
            setUploading(false);
          } else if (video.duration > maxSeconds) {
            setError(`Video must be under ${formatDuration(maxSeconds)}`);
            setUploading(false);
          }
          resolve();
        };
      });

      if (error) return;

      const supabase = createClient();
      const filePath = `${userId}/${moduleId}/${sequenceId}/${Date.now()}.webm`;

      const { error: uploadError } = await supabase.storage
        .from('yoi-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('yoi-videos').getPublicUrl(filePath);

      // Create submission record
      await (supabase.from('yoi_video_submissions') as any).insert({
        user_id: userId,
        module_id: moduleId,
        sequence_id: sequenceId,
        video_url: publicUrl,
        duration_seconds: Math.round(video.duration),
      });

      setUploading(false);
      setProgress(100);
      onUploaded();
    },
    [userId, moduleId, sequenceId, minSeconds, maxSeconds, error, onUploaded]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) handleUploadFile(file);
    },
    [handleUploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.mov'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(1000);
      setRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((d) => {
          const next = d + 1;
          if (next >= maxSeconds) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const submitRecording = () => {
    if (!recordedBlob) return;
    if (recordDuration < minSeconds) {
      setError(`Recording must be at least ${formatDuration(minSeconds)}`);
      return;
    }
    const file = new File([recordedBlob], 'reflection.webm', {
      type: 'video/webm',
    });
    handleUploadFile(file);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/30 uppercase tracking-widest">
        Video Reflection ({formatDuration(minSeconds)} – {formatDuration(maxSeconds)})
      </p>

      {!recording && !recordedBlob && (
        <>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-sacred-gold/50 bg-sacred-gold/5'
                : 'border-glass-border hover:border-sacred-gold/30'
            }`}
          >
            <input {...getInputProps()} />
            <Upload size={32} className="mx-auto text-white/20 mb-3" />
            <p className="text-sm text-white/40">
              {isDragActive
                ? 'Drop your video here'
                : 'Drag & drop a video, or click to select'}
            </p>
            <p className="text-xs text-white/20 mt-1">MP4, WebM, MOV — Max 100MB</p>
          </div>

          {/* Or record */}
          <div className="text-center">
            <p className="text-xs text-white/20 mb-2">or</p>
            <button onClick={startRecording} className="btn-glass text-sm">
              <Video size={14} />
              Record with Camera
            </button>
          </div>
        </>
      )}

      {/* Recording indicator */}
      {recording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm font-medium">Recording</span>
          </div>
          <p className="text-3xl font-mono text-white/80 mb-4">
            {formatDuration(recordDuration)}
          </p>
          <button onClick={stopRecording} className="btn-sacred">
            <StopCircle size={16} />
            Stop Recording
          </button>
        </motion.div>
      )}

      {/* Review recording */}
      {recordedBlob && !recording && (
        <div className="space-y-3">
          <video
            src={URL.createObjectURL(recordedBlob)}
            controls
            className="rounded-xl w-full aspect-video bg-sacred-deep"
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setRecordedBlob(null);
                setRecordDuration(0);
              }}
              className="btn-glass flex-1 text-sm"
            >
              Re-record
            </button>
            <button onClick={submitRecording} className="btn-sacred flex-1 text-sm">
              Submit Reflection
            </button>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="h-1 rounded-full bg-glass-white overflow-hidden">
            <motion.div
              className="h-full bg-sacred-gold"
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/30 text-center">Uploading...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400/80 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
