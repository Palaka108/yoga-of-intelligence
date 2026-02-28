'use client';

import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/meditation-intro.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-pink-900/50 to-slate-900/70" />

      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,130,214,0.15)_0%,transparent_70%)]" />

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

          {/* Auth Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
            <button onClick={handleSignIn} className="btn-sacred text-base">
              Sign In
            </button>
            <button onClick={handleSignIn} className="btn-glass text-base">
              Create Account
            </button>
          </div>
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
