# 🌐 Website Improvement Roadmap

**Grupo Omniprise - Corporate Website**

---

## 📋 OVERVIEW

**Current State:** Next.js 15 project with TypeScript, Tailwind CSS 4, and 11 React components

**Completed (v2.0 - March 28, 2026):**
- ✅ Full Next.js 15 migration from single HTML file
- ✅ 11 React components (Navbar, Hero, Statement, Stats, Pillars, Brands, Vision, Partners, Franchise, Footer, WorkModal)
- ✅ Tailwind CSS 4 with custom design tokens (dark + colorful hybrid)
- ✅ Real PNG brand logos for 7 brands
- ✅ framer-motion animations with scroll-triggered reveals
- ✅ Mobile responsive with hamburger menu
- ✅ Open Graph meta tags
- ✅ Franchise section with CTA
- ✅ Vercel deployment configured
- ✅ Comprehensive franchise section created with:
  - Value proposition and benefits cards
  - 4-step process visualization
  - Google Form integration (placeholder - needs actual URL)
  - Responsive design for all devices
- ✅ Footer navigation updated with franchise link

**Remaining Work:**
- ⚠️ Google Form placeholder needs actual URL
- ⚠️ No favicon, sitemap.xml, robots.txt, or structured data
- ⚠️ No analytics tracking or metrics
- ⚠️ Single language (Spanish only)
- ⚠️ Franchise landing page and application form not yet built

**Target State:** Modern, premium Next.js website aligned with dashboard design system, with comprehensive franchise lead capture

---

## 🎯 DESIGN VISION

### Current Design Issues
```
Current Website:
- 100% monochromatic (black/white)
- Apple-inspired (dark, minimal)
- Base64 embedded logo
- Oversized Barlow Condensed typography
- Aggressive negative space

Dashboard:
- Modern, colorful, clean
- Brand colors: #0ea5e9, #22c55e, #eab308, #ef4444
- Proper asset management
- Inter + Barlow typography
- Spacious but organized

PROBLEM: Complete visual language mismatch
```

### Design Philosophy
```
Modern → Not old-school corporate
Premium → Not cheap or basic
Clean → Not cluttered or heavy
Clear → Not confusing or ambiguous
Consistent → Aligned with dashboard design system
```

### Design System Alignment
```css
/* Color Palette - Match Dashboard */
:root {
  /* Brand Colors */
  --primary: #0ea5e9;          /* Sky blue */
  --primary-hover: #0284c7;

  /* Semantic Colors */
  --success: #22c55e;           /* Green */
  --warning: #eab308;           /* Yellow */
  --error: #ef4444;             /* Red */
  --info: #3b82f6;              /* Blue */

  /* Neutrals */
  --white: #ffffff;
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
  --slate-950: #020617;

  /* Background */
  --bg-primary: #f8fafc;       /* Light, clean */
  --bg-secondary: #ffffff;
  --bg-accent: #f0f9ff;
}

/* Typography */
:root {
  --font-display: 'Barlow Condensed', sans-serif;  /* Headings */
  --font-body: 'Inter', sans-serif;                /* Body text */
  --font-mono: 'JetBrains Mono', monospace;       /* Numbers */
}
```

---

## 📅 IMPLEMENTATION PHASES

### Phase 1: Foundation & Design Overhaul — COMPLETED
**Goal:** Migrate to Next.js and align design with dashboard

**Completed:**
- [x] Initialize Next.js 15 project with TypeScript
- [x] Set up Tailwind CSS with shared design tokens
- [x] Create proper folder structure
- [x] Extract logo from base64 → SVG files
  - `/public/omniprise.svg` (light theme)
  - `/public/omniprise-dark.svg` (dark theme)
- [x] Update color palette to match dashboard (dark + colorful hybrid)
- [x] Rebuild hero section with new design
- [x] Update navigation with proper logo handling

**Deliverables:**
- ✅ Next.js project structure
- ✅ Design system aligned with dashboard
- ✅ Proper logo assets
- ✅ Hero section redesigned

---

### Phase 2: Content Migration & Polish — COMPLETED
**Goal:** Migrate all sections to Next.js components

**Completed:**
- [x] Create component structure (11 components in src/components/)
- [x] Migrate each section to React components
- [x] Optimize brand logos (PNG files in public/brands/)
- [x] Add responsive improvements
- [x] Improve mobile navigation (hamburger menu)
- [x] Add smooth page transitions (framer-motion)
- [x] Optimize images and assets

**Deliverables:**
- ✅ All sections as React components
- ✅ Improved mobile experience
- ✅ Optimized assets
- ✅ Proper component architecture

---

### Phase 3: Franchise Feature - Landing (Week 3)
**Goal:** Create compelling franchise landing page

