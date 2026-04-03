# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not** open a public GitHub issue.

Instead, send an email to **security@omniprise.com.py** with:

- A description of the vulnerability
- Steps to reproduce
- The potential impact
- Any suggested fix (optional)

We will acknowledge your report within 48 hours and aim to provide a resolution timeline within 7 business days.

## Scope

This policy covers the production website at https://www.omniprise.com.py and its source code in this repository.

The following are **in scope**:

- Cross-site scripting (XSS)
- SQL injection or database exposure
- Authentication or authorization bypass
- Sensitive data exposure (env variables, API keys, user data)
- Content Security Policy (CSP) bypasses
- Server-side request forgery (SSRF)

The following are **out of scope**:

- Denial of service (DoS)
- Social engineering
- Physical attacks
- Issues in third-party services (Vercel, Supabase, Formspree) -- report to those providers directly

## Supported Versions

| Version | Supported |
|---|---|
| `main` branch (latest) | Yes |
| Older versions | No |

## Security Headers

This project enforces the following security headers via `vercel.json`:

- `Content-Security-Policy` -- Restricts scripts, styles, fonts, images, and connections to known origins
- `Permissions-Policy` -- Denies camera, microphone, and geolocation access
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
