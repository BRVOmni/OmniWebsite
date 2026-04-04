# Grupo Omniprise — Corporate Website

The public corporate website for Grupo Omniprise, a food service operator in Paraguay running 7 brands across 17 locations.

**Live:** https://www.omniprise.com.py

---

## Quick Start

### Prerequisites

- **Node.js:** 22.x recommended (CI uses 22; 18+ minimum for local dev)
- **npm** (comes with Node.js)

### Install & Run

```bash
cd Website
npm install
npm run dev        # http://localhost:3001
```

### Commands

Run these from inside `Website/`:

```bash
npm run dev        # Start dev server (port 3001)
npm run build      # Production build — MUST pass before committing
npm run lint       # ESLint check
npm run test       # Run tests (Vitest)
```

You can also run these from the **repo root** using the convenience scripts:

```bash
npm run website:dev      # Start website dev server
npm run website:build    # Build website for production
npm run website:lint     # Lint website code
npm run website:test     # Run website tests
```

No `.env` file needed for local development. See `Website/.env.example` for reference on configurable values (Formspree endpoints, WhatsApp number).

---

## Deployment

The website auto-deploys to Vercel on every push to `main`. Vercel builds from the `Website/` subdirectory.

See [`docs/deployment-runbook.md`](./docs/deployment-runbook.md) for rollback procedures, Vercel settings, and troubleshooting.

---

## Documentation

| Document | Purpose |
|---|---|
| [`Website/README.md`](./Website/README.md) | Full technical docs — tech stack, project structure, component guide, design system, QA checklist |
| [`CLAUDE.md`](./CLAUDE.md) | AI assistant project context |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Development workflow, code style, and PR process |
| [`SECURITY.md`](./SECURITY.md) | Vulnerability reporting policy |
| [`docs/deployment-runbook.md`](./docs/deployment-runbook.md) | Deployment and rollback procedures |
| [`docs/testing-strategy.md`](./docs/testing-strategy.md) | Testing approach and priorities |
| [`docs/analytics-events.md`](./docs/analytics-events.md) | Custom analytics event reference |
| [`docs/accessibility.md`](./docs/accessibility.md) | Accessibility statement and testing |
| [`docs/adr/`](./docs/adr/) | Architecture Decision Records |

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow and PR process.

## Security

See [`SECURITY.md`](./SECURITY.md) for vulnerability reporting.