**Tasks:**
- [ ] Create franchise landing page (`/franchise`)
- [ ] Design franchise hero section
- [ ] Create 3-step process visualization
- [ ] Add social proof section
- [ ] Design benefits section
- [ ] Create FAQ section
- [ ] Add testimonials section
- [ ] Implement clear CTAs

**Deliverables:**
- ✅ Franchise landing page
- ✅ Clear value proposition
- ✅ Social proof elements
- ✅ Multiple CTA opportunities

---

### Phase 4: Franchise Feature - Application Form (Week 4)
**Goal:** Build multi-step, validated application form

**Tasks:**
- [ ] Create application page (`/franchise/apply`)
- [ ] Design multi-step form wizard:
  - Step 1: Personal Information
  - Step 2: Current Brand Details
  - Step 3: Expectations & Investment
- [ ] Add form validation (Zod)
- [ ] Implement progress indicator
- [ ] Add auto-save functionality
- [ ] Create confirmation page
- [ ] Add email notifications
- [ ] Implement lead capture API

**Deliverables:**
- ✅ Multi-step application form
- ✅ Form validation
- ✅ Lead capture backend
- ✅ Email notifications

---

### Phase 5: Performance & SEO (Week 5)
**Goal:** Optimize for search engines and performance

**Tasks:**
- [ ] Add Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Add meta descriptions
- [ ] Implement structured data (JSON-LD)
- [ ] Create sitemap.xml
- [ ] Create robots.txt
- [ ] Optimize Core Web Vitals
- [ ] Add Google Analytics 4
- [ ] Add Favicon
- [ ] Add manifest.json (PWA)

**Deliverables:**
- ✅ SEO-optimized website
- ✅ Fast Core Web Vitals
- ✅ Analytics tracking
- ✅ Search engine visibility

---

### Phase 6: Multi-language Support (Week 6)
**Goal:** Add English language option

**Tasks:**
- [ ] Set up next-intl for i18n
- [ ] Create translation files (en.json, es.json)
- [ ] Add language switcher to nav
- [ ] Translate all content
- [ ] Add URL structure for languages (`/en`, `/es`)
- [ ] Implement language detection

**Deliverables:**
- ✅ English/Spanish support
- ✅ Language switcher
- ✅ All content translated

---

## 📁 PROJECT STRUCTURE

```
Website/
├── src/
│   ├── app/
│   │   ├── [lang]/              # Language routing (en, es)
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── franchise/
│   │   │   │   ├── page.tsx     # Franchise info
│   │   │   │   └── apply/
│   │   │   │       └── page.tsx # Application form
│   │   │   ├── contact/
│   │   │   │   └── page.tsx     # Contact page
│   │   │   └── layout.tsx       # Root layout
│   │   └── api/
│   │       └── franchise/
│   │           └── leads/
│   │               ├── route.ts   # POST - Submit lead
│   │               └── [id]/route.ts # GET/PUT - Lead details
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── hero/
│   │   │   ├── hero-section.tsx
│   │   │   └── hero-stats.tsx
│   │   ├── brands/
│   │   │   ├── brands-grid.tsx
│   │   │   └── brand-card.tsx
│   │   ├── about/
│   │   │   ├── statement.tsx
│   │   │   └── pillars.tsx
│   │   ├── franchise/
│   │   │   ├── franchise-hero.tsx
│   │   │   ├── benefits.tsx
│   │   │   ├── process.tsx
│   │   │   ├── testimonials.tsx
│   │   │   └── faq.tsx
│   │   ├── forms/
│   │   │   ├── application-form.tsx
│   │   │   ├── step-personal.tsx
│   │   │   ├── step-brand.tsx
│   │   │   └── step-expectations.tsx
│   │   └── ui/
│   │       └── (shadcn/ui components)
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Shared with dashboard
│   │   │   └── types.ts      # Shared types
│   │   ├── validations/
│   │   │   ├── franchise.ts  # Zod schemas
│   │   │   └── index.ts
│   │   └── utils.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── i18n/
│       ├── en.json
│       └── es.json
│
├── public/
│   ├── logos/
│   │   ├── omniprise.svg
│   │   └── omniprise-dark.svg
│   ├── brands/
│   │   ├── ufo.svg
│   │   ├── los-condenados.svg
│   │   ├── rocco.svg
│   │   ├── sammys.svg
│   │   ├── pastabox.svg
│   │   ├── mr-chow.svg
│   │   └── barrio-pizzero.svg
│   ├── images/
│   │   ├── hero-bg.jpg
│   │   └── team/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
│
├── components.json              # shadcn/ui config
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 DESIGN SPECIFICATIONS

### Hero Section
```tsx
// New hero design (aligned with dashboard)
<HeroSection>
  <HeroBadge>
    Asunción, Paraguay — 2024
  </HeroBadge>

  <HeroHeadline>
    No somos<br/>
    <em>un restaurante</em>
  </HeroHeadline>

  <HeroSubheadline>
    Somos una <strong>plataforma de marcas gastronómicas</strong>
    con foco en escala, eficiencia y crecimiento sostenido.
  </HeroSubheadline>

  <HeroCTA>
    <Button variant="primary" size="lg">
      Conoce Nuestras Marcas
    </Button>
    <Button variant="outline" size="lg">
      Conviértete en Socio →
    </Button>
  </HeroCTA>

  <HeroStats>
    <Stat label="Marcas">7</Stat>
    <Stat label="Locales">17</Stat>
    <Stat label="Colaboradores">135</Stat>
    <Stat label="Crecimiento">30%</Stat>
  </HeroStats>
