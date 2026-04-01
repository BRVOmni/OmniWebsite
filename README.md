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

## Git Workflow — READ THIS FIRST

This repo is a monorepo. The website lives in `Website/`. The root contains legacy dashboard code.

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
│   │   ├── layout.tsx              # Root layout (Navbar + Footer + fonts + metadata)
│   │   ├── page.tsx                # Homepage
│   │   ├── error.tsx               # Custom error page
│   │   ├── globals.css             # Design tokens, animations
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
│   │   ├── PartnersSection.tsx
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
| `whatsapp_order` | `{ source, brand }` | WhatsApp CTA buttons |
| `brand_card_clicked` | `{ brand }` | Homepage brand grid |
| `scroll_depth` | `{ percent }` | Scroll milestones (25/50/75/90%) |

---

## Vercel Configuration

| Setting | Value | Why |
|---|---|---|
| Framework | Next.js | Auto-detected |
| Root Directory | `Website` | Monorepo — Vercel builds inside `Website/` |
| Branch | `main` | Only main triggers production deploys |

---

## Pending

- Multi-language support (next-intl)
- Franchise CRM integration (Supabase)
- Blog/news section for SEO
- CI/CD pipeline (GitHub Actions)
