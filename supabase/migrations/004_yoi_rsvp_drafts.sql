-- ============================================================
-- Partial RSVP capture (/redemption)
--
-- The form autosaves as it is filled in, so a visitor who types an
-- email and then abandons the page is still a reachable lead.
-- Keyed by a client-generated draft id, NOT by email, because a
-- draft may not have an email yet.
--
-- Kept separate from yoi_rsvps so the confirmed list stays clean:
-- a draft is an unconfirmed enquiry, not an RSVP.
--
-- Server-side writes only. RLS enabled with no policies.
-- ============================================================

create table if not exists public.yoi_rsvp_drafts (
  draft_id      uuid primary key,
  event_slug    text not null default 'redemption-2026-09-22',

  first_name    text,
  email         text,
  phone         text,
  sms_consent   boolean not null default false,

  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  referrer      text,
  landing_path  text,
  user_agent    text,

  -- set once the same draft completes a full RSVP, so abandoned
  -- drafts can be separated from converted ones.
  converted_at  timestamptz,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists yoi_rsvp_drafts_event_updated_idx
  on public.yoi_rsvp_drafts (event_slug, updated_at desc);

-- The useful query: drafts that never converted but left contact details.
create index if not exists yoi_rsvp_drafts_abandoned_idx
  on public.yoi_rsvp_drafts (event_slug, converted_at)
  where converted_at is null;

alter table public.yoi_rsvp_drafts enable row level security;

comment on table public.yoi_rsvp_drafts is
  'Partially completed RSVP forms for /redemption, autosaved as the visitor types. Server-side writes only; RLS on with no policies.';

drop trigger if exists yoi_rsvp_drafts_touch on public.yoi_rsvp_drafts;
create trigger yoi_rsvp_drafts_touch
  before update on public.yoi_rsvp_drafts
  for each row execute function public.yoi_rsvps_touch_updated_at();
