# Website Improvement Roadmap

**Grupo Omniprise - Corporate Website**

---

## OVERVIEW

**Current Version:** v2.6.1
**Live:** https://www.omniprise.com.py
**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Vercel Analytics

### Completed Phases

| Phase | Version | Description | Date |
|---|---|---|---|
| 1 | v2.0 | Foundation & design overhaul (Next.js migration) | March 28 |
| 2 | v2.0 | Content migration & polish (11 components) | March 28 |
| 3 | v2.1 | Franchise landing page | March 28 |
| 4 | v2.1 | Multi-step franchise application form | March 28 |
| 5 | v2.2.0 | Performance & SEO (WebP, analytics, OG tags) | March 28 |
| -- | v2.3.0 | Brand detail pages (7 dynamic routes) | March 29 |
| -- | v2.4.0 | Polish & completeness (privacy policy, gallery infra) | March 30 |
| -- | v2.5.0 | WhatsApp ordering, gallery photos, Zod validation | March 30 |
| -- | v2.6.0 | Layout consolidation, error page | April 1 |
| -- | v2.6.1 | Accessibility fixes (contrast, nested links, CSP) | April 2 |

---

## Routes

| Route | Description |
|---|---|
| `/` | Homepage -- Hero, Statement, Stats, Pillars, Brands, Vision, Partners (contact form), Franchise CTA |
| `/marcas/[slug]` | Brand detail pages -- Hero, Story, Stats, Gallery, Presence, CTA (7 brands, SSG) |
| `/franchise` | Franchise landing -- Benefits, Brands, Process, FAQ, CTA |
| `/franchise/apply` | 4-step application form (submits to Formspree) |
| `/privacidad` | Privacy policy (Spanish, Paraguay law) |

---

## Project Structure

```
Website/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Navbar + Footer + fonts + metadata)
│   │   ├── page.tsx                # Homepage
│   │   ├── error.tsx               # Custom error page
│   │   ├── globals.css             # Design tokens, animations, focus styles
│   │   ├── not-found.tsx           # Custom 404
│   │   ├── sitemap.ts              # Dynamic sitemap (auto-generated from brands)
│   │   ├── robots.ts               # Dynamic robots.txt
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
│   │   ├── PartnersSection.tsx     # Includes ContactForm at #contacto
│   │   ├── FranchiseSection.tsx    # Franchise CTA teaser
│   │   ├── ContactForm.tsx         # Formspree contact form
│   │   ├── WorkModal.tsx
│   │   ├── BackToTop.tsx
│   │   ├── ReducedMotionProvider.tsx
│   │   ├── ScrollTracker.tsx
│   │   ├── Footer.tsx
│   │   └── brand-detail/           # 6 brand page components
│   │       ├── BrandHero.tsx
│   │       ├── BrandStory.tsx
│   │       ├── BrandStats.tsx
│   │       ├── BrandGallery.tsx    # Lightbox with keyboard + touch nav
│   │       ├── BrandPresence.tsx
│   │       └── BrandCTA.tsx
│   └── lib/
│       ├── brands.ts               # Brand data + helpers (single source of truth)
│       ├── franchise-schema.ts     # Zod schemas for franchise form
│       ├── use-reveal.ts           # IntersectionObserver scroll reveal
│       ├── use-scroll-depth.ts     # Scroll depth tracking
│       └── utils.ts                # cn() utility
├── public/
│   ├── brands/                     # 7 brand logos (WebP)
│   ├── brands/gallery/             # 35 gallery photos (5 per brand)
│   ├── omniprise-logo.png          # Navbar/footer logo
│   ├── omniprise-logo.jpg          # OG/Twitter card image
│   ├── favicon-*.png               # Multi-size favicons
│   └── manifest.json
├── next.config.ts
├── vercel.json                     # Security headers + CSP
├── package.json
└── tsconfig.json
```

---

## Remaining Work

### P2 -- High Impact UX
- [ ] **Testimonials Section** -- Social proof for franchise landing page
- [ ] **Brand Gallery Photos** -- Replace placeholder gallery cards with real brand photography (awaiting manual assets)
- [ ] **Add auto-save** to franchise application form

### P3 -- Infrastructure
- [ ] **Supabase CRM Integration** -- Connect franchise leads to dashboard CRM module
- [ ] **CI/CD Pipeline** -- GitHub Actions for lint + build on PRs
- [ ] **Blog/news section** for SEO

### Phase 6 -- Multi-language Support
- [ ] Set up next-intl for i18n
- [ ] Create translation files (en.json, es.json)
- [ ] Add language switcher to nav
- [ ] Translate all content
- [ ] Add URL structure for languages (`/en`, `/es`)
- [ ] Implement language detection

---

## Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Score | 95+ |
| First Contentful Paint | <1.5s |
| Time to Interactive | <3s |
| Cumulative Layout Shift | <0.1 |

## Accessibility Targets

| Standard | Target |
|---|---|
| WCAG | 2.1 AA Compliant |
| Keyboard navigation | Full support |
| Screen reader | Full support |
| Color contrast | >4.5:1 for all text |

---

*Last Updated:* April 2, 2026 -- v2.6.1
*Next Milestone:* Gallery photos + testimonials (P2), then multi-language (Phase 6)
