# Omniprise — Website & Corporate Platform

**Version 2.1 | March 28, 2026**

---

## Current Status

The website is a **Next.js 15 application** with a full React component architecture, franchise lead capture pages, and SEO optimizations.

- **Live URL:** https://www.omniprise.com.py
- **Dashboard:** https://dashboard.omniprise.com.py (v1.21.0, 15/15 modules)
- **Deployment:** Vercel (auto-deploys from `main` branch)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 + TypeScript |
| Styling | Tailwind CSS 4 (dark + colorful hybrid) |
| Animations | framer-motion |
| Icons | lucide-react |
| Fonts | Barlow Condensed (display), Inter (body) |
| Deployment | Vercel |
| Database | Supabase (dashboard only, planned for franchise) |

---

## Project Structure

```
Website/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, metadata, manifest)
│   │   ├── page.tsx                # Homepage (JSON-LD + 9 sections)
│   │   ├── globals.css             # Design tokens, animations, base styles
│   │   └── franchise/
│   │       ├── page.tsx            # Franchise landing page
│   │       └── apply/
│   │           └── page.tsx        # Multi-step application form (4 steps)
│   ├── components/
│   │   ├── Navbar.tsx              # Fixed nav with mobile hamburger
│   │   ├── HeroSection.tsx         # Full-viewport hero with CTAs
│   │   ├── StatementSection.tsx    # Mission statement
│   │   ├── StatsSection.tsx        # Animated counters
│   │   ├── PillarsSection.tsx      # Business pillars grid
│   │   ├── BrandsSection.tsx       # 7 brand logos and descriptions
│   │   ├── VisionSection.tsx       # Company vision
│   │   ├── PartnersSection.tsx     # Partner network
│   │   ├── FranchiseSection.tsx    # Franchise CTA on homepage
│   │   ├── Footer.tsx              # Footer with nav links
│   │   └── WorkModal.tsx           # "Trabajemos juntos" modal
│   └── lib/
│       ├── utils.ts                # cn() utility
│       └── use-reveal.ts           # Scroll-triggered reveal hooks
├── public/
│   ├── brands/                     # 7 PNG brand logos
│   ├── logos/                      # Omniprise SVG + JPG logos
│   ├── favicon-*.png               # Multi-size favicons
│   ├── apple-touch-icon.png
│   ├── android-chrome-*.png
│   ├── manifest.json               # PWA manifest
│   ├── robots.txt
│   ├── sitemap.xml
│   └── omniprise.svg / omniprise-dark.svg
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## Routes

| Route | Description |
|---|---|
| `/` | Homepage — Hero, Statement, Stats, Pillars, Brands, Vision, Partners, Franchise CTA, Footer |
| `/franchise` | Franchise landing page — Benefits, Brands showcase, Process, FAQ, CTA |
| `/franchise/apply` | 4-step application form — Personal info, Brand preferences, Investment, Motivation |

---

## Completed Work

### v2.0 — Next.js Migration (March 28, 2026)
- Full migration from single HTML file to Next.js 15 + TypeScript
- 11 React components with framer-motion animations
- Dark + colorful hybrid design system aligned with dashboard
- Real PNG brand logos, mobile responsive, Open Graph meta tags

### v2.1 — Franchise & SEO (March 28, 2026)
- Franchise landing page at `/franchise` (hero, benefits, process, FAQ, CTA)
- Multi-step application form at `/franchise/apply` (4 steps, validation, success page)
- SEO: favicon, manifest.json, sitemap.xml, robots.txt, JSON-LD, Twitter Cards
- Navigation updated across Navbar, Footer, Hero to link to franchise pages

---

## Design System

**Colors:**
- Brand: `#0ea5e9` (sky blue)
- Surfaces: `#09090b` → `#2a2a28` (dark scale)
- Text: `#f5f4f0` primary, `rgba(245,244,240,0.6)` secondary
- Borders: `rgba(255,255,255,0.08–0.24)`

**Typography:**
- Headings: Barlow Condensed (display font, uppercase, bold/black)
- Body: Inter (clean, readable)

**Component Patterns:**
- Cards with `bg-surface-900 border border-border-subtle rounded-2xl`
- CTAs: `bg-omniprise-500 hover:bg-omniprise-400 rounded-full`
- Animations: Scroll-triggered reveals via `useReveal()` hook

---

## Development

```bash
cd Website
npm install
npm run dev
# Visit http://localhost:3001
```

```bash
npm run build    # Production build
npm run lint     # ESLint check
```

---

## Deployment

Push to `main` triggers automatic Vercel deployment:

```bash
git add .
git commit -m "description"
git push origin main
```

---

## Remaining Work

| Priority | Task | Status |
|---|---|---|
| High | Google Analytics 4 integration | Pending |
| High | Franchise form backend (Supabase API route) | Pending |
| Medium | Zod form validation | Pending |
| Medium | Core Web Vitals optimization (logo compression) | Pending |
| Low | Multi-language support (next-intl) | Pending |

---

## Documentation Index

| Document | Description |
|---|---|
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete project overview (dashboard + website + franchise) |
| [WEBSITE_ROADMAP.md](WEBSITE_ROADMAP.md) | Website implementation phases |
| [FRANCHISE_FEATURE_ROADMAP.md](FRANCHISE_FEATURE_ROADMAP.md) | Franchise system design (6-week plan) |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Full design system reference |
| [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) | System architecture docs |
| [DATA_MODEL.md](DATA_MODEL.md) | Database schema |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) | Deployment guide |

---

**Last Updated:** March 28, 2026
**Version:** 2.1.0
**Status:** Phase 1-4 Complete | Phase 5 (partial) & 6 Remaining
**Next Milestone:** Franchise Backend Integration (Supabase)
