'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleRefresh = () => {
    router.refresh();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-sacred-black flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-sacred-gold/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md text-center"
      >
        <div className="glass-panel p-10">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-sacred-gold/10 border border-sacred-gold/20 flex items-center justify-center mb-6">
            <Clock size={28} className="text-sacred-gold" />
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl font-light gold-text mb-3">
            Awaiting Approval
          </h1>

          {/* Message */}
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Your account has been created successfully. An instructor will review
            and approve your access shortly. You will be able to enter the portal
            once approved.
          </p>

          {/* Decorative line */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-sacred-gold/30 to-transparent mx-auto mb-8" />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button onClick={handleRefresh} className="btn-sacred w-full text-sm">
              Check Again
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs text-white/30 hover:text-white/50 transition-colors tracking-widest uppercase"
            >
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
