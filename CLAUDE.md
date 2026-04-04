# CLAUDE.md — Project Context for AI Assistants

## Project Overview

Grupo Omniprise corporate website — a food service operator in Paraguay with 7 brands across 17 locations.

- **Live:** https://www.omniprise.com.py
- **Repo:** github.com:BRVOmni/OmniWebsite.git
- **Source:** `Website/` directory (the only directory you should be working in)
- **Node.js:** 22.x (CI pinned to 22; 18+ minimum for local dev)

## Tech Stack

- Next.js 15 (App Router) + TypeScript 5
- React 19
- Tailwind CSS 4 (CSS-first config in `globals.css`)
- Framer Motion 12 (animations)
- Zod 4 (form validation)
- Vitest (testing)
- Vercel (deployment, auto-deploys from `main`)

## Key Conventions

### Code Style
- Named exports only (no default exports)
- Path aliases: `@/components/`, `@/lib/`
- All brand data lives in `Website/src/lib/brands.ts` — single source of truth
- Forms validated with Zod schemas (`franchise-schema.ts`)
- User-facing error messages in Spanish

### Styling
- Dark theme with sky blue accent (#0ea5e9)
- Use Tailwind utilities only — no inline styles
- `cn()` utility from `@/lib/utils` for conditional classes (clsx + tailwind-merge)

### Components
- Functional components with named exports
- Use `useReveal` hook from `@/lib/use-reveal` for scroll animations
- Wrap Framer Motion components with `ReducedMotionProvider`

### Git
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `style:`, `refactor:`
- Build MUST pass before committing: `cd Website && npm run build`
- Push to `main` triggers Vercel deploy
- Convenience scripts from repo root: `npm run website:build`, `website:dev`, `website:lint`, `website:test`

## Important Files

| File | Purpose |
|---|---|
| `Website/src/lib/brands.ts` | All brand data, WhatsApp URL helper, brand slugs |
| `Website/src/lib/franchise-schema.ts` | Zod schemas for 4-step franchise form |
| `Website/src/app/layout.tsx` | Root layout with Navbar + Footer |
| `Website/src/app/page.tsx` | Homepage composing all sections |
| `Website/src/app/globals.css` | Tailwind config, design tokens, custom animations |
| `Website/next.config.ts` | Next.js config |
| `Website/vercel.json` | Security headers (CSP, Permissions-Policy, etc.) |
| `Website/vitest.config.ts` | Vitest config with `@/` path alias resolution |

## Routes

| Route | Type | Description |
|---|---|---|
| `/` | SSR | Homepage |
| `/marcas/[slug]` | SSG | 7 brand detail pages |
| `/franchise` | SSR | Franchise landing |
| `/franchise/apply` | Client | 4-step application form |
| `/privacidad` | SSR | Privacy policy |

## Testing

- Runner: Vitest (`cd Website && npm run test`)
- Config: `Website/vitest.config.ts` (includes `@/` path alias)
- Tests live in `Website/src/__tests__/`
- Only schema tests exist so far — expand coverage for components and utilities

## Do NOT

- Do not create a `tailwind.config.js` or `tailwind.config.ts` inside `Website/` — uses CSS-first Tailwind 4
- Do not hardcode brand data outside of `brands.ts`
- Do not add default exports
- Do not use `any` types
- Do not use inline styles
- Do not commit `.env.local` or secrets
- Do not modify root `src/` dashboard code when working on the website
