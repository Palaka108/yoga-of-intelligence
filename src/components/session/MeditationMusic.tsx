/**
 * Suno does not publish a file a browser can play directly.
 * cdn1.suno.ai/<id>.mp3 answers 403, and the cloudfront clip is not valid
 * audio until Suno's own page decrypts it. The embed is that player.
 * It stays a separate document: no microphone permission, no shared audio graph.
 */
const SONG_EMBED = 'https://suno.com/embed/4efee319-d3a5-4ba1-81fb-c36eed475e3b';

export default function MeditationMusic() {
  return (
    <section
      aria-label="Meditation music"
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-slate-950/55 shadow-2xl backdrop-blur-xl">
        <p className="px-4 pt-2.5 text-center font-display text-[0.68rem] uppercase tracking-[0.24em] text-sacred-gold">
          Meditation music
        </p>
        <iframe
          title="So Many Forms"
          src={SONG_EMBED}
          className="mt-1 block h-[140px] w-full border-0 bg-transparent"
          allow="encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
}
