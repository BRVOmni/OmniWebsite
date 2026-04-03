# Testing Strategy

## Current State

| Layer | Tool | Coverage |
|---|---|---|
| Unit | Vitest | Zod schema validation (33 tests in `src/__tests__/franchise-schema.test.ts`) |
| Integration | — | None |
| E2E | — | None |
| Visual | — | None |
| Accessibility | axe-core (via eslint-plugin-jsx-a11y) | Lint-time only |

## Testing Pyramid

### Unit Tests (Priority: High)

**What to test:**
- Zod schemas (already covered)
- Utility functions (`cn()`, `getWhatsAppUrl()`, brand helpers)
- Data transformations and validation logic

**Where:** `Website/src/__tests__/`
**Runner:** `vitest run`
**Target:** 80% coverage on `src/lib/`

```bash
cd Website
npm run test
```

### Component Tests (Priority: Medium)

**What to test:**
- Form components render correctly with valid/invalid input
- ContactForm submits to Formspree (mocked)
- Franchise form step navigation
- Brand gallery lightbox open/close/keyboard navigation
- WorkModal focus trap and Escape key handling

**Recommended tools:** Vitest + React Testing Library

**Example:**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ContactForm from '@/components/ContactForm';

describe('ContactForm', () => {
  it('renders all fields', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
  });
});
```

### E2E Tests (Priority: Medium)

**Recommended tool:** Playwright

**Critical user flows to cover:**

| Flow | Steps |
|---|---|
| Homepage loads | Visit `/`, verify hero, brands grid, and contact form render |
| Brand page navigation | Click brand card → verify brand detail page loads with correct name/logo |
| Franchise form | Visit `/franchise/apply`, fill all 4 steps, verify submission |
| Contact form validation | Submit empty form → verify Spanish error messages appear |
| Gallery lightbox | Click gallery photo → verify lightbox opens → press Escape → verify it closes |
| Mobile navigation | Open hamburger menu → verify all links present → close |
| 404 page | Visit `/nonexistent` → verify custom 404 renders |
| WhatsApp CTA | Click WhatsApp button → verify correct `wa.me` link |

**Setup:**
```bash
cd Website
npm install -D @playwright/test
npx playwright install
```

### Accessibility Tests (Priority: Medium)

**Current:** Static analysis via `eslint-plugin-jsx-a11y` at lint time.

**Recommended additions:**
- `axe-core` in Playwright E2E tests (automated per-page audits)
- Manual screen reader testing with NVDA/VoiceOver before major releases

### Visual Regression (Priority: Low)

**Recommended for later:** Playwright screenshots or Chromatic for component-level visual diffs.

## CI Integration

Tests run on every PR via `.github/workflows/ci.yml`:

```yaml
- run: npm run lint
- run: npm run test
- run: npm run build
```

**Future additions:**
- Coverage reporting (codecov or similar)
- Playwright E2E in CI (separate job)
- Lighthouse CI for performance budgets
