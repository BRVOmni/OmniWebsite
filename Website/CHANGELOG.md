# Changelog

All notable changes to the Omniprise corporate website.

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
