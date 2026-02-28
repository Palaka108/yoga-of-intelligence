'use client';

import { useEffect } from 'react';
import PortalNav from '@/components/layout/PortalNav';
import VoiceRecorder from '@/components/global/VoiceRecorder';
import { useAudioStore } from '@/stores/audio-store';

const SONG_URL =
  'https://qwlbbcrjdpuxkavwyjyg.supabase.co/storage/v1/object/public/yoi-content/intro/intro-qualiavibe.mp3';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Ensure audio element persists across portal route changes.
    // If user entered via splash page, the element already exists.
    useAudioStore.getState().ensureAudio(SONG_URL);
  }, []);

  return (
    <div className="min-h-screen bg-sacred-black relative">
      <PortalNav />
      {/* pt-16 accounts for the fixed nav; overflow-x prevents horizontal scroll */}
      <main className="pt-16 overflow-x-hidden">{children}</main>
      <VoiceRecorder />
    </div>
  );
}
