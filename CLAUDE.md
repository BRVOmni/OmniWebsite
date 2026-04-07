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
- next-intl (i18n — Spanish default at `/`, English at `/en`)
- Zod 4 (form validation)
- Vitest + React Testing Library (unit/component tests)
- Playwright + axe-core (E2E tests + accessibility audits)
- Vercel (deployment, auto-deploys from `main`)

## Key Conventions

### Code Style
- Named exports only (no default exports)
- Path aliases: `@/components/`, `@/lib/`
- All brand data lives in `Website/src/lib/brands.ts` — single source of truth
- Forms validated with Zod schemas (`franchise-schema.ts`)
- User-facing error messages in Spanish (default locale)
- Use `useTranslations('namespace')` for all user-facing strings — never hardcode text
- Translation files: `Website/src/messages/es.json`, `Website/src/messages/en.json`

### Styling
- Dark/light theme system with sky blue accent (#0ea5e9 dark, #0369a1 light)
- Theme toggle persists preference in localStorage, respects system preference
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
| `Website/src/app/layout.tsx` | Root layout (fonts, theme script, ReducedMotionProvider) |
| `Website/src/app/[locale]/layout.tsx` | Locale layout (NextIntlClientProvider, Navbar, Footer) |
| `Website/src/app/[locale]/page.tsx` | Homepage composing all sections |
| `Website/src/app/globals.css` | Tailwind config, design tokens, custom animations, light/dark theme tokens |
| `Website/src/messages/es.json` | Spanish translations (~400 strings) |
| `Website/src/messages/en.json` | English translations (~400 strings) |
| `Website/src/i18n/routing.ts` | Locale config (es, en) and routing |
| `Website/src/i18n/request.ts` | Server-side message loading |
| `Website/src/middleware.ts` | Locale detection and cookie persistence |
| `Website/next.config.ts` | Next.js config with next-intl plugin |
| `Website/vercel.json` | Security headers (CSP, Permissions-Policy, etc.) |
| `Website/vitest.config.ts` | Vitest config with jsdom, React plugin, `@/` path alias |
| `Website/playwright.config.ts` | Playwright E2E config (Chromium, auto-start dev server) |
| `Website/eslint.config.mjs` | ESLint flat config (typescript-eslint, jsx-a11y, @next/plugin) |
| `Website/src/__tests__/setup.ts` | Test mocks (next-intl, framer-motion, lucide-react, next/image) |

## Routes

Spanish (default, no prefix) and English (`/en` prefix). All routes exist in both locales.

| Route | Type | Description |
|---|---|---|
| `/` and `/en` | SSR | Homepage |
| `/marcas/[slug]` and `/en/marcas/[slug]` | SSG | 7 brand detail pages |
| `/franchise` and `/en/franchise` | SSR | Franchise landing |
| `/franchise/apply` and `/en/franchise/apply` | Client | 4-step application form |
| `/privacidad` and `/en/privacidad` | SSR | Privacy policy |

## Testing

### Unit & Component Tests
- Runner: Vitest (`cd Website && npm run test`)
- Config: `Website/vitest.config.ts` (jsdom environment, React plugin, `@/` path alias)
- Tests live in `Website/src/__tests__/`
- 70 tests across 6 files: schema validation (28), component tests (24), utilities (18)
- Setup file: `Website/src/__tests__/setup.ts` (mocks for next-intl, framer-motion, lucide-react, next/image)

### E2E Tests
- Runner: Playwright (`cd Website && npm run test:e2e`)
- Config: `Website/playwright.config.ts` (Chromium only, auto-starts dev server)
- Tests live in `Website/e2e/`
- 40 tests across 6 files: homepage, brand pages, franchise form, navigation, accessibility, axe-core audits

### Linting
- ESLint flat config with typescript-eslint, jsx-a11y, @next/eslint-plugin-next
- 0 warnings, 0 errors

## Do NOT

- Do not create a `tailwind.config.js` or `tailwind.config.ts` inside `Website/` — uses CSS-first Tailwind 4
- Do not hardcode user-facing text in components — use `useTranslations()` instead
- Do not hardcode brand data outside of `brands.ts`
- Do not add default exports
- Do not use `any` types
- Do not use inline styles
- Do not commit `.env.local` or secrets
- Do not modify root `src/` dashboard code when working on the website
