# Omniprise — Website Documentation

**Version 2.8.0 | Next.js 15 | April 2026**

> All audit issues resolved. See [`docs/audits/AUDIT_2026-03-28.md`](../docs/audits/AUDIT_2026-03-28.md) for the full history.

---

## Current Status

**Production Website:** https://www.omniprise.com.py

**Current Implementation:**
- Next.js 15 with TypeScript and Tailwind CSS 4
- Multi-language support (Spanish default at `/`, English at `/en`) via next-intl
- 15+ React components with framer-motion animations
- Dark + colorful hybrid design with light/dark theme toggle (sky blue #0ea5e9 accents)
- Real WebP brand logos for 7 brands
- Gallery with lightbox (35 photos, 5 per brand, touch swipe + keyboard nav)
- Franchise section with multi-step form (Zod-validated, auto-save to localStorage)
- Contact form with Zod validation (Spanish error messages)
- WhatsApp ordering CTA across all pages
- Privacy policy page (Paraguay law compliant)
- Dynamic sitemap with hreflang alternates + robots.txt generated from brand data
- Open Graph meta tags + dynamic OG images
- Vercel Analytics with custom event tracking
- Scroll depth tracking (25%, 50%, 75%, 90%)
- Gallery skeleton loading with brand-colored placeholders
- Vercel deployment from GitHub

---

## Git Workflow — READ THIS FIRST

This website lives inside `Website/` in a monorepo. Only the `Website/` directory is deployed.

```
Remote:  github.com:BRVOmni/OmniWebsite.git (origin)
Branch:  main
Deploy:  Vercel auto-deploys on push to main
```

### Every time you make changes:

```bash
# 1. Make your edits inside Website/

# 2. Test locally
cd Website
npm install        # first time or after dependency changes
npm run build      # MUST pass before committing

# 3. Go to repo root and commit
cd ..
git status                        # see what changed
git diff                          # review your changes
git add Website/<changed-files>   # stage specific files
git commit -m "type: description"

# 4. Push to GitHub (this triggers Vercel deploy)
git push origin main

# 5. Verify on Vercel
# Go to https://vercel.com and check the deploy succeeded
```

### Convenience scripts from repo root

You can also run website commands from the repo root without `cd`-ing:

```bash
npm run website:dev      # Start dev server
npm run website:build    # Production build
npm run website:lint     # ESLint
npm run website:test     # Vitest
```

### Commit message format

```
feat: add testimonials section
fix: broken gallery on mobile
chore: update dependencies
docs: update README
style: fix spacing in hero
refactor: extract shared component
```

### Before pushing — checklist

- [ ] `npm run build` passes inside `Website/`
- [ ] `git status` shows only the files you intended to change
- [ ] No secrets or `.env` files in the diff
- [ ] Commit message describes the change clearly

### Local backup — protect your work

Pushing to GitHub IS your backup. If you have uncommitted local work, it exists nowhere else. To avoid losing work:

1. **Commit often.** Small commits are fine.
2. **Push after every commit.** `git push origin main` takes 5 seconds.
3. **Never leave uncommitted changes at the end of a session.** Even if work is half-done, commit it on a branch:
   ```bash
   git checkout -b wip/my-feature
   git add -A
   git commit -m "wip: in-progress feature"
   git push origin wip/my-feature
   ```
4. **Verify your push.** After pushing, run `git status` — it should say `Your branch is up to date with 'origin/main'`.

### Emergency: recovering from a lost local copy

```bash
git clone git@github.com:BRVOmni/OmniWebsite.git
cd OmniWebsite/Website
npm install
npm run dev
```

### Adding a GitLab backup mirror

If you want an extra backup (the docs reference `gitlab.com:sbrv-group/omniprise`):

```bash
git remote add gitlab git@gitlab.com:sbrv-group/omniprise.git
git push gitlab main           # push once
git push gitlab main --mirror  # or mirror everything
```

To push to both remotes every time:
```bash
git remote set-url --add --push origin git@github.com:BRVOmni/OmniWebsite.git
git remote set-url --add --push origin git@gitlab.com:sbrv-group/omniprise.git
# Now `git push origin main` pushes to both GitHub and GitLab
```

---

## Path to Production

This section documents the exact deployment pipeline.

### Architecture

```
Local (Website/)  ──git push──>  GitHub (main)  ──webhook──>  Vercel (auto-build)
```

### Vercel Configuration

| Setting | Value | Why |
|---|---|---|
| **Framework** | Next.js | Auto-detected |
| **Root Directory** | `Website` | Monorepo — Vercel must build inside `Website/` |
| **Build Command** | `next build` | Default |
| **Branch** | `main` | Only pushes to `main` trigger production deploys |

### Known Pitfalls

1. **Wrong Root Directory** — Vercel must build from `Website/`, not repo root. Check Vercel dashboard Settings.
2. **Invalid vercel.json** — Must be strict JSON. No trailing commas, no comments.
3. **Missing ESLint** — Next.js 15 requires ESLint as devDependency for production builds.
4. **Large image files** — Compress logos before adding to `public/brands/`. Target under 500KB.
5. **Dark logos on dark background** — Dark logos need `invertLogo: true` in `brands.ts`.

### Manual Deploy (Emergency)

```bash
cd Website
npm run build
npx vercel --prod
```

### DNS Configuration

- **Type A:** `@` → `76.76.21.21`
- **Type CNAME:** `www` → `cname.vercel-dns.com`

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.x | Framework |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| framer-motion | 12.x | Animations |
| next-intl | 4.x | Internationalization (Spanish + English) |
| lucide-react | 0.577 | Icons |
| clsx + tailwind-merge | latest | Class utilities |
| zod | 4.x | Form validation |
| @vercel/analytics | latest | Analytics + custom events |

---

## Project Structure

```
Website/
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind + custom theme tokens
│   │   ├── layout.tsx           # Root layout (fonts + theme script + ReducedMotionProvider)
│   │   ├── error.tsx            # Custom error page
│   │   ├── not-found.tsx        # Custom 404 page
│   │   ├── sitemap.ts           # Dynamic sitemap (both locales, hreflang alternates)
│   │   ├── robots.ts            # Dynamic robots.txt
│   │   └── [locale]/
│   │       ├── layout.tsx       # Locale layout (NextIntlClientProvider + Navbar + Footer)
│   │       ├── page.tsx         # Home page composing all sections
│   │       ├── privacidad/      # Privacy policy (Paraguay law)
│   │       ├── franchise/       # Franchise landing + apply form
│   │       └── marcas/[slug]/   # Brand detail pages (SSG)
│   ├── components/
│   │   ├── Navbar.tsx           # Fixed nav with WhatsApp + work modal + language switcher
│   │   ├── HeroSection.tsx      # Hero with animated stats
│   │   ├── StatementSection.tsx # "No somos un restaurante"
│   │   ├── StatsSection.tsx     # Animated counter stats
│   │   ├── PillarsSection.tsx   # 3 core pillars
│   │   ├── BrandsSection.tsx    # Brand cards with logos + WhatsApp links
│   │   ├── VisionSection.tsx    # Company vision statement
│   │   ├── PartnersSection.tsx  # Partner/ecosystem section
│   │   ├── FranchiseSection.tsx # Franchise CTA teaser
│   │   ├── Footer.tsx           # Footer with navigation links
│   │   ├── WorkModal.tsx        # "Trabajemos juntos" modal
│   │   ├── BackToTop.tsx        # Scroll-to-top button
│   │   ├── ThemeToggle.tsx      # Light/dark mode toggle
│   │   ├── ContactForm.tsx      # Contact form (Formspree)
│   │   ├── ScrollTracker.tsx    # Client wrapper for scroll depth tracking
│   │   ├── ReducedMotionProvider.tsx # framer-motion reduced-motion wrapper
│   │   └── brand-detail/        # Brand page sub-components
│   │       ├── BrandHero.tsx    # Brand header with logo + badge
│   │       ├── BrandStory.tsx   # Brand story + milestones
│   │       ├── BrandStats.tsx   # Brand statistics grid
│   │       ├── BrandGallery.tsx # Photo gallery with lightbox
│   │       ├── BrandPresence.tsx # Brand locations + platforms
│   │       └── BrandCTA.tsx     # WhatsApp order + franchise CTA
│   ├── i18n/
│   │   ├── routing.ts           # Locale config (es, en) and routing
│   │   └── request.ts           # Server-side message loading
│   ├── messages/
│   │   ├── es.json              # Spanish translations (~400 strings)
│   │   └── en.json              # English translations (~400 strings)
│   ├── middleware.ts             # Locale detection + cookie persistence
│   └── lib/
│       ├── brands.ts            # Canonical brand data (7 brands) + helpers
│       ├── franchise-schema.ts  # Zod schemas for franchise (4 steps) + contact forms
│       ├── use-reveal.ts        # Scroll-triggered reveal + counter hooks
│       ├── use-scroll-depth.ts  # Scroll depth tracking hook
│       └── utils.ts             # cn() utility
├── public/
│   ├── brands/                  # 7 brand WebP logos
│   │   └── gallery/             # 35 photos (5 per brand)
│   ├── omniprise-logo.png       # Logo for navbar/footer
│   └── omniprise-logo.jpg       # Logo for OG/Twitter cards (1920x1080)
├── next.config.ts               # Next.js config with next-intl plugin
├── tsconfig.json                # TypeScript config
├── vitest.config.ts             # Vitest config with @/ path alias
├── postcss.config.mjs           # Tailwind PostCSS config
└── package.json                 # Dependencies and scripts
```

---

## Getting Started

### Prerequisites
- Node.js 22.x recommended (CI uses 22; 18+ minimum for local dev)
- npm

### Install & Run
```bash
cd Website
npm install
npm run dev
# Visit http://localhost:3001
```

### Build for Production
```bash
cd Website
npm run build
```

---

## Design System

### Color Palette
```css
/* Brand */
--color-omniprise-500: #0ea5e9    /* Sky blue accent */

/* Surfaces (dark theme) */
--color-surface-950: #09090b      /* Deepest background */
--color-surface-900: #111110
--color-surface-800: #161614      /* Body background */
--color-surface-700: #1e1e1c

/* Text */
--color-text-primary: #f5f4f0
--color-text-secondary: rgba(245, 244, 240, 0.6)
--color-text-accent: #0ea5e9

/* Borders */
--color-border-subtle: rgba(255, 255, 255, 0.08)
--color-border-medium: rgba(255, 255, 255, 0.16)
```

### Typography
- **Display:** Barlow Condensed (headings) — weights 400, 600, 700, 800, 900
- **Body:** Inter (body text) — weights 300, 400, 500, 600

### Animations
- Scroll-triggered reveals via `use-reveal` hook
- Counter animations on stats section
- framer-motion page transitions

---

## Component Guide

### Adding a New Section
1. Create a new component in `src/components/`
2. Import and add it to `src/app/page.tsx`
3. Use the `useReveal` hook for scroll animations:
```tsx
import { useReveal } from '@/lib/use-reveal';

export function NewSection() {
  const { ref, isVisible } = useReveal();
  return <section ref={ref}>...</section>;
}
```

### Adding a New Brand
1. Compress the logo (target under 500KB) and add it to `public/brands/`
2. Check if the logo is dark-colored (will be invisible on dark background)
3. Add 5 gallery photos to `public/brands/gallery/<slug>/` (named `1.jpeg`–`5.jpeg`)
4. Update the `BRANDS` array in `src/lib/brands.ts`:
```tsx
{
  slug: "brand-name",
  name: "Brand Name",
  logo: "/brands/brand-logo.webp",
  tag: "Marca propia — Month Year",
  tagline: "Tagline here",
  description: "2-3 sentences about the brand",
  badge: "Badge text",
  invertLogo: true,  // only if the logo is dark/black
  story: "Full brand story...",
  stats: [...],
  milestones: [...],
  locations: "Location info",
  deliveryPlatforms: ["PedidosYa"],
  model: "Business model",
  galleryCount: 5,
  galleryImages: ["/brands/gallery/<slug>/1.jpeg", ...],
  instagram: "handle",
}
```

### Updating Stats
Edit the `stats` array in `src/components/StatsSection.tsx`.

### Updating Contact Email
Search for `@omniprise.com.py` across components to find all email references.

---

## Roadmap

### Completed (v2.0)
- [x] Next.js 15 project with TypeScript
- [x] Tailwind CSS 4 with custom design tokens
- [x] 15+ React components with animations
- [x] Real brand logos (WebP)
- [x] Franchise section with CTA
- [x] Open Graph meta tags
- [x] Mobile responsive with hamburger menu
- [x] Vercel deployment pipeline
- [x] Logo compression and dark logo fixes
- [x] Favicon + apple-touch-icon
- [x] ESLint config (typescript-eslint flat config)
- [x] Custom 404 page
- [x] Analytics (Vercel Analytics)
- [x] Contact form
- [x] "Back to Top" button
- [x] Brand detail pages (`/marcas/[slug]`)
- [x] Skip-to-content link for accessibility
- [x] Internal nav uses Next.js `<Link>`
- [x] Franchise landing page (`/franchise`)
- [x] Multi-step franchise application form (`/franchise/apply`)
- [x] `prefers-reduced-motion` support (CSS + framer-motion + JS animations)
- [x] Canonical brand data across all pages
- [x] Proper OG social cards on brand detail pages

### Completed (v2.5)
- [x] Privacy policy page (`/privacidad`) — Paraguay law compliant
- [x] Gallery with lightbox — 35 photos, keyboard + touch swipe nav
- [x] Dynamic sitemap + robots.txt generated from brand data
- [x] Zod validation for franchise form and contact form — Spanish error messages
- [x] Scroll depth tracking — `scroll_depth` analytics events at 25/50/75/90%
- [x] WhatsApp ordering CTA — navbar, brand pages, homepage cards
- [x] Custom analytics events
- [x] Replaced bloated FranchiseSection with lean CTA teaser
- [x] Canonical brand data centralized in `src/lib/brands.ts`

### Completed (v2.6)
- [x] Centralized layout — Navbar + Footer in root layout only
- [x] Removed duplicate Navbar/Footer from all page files
- [x] Custom error page (`error.tsx`)
- [x] Updated README with git workflow and backup instructions

### Completed (v2.7)
- [x] Project documentation (CLAUDE.md, ADRs, deployment runbook, testing strategy, accessibility guide)
- [x] Community files (LICENSE, SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md)
- [x] GitHub issue/PR templates
- [x] Enhanced CI workflow (parallel lint/test/build + Lighthouse CI)
- [x] `.env.example` and `lighthouse-budget.json`
- [x] Removed duplicate `<main>` tag from franchise page

### Next Up
- [x] Enable Next.js image optimization (already enabled — no `unoptimized` flag)
- [x] Light/dark theme toggle
- [x] Multi-language support (Spanish + English) via next-intl
- [ ] Lead capture API with Supabase
- [ ] Blog/news section for SEO

---

## QA Checklist

Before deploying to production:
- [ ] Run `npm run build` with no errors
- [ ] Test on mobile (Chrome DevTools iPhone)
- [ ] Verify all navigation links work
- [ ] Confirm contact email is correct
- [ ] Verify stats are up to date
- [ ] Check logos load correctly (dark logos should be inverted)
- [ ] Test franchise CTA and modal
- [ ] Test contact form Zod validation
- [ ] Test WhatsApp CTA buttons (navbar, brand cards, brand pages)
- [ ] Test gallery lightbox (keyboard arrows, touch swipe, Escape to close)
- [ ] Verify Open Graph tags (use opengraph.xyz)
- [ ] Check `/robots.txt` and `/sitemap.xml` render correctly

---

**Last Updated:** April 6, 2026
**Version:** 2.8.0
