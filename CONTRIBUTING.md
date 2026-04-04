# Contributing to the Omniprise Website

Thank you for contributing to the Grupo Omniprise corporate website.

**All website work happens inside `Website/`.** Always `cd Website` first.

---

## Development Setup

### Prerequisites

- **Node.js:** 22.x recommended (CI uses 22; 18+ minimum for local dev)
- **npm** (comes with Node.js)

### Install & Run

```bash
cd Website
npm install
npm run dev        # http://localhost:3001
```

No `.env` file needed for local development. See `Website/.env.example` for reference on configurable values.

### Commands

From inside `Website/`:

```bash
npm run build      # Production build — MUST pass before committing
npm run lint       # ESLint check
npm run test       # Run tests (Vitest)
```

From the **repo root** (convenience scripts):

```bash
npm run website:build    # Build website for production
npm run website:lint     # Lint website code
npm run website:test     # Run website tests
npm run website:dev      # Start website dev server
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

1. **Build the website** — this is the most important check:

```bash
cd Website
npm run build
```

2. **Run the full checklist:**

- [ ] `npm run build` passes inside `Website/`
- [ ] `npm run lint` passes with no errors
- [ ] `npm run test` passes
- [ ] `git status` shows only the files you intended to change
- [ ] No secrets or `.env` files in the diff
- [ ] Commit message follows the format above

3. **Push from the repo root:**

```bash
cd ..                           # back to repo root
git add Website/<changed-files>
git commit -m "type: description"
git push origin main
```

Pushing to `main` triggers an automatic Vercel deployment.

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
- **Components** — Functional React components with named exports (no default exports)
- **Styling** — Tailwind CSS utility classes; no inline styles
- **Imports** — Use `@/` path aliases (`@/components/`, `@/lib/`)
- **Brand data** — Always use the canonical `BRANDS` array from `@/lib/brands.ts`
- **Animations** — Use the `useReveal` hook for scroll-triggered animations
- **Forms** — Validate with Zod schemas; Spanish error messages for user-facing forms
- **Tests** — Use named imports matching component exports

---

## Adding a New Brand

1. Compress the logo to WebP (target under 500KB) and add to `Website/public/brands/`
2. Add 5 gallery photos to `Website/public/brands/gallery/<slug>/`
3. Update the `BRANDS` array in `Website/src/lib/brands.ts`
4. Set `invertLogo: true` if the logo is dark (invisible on dark background)

---

## Documentation

| File | Purpose |
|---|---|
| `Website/README.md` | Full technical docs — project structure, components, design system, QA checklist |
| `docs/deployment-runbook.md` | Deployment and rollback procedures |
| `docs/testing-strategy.md` | Testing approach and priorities |
| `docs/analytics-events.md` | Custom analytics event reference |
| `docs/accessibility.md` | Accessibility statement and testing |
| `docs/adr/` | Architecture Decision Records |

---

## Questions?

For questions about the codebase, open a GitHub issue with the `question` label.
