import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EVENT } from '@/lib/redemption-event';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLUMNS = [
  'created_at',
  'first_name',
  'email',
  'phone',
  'sms_consent',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'referrer',
  'landing_path',
] as const;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const DRAFT_COLUMNS = [
  'updated_at',
  'first_name',
  'email',
  'phone',
  'sms_consent',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'referrer',
  'landing_path',
] as const;

/**
 * CSV export.
 *
 *   ?type=rsvps   (default) confirmed registrations
 *   ?type=partial            autosaved forms that never completed —
 *                            people who left contact details and stopped
 *
 * Guarded by RSVP_EXPORT_TOKEN — passed as ?token=… or an
 * `Authorization: Bearer …` header. Without the variable set the route
 * refuses outright rather than defaulting to open.
 */
export async function GET(request: Request) {
  const expected = process.env.RSVP_EXPORT_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: 'Export is not configured.' }, { status: 503 });
  }

  const url = new URL(request.url);
  const supplied =
    url.searchParams.get('token') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    '';

  if (supplied !== expected) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Not configured.' }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const wantsPartial = url.searchParams.get('type') === 'partial';
  const columns = wantsPartial ? DRAFT_COLUMNS : COLUMNS;

  const query = wantsPartial
    ? supabase
        .from('yoi_rsvp_drafts')
        .select(DRAFT_COLUMNS.join(','))
        .eq('event_slug', EVENT.slug)
        .is('converted_at', null)
        .order('updated_at', { ascending: true })
    : supabase
        .from('yoi_rsvps')
        .select(COLUMNS.join(','))
        .eq('event_slug', EVENT.slug)
        .order('created_at', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('[redemption/export] query failed:', error.message);
    return NextResponse.json({ error: 'Export failed.' }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const csv = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(',')),
  ].join('\n');

  const filename = `${EVENT.slug}-${wantsPartial ? 'partial' : 'rsvps'}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
