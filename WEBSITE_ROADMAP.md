# 🌐 Website Improvement Roadmap

**Grupo Omniprise - Corporate Website**

---

## 📋 OVERVIEW

**Current State:** Single HTML file (45KB) with embedded CSS/JS, Apple-inspired dark monochromatic design

**Recent Progress (v1.4):**
- ✅ Logo fix complete - base64 extracted to proper asset
- ✅ File size reduced from 80KB to 45KB (44% reduction)
- ✅ Proper asset management at `/public/logos/omniprise-logo.jpg`
- ✅ Franchise CTA added to hero section with animated button
- ✅ Comprehensive franchise section created with:
  - Value proposition and benefits cards
  - 4-step process visualization
  - Google Form integration (placeholder - needs actual URL)
  - Responsive design for all devices
- ✅ Footer navigation updated with franchise link

**Remaining Issues:**
- ⚠️ Google Form placeholder needs actual URL
- ❌ Design mismatch with dashboard (monochromatic vs modern/colorful)
- ❌ No component structure or build process
- ❌ No analytics tracking or metrics
- ❌ Single language (Spanish only)

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

### Phase 1: Foundation & Design Overhaul (Week 1)
**Goal:** Migrate to Next.js and align design with dashboard

**Tasks:**
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Set up Tailwind CSS with shared design tokens
- [ ] Create proper folder structure
- [ ] Extract logo from base64 → SVG files
  - `/public/logos/omniprise.svg` (light theme)
  - `/public/logos/omniprise-dark.svg` (dark theme)
- [ ] Update color palette to match dashboard
- [ ] Rebuild hero section with new design
- [ ] Update navigation with proper logo handling
- [ ] Add theme support (light/dark)

**Deliverables:**
- ✅ Next.js project structure
- ✅ Design system aligned with dashboard
- ✅ Proper logo assets
- ✅ Hero section redesigned

---

### Phase 2: Content Migration & Polish (Week 2)
**Goal:** Migrate all sections to Next.js components

**Tasks:**
- [ ] Create component structure:
  - `src/components/hero/`
  - `src/components/brands/`
  - `src/components/about/`
  - `src/components/stats/`
  - `src/components/pillars/`
  - `src/components/vision/`
  - `src/components/contact/`
  - `src/components/layout/` (nav, footer)
- [ ] Migrate each section to React components
- [ ] Optimize brand logos (SVG from embedded code)
- [ ] Add responsive improvements
- [ ] Improve mobile navigation
- [ ] Add smooth page transitions
- [ ] Optimize images and assets

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

## ✅ COMPLETED QUICK WINS

These have been completed on the current HTML site:

1. ✅ **Fix Logo Handling (COMPLETED)**
   - ✅ Extracted base64 logo → created `/logos/omniprise-logo.jpg`
   - ✅ Updated `<img>` tags to use asset file
   - ✅ Removed 35KB of base64 bloat
   - ✅ **Result:** 44% HTML file size reduction, better performance

2. ✅ **Add Franchise CTA (COMPLETED - v1.5)**
   - ✅ Added "Conviértete en Franquiciado" button to hero section
   - ✅ Created comprehensive franchise section (Omniprise selling franchises to entrepreneurs)
   - ✅ Added 3 key benefit cards (Proven Brands, Integral Support, Profitable Model)
   - ✅ Implemented 4-step franchise process (Postulación → Evaluación → Propuesta → Apertura)
   - ✅ Added Google Form integration (placeholder - needs actual URL)
   - ✅ Updated header navigation with franchise link
   - ✅ Updated footer navigation with franchise link
   - ✅ Responsive design for all devices
   - ✅ **Result:** Complete franchise lead capture ready for Google Form integration

3. ✅ **Fix Vercel Deployment (COMPLETED - v1.5)**
   - ✅ Fixed vercel.json outputDirectory configuration
   - ✅ Changed from "public" to "." for correct deployment
   - ✅ Deployed new production version with all fixes
   - ✅ Updated Vercel alias to point www.omniprise.com.py to correct deployment
   - ✅ **Result:** All website changes now live at production URL

## 🚨 NEXT QUICK WINS (Week 1)

These can be done immediately on the current HTML site:

1. **Setup Google Form**
   - Replace placeholder URL with actual Google Form
   - Create form with required fields from FRANCHISE_FEATURE_ROADMAP.md
   - Configure email notifications
   - Test form submission workflow

2. **Fix Logo Assets**
3. **Improve Navigation**
   - Add language switcher (visual only for now)
   - Improve mobile menu
   - Add active state indicators

4. **Add Meta Tags**
   - Open Graph tags for social sharing
   - Twitter Card tags
   - Meta descriptions

---

## 📝 NEXT STEPS

1. ✅ Review this roadmap with stakeholders
2. ✅ Approve Phase 1 scope
3. ✅ Begin Phase 1 implementation
4. ✅ Complete Logo Fix Quick Win (v1.3)
5. ⏳ Add Franchise CTA to Website
6. ⏳ Complete Phase 1-6
7. ⏳ Launch new website
8. ⏳ Monitor metrics and iterate

---

**Last Updated:** 2026-03-26 - Logo Fix Complete ✅
**Status:** 📋 Roadmap Defined | Quick Wins in Progress
**Next Milestone:** Franchise CTA Implementation

---

## 📅 CURRENT STATUS - END OF DAY

**Date:** 2026-03-26  
**Website Version:** v1.5.2 (Logo Fixed & All Features Complete)  
**Production URL:** https://www.omniprise.com.py ✅ **LIVE & WORKING**

### ✅ TODAY'S ACHIEVEMENTS

**Complete Franchise Features:**
- ✅ Correct franchise perspective (Omniprise selling franchises to entrepreneurs)
- ✅ Professional franchise landing section with proper benefits
- ✅ Header navigation with franchise link
- ✅ Footer navigation with franchise link
- ✅ Hero CTA button: "Conviértete en Franquiciado →"

**All Text Fixes Applied:**
- ✅ "cocinas ocultas" → "dark-kitchens" (globally)
- ✅ "consolidadas" → "con mucha trayectoria en el mercado"
- ✅ Stats percentage display: "30%" (correct format)

**Logo Issues Resolved:**
- ✅ Professional SVG logo created (OMNIPRISE with brand colors)
- ✅ Logo files deployed and accessible on production
- ✅ Logo working in both header and footer
- ✅ Removed problematic CSS filters
- ✅ Proper file structure for Vercel deployment

**Technical Improvements:**
- ✅ Vercel deployment configuration fixed
- ✅ Vercel aliases updated and working
- ✅ Automated deployment from GitHub
- ✅ Production URL properly configured

**Documentation:**
- ✅ All documentation files updated
- ✅ PROJECT_SUMMARY.md reflects current state
- ✅ WEBSITE_ROADMAP.md updated with completed features
- ✅ Ready for tomorrow's work

### 🎯 READY FOR TOMORROW

**Current State:** Everything working and documented
**Production:** Live and operational
**Next Priority:** Setup Google Form for franchise applications
**Backup Status:** All changes committed and pushed to GitLab + GitHub

**The website is fully functional and ready for continued development.** 🚀
