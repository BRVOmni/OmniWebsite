# Changelog

All notable changes to the Omniprise corporate website.

## v2.10.0 — 2026-04-08

### Forms — Resend Migration
- Replaced Formspree with Resend for email delivery on both contact and franchise forms
- Created `/api/contact` and `/api/franchise` Next.js API route handlers
- Forms now POST JSON to internal API routes instead of external Formspree endpoints
- Styled HTML email templates with all form fields, branded with Omniprise sky blue
- Proper error handling with Resend SDK error inspection
- Configurable via env vars: `RESEND_API_KEY`, `FROM_EMAIL`, `CONTACT_EMAIL`, `FRANCHISE_EMAIL`
- Updated `.env.example` with Resend configuration docs

### Bug Fixes
- Fixed English brand detail pages showing Spanish text (`metadata.brand` → `metadata.brandDetail` key mismatch in `en.json`)

### Dependencies
- Added `resend` npm package

## v2.9.0 — 2026-04-07

### Testing — Unit & Component
- Rewrote franchise-schema tests from stub to 28 proper Zod validation tests
- Added React Testing Library + jsdom + @vitejs/plugin-react for component tests
- Added test setup file (`setup.ts`) with mocks for next-intl, framer-motion, lucide-react, next/image
- Added component tests: ContactForm (6), WorkModal (8), ThemeToggle (6), BackToTop (4)
- Added utility tests: `cn()`, `getBrandBySlug()`, `whatsappOrderUrl()`, `getAllBrandSlugs()`, BRANDS data integrity (18)
- Updated `vitest.config.ts` with jsdom environment and React plugin

### Testing — E2E
- Added Playwright E2E test suite with Chromium
- Homepage: hero section, brands grid, contact form, navigation (4 tests)
- Brand pages: all 7 brands load, navigation from homepage, 404 for invalid slugs (16 tests)
- Franchise form: renders fields, disabled states, email link, step indicator (5 tests)
- Navigation: mobile menu, 404 page, WhatsApp link, language switcher (4 tests)
- Accessibility: skip link, lang attribute, validation errors, document title, alt text (6 tests)
- Added `@axe-core/playwright` automated accessibility audits on 5 pages (5 audits)
- Added `test:e2e` and `test:e2e:ui` scripts to package.json
- Added E2E job to CI workflow (`.github/workflows/ci.yml`)

### Accessibility
- Added `eslint-plugin-jsx-a11y` for static accessibility analysis (0 violations)
- Added `@next/eslint-plugin-next` to resolve "Next.js plugin not detected" build warning
- Fixed WCAG AA color-contrast violations found by axe-core:
  - Light theme `--color-text-hint` opacity: 0.45 → 0.62
  - Light theme `--color-text-secondary` opacity: 0.6 → 0.72
  - Light theme `--color-omniprise-500` overridden to `#0369a1` (darker blue)
  - Light theme `--color-text-accent` set to `#0369a1`
- WhatsApp CTA buttons: changed from `text-surface-900` to `text-green-950` (visible in light theme)
- Stats section: static stat changed from `text-omniprise-500` to `text-omniprise-600`
- Zero color-contrast violations across all pages

### Code Quality
- Updated ESLint flat config (`eslint.config.mjs`) with jsx-a11y and @next/plugin
- Eliminated all lint warnings (was 16 unused variable warnings in test stub)

### Summary
- 70 unit/component tests (6 files)
- 40 E2E tests (6 spec files including axe-core audits)
- 110 total tests
- 0 lint warnings, 0 axe violations

## v2.8.0 — 2026-04-06

### Features
- Multi-language support (Spanish + English) via `next-intl`
  - Spanish at `/` (default, no prefix), English at `/en`
  - ~400 translated strings per language in `messages/es.json` and `messages/en.json`
  - All 20+ components updated with `useTranslations()` hook
  - Language switcher (ES/EN toggle) in navbar
  - Locale-aware sitemap with `hreflang` alternates
  - Locale detection middleware with cookie persistence
