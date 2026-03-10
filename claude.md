# Pulse Pro — Project Guide

## What Is This
Pulse Pro is a SaaS project management app for freelancers and small agencies. Built with Next.js App Router, Prisma, Clerk auth, and Polar billing. Deployed on Vercel.

**Live URL:** pulsepro.work
**Owner:** Fonz (Fonz@PulsePro.org)

---

## Tech Stack
- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Clerk (middleware-based, `forceRedirectUrl` on sign-in/sign-up)
- **Billing:** Polar (webhooks for subscription sync)
- **Storage:** Vercel Blob (images, files)
- **Deployment:** Vercel (auto-deploy from main branch)
- **Analytics:** @vercel/analytics + @vercel/speed-insights

---

## Project Structure

### App Routes (`src/app/`)
| Route | Description |
|-------|-------------|
| `/` | Marketing landing page (public) |
| `/dashboard` | Main dashboard with activity rings, insights, DnD grid |
| `/projects`, `/projects/[id]` | Project list and detail (tabs: tasks, bookmarks, time, files, team) |
| `/tasks`, `/tasks/[id]` | Task list and detail |
| `/clients`, `/clients/[id]` | Client list and detail |
| `/bookmarks` | Bookmark list |
| `/invoices`, `/invoice/[id]` | Invoice list, detail, and public share view |
| `/calendar` | Calendar view |
| `/settings` | Settings page (billing, email-to-task, API, Telegram) |
| `/admin`, `/admin/users` | Admin dashboard and user management |
| `/kb` | Knowledge base (dual layout: marketing for public, clean for auth) |
| `/maintenance` | Maintenance mode page |
| `/suspended` | Account suspended page |
| `/login`, `/sign-in`, `/sign-up` | Auth pages |
| `/about`, `/contact`, `/privacy`, `/terms` | Legal/marketing pages |

### Server Actions (`src/actions/`)
| File | Handles |
|------|---------|
| `tasks.ts` | CRUD tasks, comments, images, files, tags, bulk ops, getTaskComments |
| `projects.ts` | CRUD projects, time entries, images, getProject (uses `_count` for comments) |
| `clients.ts` | CRUD clients |
| `invoices.ts` | CRUD invoices, line items, send email, share tokens (crypto-random) |
| `search.ts` | Global search across projects, tasks, clients, bookmarks |
| `dashboard.ts` | Dashboard stats, overdue tasks, project health, smart insights |
| `access.ts` | Collaboration: project access, roles, org members |
| `integrations.ts` | API token generation (SHA-256 hashed), email token |
| `telegram.ts` | Telegram link/unlink, reminders toggle |
| `admin.ts` | User management: plan changes, suspend, wipe, delete, maintenance mode |
| `subscription.ts` | Plan management, usage checking |
| `board.ts` | Kanban board task reordering |

### API Routes (`src/app/api/`)
| Route | Description |
|-------|-------------|
| `v1/tasks` | REST API (POST create, GET list) — Bearer token auth with SHA-256 hash lookup |
| `webhook/polar` | Polar subscription webhooks |
| `webhook/telegram` | Telegram bot webhook |
| `webhook/email` | Email-to-task inbound webhook |
| `webhook/clerk` | Clerk auth webhooks |
| `cron/` | Daily reminder cron job |
| `admin/` | Admin API routes |
| `insights/` | AI insights generation |
| `upload/` | File/image upload to Vercel Blob |

### Key Libraries (`src/lib/`)
| File | Purpose |
|------|---------|
| `auth.ts` | `requireUserId()`, `isAdminUser()`, `getOrgId()` |
| `prisma.ts` | Prisma client singleton |
| `subscription.ts` | `PLAN_LIMITS`, `checkLimit()`, `getUserSubscription()` (auto-creates Pro for admins) |
| `access.ts` | Role hierarchy (viewer < editor < manager < owner), project access checks |
| `voice.ts` | `parseTaskFromVoice`, `parseClientFromVoice`, `parseProjectFromVoice` |
| `utils.ts` | Date formatting, status/priority colors and labels |
| `email.ts` | Email sending (Resend) |
| `ai.ts` / `ai-insights.ts` | AI-powered smart insights |
| `telegram.ts` / `telegram-commands.ts` / `telegram-executor.ts` | Telegram bot logic |

