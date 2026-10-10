import VoiceWidget from '@/components/session/VoiceWidget';
import { dayLabel, programInfo, type PublicParticipant } from '@/lib/session-participants';

const VIDEO_URL =
  'https://qwlbbcrjdpuxkavwyjyg.supabase.co/storage/v1/object/public/yoi-content/intro/water-background.mp4';

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-sacred-black">
      <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-rose-900/35 via-pink-900/30 to-slate-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,130,214,0.14)_0%,transparent_68%)]" />
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 py-10 pb-32">
        {children}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
      {children}
    </div>
  );
}

export default function SessionScreen({ person }: { person: PublicParticipant | null }) {
  if (!person?.agent_id) {
    return (
      <Backdrop>
        <Card>
          <p className="font-display text-sm uppercase tracking-[0.28em] text-white/45">
            Yoga of Intelligence
          </p>
          <h1 className="font-display mx-auto mt-6 max-w-xs text-3xl font-light leading-snug text-white/90">
            Ask Palaka for your personal link.
          </h1>
        </Card>
      </Backdrop>
    );
  }

  const program = programInfo(person.program);

  return (
    <Backdrop>
      <Card>
        <p className="font-display text-sm uppercase tracking-[0.28em] text-white/45">
          Yoga of Intelligence
        </p>
        <h1 className="font-display mt-5 text-[2.65rem] font-light leading-none gold-text sm:text-5xl">
          Hello, {person.name}
        </h1>
        <h2 className="font-display mx-auto mt-5 max-w-xs text-balance text-[1.65rem] font-light leading-snug text-white/90">
          {program.title}
        </h2>
        <p className="mt-4 font-display text-sm uppercase tracking-[0.22em] text-sacred-gold">
          {dayLabel(person.program, person.day)}
        </p>
        <div className="mx-auto my-6 h-px w-24 bg-gradient-to-r from-transparent via-sacred-gold/50 to-transparent" />
        <p className="text-base leading-relaxed text-white/75">
          Find a quiet spot, tap to begin, and talk as you would with a friend.
        </p>
      </Card>
      <VoiceWidget agentId={person.agent_id} clientId={person.client_id} clientName={person.name} />
    </Backdrop>
  );
}
