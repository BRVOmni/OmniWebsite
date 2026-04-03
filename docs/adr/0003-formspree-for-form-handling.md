# ADR-3: Formspree for form handling

**Date:** 2026-03-25
**Status:** Accepted

## Context

The website has two forms: a contact form and a multi-step franchise application. Both need to send submissions to email. Options considered:

1. Custom API route + email service (Resend, SendGrid)
2. Formspree (hosted form backend)
3. Supabase table + email trigger

## Decision

Use Formspree for both forms. Form endpoints are hardcoded in the components. Client-side validation uses Zod schemas with Spanish error messages.

## Consequences

- **Pro:** Zero backend code — forms just POST to Formspree
- **Pro:** Built-in spam filtering and email forwarding
- **Pro:** Free tier covers the expected volume
- **Con:** Formspree endpoint IDs are hardcoded, not configurable via env vars
- **Con:** Limited control over submission processing
- **Con:** Future CRM integration (Supabase) will require adding a separate data pipeline
