# Merqato.Digital

### Local businesses. Distinct digital worlds.

Merqato.Digital is a creative technology studio based in Palawan. We build thoughtful websites and digital systems for ambitious businesses — rooted in Palawan, made to work anywhere.

**Strategy · Design · Development · Automation**

[merqato.digital](https://merqato.digital) · [david@palawancollective.com](mailto:david@palawancollective.com)

This repository is MIT licensed. It contains the profile site and the reusable application foundation behind the studio's digital systems work.

---

## What we do

- **Websites** — distinct, responsive sites built around the way a business actually works.
- **Digital systems** — simple tools that bring content, customers, and daily work together.
- **Automation** — useful workflows that save time and keep people in control.

## The studio

Every business has its own rhythm. We start there, then make something clear, useful, and unmistakably yours.

Merqato.Digital pairs a strong visual point of view with practical tools that help local businesses grow on their own terms.

**Rooted in Palawan. Working everywhere.**

---

## Technology in this repository

The profile and application are built with a practical, open-source stack:

| Layer | Tools |
| --- | --- |
| Web | Next.js 16, React 19, TypeScript 5 |
| Interface | Tailwind CSS 4, Radix UI, Lucide, Framer Motion |
| Data | Drizzle ORM, Neon Serverless Postgres, Zod |
| Systems | MCP server, API routes, webhooks, workflows, cron jobs |
| Integrations | Google APIs, Resend, Vercel Blob, Upload Post, fal.ai |
| Quality | ESLint, Playwright, GitHub Actions, Docker |

The landing page also uses a small visual language of its own: editorial typography, Palawan-inspired photography, responsive layouts, and lightweight CSS motion that respects reduced-motion preferences.

## Code tree

```text
app/
├── page.tsx                 # Merqato.Digital profile / marketing site
├── globals.css              # studio visual system and responsive styles
├── (app)/                   # application routes and operating-system shell
│   ├── dashboard/           # command centre
│   ├── today/ tasks/        # daily work and accountability
│   ├── leads/ inbox/        # contacts, pipeline and correspondence
│   ├── invoices/ expenses/  # finance and financial reporting
│   ├── campaigns/ studio/   # content and marketing workflows
│   ├── agents/ skills/      # agent connections and reusable skills
│   ├── workflows/ webhooks/ # automation and integrations
│   ├── wiki/ knowledge-base/ # transparent business memory
│   └── settings/ audit/     # configuration and traceability
├── api/                     # server routes for app capabilities
components/                  # reusable UI, studio, output and system components
lib/                         # data access, integrations and service helpers
drizzle/                     # database schema and migrations
mcp-server/                  # agent-ready business operations
tests/                       # API and end-to-end coverage
public/                      # profile photography and public assets
```

### Application capabilities

The existing foundation brings together CRM and pipeline work, tasks and employee operations, invoices and expenses, content studio workflows, campaigns and publishing, AI queues, agent connections, knowledge management, webhooks, scheduled jobs, audit history, and reporting.

That breadth is intentional: a website can be a front door, but the right digital system should continue to help after the visitor becomes a customer.

---

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm run build       # production build
npm run start       # serve the production build
npm run lint        # lint app, components and lib
npm run mcp:build   # build the MCP server
```

Database-backed modules use the environment variables documented in `.env.example` and `.env.local.example`. The profile page itself does not require a database connection to render.

## Contact

Have something in mind?

Tell us what you’re building. We’ll start with a conversation.

- **Email:** [david@palawancollective.com](mailto:david@palawancollective.com)
- **Web:** [Merqato.Digital](https://merqato.digital)

**Let’s make something good.**

---

## License

This project is available under the [MIT License](LICENSE).
