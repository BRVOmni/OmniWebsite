# ADR-2: Static generation (SSG) for brand pages

**Date:** 2026-03-29
**Status:** Accepted

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
