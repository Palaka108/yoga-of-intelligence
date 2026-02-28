'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Video, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { useUser } from '@/hooks/use-user';

interface SubmissionRow {
  id: string;
  user_id: string;
  module_id: string;
  sequence_id: string;
  video_url: string;
  duration_seconds: number | null;
  status: string;
  submitted_at: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  module_title: string;
  sequence_title: string;
}

export default function AdminDashboard() {
  const { profile, loading: userLoading } = useUser();
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingSubmissions: 0,
    reviewedSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'reviewed' | 'all'>('pending');

  useEffect(() => {
    if (!profile || (profile.role !== 'admin' && profile.role !== 'instructor')) return;

    async function fetchData() {
      const supabase = createClient();

      // Get stats
      const { count: userCount } = await supabase
        .from('yoi_users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      const { count: pendingCount } = await supabase
        .from('yoi_video_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: reviewedCount } = await supabase
        .from('yoi_video_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'reviewed');

      setStats({
        totalUsers: userCount ?? 0,
        pendingSubmissions: pendingCount ?? 0,
        reviewedSubmissions: reviewedCount ?? 0,
      });

      // Get submissions with user info
      let query = supabase
        .from('yoi_video_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: submissionData } = await query;

      if (submissionData) {
        const subs = submissionData as unknown as Array<{
          id: string;
          user_id: string;
          module_id: string;
          sequence_id: string;
          video_url: string;
          duration_seconds: number | null;
          status: string;
          submitted_at: string;
        }>;

        // Enrich with user and module info
        const enriched = await Promise.all(
          subs.map(async (sub) => {
            const { data: userData } = await supabase
              .from('yoi_users')
              .select('full_name, email, avatar_url')
              .eq('id', sub.user_id)
              .single();

            const { data: modData } = await supabase
              .from('yoi_modules')
              .select('title')
              .eq('id', sub.module_id)
              .single();

            const { data: seqData } = await supabase
              .from('yoi_module_sequences')
              .select('title')
              .eq('id', sub.sequence_id)
              .single();

            return {
              ...sub,
              user_name: (userData as Record<string, string> | null)?.full_name ?? 'Unknown',
              user_email: (userData as Record<string, string> | null)?.email ?? '',
              user_avatar: (userData as Record<string, string | null> | null)?.avatar_url ?? null,
              module_title: (modData as Record<string, string> | null)?.title ?? 'Unknown Module',
              sequence_title: (seqData as Record<string, string> | null)?.title ?? 'Unknown Sequence',
            } as SubmissionRow;
          })
        );

        setSubmissions(enriched);
      }

      setLoading(false);
    }

    fetchData();
  }, [profile, filter]);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (profile?.role !== 'admin' && profile?.role !== 'instructor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Unauthorized</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl gold-text mb-8">Instructor Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Students', value: stats.totalUsers, icon: Users, color: 'text-sacred-neon' },
          { label: 'Pending Review', value: stats.pendingSubmissions, icon: Clock, color: 'text-amber-400' },
          { label: 'Reviewed', value: stats.reviewedSubmissions, icon: CheckCircle, color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-5">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={18} className={stat.color} />
              <span className="text-xs text-white/40 uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-3xl font-display text-white/90">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'reviewed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-sacred-gold/20 text-sacred-gold border border-sacred-gold/30'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 && (
          <div className="glass-panel p-8 text-center">
            <p className="text-white/30">No submissions found</p>
          </div>
        )}

        {submissions.map((sub, i) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/admin/submissions/${sub.user_id}?submission=${sub.id}`}>
              <div className="glass-panel-hover p-5 flex items-center gap-4">
                {/* Avatar */}
                {sub.user_avatar ? (
                  <img
                    src={sub.user_avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-sacred-indigo flex items-center justify-center text-sm text-sacred-gold">
                    {sub.user_name[0]}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 font-medium truncate">
                    {sub.user_name}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {sub.module_title} — {sub.sequence_title}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {sub.status === 'pending' ? (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Clock size={12} /> Pending
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle size={12} /> Reviewed
                    </span>
                  )}
                </div>

                {/* Duration */}
                <span className="text-xs text-white/30">
                  {sub.duration_seconds ? `${Math.round(sub.duration_seconds)}s` : '—'}
                </span>

                {/* Time */}
                <span className="text-xs text-white/20">
                  {new Date(sub.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
