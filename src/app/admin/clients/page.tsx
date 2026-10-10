import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createParticipantInvite, lockOwnerList, unlockOwnerList } from '@/app/admin/clients/actions';
import { hasElevenLabsKey, isSignupReady, templateAgentId } from '@/lib/elevenlabs-agent';
import { accountSummaries, canSendResetEmail, claimUrl } from '@/lib/session-auth';
import { isOwnerUnlocked, OWNER_COOKIE, ownerPassword } from '@/lib/session-owner-auth';
import { listProfilesForOwner } from '@/lib/session-directory';
import { joinCodeRequired } from '@/lib/session-join';
import {
  dayLabel,
  formatSessionDate,
  joinUrl,
  programInfo,
  sessionPath,
  sessionUrl,
} from '@/lib/session-participants';
import { isStoreConfigured } from '@/lib/session-store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Participants — Yoga of Intelligence',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  referrer: 'no-referrer',
};

export default async function OwnerClientsPage({
  searchParams,
}: {
  searchParams: { error?: string; invite?: string; for?: string; mailed?: string };
}) {
  const configured = Boolean(ownerPassword());
  const unlocked = isOwnerUnlocked(cookies().get(OWNER_COOKIE)?.value);
  const wrongPassword = searchParams.error === '1';
  const inviteFailed = searchParams.error === 'invite';
  const directory = unlocked ? await listProfilesForOwner() : null;
  const accounts =
    directory && directory.storeConfigured
      ? await accountSummaries(directory.profiles.map((person) => person.client_id))
      : {};
  const inviteToken =
    unlocked && searchParams.invite && /^[A-Za-z0-9_-]{32,128}$/.test(searchParams.invite)
      ? searchParams.invite
      : null;
  const inviteFor =
    inviteToken && directory?.profiles.some((person) => person.client_id === searchParams.for)
      ? searchParams.for
      : null;

  return (
    <div className="relative min-h-[100svh] bg-sacred-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.14),transparent_55%)]" />
      <main className="relative z-10 mx-auto w-full max-w-lg px-5 py-10 sm:py-14">
        <p className="font-display text-sm uppercase tracking-[0.28em] text-white/40">
          Yoga of Intelligence
        </p>
        <h1 className="font-display mt-3 text-4xl font-light gold-text">Participants</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          Personal links for the reflection trial. Notes on this page stay off their pages.
        </p>

        {!configured ? (
          <section className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="font-display text-2xl font-light text-white/90">Locked</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Set <span className="font-mono text-sacred-gold">SESSION_OWNER_PASSWORD</span> on the
              server, then reload. Until then this list stays empty.
            </p>
          </section>
        ) : !unlocked ? (
          <form
            action={unlockOwnerList}
            className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl"
          >
            <label htmlFor="password" className="font-display text-2xl font-light text-white/90">
              Owner password
            </label>
            <p className="mt-2 text-sm text-white/55">This page is not linked from the site.</p>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input-sacred mt-5"
            />
            {wrongPassword ? (
              <p className="mt-3 text-sm text-sacred-gold-light">That password did not match.</p>
            ) : null}
            <button type="submit" className="btn-sacred mt-5 w-full">
              Open list
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            <form action={lockOwnerList}>
              <button type="submit" className="btn-glass text-sm">
                Lock list
              </button>
            </form>
            {inviteFailed ? (
              <p className="rounded-2xl border border-sacred-gold/30 bg-white/5 px-4 py-3 text-sm text-sacred-gold-light">
                Could not create a link. Check that Redis is connected, then try again.
              </p>
            ) : null}
            {inviteToken && inviteFor ? (
              <section className="rounded-3xl border border-sacred-gold/40 bg-white/5 p-5 text-sm leading-relaxed text-white/75">
                <h2 className="font-display text-2xl font-light text-white">One-time link</h2>
                <p className="mt-2">
                  For <span className="font-mono text-sacred-gold">{inviteFor}</span>. It expires in 7 days,
                  works once, and replaces any earlier link for this person. Give it to them directly.
                </p>
                <input
                  readOnly
                  value={claimUrl(inviteToken)}
                  className="input-sacred mt-4 font-mono text-xs"
                  aria-label="One-time link"
                />
                {searchParams.mailed === '1' ? (
                  <p className="mt-3 text-white/70">A copy was sent to their email.</p>
                ) : canSendResetEmail() ? (
                  <p className="mt-3 text-white/50">Email was not sent. Share the link yourself.</p>
                ) : (
                  <p className="mt-3 text-white/50">
                    Email is not configured, so this link is the way to set or reset a password.
                  </p>
                )}
              </section>
            ) : null}
            <section className="rounded-3xl border border-white/15 bg-white/5 p-5 text-sm leading-relaxed text-white/70">
              <p>
                Shared signup link:{' '}
                <a href="/join" className="break-all text-sacred-gold-light underline-offset-4 hover:underline">
                  {joinUrl()}
                </a>
              </p>
              <p className="mt-2">
                New pages copy agent{' '}
                <span className="break-all font-mono text-xs text-white/80">{templateAgentId()}</span>.
                {joinCodeRequired() ? ' A join code is required.' : ' No join code is set.'} A voice page
                opens only for the person signed in to it. Use a one-time link when someone has no
                password yet, including Nia.
              </p>
              {!isSignupReady() ? (
                <p className="mt-2 text-sacred-gold-light">
                  Sign-up is closed.
                  {!isStoreConfigured()
                    ? ' Connect Upstash Redis (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).'
                    : ''}
                  {!hasElevenLabsKey() ? ' Set ELEVENLABS_API_KEY.' : ''} Voice pages stay locked until each
                  person has a password. Nia claims hers from a one-time link once Redis is connected.
                </p>
              ) : null}
              {directory?.storeError ? (
                <p className="mt-2 text-sacred-gold-light">
                  The signup store did not respond. Only the seeded profile is listed.
                </p>
              ) : null}
            </section>
            {directory?.profiles.map((person) => {
              const program = programInfo(person.program);
              const path = sessionPath(person.client_id);
              const url = sessionUrl(person.client_id);
              const account = accounts[person.client_id.toLowerCase()];
              const email = account?.email || person.email;
              const hasPassword = Boolean(account?.hasPassword);
              return (
                <article
                  key={person.client_id}
                  className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <h2 className="font-display text-3xl font-light text-white">{person.name}</h2>
                  <p className="mt-1 font-mono text-xs text-sacred-gold">{person.client_id}</p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-white/40">Program</dt>
                      <dd className="text-white/85">
                        {program.label}{' '}
                        <span className="font-mono text-xs text-white/45">({person.program})</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Day</dt>
                      <dd className="text-white/85">
                        {dayLabel(person.program, person.day)} · started{' '}
                        {formatSessionDate(person.start_date)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Agent</dt>
                      <dd className="break-all font-mono text-xs leading-relaxed text-white/80">
                        {person.agent_id}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Link</dt>
                      <dd className="break-all text-white/85">
                        <a href={path} className="text-sacred-gold-light underline-offset-4 hover:underline">
                          {url}
                        </a>
                      </dd>
                    </div>
                    {person.aliases && person.aliases.length > 0 ? (
                      <div>
                        <dt className="text-white/40">Also opens from</dt>
                        <dd className="break-all text-white/70">
                          {person.aliases
                            .map((alias) => `/session/${alias} and /session?c=${alias}`)
                            .join('; ')}
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-white/40">Account</dt>
                      <dd className="text-white/85">
                        {hasPassword ? 'Password set' : 'No password yet'}
                      </dd>
                    </div>
                    {email ? (
                      <div>
                        <dt className="text-white/40">Email</dt>
                        <dd className="break-all text-white/75">{email}</dd>
                      </div>
                    ) : (
                      <div>
                        <dt className="text-white/40">Email</dt>
                        <dd className="text-white/50">None yet. The one-time link will ask for one.</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-white/40">Private notes</dt>
                      <dd className="whitespace-pre-wrap text-white/75">
                        {person.notes?.trim() ? person.notes : 'None yet.'}
                      </dd>
                    </div>
                  </dl>
                  {directory?.storeConfigured && !directory.storeError ? (
                    <form action={createParticipantInvite} className="mt-5">
                      <input type="hidden" name="client_id" value={person.client_id} />
                      <button type="submit" className="btn-glass w-full text-sm">
                        {hasPassword ? 'Create a reset link' : 'Create a one-time link'}
                      </button>
                    </form>
                  ) : (
                    <p className="mt-4 text-sm text-white/45">Connect Redis before sending a link.</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
