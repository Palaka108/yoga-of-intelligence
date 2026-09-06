-- ============================================================
-- REDEMPTION event RSVPs  (/redemption)
--
-- Writes come only from the server-side route handler using the
-- service-role key, which bypasses RLS. RLS is therefore enabled
-- with NO policies: the anon and authenticated roles can neither
-- read nor write this table.
-- ============================================================

create table if not exists public.yoi_rsvps (
  id            uuid primary key default gen_random_uuid(),
  event_slug    text not null default 'redemption-2026-09-22',

  first_name    text not null,
  email         text not null,
  phone         text,
  sms_consent   boolean not null default false,

  -- advertising attribution
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  referrer      text,
  landing_path  text,

  user_agent    text,
  meta_event_id text,          -- shared with the browser Meta `Lead` event

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- One row per person per event; a repeat submit updates rather than duplicates.
-- Plain columns (not lower(email)) so PostgREST can infer this index for the
-- upsert's ON CONFLICT clause. The route handler lowercases email before insert.
create unique index if not exists yoi_rsvps_event_email_key
  on public.yoi_rsvps (event_slug, email);

create index if not exists yoi_rsvps_event_created_idx
  on public.yoi_rsvps (event_slug, created_at desc);

create index if not exists yoi_rsvps_utm_campaign_idx
  on public.yoi_rsvps (event_slug, utm_campaign);

alter table public.yoi_rsvps enable row level security;

-- Deliberately no policies: contact data is not reachable with the anon key.

comment on table public.yoi_rsvps is
  'Event RSVPs for Yoga of Intelligence campaign landing pages (/redemption). Server-side writes only; RLS on with no policies.';

-- keep updated_at honest on upsert
create or replace function public.yoi_rsvps_touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists yoi_rsvps_touch on public.yoi_rsvps;
create trigger yoi_rsvps_touch
  before update on public.yoi_rsvps
  for each row execute function public.yoi_rsvps_touch_updated_at();
