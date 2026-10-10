const VIDEO_URL =
  'https://qwlbbcrjdpuxkavwyjyg.supabase.co/storage/v1/object/public/yoi-content/intro/water-background.mp4';

export default function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-sacred-black">
      <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-rose-900/35 via-pink-900/30 to-slate-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,130,214,0.14)_0%,transparent_68%)]" />

      <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 py-10">
        <div className="animate-fade-in w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="font-display text-sm uppercase tracking-[0.28em] text-white/45">
            Yoga of Intelligence
          </p>
          <h1 className="font-display mx-auto mt-5 max-w-xs text-balance text-[1.85rem] font-light leading-snug text-white/90">
            {title}
          </h1>
          <div className="mx-auto my-6 h-px w-24 bg-gradient-to-r from-transparent via-sacred-gold/50 to-transparent" />
          {children}
        </div>
      </main>
    </div>
  );
}
