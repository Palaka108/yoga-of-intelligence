# Yoga of Intelligence — Deployment Guide

## Prerequisites
- Node.js 18+
- Supabase project: `qwlbbcrjdpuxkavwyjyg`
- Vercel account
- Git

---

## 1. Environment Setup

Copy `.env.local.example` to `.env.local` and fill in values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `NEXT_PUBLIC_SITE_URL` — Your deployment URL

---

## 2. Database Migration

Run the schema migration in Supabase SQL Editor:

1. Go to https://supabase.com/dashboard/project/qwlbbcrjdpuxkavwyjyg/sql
2. Paste contents of `supabase/migrations/001_yoi_schema.sql`
3. Execute

This creates:
- `yoi_users` — User profiles with role-based access
- `yoi_modules` — Module definitions
- `yoi_module_sequences` — 7-sequence structure per module
- `yoi_user_progress` — Per-user gated progress tracking
- `yoi_video_submissions` — Student video uploads
- `yoi_instructor_responses` — Admin response + unlock records
- Storage buckets: `yoi-videos`, `yoi-avatars`, `yoi-content`
- RLS policies for all tables
- Auto user profile creation trigger
- Admin unlock RPC function
- Module 1 seed data with all 7 sequences

---

## 3. Supabase Auth Configuration

### Email Auth
Already enabled by default in Supabase.

### Google OAuth
1. Go to Supabase Dashboard > Authentication > Providers > Google
2. Enable Google provider
3. Add Client ID and Client Secret from GCP
4. Redirect URL: `https://qwlbbcrjdpuxkavwyjyg.supabase.co/auth/v1/callback`

### GCP OAuth Client
- Add your deployment domain to **Authorized JavaScript Origins**
- Redirect URI already configured: `https://qwlbbcrjdpuxkavwyjyg.supabase.co/auth/v1/callback`

---

## 4. Storage Setup

The migration creates 3 buckets automatically:
- `yoi-videos` (private) — Student submissions + instructor responses
- `yoi-avatars` (public) — Profile images
- `yoi-content` (public) — Module media (videos, images, audio)

### Upload Module Content
Upload your media files to the `yoi-content` bucket:
- `/modules/1/intro-video.mp4`
- `/modules/1/gift-song.mp3`
- `/modules/1/sankhya-slide.png`

Then update `yoi_module_sequences` rows with the correct `content_url` values.

---

## 5. Set Admin User

After your first sign-in, promote yourself to admin:

```sql
UPDATE yoi_users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 6. Deploy Edge Function

```bash
supabase functions deploy unlock-sequence --project-ref qwlbbcrjdpuxkavwyjyg
```

---

## 7. Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## 8. Deploy to Vercel

### Option A: CLI
```bash
npx vercel
```

### Option B: Git Integration
1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Deploy

### Vercel Environment Variables
Add these in Vercel Dashboard > Settings > Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (set to your Vercel domain)

---

## 9. Custom Domain

This repository is served by the Vercel project **`yoga-of-intelligence`**
(team `pauls-projects-c3c57110`), which holds the apex domain
**`yogaofintelligence.com`**.

`qualiavibe.yogaofintelligence.com` belongs to a *different* Vercel project
(`idealconnection`, built from `Palaka108/QualiaVibe`) and is not this app.
An earlier version of this guide named it here in error.

1. Confirm the domain under Vercel > the project > Settings > Domains
2. DNS CNAME points to `cname.vercel-dns.com`
3. Keep `NEXT_PUBLIC_SITE_URL` equal to that domain, with no trailing slash
4. Add the domain to GCP OAuth Authorized JavaScript Origins

---

## 10. Add Background Audio

Place your Gita 3.27 audio file at:
```
public/audio/gita-3-27.mp3
```

Place hero intro video at:
```
public/videos/intro-splash.mp4
```

---

## Architecture Overview

```
yoga-of-intelligence/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Sacred geometry splash
│   │   ├── layout.tsx                  # Root layout + fonts
│   │   ├── globals.css                 # Tailwind + sacred theme
│   │   ├── (auth)/login/              # Auth flow
│   │   ├── (portal)/                  # Authenticated routes
│   │   │   ├── dashboard/             # User dashboard
│   │   │   ├── module/[moduleId]/     # Module + sequences
│   │   │   └── profile/              # User profile
│   │   ├── (admin)/admin/            # Instructor panel
│   │   │   ├── dashboard/            # Submissions overview
│   │   │   └── submissions/[userId]/ # Response upload
│   │   └── api/                      # API routes
│   │       ├── auth/callback/        # OAuth callback
│   │       ├── admin/unlock/         # Server-side unlock
│   │       └── upload/              # Video upload
│   ├── components/
│   │   ├── geometry/                 # Three.js sacred geometry
│   │   ├── module/                   # Sequence cards, uploader
│   │   └── layout/                   # Navigation
│   ├── hooks/                        # useUser, useModuleProgress
│   ├── stores/                       # Zustand (audio, progress)
│   ├── lib/                          # Supabase clients, utils, knowledge-hub
│   └── types/                        # TypeScript types
├── supabase/
│   ├── migrations/                   # SQL schema
│   └── functions/                    # Edge Functions
├── middleware.ts                     # Auth + route protection
└── DEPLOY.md                        # This file
```

---

## 11. Campaign landing page — `/redemption`

A public, statically-rendered event page for **REDEMPTION** (Tue 22 Sep 2026,
Brooklyn). It lives in the `(campaign)` route group and shares nothing visually
with the portal: its palette, fonts and CSS are scoped to that group, so the
`sacred` theme is untouched.

### Routes

| Route | Notes |
|---|---|
| `/redemption` | The landing page. Static, ~95 kB first load. |
| `/redemption/thanks` | Post-RSVP confirmation. `noindex`. |
| `/api/redemption/rsvp` | `POST` — validates and stores an RSVP. |
| `/api/redemption/autosave` | `POST` — stores partially-filled forms. |
| `/api/redemption/ics` | `GET` — `redemption.ics` calendar file. |
| `/api/redemption/export` | `GET` — CSV export (token-guarded). |

`middleware.ts` skips `/redemption` entirely, so the page never pays for a
Supabase auth round-trip and is never caught by portal gating.

### Database

Run `supabase/migrations/003_yoi_rsvps.sql` and `004_yoi_rsvp_drafts.sql`.

- `yoi_rsvps` — confirmed registrations, one row per person per event.
- `yoi_rsvp_drafts` — forms autosaved while being filled in. A draft whose
  `converted_at` is null is someone who left contact details and did not
  finish.

Both have RLS enabled with **no policies**: they are unreadable with the anon
key, and only the server-side route handlers (service-role) write to them.

### Environment variables

Already present, reused as-is:

- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` — must be set **at build time**; it is baked into the
  OpenGraph URLs and the `.ics` file.

