# Merqato.Digital profile

## Company information

**Merqato.Digital** is a creative technology studio based in Palawan.

**Positioning:** Local businesses. Distinct digital worlds.

**What we do:** Strategy · Design · Development · Automation

### Services

1. **Websites** — Distinct, responsive sites built around the way a business actually works.
2. **Digital systems** — Simple tools that bring content, customers, and daily work together.
3. **Automation** — Useful workflows that save time and keep people in control.

### Approach

**Made for real business.**

Good digital work should feel like it belongs to the business using it. Every business has its own rhythm. Merqato.Digital starts there, then makes something clear, useful, and unmistakably yours.

### Studio

Merqato.Digital is a small creative technology studio with a strong visual point of view and a practical approach to tools. We are rooted in Palawan and work with businesses anywhere.

### Contact

- **Email:** [david@palawancollective.com](mailto:david@palawancollective.com)
- **Web:** [merqato.digital](https://merqato.digital)

---

## Technology stack

The repository is an MIT-licensed Next.js application foundation that supports both a public studio profile and the digital systems work described above.

- **Frontend:** Next.js 16, React 19, TypeScript 5
- **Styling and interaction:** Tailwind CSS 4, Radix UI, Lucide React, Framer Motion
- **Data layer:** Drizzle ORM, Neon Serverless Postgres, Zod
- **Agent and automation layer:** MCP server, API routes, webhooks, workflows, cron jobs
- **Integrations:** Google APIs, Resend, Vercel Blob, Upload Post, fal.ai
- **Quality and delivery:** ESLint, Playwright, Docker, GitHub Actions
- **License:** MIT

## Code tree

```text
app/
├── page.tsx                    # public Merqato.Digital profile
├── globals.css                 # profile visual system and app styles
├── (app)/                      # authenticated/application experiences
│   ├── dashboard/              # command centre
│   ├── today/ tasks/ reports/  # work planning and reporting
│   ├── leads/ inbox/           # contacts, pipeline, correspondence
│   ├── invoices/ expenses/     # finance operations
│   ├── financials/             # financial reporting
│   ├── campaigns/ studio/      # marketing and content production
│   ├── gallery/ publishing/    # media and publishing workflows
│   ├── agents/ skills/         # agent connections and skills
│   ├── chat/ voice/            # assistant experiences
│   ├── workflows/ webhooks/    # automation and integrations
│   ├── wiki/ knowledge-base/   # business knowledge and memory
│   ├── cron-jobs/ audit/       # scheduling and traceability
│   └── settings/ api-docs/     # configuration and reference
├── api/                        # server-side application routes
components/                     # reusable UI, studio and output components
lib/                            # data access and integration helpers
drizzle/                        # schema and database configuration
mcp-server/                     # agent-ready business operations
scripts/                        # onboarding, seeding and setup utilities
tests/                          # API and end-to-end tests
public/                         # profile photography and public assets
```

### Capability map

The application foundation contains the building blocks for CRM and pipeline work, tasks and employee operations, invoices and expenses, content studio workflows, campaigns and publishing, AI queues, agent connections, knowledge management, webhooks, scheduled jobs, audit history, and reporting.

This is the technical layer behind the studio's promise: a digital presence can be beautiful on the surface and still be useful on an ordinary Tuesday.
