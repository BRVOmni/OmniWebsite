# Grupo Omniprise — Monorepo

The corporate website and internal dashboard for Grupo Omniprise, a food service operator in Paraguay running 7 brands across 17 locations.

**Live website:** https://www.omniprise.com.py

---

## Monorepo Structure

| Directory | App | Docs |
|---|---|---|
| [`Website/`](./Website/) | Public corporate website (Next.js 15) | [`Website/README.md`](./Website/README.md) |
| [`src/`](./src/) (root) | Internal operations dashboard | This file |

**The website is the primary project.** See [`Website/README.md`](./Website/README.md) for the full technical documentation — tech stack, project structure, component guide, design system, and QA checklist.

---

## Quick Start

```bash
# Website (primary)
cd Website
npm install
npm run dev        # http://localhost:3001
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Vitest

# Dashboard (root)
npm install
npm run dev        # http://localhost:3000
```

---

## Deployment

The website auto-deploys to Vercel on every push to `main`. See [`Website/README.md`](./Website/README.md) for the full deployment pipeline and Vercel configuration.

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow, code style, and PR process.

## Security

See [`SECURITY.md`](./SECURITY.md) for vulnerability reporting.
