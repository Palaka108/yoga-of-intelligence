'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const [entered, setEntered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const handleEnter = useCallback(() => {
    // Start playing the intro song
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    }
    setEntered(true);
  }, []);

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Audio Element */}
      <audio ref={audioRef} src="https://qwlbbcrjdpuxkavwyjyg.supabase.co/storage/v1/object/public/yoi-content/intro/intro-qualiavibe.mp3" loop preload="auto" />

      {/* Water Animation Background */}
      <div className="water-bg" aria-hidden="true">
        {/* Caustic light layer 1 */}
        <div className="water-caustics water-caustics-1" />
        {/* Caustic light layer 2 */}
        <div className="water-caustics water-caustics-2" />
        {/* Wave ripple layer */}
        <div className="water-ripple" />
        {/* Floating light orbs */}
        <div className="water-orb water-orb-1" />
        <div className="water-orb water-orb-2" />
        <div className="water-orb water-orb-3" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-900/20 via-pink-900/15 to-slate-900/50" />

      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,130,214,0.1)_0%,transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Glassmorphism Card */}
        <div className="animate-fade-in bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 md:p-14 max-w-lg w-full text-center shadow-2xl">
          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-wide gold-text mb-4">
            Yoga of Intelligence
          </h1>

          {/* Subtitle */}
          <p className="font-display text-lg md:text-xl text-white/50 tracking-[0.3em] uppercase mb-10">
            Know the Knower
          </p>

          {/* Decorative line */}
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-sacred-gold/50 to-transparent mx-auto mb-10" />

          {!entered ? (
            /* Enter Button — triggers audio */
            <button
              onClick={handleEnter}
              className="group relative px-12 py-4 rounded-full border border-sacred-gold/30
                         bg-sacred-gold/5 backdrop-blur-md
                         transition-all duration-500
                         hover:border-sacred-gold/60 hover:bg-sacred-gold/10
                         hover:shadow-[0_0_40px_rgba(201,168,76,0.2)]"
            >
              <span className="font-display text-lg tracking-[0.2em] uppercase text-sacred-gold group-hover:text-sacred-gold-light transition-colors">
                Enter
              </span>
            </button>
          ) : (
            /* Auth Buttons — shown after entering */
            <div className="flex flex-col gap-4 w-full max-w-xs mx-auto animate-fade-in">
              <button onClick={handleSignIn} className="btn-sacred text-base">
                Sign In
              </button>
              <button onClick={handleSignIn} className="btn-glass text-base">
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Breathing Circle Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        <div className="w-2 h-2 rounded-full bg-white/40 breathing-circle" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-white/40 breathing-circle" style={{ animationDelay: '1.5s' }} />
        <div className="w-2 h-2 rounded-full bg-white/40 breathing-circle" style={{ animationDelay: '3s' }} />
      </div>
    </div>
  );
}
