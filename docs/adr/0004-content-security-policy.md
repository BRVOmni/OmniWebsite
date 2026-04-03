# ADR-4: Content Security Policy (CSP)

**Date:** 2026-04-02
**Status:** Accepted

## Context

The website is a public-facing marketing site that loads third-party resources (Google Fonts, Vercel Analytics). A CSP protects against XSS and injection attacks.

## Decision

Implement a strict CSP via `vercel.json` headers that:
- Restricts scripts to `'self'`, `'unsafe-inline'` (required by Next.js/Framer Motion), and Vercel Analytics
- Restricts styles to `'self'` and `'unsafe-inline'` (required by Tailwind)
- Restricts fonts to `'self'` and Google Fonts
- Restricts images to `'self'`, data URIs, and Vercel blob storage
- Blocks all frame, object, and plugin content

Additional security headers: `Permissions-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`.

## Consequences

- **Pro:** Significant XSS and injection protection
- **Pro:** Prevents unauthorized third-party resource loading
- **Con:** `'unsafe-inline'` for scripts/styles is required — limits CSP effectiveness for those directives
- **Con:** Adding new third-party scripts (analytics, chat widgets) requires updating the CSP
