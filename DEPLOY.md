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

After Vercel deployment:
1. Add custom domain in Vercel: `qualiavibe.yogaofintelligence.com`
2. Update DNS CNAME to point to `cname.vercel-dns.com`
3. Update `NEXT_PUBLIC_SITE_URL` to the custom domain
4. Add domain to GCP OAuth Authorized JavaScript Origins

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