New, all optional — the page works without them:

- `NEXT_PUBLIC_META_PIXEL_ID` — when absent, no pixel code is emitted at all.
  Set it and redeploy to switch tracking on.
- `RSVP_EXPORT_TOKEN` — required for the CSV export route; without it the
  route refuses rather than defaulting to open.

### Exporting the RSVP list

```bash
# confirmed registrations
curl -O -J "https://<domain>/api/redemption/export?token=$RSVP_EXPORT_TOKEN"

# people who started the form and did not finish
curl -O -J "https://<domain>/api/redemption/export?token=$RSVP_EXPORT_TOKEN&type=partial"
```

Or query `yoi_rsvps` directly in the Supabase SQL editor.

### Meta Pixel

`PageView` fires on load. The standard **`Lead`** event fires **only** after
the RSVP endpoint returns a success — never on page view and never on a button
click. Each submission carries an `eventID` stored on the row, so adding the
server-side Conversions API later will deduplicate correctly against the
browser event.

### Still to supply

- Host portrait and biography (section 09 renders labelled placeholders).

### Google Ads / GA4 conversion tracking

No Google tag existed before this. `GoogleTag` (in the campaign layout) loads
`gtag.js` only when at least one of these is set, so the page emits nothing
until you configure it:

| Variable | Example | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | `G-XXXXXXXXXX` | GA4 property. Enables the `emancipation_rsvp` event. |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | `AW-XXXXXXXXX` | Google Ads conversion ID. |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | e.g. `abcDEfGhIjk` | Label from the Google Ads conversion action. Required alongside the Ads ID. |

All are `NEXT_PUBLIC_` and read at build time — set them in Vercel and
redeploy for them to take effect.

**How the conversion fires.** On a confirmed 200 from `/api/redemption/rsvp`,
the form writes a short-lived marker to `sessionStorage`. The thank-you page
reads that marker exactly once, clears it, and then fires:

- GA4: `emancipation_rsvp` with the RSVP's `event_id`
- Google Ads: `conversion` to `AW-…/LABEL` with `transaction_id` set to the
  same id, so Google can deduplicate

Because the marker is consumed on read and expires after 15 minutes, a direct
visit, a refresh, a bookmark or a crawler on `/redemption/thanks` counts
nothing. Page views, CTA clicks, form starts and validation errors never
count.

The same `event_id` is used for the Meta `Lead` event and stored on the row in
`yoi_rsvps.meta_event_id`, so one registration can be reconciled across Google,
Meta and the database.
