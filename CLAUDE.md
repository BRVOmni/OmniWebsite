# CLAUDE.md — Project Context for AI Assistants

## Project Overview

Grupo Omniprise corporate website — a food service operator in Paraguay with 7 brands across 17 locations.

- **Live:** https://www.omniprise.com.py
- **Repo:** github.com:BRVOmni/OmniWebsite.git
- **Source:** `Website/` directory (the only directory you should be working in). The repo root holds only shared docs, the original logo PNGs (`Logos/`) and a `package.json` with `website:*` convenience scripts — the old internal dashboard that used to live in root `src/` was removed on 2026-10-19 (the real dashboard is a separate repo)
- **Node.js:** 22.x (CI pinned to 22; 18+ minimum for local dev)
- **Lock file caveat:** Regenerate `package-lock.json` with Node 22 (`nvm use 22 && rm -rf node_modules package-lock.json && npm install`). Node 24+ resolves transitive deps differently and produces a lock file that fails `npm ci` on CI.

## Tech Stack

- Next.js 15 (App Router) + TypeScript 5
- React 19
- Tailwind CSS 4 (CSS-first config in `globals.css`)
- Framer Motion 12 (animations)
- next-intl (i18n — Spanish default at `/`, English at `/en`)
- Zod 4 (form validation)
- Resend (email delivery for contact and franchise forms)
- Vitest + React Testing Library (unit/component tests)
- Playwright + axe-core (E2E tests + accessibility audits)
- Vercel (deployment, auto-deploys from `main`)

## Key Conventions

### Code Style
- Named exports only (no default exports)
- Path aliases: `@/components/`, `@/lib/`
- All brand data lives in `Website/src/lib/brands.ts` — single source of truth
- Company-wide figures (brands, locations, team, cities, growth, WhatsApp number) live in `Website/src/lib/company.ts`; message strings interpolate them with `{brands}`, `{locations}`, `{team}`, `{teamCount}`, `{cities}` placeholders — never hardcode the numbers in components or copy
- Static pages get their `<title>`/description/canonical/hreflang through `buildPageMetadata()` in `Website/src/lib/page-metadata.ts` with keys under `metadata.*` in the message files
- Forms validated with Zod schemas (`franchise-schema.ts`)
- User-facing error messages in Spanish (default locale)
- Use `useTranslations('namespace')` for all user-facing strings — never hardcode text
- Translation files: `Website/src/messages/es.json`, `Website/src/messages/en.json`

