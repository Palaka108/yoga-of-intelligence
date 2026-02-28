'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase-client';
import { useUser } from '@/hooks/use-user';

interface Submission {
  id: string;
  video_url: string;
  duration_seconds: number | null;
  status: string;
  submitted_at: string;
  module_id: string;
  sequence_id: string;
}

interface StudentInfo {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentUserId = params.userId as string;
  const submissionId = searchParams.get('submission');
  const { profile } = useUser();

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [responseVideoFile, setResponseVideoFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [meditationUrl, setMeditationUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: studentData } = await supabase
        .from('yoi_users')
        .select('full_name, email, avatar_url')
        .eq('id', studentUserId)
        .single();

      if (studentData) setStudent(studentData as unknown as StudentInfo);

      if (submissionId) {
        const { data: subData } = await supabase
          .from('yoi_video_submissions')
          .select('*')
          .eq('id', submissionId)
          .single();

        if (subData) setSubmission(subData as unknown as Submission);
      }
    }

    fetchData();
  }, [studentUserId, submissionId]);

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setResponseVideoFile(files[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.mov'] },
    maxFiles: 1,
    maxSize: 200 * 1024 * 1024,
  });

  const handleSubmitResponse = async () => {
    if (!responseVideoFile || !submission || !profile) return;
    setUploading(true);

    const supabase = createClient();

    // Upload response video
    const filePath = `instructor/${studentUserId}/${submission.module_id}/${submission.sequence_id}/${Date.now()}.webm`;

    const { error: uploadError } = await supabase.storage
      .from('yoi-videos')
      .upload(filePath, responseVideoFile);

    if (uploadError) {
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('yoi-videos').getPublicUrl(filePath);

    // Call the admin unlock function
    const { error } = await (supabase as any).rpc('yoi_admin_unlock_sequence', {
      p_user_id: studentUserId,
      p_module_id: submission.module_id,
      p_sequence_id: submission.sequence_id,
      p_submission_id: submission.id,
      p_response_video_url: publicUrl,
      p_message: message || null,
      p_next_meditation_url: meditationUrl || null,
    });

    if (!error) {
      setSuccess(true);
    }

    setUploading(false);
  };

  if (!student || !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      {/* Student Info */}
      <div className="flex items-center gap-4 mb-8">
        {student.avatar_url ? (
          <img
            src={student.avatar_url}
            alt=""
            className="w-14 h-14 rounded-full avatar-glow object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-sacred-indigo flex items-center justify-center text-xl text-sacred-gold">
            {student.full_name?.[0]}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl text-white/90">{student.full_name}</h1>
          <p className="text-sm text-white/40">{student.email}</p>
        </div>
      </div>

      {/* Student's Video Submission */}
      <div className="glass-panel p-6 mb-8">
        <h2 className="text-sm text-sacred-gold/60 uppercase tracking-widest mb-4">
          Student Submission
        </h2>
        <div className="rounded-xl overflow-hidden aspect-video bg-sacred-deep mb-3">
          <video
            src={submission.video_url}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-xs text-white/30">
          Submitted {new Date(submission.submitted_at).toLocaleString()} —{' '}
          {submission.duration_seconds}s
        </p>
      </div>

      {/* Response Form */}
      {!success ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 space-y-6"
        >
          <h2 className="text-sm text-sacred-gold/60 uppercase tracking-widest">
            Your Response
          </h2>

          {/* Response video upload */}
          <div>
            <label className="block text-xs text-white/40 mb-2">
              Response Video *
            </label>
            {responseVideoFile ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle size={14} />
                  <span>{responseVideoFile.name}</span>
                </div>
                <button
                  onClick={() => setResponseVideoFile(null)}
                  className="text-xs text-white/30 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-glass-border rounded-xl p-6 text-center cursor-pointer hover:border-sacred-gold/30 transition-colors"
              >
                <input {...getInputProps()} />
                <Upload size={24} className="mx-auto text-white/20 mb-2" />
                <p className="text-sm text-white/40">
                  Drop your response video or click to select
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs text-white/40 mb-2">
              Personal Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="input-sacred resize-none"
              placeholder="Your guidance and feedback..."
            />
          </div>

          {/* Next meditation URL */}
          <div>
            <label className="block text-xs text-white/40 mb-2">
              Next Guided Meditation URL (optional)
            </label>
            <input
              type="url"
              value={meditationUrl}
              onChange={(e) => setMeditationUrl(e.target.value)}
              className="input-sacred"
              placeholder="https://..."
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmitResponse}
            disabled={!responseVideoFile || uploading}
            className="btn-sacred w-full"
          >
            {uploading ? (
              'Uploading & Unlocking...'
            ) : (
              <>
                <Send size={16} />
                Send Response & Unlock Next Step
              </>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 text-center"
        >
          <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
          <h2 className="font-display text-xl text-white/90 mb-2">
            Response Sent Successfully
          </h2>
          <p className="text-sm text-white/40 mb-6">
            {student.full_name}&apos;s next sequence has been unlocked.
          </p>
          <Link href="/admin/dashboard" className="btn-glass">
            Back to Dashboard
          </Link>
        </motion.div>
      )}
    </div>
  );
}
