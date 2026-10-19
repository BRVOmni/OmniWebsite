# ADR-2: Static generation (SSG) for brand pages

**Date:** 2026-03-29
**Status:** Accepted — amended 2026-10-19: all routes under `[locale]` are now rendered per request (`dynamic = 'force-dynamic'` in the locale layout) because the Content Security Policy uses a per-request script nonce (see ADR-4). Prerendered HTML served from the CDN cannot carry a nonce, so static generation and a nonce-based CSP are mutually exclusive. Brand data is still read from `brands.ts` at build time and the pages are still cheap to render; `generateStaticParams` is kept for route typing and for the `notFound()` guard.

## Context

Brand detail pages at `/marcas/[slug]` display data for 7 restaurant brands. The data is static and defined in `brands.ts`. There are only 7 pages and the content changes rarely.

Options considered:
1. Client-side rendering (CSR) — fetch data in the browser
2. Server-side rendering (SSR) — generate on every request
3. Static site generation (SSG) — build time generation via `generateStaticParams()`

## Decision

Use SSG with `generateStaticParams()` to pre-build all 7 brand pages at deploy time. Brand data is imported directly from `brands.ts` with no external API calls.

## Consequences

- **Pro:** Fastest possible page loads — pre-rendered HTML served from CDN
- **Pro:** No database dependency for brand pages
- **Pro:** Automatically generates pages for new brands when `BRANDS` array is updated
- **Con:** Brand data changes require a full rebuild and deploy
- **Con:** Not suitable if brand data becomes dynamic (user-editable)
