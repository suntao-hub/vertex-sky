@AGENTS.md

# CLAUDE.md — Vertex Sky

SEO monitoring & task system, public-facing at vertexsky.com. Marketing homepage is public; everything else lives behind login, single user (suntaodung@gmail.com via `ALLOWED_EMAIL` gate). Original brief was Phase 1 manual entry only; the actual goal (per Suntao, 2026-08-09) is broader — a system covering keyword research, internal + external content creation, distribution, and monitoring, for every site he manages. Monitoring is done; AI-assisted keyword research and AI content drafting are the first two research/creation pieces built (see below). External distribution automation is not built yet (only the manual "Log distribution" shortcut from Content → Authority exists). Phase 2 (GSC/GA4 API automation) and Phase 3 (DataForSEO) from the original brief are still just planned.

## Stack
- Next.js 16.3, App Router, TypeScript
- Tailwind CSS v4 (no shadcn — plain Tailwind utility classes in `components/ui.tsx`)
- Prisma 7.9 + `@prisma/adapter-pg` + Neon Postgres — **no SQLite**, `DATABASE_URL` must be a real Postgres connection string even for local dev (schema provider is `postgresql`, matches [[project_vertex_invest]] / [[project_vertexlaunch]])
- Auth.js v5 (`next-auth@beta`) + Resend magic-link email + `@auth/prisma-adapter`, JWT sessions — mirrors the vertexlaunch pattern, see [[project_vertexlaunch]]

## Deployment
- GitHub: `github.com/suntao-hub/vertex-sky` (public, `main` branch), connected to Vercel — push to `main` auto-deploys
- Live at `vertexsky.com` (redirects to `www.vertexsky.com`) and `vertex-sky.vercel.app`. DNS auto-configured the moment the domain was added in Vercel — no manual A/CNAME entry was needed for this domain.
- Neon Postgres provisioned via Vercel's Storage tab, env-var prefix set to `DATABASE` so it's `DATABASE_URL` (default prefix is `STORAGE`, which would silently break the app if left as-is)
- Auth fully verified working end-to-end in production as of 2026-08-09 (real sign-in, real magic-link email received and clicked)
- No migrations checked in — schema is applied via `npx prisma db push` (matching vertexlaunch's actual workflow; migration drift isn't a concern yet since there's no production data)
- `postinstall: prisma generate` in package.json so Vercel's build always regenerates the gitignored client
- Claude's browser tooling (both `mcp__Claude_Browser` and `mcp__claude-in-chrome`) is policy-blocked from vercel.com and resend.com — any future dashboard work on either needs Suntao to drive while Claude guides step-by-step from the deployment/runtime logs. `mcp__Claude_Browser` (but not `mcp__claude-in-chrome`) can reach the deployed `*.vercel.app` app itself, just not the Vercel dashboard.

## Known gotcha: Auth.js Resend provider needs `apiKey` passed explicitly
Auth.js only auto-populates `provider.apiKey` from an env var named `AUTH_RESEND_KEY` (see `@auth/core/lib/utils/env.js`), not `RESEND_API_KEY`. `lib/auth.ts` passes `apiKey: process.env.RESEND_API_KEY` explicitly to the `Resend()` provider config to work around this — **don't remove that line**, or every send silently goes out as `Authorization: Bearer undefined` and fails with a misleading "API key is invalid" error that looks identical to an actually-bad key. This cost a long debugging session (regenerating the key twice, verifying it worked via direct curl against Resend's API, before finding the real cause in the provider source). If this pattern gets reused in another project's Auth.js + Resend setup, check for this exact same class of bug first.

