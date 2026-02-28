'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useAudioStore } from '@/stores/audio-store';
import { getInitials } from '@/lib/utils';

export default function PortalNav() {
  const { profile } = useUser();
  const { isPlaying, isMuted, toggleMute } = useAudioStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-glass-border bg-sacred-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <span className="text-sacred-black font-display text-sm font-bold">Y</span>
            </div>
            <span className="font-display text-lg text-sacred-gold hidden sm:block">
              Yoga of Intelligence
            </span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Audio toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg text-white/40 hover:text-sacred-gold transition-colors"
              title={isMuted ? 'Unmute Gita 3.27' : 'Mute Gita 3.27'}
            >
              {isPlaying && !isMuted ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-glass-white transition-colors"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full avatar-glow object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sacred-indigo flex items-center justify-center text-xs text-sacred-gold font-medium">
                    {getInitials(profile?.full_name ?? null)}
                  </div>
                )}
                <span className="text-sm text-white/60 hidden md:block">
                  {profile?.full_name ?? 'Seeker'}
                </span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 glass-panel p-1 shadow-2xl"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-glass-white-10 transition-colors"
                    >
                      <User size={14} />
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-red-400 hover:bg-glass-white-10 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 text-white/40"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