### Key Components (`src/components/`)
- `LayoutWrapper.tsx` — Main layout: sidebar, auth guard, suspension/maintenance checks
- `AuthGuard.tsx` — Redirects unauthenticated users (has public paths list)
- `Sidebar.tsx` / `SidebarAuth.tsx` — Navigation sidebar
- `CommandBar.tsx` — Cmd+K command bar (search + quick actions)
- `QuickAdd.tsx` — N key quick-add overlay
- `OnboardingOverlay.tsx` — First-time user onboarding (4 steps)
- `DashboardLayout.tsx` — Dashboard DnD grid with @dnd-kit (drag-to-reorder sections)
- `DashboardCalendar.tsx` — Mini calendar widget
- `InsightsPanelWithAI.tsx` — AI-powered insights (Pro feature)

---

## Critical Patterns

### Admin System
- Admin users set via `ADMIN_USER_IDS` env var (comma-separated Clerk user IDs)
- `getUserSubscription()` auto-creates a Pro Subscription record for admins
- DO NOT scatter `isAdminUser()` checks — the DB subscription record handles gating
- Admin panel at `/admin` and `/admin/users` with full user management

### Public Routes (3 places to register)
1. `src/middleware.ts` — `isPublicRoute` matcher + `bypassPaths` array
2. `src/components/LayoutWrapper.tsx` — `isMarketingPage` check
3. `src/components/AuthGuard.tsx` — `publicPaths` array

### Subscription Plans
- **Free:** 3 projects, 50 tasks, 1 client, no integrations
- **Pro ($12/mo):** Unlimited + 3 collaborators/project + all integrations
- **Team ($29/mo):** Unlimited + 10 collaborators/project
- Limits enforced via `checkLimit()` in `src/lib/subscription.ts`

### Security Measures
- API tokens stored as SHA-256 hashes (legacy plain-text auto-migrates on first use)
- Invoice share tokens: `crypto.randomBytes(16).toString('hex')`
- Telegram verification: `crypto.randomBytes(4)` with 10-minute expiry
- CSP header configured in `next.config.ts` (Clerk, Vercel Blob, YouTube, Cloudflare, Polar)
- Permissions-Policy: `microphone=(self)` for voice input
- Task comment validation: required, max 5000 chars
- All server actions validate ownership before mutations

### Performance Optimizations
- TaskBoard (@dnd-kit ~50KB) lazy-loaded via `next/dynamic` in ProjectTabs
- Team member queries parallelized with `Promise.all` on project detail
- `getProject()` uses `_count` for comments — full comments fetched on demand via `getTaskComments()`
- `force-dynamic` on data-fetching pages (required for Clerk auth)

---

## Design Standards

### Typography
- Primary font: Inter (fallback: -apple-system, system-ui)
- NEVER use: Roboto, Open Sans, or generic Google Fonts defaults
- Use semantic font scaling (not arbitrary pixel values)

### Visual Design - CRITICAL
- NO AI gradient designs (rainbow fades, purple-blue-pink blends)
- NO "vibe coded" aesthetics - nothing generic or amateur-looking
- All design choices must be intentional and purposeful
- Favor clean, professional layouts over trendy effects

### Anti-Patterns to Avoid
- Generic hero sections with gradient backgrounds
- Overused glassmorphism or blur effects
- Random decorative elements without function
- Cookie-cutter SaaS landing page aesthetics

### When Creating UI
- Ask about brand colors/style before defaulting
- Prioritize clarity, hierarchy, and whitespace
- Use a defined, limited color palette
- Every element should have a clear purpose

---

## Deployment

### Vercel Setup
- Auto-deploys from `main` branch
- TypeScript build errors prevent deployment SILENTLY (Vercel serves old version)
- Always run `npx tsc --noEmit` before merging
- `gh pr merge` throws local worktree error but merge succeeds — verify with `gh pr view <num> --json state,mergedAt`

### Environment Variables (Vercel)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — Clerk auth
- `DATABASE_URL` — PostgreSQL connection string
- `ADMIN_USER_IDS` — Comma-separated Clerk user IDs for admin access
- `POLAR_ACCESS_TOKEN` / `POLAR_WEBHOOK_SECRET` — Polar billing
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_USERNAME` / `TELEGRAM_WEBHOOK_SECRET` — Telegram bot
- `RESEND_API_KEY` — Email sending
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob storage
- `REMINDER_USER_ID` — Cron job reminder target
- `ANTHROPIC_API_KEY` — AI insights

---

## Workflow Rules
- **NEVER push directly to production without verifying TypeScript compiles**
- Always run `npx tsc --noEmit` before creating PRs
- Branch naming: `youngfonz/<feature-name>`
- PR workflow: create branch -> commit -> push -> create PR -> merge to main
