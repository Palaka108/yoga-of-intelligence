import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { EVENT, UTM_KEYS } from '@/lib/redemption-event';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Naive in-process throttle. Enough to blunt casual abuse on a single event. */
const recent = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);

  if (recent.size > 5000) recent.clear(); // bound memory on a long-lived lambda
  return hits.length > MAX_PER_WINDOW;
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('[redemption/rsvp] Supabase env vars are not configured');
    return NextResponse.json(
      { error: 'Registration is temporarily unavailable. Please try again shortly.' },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a moment.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: report success so bots do not learn they were caught.
  if (str(body.company, 100)) {
    return NextResponse.json({ ok: true, eventId: randomUUID() });
  }

  const firstName = str(body.firstName, 80);
  const email = str(body.email, 200).toLowerCase();
  const phone = str(body.phone, 40);
  const smsConsent = body.smsConsent === true;

  if (!firstName) {
    return NextResponse.json({ error: 'Please add your first name.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'That email does not look right.' }, { status: 400 });
  }
  if (smsConsent && !phone) {
    return NextResponse.json(
      { error: 'Add a mobile number, or untick the reminder box.' },
      { status: 400 }
    );
  }

  const raw = (body.attribution ?? {}) as Record<string, unknown>;
  const attribution: Record<string, string | null> = {};
  for (const key of UTM_KEYS) attribution[key] = str(raw[key], 200) || null;

  const eventId = randomUUID();
  const draftId = str(body.draftId, 64);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('yoi_rsvps').upsert(
    {
      event_slug: EVENT.slug,
      first_name: firstName,
      email,
      phone: phone || null,
      sms_consent: smsConsent,
      ...attribution,
      referrer: str(raw.referrer, 300) || null,
      landing_path: str(raw.landing_path, 200) || '/redemption',
      user_agent: request.headers.get('user-agent')?.slice(0, 400) ?? null,
      meta_event_id: eventId,
    },
    { onConflict: 'event_slug,email' }
  );

  if (error) {
    console.error('[redemption/rsvp] insert failed:', error.message);
    return NextResponse.json(
      { error: 'We could not save that. Please try again.' },
      { status: 500 }
    );
  }

  // Close out the autosaved partial so abandoned drafts stay distinguishable
  // from ones that went on to complete. Never fail the RSVP over this.
  if (/^[0-9a-f-]{36}$/i.test(draftId)) {
    const { error: draftError } = await supabase
      .from('yoi_rsvp_drafts')
      .update({ converted_at: new Date().toISOString() })
      .eq('draft_id', draftId);
    if (draftError) {
      console.error('[redemption/rsvp] draft close-out failed:', draftError.message);
    }
  }

  // 200 here is what authorises the client to fire the Meta `Lead` event.
  return NextResponse.json({ ok: true, eventId });
}
