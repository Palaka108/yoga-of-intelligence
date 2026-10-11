import MeditationMusic from '@/components/session/MeditationMusic';
import VoiceWidget from '@/components/session/VoiceWidget';
import { resolveSessionDay, type ResolvedDay } from '@/lib/session-progress';
import { dayLabel, programInfo } from '@/lib/session-participants';
import type { SessionAccess } from '@/lib/session-access';

const VIDEO_URL =
  'https://qwlbbcrjdpuxkavwyjyg.supabase.co/storage/v1/object/public/yoi-content/intro/water-background.mp4';

function Backdrop({ children, roomForWidget }: { children: React.ReactNode; roomForWidget?: boolean }) {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-sacred-black">
      <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-rose-900/35 via-pink-900/30 to-slate-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,130,214,0.14)_0%,transparent_68%)]" />
      <div
        className={`relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 py-10 ${roomForWidget ? 'pb-64 pt-8' : ''}`}
      >
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

function Brand() {
  return (
    <p className="font-display text-sm uppercase tracking-[0.28em] text-white/45">Yoga of Intelligence</p>
  );
}

function SignOut() {
  return (
    <form action="/api/session/logout" method="post" className="mt-4">
      <button
        type="submit"
        className="text-sm text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
      >
        Sign out
      </button>
    </form>
  );
}

function DayDots({ progress }: { progress: ResolvedDay }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
      {Array.from({ length: progress.total }, (_, index) => {
        const day = index + 1;
        const filled = progress.finished || day <= progress.completed;
        const current = !progress.finished && day === progress.day;
        return (
          <span
            key={day}
            className={`h-2.5 w-2.5 rounded-full ${
              filled ? 'bg-sacred-gold' : current ? 'bg-transparent ring-2 ring-sacred-gold' : 'bg-white/20'
            }`}
          />
        );
      })}
    </div>
  );
}

export default async function SessionScreen({ access }: { access: SessionAccess }) {
  if (access.mode === 'open') {
    const person = access.person;
    const program = programInfo(person.program);
    const progress = await resolveSessionDay(person);
    return (
      <Backdrop roomForWidget>
        <Card>
          <Brand />
          <h1 className="font-display mt-5 text-[2.65rem] font-light leading-none gold-text sm:text-5xl">
            Hello, {person.name}
          </h1>
          <h2 className="font-display mx-auto mt-5 max-w-xs text-balance text-[1.65rem] font-light leading-snug text-white/90">
            {program.title}
          </h2>
          <p className="mt-4 font-display text-sm uppercase tracking-[0.22em] text-sacred-gold">
            {progress.finished ? "You've completed the 5 days." : dayLabel(person.program, progress.day)}
          </p>
          <DayDots progress={progress} />
          <div className="mx-auto my-6 h-px w-24 bg-gradient-to-r from-transparent via-sacred-gold/50 to-transparent" />
          <p className="text-base leading-relaxed text-white/75">
            Find a quiet spot, tap to begin, and talk as you would with a friend.
          </p>
          <SignOut />
        </Card>
        <VoiceWidget
          agentId={person.agent_id}
          clientId={person.client_id}
          clientName={person.name}
          sessionNumber={progress.sessionNumber}
        />
        <MeditationMusic />
      </Backdrop>
    );
  }

  if (access.mode === 'signin') {
    const next = encodeURIComponent(access.nextPath);
    return (
      <Backdrop>
        <Card>
          <Brand />
          <h1 className="font-display mx-auto mt-6 max-w-xs text-3xl font-light leading-snug text-white/90">
            Sign in to open this page.
          </h1>
          <a href={`/session/login?next=${next}`} className="btn-sacred mt-8 w-full">
            Sign in
          </a>
          <p className="mt-5 text-sm text-white/55">
            New here?{' '}
            <a href="/join" className="text-sacred-gold-light underline-offset-4 hover:underline">
              Open a page
            </a>
          </p>
        </Card>
      </Backdrop>
    );
  }

  if (access.mode === 'other') {
    return (
      <Backdrop>
        <Card>
          <Brand />
          <h1 className="font-display mx-auto mt-6 max-w-xs text-3xl font-light leading-snug text-white/90">
            This page is for someone else.
          </h1>
          <a href={access.ownPath} className="btn-sacred mt-8 w-full">
            Go to your page
          </a>
          <SignOut />
        </Card>
      </Backdrop>
    );
  }

  return (
    <Backdrop>
      <Card>
        <Brand />
        <h1 className="font-display mx-auto mt-6 max-w-xs text-3xl font-light leading-snug text-white/90">
          Ask Palaka for your personal link.
        </h1>
        {access.ownPath ? (
          <a href={access.ownPath} className="btn-sacred mt-8 w-full">
            Go to your page
          </a>
        ) : null}
      </Card>
    </Backdrop>
  );
}