</HeroSection>
```

### Brand Card Component
```tsx
// Modern brand card design
<BrandCard>
  <BrandLogo src="/brands/ufo.svg" alt="UFO" />
  <BrandTag>Marca propia — Marzo 2025</BrandTag>
  <BrandName>UFO</BrandName>
  <BrandTagline>Experiencia gastronómica temática de alto impacto</BrandTagline>
  <BrandDescription>
    Restaurante temático único en su clase con 1.600 m² y capacidad
    para 250 personas...
  </BrandDescription>
  <BrandBadge variant="success">Marca Insignia</BrandBadge>
</BrandCard>
```

---

## 🔧 TECHNICAL REQUIREMENTS

### Dependencies
```json
{
  "dependencies": {
    "next": "^15.1.6",
    "react": "^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@supabase/supabase-js": "^2.99.2",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.577.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.5.0",
    "next-intl": "^3.0.0"
  }
}
```

### Performance Targets
- **Lighthouse Score:** 95+
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Cumulative Layout Shift:** <0.1
- **Total Bundle Size:** <200KB

### Accessibility Targets
- **WCAG 2.1 AA Compliant**
- Keyboard navigation
- Screen reader support
- Color contrast ratio >4.5:1

---

## 📊 SUCCESS METRICS

### Conversion Metrics
- Franchise form completion rate: >70%
- Time to complete form: <5 minutes
- Lead quality score (qualified leads): >40%

### Engagement Metrics
- Average time on site: >2 minutes
- Bounce rate: <40%
- Pages per session: >3

### SEO Metrics
- Organic traffic growth: +20% month-over-month
- Keywords ranking: Top 10 for "franchise gastronomía Paraguay"
- Domain Authority: 30+

---

## COMPLETED WORK

### Phase 1 & 2 (v2.0 — March 28, 2026)
- ✅ **Next.js 15 Migration** — Full React component architecture replacing single HTML file
- ✅ **11 Components** — Navbar, Hero, Statement, Stats, Pillars, Brands, Vision, Partners, Franchise, Footer, WorkModal
- ✅ **Design System** — Dark + colorful hybrid with sky blue (#0ea5e9) accents, Tailwind CSS 4
- ✅ **Real Brand Logos** — 7 PNG logos in public/brands/
- ✅ **Animations** — framer-motion scroll reveals, animated counters, transitions
- ✅ **Mobile Responsive** — Hamburger menu, responsive grids
- ✅ **Open Graph** — Meta tags for social sharing
- ✅ **Franchise Section** — CTA, benefits, 4-step process
- ✅ **Vercel Deployment** — Configured with `"framework": "nextjs"`

### Pre-v2.0 Quick Wins (Completed in v1.x)
- ✅ **Logo Handling** — Base64 extracted to proper SVG/JPEG assets
- ✅ **Franchise CTA** — Hero button and franchise section
- ✅ **Text Fixes** — "dark-kitchens", "con mucha trayectoria", "30%"

## NEXT TASKS

1. **Setup Google Form** — Replace placeholder URL with actual form
2. **Add SEO Assets** — favicon, sitemap.xml, robots.txt, structured data
3. **Add Analytics** — Google Analytics 4 integration
4. **Start Phase 3** — Franchise landing page and application form

---

## NEXT STEPS

1. ✅ ~~Review roadmap with stakeholders~~
2. ✅ ~~Approve Phase 1 scope~~
3. ✅ ~~Begin Phase 1 implementation~~
4. ✅ ~~Complete Logo Fix Quick Win (v1.3)~~
5. ✅ ~~Add Franchise CTA to Website~~
6. ✅ ~~Phase 1: Foundation & Design Overhaul~~
7. ✅ ~~Phase 2: Content Migration~~
8. ⏳ Phase 3: Franchise Feature - Landing Page
9. ⏳ Phase 4: Franchise Feature - Application Form
10. ⏳ Phase 5: Performance & SEO
11. ⏳ Phase 6: Multi-language Support

---

**Last Updated:** March 28, 2026 - Phase 1 & 2 Complete
**Status:** Phase 1-2 Complete | Phase 3-6 Remaining
**Next Milestone:** Franchise Landing Page