### Styling
- Single dark theme (v3.0, Aug 2026): cool "ink" surfaces (`--color-surface-*`) with sky blue accent (#0ea5e9). No light theme, no theme toggle, no `data-theme` attribute — do not reintroduce them
- Dark-on-transparent brand logos use the `.logo-invert` class (driven by `logoColor: 'dark'` in `brands.ts`); other logos render as-is
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
| `Website/src/lib/company.ts` | Company figures, WhatsApp number, site URL (single source of truth) |
| `Website/src/lib/page-metadata.ts` | Localized metadata helper (title, description, canonical, hreflang, OG) |
| `Website/src/lib/franchise-schema.ts` | Zod schemas for the 4-step franchise form (+ merged `franchiseSchema`), contact form and supplier form |
| `Website/src/lib/dashboard-lead.ts` | Maps form answers to the dashboard's lead enums (investment range, timeframe, years) |
| `Website/src/lib/rate-limit.ts`, `form-guard.ts`, `escape-html.ts` | API route protection: per-IP rate limit, honeypot, HTML escaping |
| `Website/src/app/api/contact/route.ts` | Contact form API route (Resend email) |
| `Website/src/app/api/franchise/route.ts` | Franchise form API route (Zod-validated, Resend email + dashboard sync with timeout) |
| `Website/src/app/api/suppliers/route.ts` | Supplier form API route (Resend email) |
| `Website/src/app/layout.tsx` | Root layout (fonts, ReducedMotionProvider) |
| `Website/src/app/[locale]/layout.tsx` | Locale layout (NextIntlClientProvider, Navbar, Footer) |
| `Website/src/app/[locale]/page.tsx` | Homepage composing all sections |
| `Website/src/app/globals.css` | Tailwind config, design tokens (surfaces, text, borders, radii, shadows, motion), custom animations |
| `Website/src/messages/es.json` | Spanish translations (~400 strings) |
| `Website/src/messages/en.json` | English translations (~400 strings) |
| `Website/src/i18n/routing.ts` | Locale config (es, en) and routing |
| `Website/src/i18n/request.ts` | Server-side message loading |
| `Website/src/middleware.ts` | Locale routing (next-intl) + Content Security Policy with per-request script nonce |
| `Website/next.config.ts` | Next.js config with next-intl plugin |
| `Website/vercel.json` | Static security headers (X-Frame-Options, Permissions-Policy, etc.; the CSP itself lives in `middleware.ts`) |
| `Website/vitest.config.ts` | Vitest config with jsdom, React plugin, `@/` path alias |
| `Website/playwright.config.ts` | Playwright E2E config (Chromium, auto-start dev server) |
| `Website/eslint.config.mjs` | ESLint flat config (typescript-eslint, jsx-a11y, @next/plugin) |
| `Website/src/__tests__/setup.ts` | Test mocks (next-intl, framer-motion, lucide-react, next/image) |

## Routes

Spanish (default, no prefix) and English (`/en` prefix). All routes exist in both locales. Everything under `[locale]` is rendered per request (`dynamic = 'force-dynamic'` in the locale layout) because the CSP in `src/middleware.ts` issues a per-request script nonce — do not switch pages back to static generation without also dropping the nonce.

| Route | Type | Description |
|---|---|---|
| `/` and `/en` | SSR | Homepage |
| `/marcas/[slug]` and `/en/marcas/[slug]` | SSR | 7 brand detail pages (slugs from `brands.ts`, `notFound()` otherwise) |
| `/franchise` and `/en/franchise` | SSR | Franchise landing |
| `/franchise/apply` and `/en/franchise/apply` | Client | 4-step application form |
| `/proveedores` and `/en/proveedores` | Client | Supplier proposal form (posts to `/api/suppliers`) |
| `/prensa` and `/en/prensa` | SSR | Press page (boilerplate, key figures, press contact — brand assets only on request, never downloadable) |
| `/agent` and `/en/agent` | SSR | Static-content reference page for people, search engines and AI assistants (brands, how to order, investing via franchise, contacts). Not linked from nav/footer; indexable; no forms/inputs by design |
| `/llms.txt` | Route | Plain-text index for LLM crawlers (built from `brands.ts`) |
| `/privacidad`, `/terminos`, `/cookies` (+ `/en/…`) | SSR | Legal pages (privacy, terms, cookies) |

## Testing

### Unit & Component Tests
- Runner: Vitest (`cd Website && npm run test`)
- Config: `Website/vitest.config.ts` (jsdom environment, React plugin, `@/` path alias)
- Tests live in `Website/src/__tests__/`
- 87 tests across 8 files: schema validation (35), component tests (18), utilities (18), dashboard lead mapping (7), form guard / rate limit (9)
- Setup file: `Website/src/__tests__/setup.ts` (mocks for next-intl, framer-motion, lucide-react, next/image)

### E2E Tests
- Runner: Playwright (`cd Website && npm run test:e2e`)
- Config: `Website/playwright.config.ts` (Chromium only, auto-starts dev server)
- Tests live in `Website/e2e/`
- 58 tests across 7 files: homepage, brand pages, franchise form, navigation, accessibility, axe-core audits, agent page + privacy guard (`agent-privacy.spec.ts` fails the build if any public response contains internal/stack tokens)
- Reliable local run: `npm run build && npx next start -p 3001 &` then `npx playwright test -c <absolute path to playwright.config.ts>` (the dev server corrupts its manifests under parallel lazy compiles and pages 500; the config reuses an existing server outside CI). Kill the server by PID afterwards

### Linting
- ESLint flat config with typescript-eslint, jsx-a11y, @next/eslint-plugin-next
- 0 warnings, 0 errors

## Do NOT

- Do not create a `tailwind.config.js` or `tailwind.config.ts` inside `Website/` — uses CSS-first Tailwind 4
- Do not hardcode user-facing text in components — use `useTranslations()` instead
- Do not hardcode brand data outside of `brands.ts`, nor company figures outside of `company.ts`
- Do not add default exports
- Do not use `any` types
- Do not use inline styles
- Do not commit `.env.local` or secrets
- Do not publish internal systems, provider/stack names, cookie names, legal suffix/RUC, addresses/hours, or downloadable brand assets — the E2E privacy guard enforces a denylist; extend it if new sensitive tokens appear
- Do not add analytics/tracking scripts (decision Aug 2026) or any interactive agent/chatbot on `/agent` — it must stay a static document
- On server components use plain `<a href>` (with the locale prefix) instead of next-intl `Link` when the page must not serialise routing config into the payload