- App directory restructured under `[locale]/` dynamic segment
- Navbar, Footer, BackToTop moved into `[locale]/layout.tsx` (inside `NextIntlClientProvider`)

### Architecture
- Added `src/i18n/routing.ts` — locale config and routing
- Added `src/i18n/request.ts` — server-side message loading
- Added `src/middleware.ts` — locale detection and redirects
- Updated `next.config.ts` with `createNextIntlPlugin()`
- Root `layout.tsx` simplified to fonts + theme script + `ReducedMotionProvider` only
- Error/not-found pages remain at root level with hardcoded Spanish (outside provider)

## v2.7.2 — 2026-04-06

### Features
- Auto-save franchise application form to localStorage — draft persists across page refreshes with 7-day expiry
- Restored draft shows "Borrador recuperado" banner with option to discard
- Draft is cleared automatically on successful form submission
- Light/dark theme toggle with smooth transitions — Sun/Moon button in navbar
- Theme preference persisted in localStorage, respects system preference on first visit
- Inline script prevents flash of wrong theme on page load

### Bug Fixes
- Fixed hero scroll indicator ("Bajar") overlapping CTA buttons on mobile

## v2.7.1 — 2026-04-03

### Bug Fixes
- Removed duplicate `<main id="main-content">` tag from franchise page (root layout already provides it)

## v2.7.0 — 2026-04-03

