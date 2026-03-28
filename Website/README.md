# Omniprise — Website Documentation

**Version 2.0.0 | Next.js 15 | March 2026**

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

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.1.6 | Framework |
| React | 19.0.0 | UI library |
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
│   ├── omniprise.svg            # Logo (light)
│   ├── omniprise-dark.svg       # Logo (dark)
│   └── omniprise-logo.jpg       # Logo (JPEG fallback)
├── next.config.ts               # Next.js config
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
  const ref = useReveal();
  return <section ref={ref}>...</section>;
}
```

### Adding a New Brand
1. Add the PNG logo to `public/brands/`
2. Update the `brands` array in `src/components/BrandsSection.tsx`:
```tsx
{
  name: "Brand Name",
  tagline: "Tagline here",
  description: "2-3 sentences about the brand",
  tag: "Marca propia",
  badge: "Badge text",
  logo: "/brands/brand-logo.png",
}
```

### Updating Stats
Edit the `stats` array in `src/components/StatsSection.tsx`:
```tsx
{ label: "Marcas", value: 7, suffix: "" },
{ label: "Locales", value: 17, suffix: "" },
```

### Updating Contact Email
Search for `@omniprise.com.py` across components to find all email references.

---

## Deployment

### Vercel (Production)
The site auto-deploys from the GitHub `main` branch via Vercel integration.

**Configuration:** `vercel.json` sets `"framework": "nextjs"`

### Manual Deploy
```bash
npm run build
npx vercel --prod
```

### DNS Configuration
- **Type A:** `@` → `76.76.21.21`
- **Type CNAME:** `www` → `cname.vercel-dns.com`

SSL is handled automatically by Vercel.

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
- [x] Vercel deployment

### Next Up
- [ ] Replace Google Form placeholder with actual URL
- [ ] Add favicon and manifest.json
- [ ] Create sitemap.xml and robots.txt
- [ ] Add Google Analytics 4
- [ ] Implement structured data (JSON-LD)

### Future Phases
- [ ] Franchise landing page (`/franchise`)
- [ ] Multi-step franchise application form
- [ ] Lead capture API with Supabase
- [ ] Multi-language support (next-intl)
- [ ] Light/dark theme toggle

See [WEBSITE_ROADMAP.md](../WEBSITE_ROADMAP.md) for the complete migration plan.

---

## QA Checklist

Before deploying to production:
- [ ] Test on mobile (Chrome DevTools → iPhone 14)
- [ ] Test on tablet (iPad landscape and portrait)
- [ ] Verify all navigation links work
- [ ] Confirm contact email is correct
- [ ] Verify stats are up to date
- [ ] Check logos load correctly
- [ ] Test franchise CTA and modal
- [ ] Verify Open Graph tags (use opengraph.xyz)
- [ ] Run `npm run build` with no errors

---

**Last Updated:** March 2026
**Version:** 2.0.0
