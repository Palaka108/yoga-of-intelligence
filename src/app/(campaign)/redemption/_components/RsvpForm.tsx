'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UTM_KEYS } from '@/lib/redemption-event';
import { trackLead } from './MetaPixel';

const UTM_STORAGE_KEY = 'rdm_attribution';
const DRAFT_STORAGE_KEY = 'rdm_draft_id';
const AUTOSAVE_DEBOUNCE_MS = 1200;

type Attribution = Record<string, string>;

/**
 * Read UTM parameters from the landing URL and keep them for the session, so
 * attribution survives a visitor scrolling, refreshing or arriving deep-linked.
 * Read from window rather than useSearchParams so the page stays fully static.
 */
function useAttribution(): Attribution {
  const [attribution, setAttribution] = useState<Attribution>({});

  useEffect(() => {
    let stored: Attribution = {};
    try {
      stored = JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY) ?? '{}');
    } catch {
      stored = {};
    }

    const params = new URLSearchParams(window.location.search);
    const fresh: Attribution = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) fresh[key] = value.slice(0, 200);
    }

    // A fresh ad click wins; otherwise keep what the session already had.
    const merged: Attribution = Object.keys(fresh).length
      ? { ...fresh, referrer: document.referrer.slice(0, 300), landing_path: window.location.pathname }
      : {
          ...stored,
          referrer: stored.referrer ?? document.referrer.slice(0, 300),
          landing_path: stored.landing_path ?? window.location.pathname,
        };

    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
    } catch {
      /* private mode — attribution is best-effort, never blocking */
    }
    setAttribution(merged);
  }, []);

  return attribution;
}

/**
 * A stable id for this visitor's in-progress form, so repeated autosaves
 * update one row instead of creating many.
 */
function useDraftId(): string | null {
  const [draftId, setDraftId] = useState<string | null>(null);

  useEffect(() => {
    let existing: string | null = null;
    try {
      existing = localStorage.getItem(DRAFT_STORAGE_KEY);
    } catch {
      existing = null;
    }

    const id = existing ?? crypto.randomUUID();
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, id);
    } catch {
      /* private mode — the id simply lives for this page view */
    }
    setDraftId(id);
  }, []);

  return draftId;
}

