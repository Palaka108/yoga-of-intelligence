import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EVENT, UTM_KEYS } from '@/lib/redemption-event';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Partial RSVP capture.
 *
 * Called as the visitor types (debounced) and again on page-hide via
 * sendBeacon, so someone who enters an email and then leaves is not lost.
 * Always answers 204: autosave is best-effort and must never surface an
 * error in the middle of someone filling in a form.
 */
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const draftId = str(body.draftId, 64);
  if (!UUID_RE.test(draftId)) return new Response(null, { status: 204 });

  // Honeypot filled → a bot. Record nothing.
  if (str(body.company, 100)) return new Response(null, { status: 204 });

  const firstName = str(body.firstName, 80);
  const email = str(body.email, 200).toLowerCase();
  const phone = str(body.phone, 40);

  // Nothing worth storing yet — do not create empty rows.
  if (!firstName && !email && !phone) return new Response(null, { status: 204 });

  const raw = (body.attribution ?? {}) as Record<string, unknown>;
  const attribution: Record<string, string | null> = {};
  for (const key of UTM_KEYS) attribution[key] = str(raw[key], 200) || null;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('yoi_rsvp_drafts').upsert(
    {
      draft_id: draftId,
      event_slug: EVENT.slug,
      first_name: firstName || null,
      email: email || null,
      phone: phone || null,
      sms_consent: body.smsConsent === true,
      ...attribution,
      referrer: str(raw.referrer, 300) || null,
      landing_path: str(raw.landing_path, 200) || '/redemption',
      user_agent: request.headers.get('user-agent')?.slice(0, 400) ?? null,
    },
    { onConflict: 'draft_id' }
  );

  if (error) console.error('[redemption/autosave] upsert failed:', error.message);

  return new Response(null, { status: 204 });
}
