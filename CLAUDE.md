@AGENTS.md

# CLAUDE.md — Vertex Sky

SEO monitoring & task system, public-facing at vertexsky.com. Marketing homepage is public; everything else lives behind login, single user (suntaodung@gmail.com via `ALLOWED_EMAIL` gate). Manual data entry for now — Phase 2 will swap in GSC/GA4 API automation; Phase 3 adds DataForSEO; client-scoped multi-user access is a later phase if ever needed (not built — single-user gate only).

## Stack
- Next.js 16.3, App Router, TypeScript
- Tailwind CSS v4 (no shadcn — plain Tailwind utility classes in `components/ui.tsx`)
- Prisma 7.9 + `@prisma/adapter-pg` + Neon Postgres — **no SQLite**, `DATABASE_URL` must be a real Postgres connection string even for local dev (schema provider is `postgresql`, matches [[project_vertex_invest]] / [[project_vertexlaunch]])
- Auth.js v5 (`next-auth@beta`) + Resend magic-link email + `@auth/prisma-adapter`, JWT sessions — mirrors the vertexlaunch pattern, see [[project_vertexlaunch]]

## Deployment
- GitHub: `github.com/suntao-hub/vertex-sky` (public, `main` branch) — pushed 2026-08-09
- Vercel: **not yet imported** — Claude's browser tooling is policy-blocked from vercel.com, so Suntao has to do the import himself (see chat for the step-by-step: import the repo, add a Neon Postgres storage integration for `DATABASE_URL`, set `AUTH_SECRET`/`ALLOWED_EMAIL`/`RESEND_API_KEY`/`RESEND_FROM`, then point vertexsky.com's DNS at Vercel)
- No migrations checked in — schema is applied via `npx prisma db push` (run once against the real `DATABASE_URL` before first deploy, matching vertexlaunch's actual workflow; migration drift isn't a concern yet since there's no production data)
- `postinstall: prisma generate` in package.json so Vercel's build always regenerates the gitignored client

## Key paths
- App root: `C:\Users\sunta\vertex-sky\`
- Prisma schema: `prisma/schema.prisma` — includes Auth.js adapter models (`User`/`Account`/`Session`/`VerificationToken`)
- Generated client: `app/generated/prisma/` (gitignored, run `npx prisma generate`)
- DB singleton: `lib/db/client.ts`
- Auth config: `lib/auth.config.ts` (callbacks, `ALLOWED_EMAIL` gate, pages) + `lib/auth.ts` (providers + adapter) — same split as vertexlaunch
- Auth API route: `app/api/auth/[...nextauth]/route.ts`
- Shared enums/labels: `lib/constants.ts` — client-understandable labels even though internal-only, per original brief
- Finding→Task helper: `lib/db/findings.ts` (`maybeCreateFinding`) — called from monitoring-entry server actions when the "flag as issue" checkbox is checked
- Shared UI primitives: `components/ui.tsx`, `components/task-flag-fieldset.tsx`, `components/task-board.tsx`

## Data model
Site registry (`Site`) is the root. Six monitoring categories hang off it: `TechnicalAudit`/`SchemaMarkup`, `Keyword`/`RankingEntry`, `ContentItem`, `AuthorityEntry`, `AiVisibilityEntry`, `TrafficSnapshot`. `Finding` captures an issue surfaced from any of those (via `sourceType`/`sourceId`); `Task` optionally links back to the `Finding` that generated it. Task categories are only `technical | content | authority | ai_visibility` (no dedicated category for rankings/traffic — matches the brief). None of these are scoped by `userId` — single-user via the auth gate, not per-row ownership.

## Routes
- `/` — public marketing homepage
- `/sign-in`, `/sign-in/verify` — public, magic-link email sign-in
- Everything else lives under `app/(app)/` and is protected by `app/(app)/layout.tsx` (checks `auth()`, redirects to `/sign-in` if no session):
  - `/sites` — site registry (list + add)
  - `/sites/[siteId]` — overview tiles + open tasks
  - `/sites/[siteId]/{technical,rankings,content,authority,ai-visibility,traffic}` — manual entry forms + history
  - `/sites/[siteId]/tasks` — per-site task board
  - `/tasks` — cross-site task board (primary daily-use view)

## Env vars needed for auth
- `AUTH_SECRET` — random secret, `.env` has a dev-only value, generate a fresh one for production
- `ALLOWED_EMAIL` — the single email allowed to sign in (`suntaodung@gmail.com`)
- `RESEND_API_KEY` — real Resend API key required to actually send magic-link emails; without one, sign-in fails gracefully with `?error=Configuration` (verified in dev)
- `RESEND_FROM` — sender address, must be on a domain verified in Resend. Set to `Vertex Sky <noreply@vertexlaunch.com>`, reusing vertexlaunch.com's already-verified domain on the same Resend account — Resend's free tier only allows one verified domain per account, and vertexlaunch.com was already using the slot. Only Suntao ever sees this email (single-user magic link), so the mismatched sender domain is cosmetic, not a real problem.

## Rules
1. Next.js 16 breaking changes apply — `params`/`searchParams` are async, `middleware.ts` → `proxy.ts` if added later. Check `node_modules/next/dist/docs/` before assuming Next 15-era APIs.
2. Keep field labels client-understandable (see `lib/constants.ts`) — opening this to clients later is a permissions change, not a redesign.
3. When adding a new monitoring-entry form that represents an actionable issue, wire up `TaskFlagFieldset` + `maybeCreateFinding` rather than a bespoke task-creation path.
4. New protected routes go under `app/(app)/`, not at the app root — the root is public (marketing + sign-in only).