export default function RsvpForm({ id = 'rsvp' }: { id?: string }) {
  const router = useRouter();
  const attribution = useAttribution();
  const draftId = useDraftId();
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  // The phone field only exists once someone asks for reminders. Nobody who
  // just wants to RSVP should have to look at it, let alone skip past it.
  const [wantsTexts, setWantsTexts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastSaved = useRef<string>('');
  const submitted = useRef(false);

  /** Snapshot whatever has been typed so far. */
  const snapshot = useCallback(() => {
    const form = formRef.current;
    if (!form || !draftId) return null;

    const data = new FormData(form);
    const payload = {
      draftId,
      firstName: String(data.get('firstName') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      smsConsent: data.get('smsConsent') === 'on',
      company: String(data.get('company') ?? ''),
      attribution,
    };

    // Nothing typed yet, or nothing changed since the last save.
    if (!payload.firstName && !payload.email && !payload.phone) return null;
    return payload;
  }, [attribution, draftId]);

  /** Best-effort partial save. Never blocks or interrupts the visitor. */
  const autosave = useCallback(
    (opts: { beacon?: boolean } = {}) => {
      if (submitted.current) return;
      const payload = snapshot();
      if (!payload) return;

      const body = JSON.stringify(payload);
      if (body === lastSaved.current) return;
      lastSaved.current = body;

      if (opts.beacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        // Survives the page being closed or backgrounded.
        navigator.sendBeacon(
          '/api/redemption/autosave',
          new Blob([body], { type: 'application/json' })
        );
        return;
      }

      fetch('/api/redemption/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // A failed autosave must never surface to the visitor.
        lastSaved.current = '';
      });
    },
    [snapshot]
  );

  /** Debounced while typing. */
  function handleChange() {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autosave(), AUTOSAVE_DEBOUNCE_MS);
  }

  // Flush on blur, tab-hide and page-unload so a half-filled form still lands.
  useEffect(() => {
    const flush = () => autosave({ beacon: true });
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimeout(saveTimer.current);
    };
  }, [autosave]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    clearTimeout(saveTimer.current);
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      draftId,
      firstName: String(data.get('firstName') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      smsConsent: data.get('smsConsent') === 'on',
      // Honeypot: a real person never fills this; bots usually do.
      company: String(data.get('company') ?? ''),
      attribution,
    };

    if (!payload.firstName || !payload.email) {
      setError('Please add your first name and email.');
      setStatus('error');
      autosave();
      return;
    }

    if (payload.smsConsent && !payload.phone) {
      setError('Add a mobile number, or untick the reminder box.');
      setStatus('error');
      autosave();
      return;
    }

    setStatus('sending');
    setError(null);

    try {
      const response = await fetch('/api/redemption/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result?.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      submitted.current = true;
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        /* nothing to clean up */
      }

      // Meta `Lead` fires here and only here — after a confirmed registration.
      if (result?.eventId) trackLead(result.eventId);

      router.push('/redemption/thanks');
    } catch {
      setError('Network problem. Please try again.');
      setStatus('error');
      autosave({ beacon: true });
    }
  }

  useEffect(() => {
    if (status === 'error') errorRef.current?.focus();
  }, [status]);

  const fieldClass =
    'w-full border-b border-redemption-ivory/25 bg-transparent px-0 py-3.5 text-lg text-redemption-ivory ' +
    // 35% was unreadable on a real phone; 55% is legible while still clearly
    // subordinate to text the visitor has typed.
    'placeholder:text-redemption-ivory/55 focus:border-redemption-vermilion focus:outline-none ' +
    'transition-colors duration-300';

  const labelClass =
    'font-mono text-[12px] uppercase tracking-[0.18em] text-redemption-ivory/60';

  return (
    <form
      id={id}
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={handleChange}
      onBlur={() => autosave()}
      noValidate
      className="w-full max-w-xl"
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="firstName" className={labelClass}>
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            placeholder="Your first name"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@email.com"
            className={fieldClass}
          />
        </div>

        {/* Honeypot. Bots fill it, people never see it: removed from the
            accessibility tree, out of the tab order, and taken out of layout
            entirely rather than merely pushed off-screen. */}
        <div
          className="rdm-honeypot"
          aria-hidden="true"
          // Inline as well as in the stylesheet: if the CSS ever fails to
          // load, the field must still not be visible to a real visitor.
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clipPath: 'inset(50%)',
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <label htmlFor="company" tabIndex={-1}>
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="smsConsent"
              checked={wantsTexts}
              onChange={(e) => setWantsTexts(e.target.checked)}
              aria-controls="phone-field"
              aria-expanded={wantsTexts}
              className="mt-0.5 h-5 w-5 shrink-0 accent-redemption-vermilion"
            />
            <span className="text-[15px] leading-relaxed text-redemption-ivory/80">
              Text me an event reminder
            </span>
          </label>

          {/* Revealed only on request. Rendered conditionally rather than
              hidden, so it is never in the tab order or announced when the
              visitor has not asked for texts. */}
          {wantsTexts && (
            <div id="phone-field" className="rdm-reveal mt-6">
              <label htmlFor="phone" className={labelClass}>
                Mobile number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                autoFocus
                placeholder="(000) 000-0000"
                className={fieldClass}
              />
              <p className="mt-3 text-[13px] leading-relaxed text-redemption-ivory/60">
                By providing your number, you agree to receive reminder texts for this event.
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 border-l-2 border-redemption-vermilion pl-4 text-sm text-redemption-vermilion"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-8 w-full bg-redemption-vermilion px-8 py-4 font-mono text-sm font-semibold uppercase
                   tracking-[0.18em] text-redemption-ivory transition-colors duration-300
                   hover:bg-redemption-vermilion-deep disabled:cursor-wait disabled:opacity-70
                   sm:py-5 sm:text-base"
      >
        {status === 'sending' ? 'Reserving…' : 'Reserve my spot'}
      </button>

      <p className="mt-5 text-[13px] leading-relaxed text-redemption-ivory/60">
        We’ll only use your information to confirm your RSVP and send reminders for this
        event.
      </p>
    </form>
  );
}