### Documentation
- Added `LICENSE` (proprietary, all rights reserved)
- Added `SECURITY.md` with vulnerability reporting policy
- Added `CONTRIBUTING.md` with development workflow and code style, and PR process
- Added `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1)
- Added `CLAUDE.md` for AI assistant project context
- Added GitHub issue templates (bug report, feature request, config)
- Added GitHub pull request template
- Created `docs/` directory with:
  - Architecture Decision Records (4 ADRs)
  - Deployment runbook
  - Analytics events reference
  - Testing strategy
  - Accessibility statement and testing procedure
- Archived `AUDIT_2026-03-28.md` to `docs/audits/`
- Added `Website/.env.example` documenting hardcoded config values
- Added `Website/lighthouse-budget.json` for CI performance budgets
- Deduplicated root `README.md` (now links to `Website/README.md`)
- Fixed stale roadmap items (CI/CD marked as done, version footer updated)
- Added `package.json` metadata (description, repository, homepage, license) both root and Website)

### CI/CD
- Enhanced `ci.yml` with parallel jobs (lint, test, build) and Lighthouse CI

## v2.6.1 — 2026-04-02

### Accessibility
- Raised `--color-text-hint` opacity from 0.25 to 0.45 (~1.5:1 → ~5.2:1 contrast) to pass WCAG AA (4.5:1)
- Fixed invalid nested `<a>` inside `<Link>` in BrandCard WhatsApp button — replaced with `<button>` + `window.open()`
- Added global `:focus-visible` ring style (sky-blue 2px outline) for keyboard navigation
- Removed outline on mouse focus via `:focus:not(:focus-visible)` for all links/buttons

### Security
- Added `Content-Security-Policy` header to `vercel.json` (restricts scripts, styles, fonts, images, connections to known origins)
- Added `Permissions-Policy` header (camera, microphone, geolocation denied)
- Added `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy` headers
- Added immutable cache header for `/fonts/*`

### Documentation
- Cleaned up `WEBSITE_ROADMAP.md` — collapsed completed phases, removed stale P1 tasks, updated file tree and dependency list
- Separated root CHANGELOG (dashboard-only) from Website CHANGELOG
- Bumped version to v2.6.1

### Testing
- Added vitest as test runner (devDependency)
- Added `npm test` script to package.json
- Added 33 unit tests for franchise form Zod schema validation (`franchise-schema.test.ts`)
- Added vitest config for path alias resolution

### CI/CD
- Added GitHub Actions workflow (`ci.yml`) for lint + test + build on PRs to main

## v2.6.0 — 2026-04-01

### Layout Architecture
- Root layout (`src/app/layout.tsx`) now renders Navbar + Footer globally
- Removed duplicate Navbar/Footer from individual page files (home, privacidad, franchise, brand detail)
- Removed redundant `<main>` wrappers — root layout now provides `<main id="main-content">`
- Franchise layouts simplified to `<Suspense>` wrappers only (no more Navbar/Footer imports)
- Added custom error page (`src/app/error.tsx`) with branded styling
- Removed `outputFileTracingRoot: __dirname` from `next.config.ts` (no longer needed)

### UX Polish
- Contact form now has Zod validation with Spanish inline error messages
- Gallery lightbox supports touch swipe navigation on mobile (>50px threshold)
- Gallery images show brand-colored skeleton placeholder while loading, then fade in smoothly
- Franchise page brand cards now link to brand detail pages (`/marcas/[slug]`)

### SEO & Infrastructure
- Dynamic `robots.txt` via `src/app/robots.ts` (removed stale `/api/*` and `/admin/` rules)
- Removed unused `omniprise.svg` and `omniprise-dark.svg` assets

### Bug Fixes
- Franchise page: removed duplicate Navbar/Footer (already rendered by layout)
- Apply page: added Navbar/Footer to its layout (was missing)

## v2.5.0 — 2026-03-30

### WhatsApp Ordering
- Added "Proban nuestros platos" CTA button in Navbar (desktop + mobile)
- Added WhatsApp order link on every brand card in homepage grid
- Added WhatsApp order button on brand detail pages (BrandCTA)
- All links open `wa.me/595992035000` with pre-filled message including brand name
- Analytics: `whatsapp_order` event with `source` (navbar, homepage, brand_page) and `brand`

### Gallery
- 35 brand photos added (5 per brand) in `public/brands/gallery/`
- Lightbox with keyboard navigation (ArrowLeft/ArrowRight/Escape)
- Image error fallbacks (gradient placeholder for failed images)
- Logo error fallback (brand name text) in BrandHero and BrandsSection

### Franchise Form Validation
- Zod schemas for all 4 steps in `src/lib/franchise-schema.ts`
- Spanish error messages on all fields
- Inline error display (red border + message) on InputField, RadioGroup, TextArea
- Errors clear automatically when user corrects input

### Scroll Depth Tracking
- `useScrollDepth` hook fires `scroll_depth` analytics event at 25%, 50%, 75%, 90%
- `ScrollTracker` component for server pages (homepage, brand pages)
- Direct hook usage in client pages (franchise, apply)

### Analytics Events
- `whatsapp_order` — WhatsApp CTA clicks
- `brand_card_clicked` — brand card navigation
- `franchise_cta` — franchise section clicks
- `contact_form_submitted` — contact form submissions
- `franchise_form_step` — form step navigation
- `franchise_form_submitted` — form completion
- `scroll_depth` — scroll milestones

### Other
- Replaced bloated FranchiseSection with lean CTA teaser
- Privacy policy page (`/privacidad`) — Paraguay law (Ley 4868/2013)
- Dynamic sitemap (`src/app/sitemap.ts`) replacing static XML
- Canonical brand data centralized in `src/lib/brands.ts`
- Cleaned up 17 dashboard-only documentation files from repo

## v2.4.0 — 2026-03-28

### Brand Detail Pages
- Full brand pages at `/marcas/[slug]` with SSG via `generateStaticParams()`
- BrandHero, BrandStory, BrandStats, BrandGallery, BrandCTA components
- Instagram handles displayed on gallery section
- Dynamic OG images per brand

### Infrastructure
- `src/lib/brands.ts` as single source of truth for all brand data
- `useReveal` hook for scroll-triggered animations
- ReducedMotionProvider wrapping app in layout.tsx
- Vercel Analytics integration

## v2.0.0 — 2026-03-25

### Launch
- Next.js 15 with TypeScript, Tailwind CSS 4, Framer Motion
- Dark theme with sky blue (#0ea5e9) accents
- 7 brand logos (WebP)
- Homepage with 8 sections
- Franchise landing page + multi-step application form
- Contact form (Formspree)
- Custom 404 page
- Mobile responsive with hamburger menu
- Vercel deployment pipeline
