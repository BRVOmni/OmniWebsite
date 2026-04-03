# Contributing to Omniprise

Thank you for contributing to the Grupo Omniprise website and dashboard. This guide covers everything you need to get started.

---

## Project Structure

This is a monorepo with two independent Next.js apps:

| Directory | App | Deploy |
|---|---|---|
| `Website/` | Public corporate website | Vercel (auto-deploys from `main`) |
| `src/` (root) | Internal operations dashboard | Separate deployment |

**Most contributions will be in `Website/`.**

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Website
cd Website
npm install
npm run dev        # http://localhost:3001

# Dashboard (root)
npm install
npm run dev        # http://localhost:3000
```

### Useful Commands

```bash
npm run build      # Production build — MUST pass before committing
npm run lint       # ESLint check
npm run test       # Run tests (vitest)
```

---

## Git Workflow

### Branch Naming

Use descriptive branch names with a prefix:

```
feat/add-testimonials
fix/gallery-mobile-layout
docs/update-readme
chore/update-dependencies
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add testimonials section
fix: broken gallery on mobile
chore: update dependencies
docs: update README
style: fix spacing in hero
refactor: extract shared component
test: add contact form validation tests
```

### Before Pushing

- [ ] `npm run build` passes inside `Website/`
- [ ] `npm run lint` passes with no errors
- [ ] `npm run test` passes
- [ ] `git status` shows only the files you intended to change
- [ ] No secrets or `.env` files in the diff
- [ ] Commit message follows the format above

---

## Pull Requests

1. Create a branch from `main`
2. Make your changes with clear, focused commits
3. Ensure build, lint, and tests pass
4. Open a PR against `main` with:
   - A clear title describing the change
   - A summary of what changed and why
   - Screenshots for visual changes
   - Link to any related issues

### PR Size

Keep PRs small and focused. One feature or fix per PR. Large PRs take longer to review and are more likely to introduce bugs.

---

## Code Style

- **TypeScript** — Strict mode, no `any` types
- **Components** — Functional React components with named exports
- **Styling** — Tailwind CSS utility classes; avoid inline styles
- **Imports** — Use `@/` path aliases (`@/components/`, `@/lib/`)
- **Brand data** — Always use the canonical `BRANDS` array from `@/lib/brands.ts`
- **Animations** — Use the `useReveal` hook for scroll-triggered animations
- **Forms** — Validate with Zod schemas; Spanish error messages for user-facing forms

---

## Adding a New Brand

1. Compress the logo to WebP (target under 500KB) and add to `Website/public/brands/`
2. Add 5 gallery photos to `Website/public/brands/gallery/<slug>/`
3. Update the `BRANDS` array in `Website/src/lib/brands.ts`
4. Set `invertLogo: true` if the logo is dark (invisible on dark background)

---

## Questions?

For questions about the codebase, open a GitHub issue with the `question` label.