## Key paths
- App root: `C:\Users\sunta\vertex-sky\`
- Prisma schema: `prisma/schema.prisma` — includes Auth.js adapter models (`User`/`Account`/`Session`/`VerificationToken`)
- Generated client: `app/generated/prisma/` (gitignored, run `npx prisma generate`)
- DB singleton: `lib/db/client.ts`
- Auth config: `lib/auth.config.ts` (callbacks, `ALLOWED_EMAIL` gate, pages) + `lib/auth.ts` (providers + adapter) — same split as vertexlaunch
- Auth API route: `app/api/auth/[...nextauth]/route.ts`
- Freshness/completeness helper: `lib/db/site-status.ts` (`getSiteStatusMap`) — computes missing/stale/ok per category per site in a fixed number of batched queries (not one query per site), used by both the per-site "Getting started" checklist and the `/sites` list's "N need attention" badge. `STALE_DAYS` (currently 30) is the single knob for the staleness window. Content Pipeline has no staleness concept (missing/ok only) — the other five categories do, keyed off their most recent date field. Rankings staleness is based on the latest `RankingEntry.date` via a raw SQL join (no direct `siteId` on that model), not `Keyword.createdAt`.
- Shared enums/labels: `lib/constants.ts` — client-understandable labels even though internal-only, per original brief
- Finding→Task helper: `lib/db/findings.ts` (`maybeCreateFinding`) — called from monitoring-entry server actions when the "flag as issue" checkbox is checked
- Shared UI primitives: `components/ui.tsx`, `components/task-flag-fieldset.tsx`, `components/task-board.tsx` (client component — supports drag-and-drop between status columns in addition to a select-and-save fallback), `components/ui.tsx`'s `HintBox` (the "where to find this, free" tip boxes on every monitoring form — added because the tool read as a pure data-entry shell to anyone who didn't already know SEO methodology; every form should have one pointing at a free source: Search Console, GA4, PageSpeed Insights, Rich Results Test)
- AI keyword research: `lib/ai/anthropic.ts` (client singleton, needs `ANTHROPIC_API_KEY`) + `lib/ai/keyword-research.ts` (`suggestKeywords` — prompts Claude for 15 buyer-intent keywords bucketed as competitor/problem/category_fit, given site context + a seed topic). Wired into the Rankings page via `components/keyword-research-panel.tsx` (client component, calls the `suggestKeywordsForSite`/`addSuggestedKeyword` server actions directly rather than through a form). `Keyword.bucket` stores which bucket a tracked keyword came from (nullable — manual entries can skip it).
- AI content drafting: `lib/ai/content-draft.ts` (`generateContentDraft` — format-aware prompt per `ContentItem.format`, same AEO formatting rules as keyword research: question headings, answer-first, self-contained paragraphs, comparison tables where the format calls for one, placeholders instead of invented facts). New route `app/(app)/sites/[siteId]/content/[itemId]/page.tsx` is the draft editor (`components/content-draft-editor.tsx`, client component) — click a content item's title from the pipeline list to reach it. Draft persists to `ContentItem.draftContent`; regenerating confirms before overwriting unsaved text.
- AI distribution posts: `lib/ai/distribution-draft.ts` (`generateDistributionPosts` — LinkedIn + X/Twitter post copy for a content item) + `components/distribution-posts-panel.tsx`, also on the content item detail page. Copy-paste only — no auto-publish integration (that needs a paid service like Blotato with its own account, deliberately not wired in without that decision being made explicitly). Links into the existing `?prefill=` Log-distribution flow on the Authority page once posted.

## Data model
Site registry (`Site`) is the root. Six monitoring categories hang off it: `TechnicalAudit`/`SchemaMarkup`, `Keyword`/`RankingEntry`, `ContentItem`, `AuthorityEntry`, `AiVisibilityEntry`, `TrafficSnapshot`. `Finding` captures an issue surfaced from any of those (via `sourceType`/`sourceId`); `Task` optionally links back to the `Finding` that generated it. Task categories are only `technical | content | authority | ai_visibility` (no dedicated category for rankings/traffic — matches the brief). None of these are scoped by `userId` — single-user via the auth gate, not per-row ownership.

## Routes
- `/` — public marketing homepage
- `/sign-in`, `/sign-in/verify` — public, magic-link email sign-in
- Everything else lives under `app/(app)/` and is protected by `app/(app)/layout.tsx` (checks `auth()`, redirects to `/sign-in` if no session):
  - `/sites` — site registry (list + add)
  - `/sites/[siteId]` — overview tiles + open tasks
  - `/sites/[siteId]/{technical,rankings,content,authority,ai-visibility,traffic}` — manual entry forms + history (rankings also has the AI keyword-research panel)
  - `/sites/[siteId]/content/[itemId]` — AI content draft editor for one content item
  - `/sites/[siteId]/tasks` — per-site task board
  - `/tasks` — cross-site task board (primary daily-use view)

## Env vars needed for auth
- `AUTH_SECRET` — random secret, `.env` has a dev-only value, generate a fresh one for production
- `ALLOWED_EMAIL` — the single email allowed to sign in (`suntaodung@gmail.com`)
- `RESEND_API_KEY` — real Resend API key required to actually send magic-link emails; without one, sign-in fails gracefully with `?error=Configuration` (verified in dev)
- `RESEND_FROM` — sender address, must be on a domain verified in Resend. Set to `Vertex Sky <noreply@vertexlaunch.com>`, reusing vertexlaunch.com's already-verified domain on the same Resend account — Resend's free tier only allows one verified domain per account, and vertexlaunch.com was already using the slot. Only Suntao ever sees this email (single-user magic link), so the mismatched sender domain is cosmetic, not a real problem.
- `ANTHROPIC_API_KEY` — powers keyword-research suggestions (Rankings page) and content draft generation (content item detail page). Without it, those actions error rather than silently failing — the SDK throws on missing auth. Set in both `.env` and Vercel as of 2026-08-09.

## Rules
1. Next.js 16 breaking changes apply — `params`/`searchParams` are async, `middleware.ts` → `proxy.ts` if added later. Check `node_modules/next/dist/docs/` before assuming Next 15-era APIs.
2. Keep field labels client-understandable (see `lib/constants.ts`) — opening this to clients later is a permissions change, not a redesign.
3. When adding a new monitoring-entry form that represents an actionable issue, wire up `TaskFlagFieldset` + `maybeCreateFinding` rather than a bespoke task-creation path.
4. New protected routes go under `app/(app)/`, not at the app root — the root is public (marketing + sign-in only).
