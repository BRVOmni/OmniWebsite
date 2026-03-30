# Omniprise — Corporate Website

The marketing website for Grupo Omniprise, a food service operator in Paraguay running 7 brands across 17 locations.

**Live:** https://www.omniprise.com.py

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Fonts | Barlow Condensed (display), Inter (body) |
| Forms | Formspree (contact + franchise) |
| Analytics | Vercel Analytics (pageviews + custom events) |
| Deployment | Vercel (auto-deploys from `main`) |

---

## Routes

| Route | Description |
|---|---|
| `/` | Homepage — Hero, Statement, Stats, Pillars, Brands grid, Vision, Partners, Franchise CTA |
| `/marcas/[slug]` | Brand detail pages — Hero, Story, Stats, Gallery, Presence, CTA (7 brands, SSG) |
| `/franchise` | Franchise landing — Benefits, Brands, Process, FAQ, CTA |
| `/franchise/apply` | 4-step application form (submits to Formspree) |
| `/privacidad` | Privacy policy (Spanish, Paraguay law) |

---

## Project Structure

```
Website/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, metadata, analytics, reduced motion)
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Design tokens, animations
│   │   ├── not-found.tsx           # Custom 404
│   │   ├── sitemap.ts              # Dynamic sitemap (auto-generated from brands)
│   │   ├── privacidad/page.tsx     # Privacy policy
│   │   ├── franchise/
│   │   │   ├── page.tsx            # Franchise landing
│   │   │   └── apply/page.tsx      # Multi-step application form
│   │   └── marcas/[slug]/page.tsx  # Brand detail pages (SSG)
│   ├── components/
│   │   ├── Navbar.tsx              # Fixed nav + mobile hamburger + work modal
│   │   ├── HeroSection.tsx
│   │   ├── StatementSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── PillarsSection.tsx
│   │   ├── BrandsSection.tsx       # 3-column brand card grid
│   │   ├── VisionSection.tsx
│   │   ├── PartnersSection.tsx     # Contact form
│   │   ├── FranchiseSection.tsx    # Franchise CTA teaser
│   │   ├── ContactForm.tsx         # Formspree contact form
│   │   ├── WorkModal.tsx
│   │   ├── BackToTop.tsx
│   │   ├── ReducedMotionProvider.tsx
│   │   ├── Footer.tsx
│   │   └── brand-detail/           # 6 brand page components
│   │       ├── BrandHero.tsx
│   │       ├── BrandStory.tsx
│   │       ├── BrandStats.tsx
│   │       ├── BrandGallery.tsx    # Lightbox with keyboard nav
│   │       ├── BrandPresence.tsx
│   │       └── BrandCTA.tsx
│   └── lib/
│       ├── brands.ts               # Brand data + helpers (single source of truth)
│       ├── utils.ts                # cn() utility
│       └── use-reveal.ts           # IntersectionObserver scroll reveal
├── public/
│   ├── brands/                     # Brand logos (WebP)
│   ├── brands/gallery/             # Gallery images (empty — photos pending)
│   ├── logos/                      # Omniprise logos
│   ├── favicon-*.png               # Multi-size favicons
│   ├── manifest.json
│   ├── robots.txt
│   └── omniprise-logo.png
├── next.config.ts
├── vercel.json                     # Framework detection for monorepo
├── package.json
└── tsconfig.json
```

---

## Development

```bash
cd Website
npm install
npm run dev        # http://localhost:3001
npm run build      # Production build
npm run lint       # ESLint
```

---

## Analytics Events

Custom events tracked via Vercel Analytics:

| Event | Properties | Where |
|---|---|---|
| `contact_form_submitted` | `{ status }` | Homepage contact form |
| `franchise_form_step` | `{ step, from }` | Franchise form step advance |
| `franchise_form_submitted` | `{ status, brand }` | Franchise form submission |
| `franchise_cta` | `{ source, action, brand? }` | All franchise CTA buttons |
| `work_modal_opened` | — | Navbar modal |
| `brand_card_clicked` | `{ brand }` | Homepage brand grid |

---

## Pending

- Brand gallery photos (directories created, photos needed)
- Multi-language support (next-intl)
- Franchise CRM integration (dashboard repo)
