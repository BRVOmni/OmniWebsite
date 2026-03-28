# Omniprise — Website Documentation

**Version 2.0.0 | Next.js 15 | March 2026**

> **ACTION REQUIRED — Production Audit (March 28, 2026)**
>
> A full production audit was performed. There are **5 critical issues** and several important fixes to address.
>
> :page_facing_up: **Full audit with prioritized fix plan: [`AUDIT_2026-03-28.md`](./AUDIT_2026-03-28.md)**
>
> The dev team should start with the **Sprint 1: Production Fixes** section (estimated 1 hour total).

---

## Current Status

**Production Website:** https://www.omniprise.com.py

**Current Implementation:**
- Next.js 15 with TypeScript and Tailwind CSS 4
- 11 React components with framer-motion animations
- Dark + colorful hybrid design (sky blue #0ea5e9 accents)
- Real PNG brand logos for 7 brands
- Franchise selling section with CTA
- Open Graph meta tags for social sharing
- Vercel deployment from GitHub

---

## Path to Production

This section documents the exact deployment pipeline. Follow it carefully to avoid the issues we hit during the v2.0 launch.

### Architecture

```
Local (Website/)  ──git push──>  GitHub (main)  ──webhook──>  Vercel (auto-build)
```

### Git Remotes

```
origin  = github.com:BRVOmni/OmniWebsite.git   ← Vercel reads from here
gitlab  = gitlab.com:sbrv-group/omniprise       ← Backup mirror
```

**Important:** Only `origin` (GitHub) triggers Vercel. Pushing to `gitlab` does nothing.

### Deployment Checklist

Every time you make changes and want them live:

```bash
# 1. Make your changes in Website/

# 2. Verify the build passes locally
cd Website
npm run build

# 3. If build passes, commit and push
git add <changed-files>
git commit -m "description of change"
git push origin main

# 4. Vercel auto-deploys. Check https://vercel.com for build status.
```

### Vercel Configuration

These settings are in the Vercel dashboard and must be correct:

| Setting | Value | Why |
|---|---|---|
| **Framework** | Next.js | Set via `vercel.json` |
| **Root Directory** | `Website` | This repo is a monorepo. Vercel must build inside `Website/`, not the repo root |
| **Build Command** | `next build` | Default, no override needed |
| **Output Directory** | Default | Next.js handles this |
| **Branch** | `main` | Only pushes to `main` trigger production deploys |

### Known Pitfalls

These are the exact issues we hit. Don't repeat them:

#### 1. Wrong Root Directory
**Problem:** Vercel was building from the repo root (the dashboard project) instead of `Website/`. The build used the wrong `package.json` and failed or deployed the wrong app.

**Fix:** Set Root Directory to `Website` in Vercel dashboard → Settings → General.

**Verification:** Check the Vercel build logs — the first line should say `Running "next build"` inside the `Website/` directory.

#### 2. Invalid vercel.json
**Problem:** A trailing comma in `vercel.json` (`{"framework": "nextjs",}`) caused a JSON parse error and the build failed silently.

**Rule:** `vercel.json` must be strict JSON. No trailing commas, no comments.

#### 3. Missing ESLint
**Problem:** Next.js 15 requires ESLint as a devDependency for production builds. Without it, `next build` fails.

**Fix:** ESLint is in `devDependencies`. If you ever run `npm install --production`, you'll need to add it back.

#### 4. Multiple lockfiles
**Problem:** The monorepo root has its own `package-lock.json` (for the dashboard). Vercel detected both and warned about it.

**Fix:** `next.config.ts` includes `outputFileTracingRoot: __dirname` to tell Next.js where the project boundary is.

#### 5. Large image files
**Problem:** Brand logos were uploaded at full camera resolution (up to 15MB each). This caused slow builds and wasted bandwidth.

**Rule:** Before adding logos to `public/brands/`, compress them. Target under 500KB per logo. Use `sharp` or any image tool.

#### 6. Dark logos on dark background
**Problem:** Some brand logos (Mr. Chow, Los Condenados) are dark/black and invisible on the dark website background.

**Fix:** These brands have `invertLogo: true` in `BrandsSection.tsx`, which applies `filter: invert(1) brightness(0.9)` via inline styles.

**When adding new logos:** Check if the logo is dark. If so, add `invertLogo: true` to the brand entry.

### Manual Deploy (Emergency)

If Vercel auto-deploy fails and you need to push manually:

```bash
cd Website
npm run build
npx vercel --prod
```

### DNS Configuration

- **Type A:** `@` → `76.76.21.21`
- **Type CNAME:** `www` → `cname.vercel-dns.com`

SSL is handled automatically by Vercel.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.x | Framework |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| framer-motion | 12.x | Animations |
| lucide-react | 0.577 | Icons |
| class-variance-authority | 0.7 | Component variants |
| clsx + tailwind-merge | latest | Class utilities |

---

## Project Structure

```
Website/
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind + custom theme tokens
│   │   ├── layout.tsx           # Root layout with metadata and fonts
│   │   └── page.tsx             # Home page composing all sections
│   ├── components/
│   │   ├── Navbar.tsx           # Fixed nav with hamburger menu
│   │   ├── HeroSection.tsx      # Hero with animated stats
│   │   ├── StatementSection.tsx # "No somos un restaurante"
│   │   ├── StatsSection.tsx     # Animated counter stats
│   │   ├── PillarsSection.tsx   # 3 core pillars
│   │   ├── BrandsSection.tsx    # Brand cards with real PNG logos
│   │   ├── VisionSection.tsx    # Company vision statement
│   │   ├── PartnersSection.tsx  # Partner/ecosystem section
│   │   ├── FranchiseSection.tsx # Franchise selling section + CTA
│   │   ├── Footer.tsx           # Footer with navigation links
│   │   └── WorkModal.tsx        # "Trabajemos juntos" modal
│   └── lib/
│       ├── utils.ts             # cn() utility
│       └── use-reveal.ts        # Scroll-triggered reveal hook
├── public/
│   ├── brands/                  # 7 brand PNG logos
│   ├── omniprise.svg            # Logo (light, for dark backgrounds)
│   ├── omniprise-dark.svg       # Logo (dark, for light backgrounds)
│   └── omniprise-logo.jpg       # Logo (JPEG fallback)
├── next.config.ts               # Next.js config (unoptimized images, tracing root)
├── vercel.json                  # Vercel deployment config
├── tsconfig.json                # TypeScript config
├── postcss.config.mjs           # Tailwind PostCSS config
└── package.json                 # Dependencies and scripts
```

---

## Getting Started

### Prerequisites
- Node.js 18+
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
3. Update the `BRANDS` array in `src/components/BrandsSection.tsx`:
```tsx
{
  name: "Brand Name",
  tagline: "Tagline here",
  description: "2-3 sentences about the brand",
  tag: "Marca propia — Month Year",
  badge: "Badge text",
  logo: "/brands/brand-logo.png",
  invertLogo: true,  // only if the logo is dark/black
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
- [x] 11 React components with animations
- [x] Real brand logos (PNG)
- [x] Franchise section with CTA
- [x] Open Graph meta tags
- [x] Mobile responsive with hamburger menu
- [x] Vercel deployment pipeline
- [x] Logo compression and dark logo fixes

### Next Up (from audit — see [`AUDIT_2026-03-28.md`](./AUDIT_2026-03-28.md))

**Sprint 1 — Production Fixes (Day 1):**
- [ ] Fix malformed `sitemap.xml` (broken XML)
- [ ] Push unpushed commit to GitHub (`06a846c`)
- [ ] Commit `robots.txt` and `sitemap.xml` to git
- [ ] Add favicon + apple-touch-icon
- [ ] Fix ESLint config (broken — `@eslint/eslintrc` missing)

**Sprint 2 — Polish (Week 1):**
- [ ] Create and add Open Graph image for social sharing
- [ ] Add Twitter/X Card metadata
- [ ] Enable Next.js image optimization (remove `unoptimized: true`)
- [ ] Convert large brand PNGs to WebP (660 KB -> ~50 KB)
- [ ] Replace `dangerouslySetInnerHTML` in WorkModal.tsx
- [ ] Fix counter hydration flash (shows "0" on SSR)
- [ ] Remove `old-static/` from git
- [ ] Add custom 404 page

**Sprint 3 — Enhancements (Week 2-3):**
- [ ] Add analytics (Vercel Analytics or Google Analytics)
- [ ] Add contact form (replace mailto link)
- [ ] Add "Back to Top" button
- [ ] Add brand detail pages (`/marcas/[slug]`)
- [ ] Add skip-to-content link for accessibility
- [ ] Replace `<a>` with Next.js `<Link>` for internal nav

### Future Phases
- [ ] Franchise landing page (`/franchise`)
- [ ] Multi-step franchise application form
- [ ] Lead capture API with Supabase
- [ ] Multi-language support (next-intl)
- [ ] Light/dark theme toggle
- [ ] Privacy policy and terms pages
- [ ] Blog/news section for SEO

See [WEBSITE_ROADMAP.md](../WEBSITE_ROADMAP.md) for the complete migration plan.

---

## QA Checklist

Before deploying to production:
- [ ] Run `npm run build` with no errors
- [ ] Test on mobile (Chrome DevTools → iPhone 14)
- [ ] Test on tablet (iPad landscape and portrait)
- [ ] Verify all navigation links work
- [ ] Confirm contact email is correct
- [ ] Verify stats are up to date
- [ ] Check logos load correctly (dark logos should be inverted)
- [ ] Test franchise CTA and modal
- [ ] Verify Open Graph tags (use opengraph.xyz)

---

**Last Updated:** March 2026
**Version:** 2.0.0
