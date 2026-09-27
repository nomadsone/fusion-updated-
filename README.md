<div align="center">

# FusionClaw

### All hustle. No luck. One database.

**The business-data layer for an agent runtime.** Your agent already runs your machine; this is how it reads and writes your business — customers, jobs, invoices, expenses and notes — over MCP, on one Postgres you own.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle)](https://orm.drizzle.team)
[![Neon](https://img.shields.io/badge/Neon-Lakebase%20Postgres-00E599?logo=neon)](https://neon.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Maintained by **Palawan Collective** — a digital agency.

</div>

---

## Tech Stack

### Core

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | **Next.js** (App Router, Turbopack) | 16.2.0 |
| UI | **React** | 19.2.4 |
| Language | **TypeScript** — `strict: true`, `moduleResolution: bundler` | 5.x |
| Styling | **Tailwind CSS** via `@tailwindcss/postcss` | v4 |
| Runtime | Node.js — CI and Docker use **22**; Next 16 itself requires ≥ 20.9.0 | 22 |
| Path alias | `@/*` → repo root (`tsconfig.json` `paths`) | — |

### Data

| Layer | Technology | Notes |
| --- | --- | --- |
| Database | **PostgreSQL 18** on **Neon (Lakebase)** | region `aws-ap-southeast-1` |
| ORM | **Drizzle ORM** 0.45.1 + **drizzle-kit** 0.31.10 | schema: `lib/db/schema.ts` (49 tables) |
| Driver | **`@neondatabase/serverless`** 1.0.2 — `neon()` HTTP driver | pooled `-pooler` host |
| Migrations | SQL migrations in `drizzle/` | **push-based**: `npm run db:push` (no `migrate` script) |
| Config | `drizzle.config.ts` reads `DATABASE_URL` from `.env.local` | `dialect: "postgresql"` |
| Infra-as-code | **`neon.ts`** (`@neon/config`) + `.neon` project link | `neon deploy` |

### App & API

| Layer | Technology |
| --- | --- |
| Auth / sessions | Custom JWT sessions signed with **`jose`** — `fc_session` cookie, 30-day TTL, roles `admin` \| `employee`. Guarded by `middleware.ts` and `lib/auth.ts` |
| Validation | **Zod** 4.x (`lib/validations/`) |
| Data reading | Server Components query Drizzle directly (no client cache layer) |
| Server mutations | Next.js **Server Actions** — 14 modules in `lib/actions/` |
| Client data | `fetch()` against the REST API, with SSE streaming for chat / skill runs |
| API surface | **112 REST route handlers** under `app/api/` |
| Background jobs | `app/api/cron/` + `cron-jobs` module |

> **Note:** `@tanstack/react-query`, `react-hook-form` and `resend` are present in `package.json` but **not imported anywhere** — they are unused dependencies, not active parts of the stack.

### UI

| Concern | Libraries |
| --- | --- |
| Primitives | Radix UI (dialog, dropdown, popover, select, tabs, tooltip, switch, checkbox, scroll-area, separator, label) |
| Styling utils | `class-variance-authority`, `clsx`, `tailwind-merge` |
| Icons | `lucide-react` |
| Animation | `framer-motion`, custom `elite/motion/` kit |
| Tables | `@tanstack/react-table`, `@tanstack/react-virtual`, `@hello-pangea/dnd` |
| Charts | `recharts` |
| Notifications | `sonner` |
| Markdown | `marked`, `dompurify`, `mammoth` (docx), `pdf-parse` |
| Files | `file-type`, `papaparse` (CSV) |

### Integrations

| Service | Package | Purpose |
| --- | --- | --- |
| OpenRouter | — | Skills, council, reflection loop, chat, humanizer |
| OpenAI | — | `/voice` (Realtime API), whisper transcription |
| fal.ai | `@fal-ai/client` | Image generation |
| Google Workspace | `googleapis` | Gmail, Calendar, Contacts |
| Resend | `resend` | ⚠️ installed but **never imported** — email not wired up |
| Vercel Blob | `@vercel/blob` | Studio file uploads |
| WordPress | custom (`lib/wordpress/`) | Publishing target |
| upload-post | `upload-post` | Social publishing |

### Agent Layer (MCP)

A standalone **MCP server** lives in `mcp-server/` (own `package.json`, built with `npm run mcp:build`). It exposes the database to AI agents over MCP with per-agent scoped API keys, a confirmation gate on destructive calls, rate limits, and an audit log.

### Quality & Delivery

| Concern | Tooling |
| --- | --- |
| Linting | **ESLint 9** flat config (`eslint.config.mjs`), `next/core-web-vitals` |
| E2E testing | **Playwright** (Chromium) — `tests/e2e/`, `tests/api/` |
| CI | GitHub Actions (`.github/workflows/ci.yml`) — build/typecheck + lint on Node 22 |
| Container | Multi-stage `Dockerfile` (`node:22-alpine`) |
| Local stack | `docker-compose.yml` — app + `postgres:16-alpine` |
| Deploy | Vercel (first-class) or Docker |
| Secrets | `.env.local` (gitignored); `.env.local.example` is the template |

---

## Code Tree

```
fusion-updated-/
├── app/                          Next.js App Router — 162 files, 39 pages, 112 API routes
│   ├── (app)/                    Authenticated app shell (41 files)
│   │   ├── activity/  agents/  ai-queue/  api-docs/  audit/
│   │   ├── branding/  calendar/  campaigns/  chat/  cron-jobs/
│   │   ├── dashboard/  employees/  expenses/  financials/  gallery/
│   │   ├── inbox/  invoices/  knowledge-base/  leads/  marketplace/
│   │   ├── onboarding/  publishing/  reports/  settings/  skills/
│   │   ├── studio/  tasks/  today/  voice/  webhooks/  wiki/  workflows/
│   │   ├── app-shell.tsx  layout.tsx  error.tsx  loading.tsx
│   ├── (auth)/                   Login / signup (Clerk-style catch-all routes)
│   │   ├── login/[[...login]]/   signup/[[...signup]]/   layout.tsx
│   ├── api/                      REST route handlers (112 route.ts files)
│   │   ├── auth/  activity/  ai-queue/  audit/  branding/  campaigns/
│   │   ├── chat/  cron/  dashboard/  employees/  expenses/  financials/
│   │   ├── google/ (8)  invoices/  knowledge-base/  leads/  marketplace/
│   │   ├── publishing/ (7)  reports/  shifts/  skills/ (10)  studio/ (5)
│   │   ├── vault/  views/  voice/  webhooks/  wiki/ (11)  workflows/
│   ├── embed/[token]/            Public embeddable view
│   ├── layout.tsx  page.tsx  error.tsx  globals.css  favicon.ico
├── components/                   React components — 73 files
│   ├── ui/ (25)                  Primitives: button, badge, input, select, CommandPalette,
│   │                             ReasoningTrace, EvalStudio, CouncilPanel, SkillOutput…
│   ├── chat/ (5)                 chat-container, chat-input, message-bubble, message-list
│   ├── leads/ (7)                PipelinePro, TanStackLeadsTable, ContactDetailDrawer
│   ├── studio/ (6)               studio-workspace, mask-painter, generation-controls
│   ├── mat-ops/ (8)  output/ (5)  sidebar/ (3)  onboarding/ (2)
│   ├── admin/  effects/  gallery/  google/  layout/  marketing/
│   ├── primitives/  vault/  wordpress/
├── lib/                          Business logic — 62 files
│   ├── db/ (9)                   index.ts (lazy neon client), schema.ts (49 pgTable),
│   │                             queries/ (brand-profiles, content, messages, projects…)
│   ├── actions/ (14)             Server Actions: leads, invoices, expenses, tasks…
│   ├── validations/ (5)          Zod schemas: campaigns, expenses, invoices, leads, tasks
│   ├── mat-ops/ (7)              auth, accountability, validators, report-generator
│   ├── openrouter/ (3)           prompts, humanizer-prompt, infographic-prompt
│   ├── wiki/ (3)  wordpress/ (3)  google/  images/  marketplace/  onboarding/
│   ├── auth.ts                   JWT session helpers (jose)
│   ├── crypto.ts  currency.ts  router.ts  toast.ts  utils.ts  webhooks.ts
├── mcp-server/                   Standalone MCP server (23 files, own package.json)
│   └── src/                      auth/api-key, db, security/ (audit, gate, ratelimit…),
│                                 tools/ (crud, query, ai, analytics, meta, system),
│                                 index.ts, server.ts
├── elite/                        Motion/design kit (17 files) — elite.css + motion/ (15 components)
├── hooks/                        use-chat.ts, use-toast.ts
├── drizzle/                      SQL migrations (5 files)
│   ├── 0000_rename-clerk-to-auth.sql   0001_spooky_oracle.sql
│   └── meta/  _journal.json, 0000/0001_snapshot.json
├── docs/                         Documentation (94 files)
│   ├── concepts/ (12)  modules/ (21)  reference/ (5)  security/ (7)
│   ├── integrations/ (7)  install/ (3)  start/ (3)  help/ (4)
│   ├── launch-content/ (11)  agent-protocols/ (5)  plugins/  snippets/
│   └── architecture.md  index.md  setup-guide.md  AGENTS.md…
├── tests/                        Playwright (9 files) — api/ (3), e2e/ (5), helpers.ts
├── scripts/                      onboard.ts, seed.ts, seed-wiki.ts, launch.sh…
├── public/                       Static assets (14 files)
├── .github/                      CI workflow, issue templates, PR template (5 files)
├── .claude/                      Agent skills — neon/, neon-postgres/ (13 files)
│
├── middleware.ts                 Route protection
├── neon.ts                       Neon infra-as-code policy (@neon/config)
├── drizzle.config.ts             Drizzle Kit config
├── next.config.ts                Security headers (CSP, X-Frame-Options…)
├── tsconfig.json  postcss.config.mjs  eslint.config.mjs
├── playwright.config.ts  package.json  package-lock.json
├── Dockerfile  docker-compose.yml  .dockerignore  setup.sh
├── .env.example  .env.local.example  .gitignore
└── AGENTS.md  README.md  CHANGELOG.md  CONTRIBUTING.md  SECURITY.md
    CODE_OF_CONDUCT.md  LICENSE  MODEL.md  ROADMAP.md  VISION.md  COMPS.md
```

---

## Getting Started

```bash
git clone https://github.com/nomadsone/fusion-updated-
cd fusion-updated-
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev                         # http://localhost:3000
```

Apply the database schema once the environment is configured:

```bash
npm run db:push                     # drizzle-kit push
```

### Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Neon Postgres connection string (use the `-pooler` host) |
| `SESSION_SECRET` | ✅ | Signs JWT session cookies (fallback chain: `SESSION_SECRET` → `MCP_API_KEY` → `OWNER_PASSWORD`) |
| `OWNER_PASSWORD` | ✅ in prod | Initial owner login — **503s without it on Vercel** |
| `OWNER_NAME`, `OWNER_EMAIL` | ✅ in prod | Seed owner profile |
| `MCP_API_KEY` | ✅ for MCP | Agent access key |
| `ENCRYPTION_KEY` | ✅ | 64-char hex AES-256-GCM key for the Settings vault |
| `WP_ENCRYPTION_KEY` | ✅ for WordPress | 64-char hex key for stored WP site credentials |
| `NEXT_PUBLIC_APP_URL` | ✅ | Canonical app URL |
| `OPENROUTER_API_KEY` | for AI features | Skills, council, chat, reflection loop |
| `OPENAI_API_KEY` | optional | `/voice` Realtime API + transcription |
| `FAL_KEY` | optional | Image generation |
| `RESEND_API_KEY` | optional | ⚠️ referenced by the integrations route only — `resend` is never imported |
| `BLOB_READ_WRITE_TOKEN` | optional | Studio file uploads |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Google Workspace integration |
| `WIKI_QUERY_MODEL`, `WIKI_INGEST_MODEL` | optional | Wiki Brain model override (default `anthropic/claude-sonnet-4`) |
| `NEXT_PUBLIC_DEMO_MODE` / `NEXT_PUBLIC_DEMO_URL` | optional | Read-only public demo mode |
| `NEXT_PUBLIC_HAS_OPENAI` | optional | Toggles OpenAI hints on `/voice` (build-time; never set by code) |

> `docs/reference/env-vars.md` is still a "coming soon" placeholder, so the table above is derived from the code. Sources: `.env.local.example`, `.env.example`, `scripts/onboard.ts`, `docker-compose.yml`, and `process.env` greps across `app/`, `lib/`, `middleware.ts` and `mcp-server/`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Drizzle schema to the database |
| `npm run db:seed` | Seed sample data |
| `npm run mcp:build` | Build the MCP server |
| `npm run onboard` | Interactive environment setup |
| `npm run key:rotate` | Rotate the MCP API key |

---

## Backend — Neon

The project is linked to a Neon project via `neon.ts` (infrastructure-as-code) and `.neon` (gitignored project context).

| | |
| --- | --- |
| Project | `gentle-silence-68289866` (`fusion-updated-`) |
| Branch | `production` (default) |
| Region | `aws-ap-southeast-1` (Singapore) |
| Engine | PostgreSQL 18 |
| Config | [`neon.ts`](neon.ts) — `@neon/config` policy |

```bash
neon status        # show the linked project + branch
neon config plan   # dry-run diff of neon.ts vs the live branch
neon deploy        # apply neon.ts and re-pull env into .env.local
```

---

## Documentation

- [`docs/index.md`](docs/index.md) — documentation home
- [`docs/architecture.md`](docs/architecture.md) — system design
- [`docs/reference/database-schema.md`](docs/reference/database-schema.md) — schema reference
- [`docs/reference/api-routes.md`](docs/reference/api-routes.md) — API reference
- [`docs/security/`](docs/security/) — auth, secrets, deployment hardening
- [`VISION.md`](VISION.md) · [`ROADMAP.md`](ROADMAP.md) · [`CONTRIBUTING.md`](CONTRIBUTING.md)

## License

MIT — see [LICENSE](LICENSE).
