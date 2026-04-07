# Testing Strategy

## Current State

| Layer | Tool | Coverage |
|---|---|---|
| Unit | Vitest | Zod schema validation (28 tests), utility functions (18 tests) |
| Component | Vitest + React Testing Library | ContactForm (6), WorkModal (8), ThemeToggle (6), BackToTop (4) |
| E2E | Playwright (Chromium) | Homepage (4), brand pages (16), franchise form (5), navigation (4), accessibility (6) |
| Accessibility | @axe-core/playwright | Automated WCAG audits on 5 pages (homepage, brand detail, franchise, apply, privacy) |
| Visual Regression | — | Not yet implemented |
| Lint | ESLint + jsx-a11y | Static accessibility analysis, 0 violations |

**Totals:** 70 unit/component tests + 40 E2E tests = **110 tests**

## Test Files

### Unit & Component (`Website/src/__tests__/`)

| File | Tests | What it covers |
|---|---|---|
| `franchise-schema.test.ts` | 28 | Zod validation for all 4 form steps + contact schema |
| `utils.test.ts` | 18 | `cn()`, `getBrandBySlug()`, `whatsappOrderUrl()`, `getAllBrandSlugs()`, BRANDS data integrity |
| `contact-form.test.tsx` | 6 | ContactForm render, validation, submit, error states |
| `work-modal.test.tsx` | 8 | WorkModal open/close, aria-modal, Escape key, overlay click |
| `theme-toggle.test.tsx` | 6 | ThemeToggle dark/light toggle, aria-labels, localStorage persistence |
| `back-to-top.test.tsx` | 4 | BackToTop visibility, scroll behavior, accessibility |

### E2E (`Website/e2e/`)

| File | Tests | What it covers |
|---|---|---|
| `homepage.spec.ts` | 4 | Hero section, brands grid, contact form, navigation |
| `brand-pages.spec.ts` | 16 | All 7 brand detail pages, navigation from homepage, 404 |
| `franchise-form.spec.ts` | 5 | Form render, disabled states, email link, step indicator |
| `navigation.spec.ts` | 4 | Mobile menu, 404 page, WhatsApp wa.me link, language switcher |
| `accessibility.spec.ts` | 6 | Skip link, lang attribute, validation errors, document title, alt text |
| `accessibility-audit.spec.ts` | 5 | axe-core automated WCAG audits (logs violations, non-blocking) |

## Running Tests

```bash
# Unit & component tests
cd Website
npm run test            # vitest run
npm run test -- --watch # watch mode

# E2E tests (requires dev server on port 3001)
cd Website
npm run test:e2e        # playwright test
npm run test:e2e:ui     # interactive Playwright UI

# Lint
cd Website
npm run lint            # eslint with typescript-eslint, jsx-a11y, @next/plugin
```

## Test Setup

- **Vitest config:** `Website/vitest.config.ts` — jsdom environment, React plugin, `@/` path alias
- **Setup file:** `Website/src/__tests__/setup.ts` — mocks for next-intl, framer-motion, lucide-react, next/image, @vercel/analytics
- **Playwright config:** `Website/playwright.config.ts` — Chromium only, auto-starts dev server, 2 retries in CI

## CI Integration

Tests run on every PR and push to `main` via `.github/workflows/ci.yml`:

| Job | Command | Notes |
|---|---|---|
| **Lint** | `npm run lint` | typescript-eslint + jsx-a11y + @next/plugin |
| **Test** | `npm run test` | 70 unit/component tests |
| **Build** | `npm run build` | Next.js production build |
| **E2E** | `npx playwright test` | 40 tests against built app, depends on build |
| **Lighthouse** | Lighthouse CI | Audits `/` and `/franchise` against budget |

Lint, test, and build run in parallel. E2E and Lighthouse run after build completes.

## Future Additions

- [ ] Coverage reporting (codecov or similar)
- [ ] Visual regression tests (Playwright screenshots or Chromatic)
- [ ] Add Firefox/WebKit to Playwright matrix
- [ ] Screen reader testing with NVDA/VoiceOver before major releases
