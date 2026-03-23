# 🔒 Security Review Report
## Grupo Omniprise - Corporate Food Service Dashboard

**Date:** March 23, 2026
**Reviewer:** Security Specialist
**Project:** Corporate Food Dashboard v1.15.7
**Production URL:** https://dashboard.omniprise.com.py

---

## 📊 Executive Summary

This document provides a comprehensive security assessment of the Corporate Food Dashboard. The overall security posture is **MODERATE** with several areas requiring attention. The application has good foundations with Row Level Security (RLS) and proper authentication, but needs improvements in input validation, dependency management, and API security.

### Risk Level Breakdown
- 🔴 **Critical Issues:** 1
- 🟠 **High Priority:** 3
- 🟡 **Medium Priority:** 6
- 🟢 **Low Priority:** 4

---

## 🔴 CRITICAL ISSUES

### 1. Exposed API Keys in Repository

**Location:** `.env.local` file
**Severity:** CRITICAL
**Risk:** Immediate unauthorized database access

**Description:**
The `.env.local` file in the repository contains actual Supabase API keys in plaintext:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **This gives full database access!**

**Why This is Dangerous:**
If this repository is ever made public, cloned to an unprotected machine, or accessed by unauthorized personnel, anyone with the service role key can:
- Bypass all RLS policies
- Read, write, and delete any data
- Create/delete users
- Drop tables

**Recommendation for Junior Devs:**

1. **Rotate the service role key immediately:**
   - Go to Supabase Dashboard → Settings → API
   - Click "Rotate" next to service_role key
   - Update the key in Vercel environment variables
   - Delete the old key from `.env.local`

2. **Add `.env.local` to `.gitignore` (already done ✅)**
3. **Use environment-specific files:**
   - `.env.local` for your local development (contains placeholder values)
   - `.env.production` should ONLY contain actual keys
   - NEVER commit actual keys to git

4. **Scan git history for keys:**
   ```bash
   # Check if keys were ever committed
   git log --all --full-history --source -- "*env*"
   ```

5. **Use a secrets scanner (optional but recommended):**
   ```bash
   npm install -g trufflehog
   trufflehog filesystem .
   ```

**How to Fix:**

Create a new `.env.local.example` with placeholder values only:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Grupo Omniprise

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

And update your actual `.env.local` to reference environment variables or use a different method for local development.

---

## 🟠 HIGH PRIORITY ISSUES

### 2. XLSX Library - Prototype Pollution Vulnerability

**Location:** `package.json` dependency
**Severity:** HIGH
**CVE:** GHSA-4r6h-8v6p-xvw6
**CVSS Score:** 7.8 (HIGH)

**Description:**
The `xlsx` library (v0.18.5) has a prototype pollution vulnerability. An attacker could potentially manipulate object prototypes to execute arbitrary code or cause denial of service.

**Affected Functionality:**
Excel export functionality in the sales module

**Recommendation:**

Update to the latest version of XLSX:
```bash
npm update xlsx
```

Or if the latest version still has issues, consider alternative libraries:
- `exceljs` - More actively maintained
- `@sheetjs/js-xlsx` - Official SheetJS package

**For Junior Devs - How to Apply:**
```bash
# 1. Check current version
npm list xlsx

# 2. Update to latest
npm update xlsx

# 3. Test the Excel export feature
# Go to Sales Analytics page and try exporting to Excel
# Make sure it still works

# 4. If it breaks, try:
npm install exceljs
# Then update the export code to use exceljs instead
```

---

### 3. Next.js Unbounded Disk Cache Growth

**Location:** `package.json` dependency
**Severity:** HIGH
**CVE:** GHSA-3x4c-7xq6-9pq8

**Description:**
Next.js versions before 15.5.14 have a vulnerability where the image cache can grow unbounded, potentially filling up server storage.

**Recommendation:**

Update Next.js to the latest version:
```bash
npm update next
```

**For Junior Devs:**
```bash
# 1. Check current version
npm list next

# 2. Update to latest
npm update next

# 3. Test the application
npm run dev
# Check all pages load correctly

# 4. Build to verify no errors
npm run build
```

---

### 4. Build Security Disabled

**Location:** `next.config.ts`

**Description:**
The Next.js config has disabled ESLint and TypeScript checking during production builds:

```typescript
eslint: {
  ignoreDuringBuilds: true,  // ⚠️ This skips security checks
},
typescript: {
  ignoreBuildErrors: true,   // ⚠️ This skips type checking
}
```

**Why This Matters:**
- TypeScript errors can catch potential security issues
- ESLint has security rules that could catch vulnerabilities
- Disabling these checks means deploying potentially unsafe code

**Recommendation:**

Fix the underlying issues and re-enable checks:

```typescript
const nextConfig: NextConfig = {
  // Remove these lines after fixing all errors:
  // eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true },
}
```

**For Junior Devs:**

1. **First, see what errors exist:**
   ```bash
   npm run lint
   ```

2. **Fix the errors one by one:**
   - Most errors will be unused imports
   - Missing types
   - Simple formatting issues

3. **When you can fix all errors, remove the config lines**

4. **If there are too many errors to fix quickly:**
   - Keep the config for now
   - Create a task to fix 5-10 errors per week
   - Remove the config when all errors are fixed

---

## 🟡 MEDIUM PRIORITY ISSUES

### 5. Missing Input Validation

**Location:** `src/lib/validations/` directory is empty

**Severity:** MEDIUM

**Description:**
The application does not validate user input before processing. API routes accept data without proper validation using schemas (like Zod).

**Risk:**
- SQL injection attempts
- XSS (Cross-Site Scripting) attacks
- Invalid data causing application errors
- Data integrity issues

**Recommendation:**

Implement Zod validation schemas for all API inputs.

**For Junior Devs:**

1. **Install Zod (if not already installed):**
   ```bash
   npm install zod
   ```

2. **Create validation schemas in `src/lib/validations/`:**

Example for sales filtering:
```typescript
// src/lib/validations/sales.ts
import { z } from 'zod'

export const salesFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  locationId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  limit: z.number().min(1).max(1000).optional(),
})

export type SalesFilter = z.infer<typeof salesFilterSchema>
```

3. **Use in API routes:**

```typescript
// In your API route
import { salesFilterSchema } from '@/lib/validations/sales'

export async function GET(request: Request) {
  // Get query parameters
  const { searchParams } = new URL(request.url)
  const rawData = {
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    locationId: searchParams.get('locationId') || undefined,
  }

  // Validate using Zod
  const result = salesFilterSchema.safeParse(rawData)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: result.error },
      { status: 400 }
    )
  }

  // Use validated data
  const filters = result.data
  // ... rest of your code
}
```

4. **Create schemas for:**
   - Date ranges
   - User inputs
   - API parameters
   - Form submissions

---

### 6. Missing Rate Limiting

**Severity:** MEDIUM

**Description:**
API routes do not have rate limiting. An attacker could:
- Make thousands of requests per second
- Cause denial of service
- Increase database costs
- Slow down the application for legitimate users

**Recommendation:**

Implement rate limiting using Vercel Edge Config or a simple in-memory solution.

**For Junior Devs:**

Simple rate limiting for API routes:

```typescript
// src/lib/utils/rate-limit.ts
const rateLimit = new Map()

export function checkRateLimit(identifier: string, limit = 60, window = 60000) {
  const now = Date.now()
  const record = rateLimit.get(identifier)

  if (!record || now - record.timestamp > window) {
    rateLimit.set(identifier, { count: 1, timestamp: now })
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count }
}
```

Use in API routes:

```typescript
export async function POST(request: Request) {
  // Get user identifier (IP or user ID)
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous'

  // Check rate limit (60 requests per minute)
  const { allowed, remaining } = checkRateLimit(identifier, 60, 60000)

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Set rate limit headers
  return NextResponse.json(
    { data: '...' },
    { headers: { 'X-RateLimit-Remaining': String(remaining) } }
  )
}
```

---

### 7. Incomplete Error Handling

**Severity:** MEDIUM

**Description:**
Some API routes expose sensitive information in error messages.

**Example:**
In `src/app/api/executive-summary/kpis/route.ts`:
```typescript
catch (error) {
  console.error('KPI API error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },  // ✅ Good - generic message
    { status: 500 }
  )
}
```

But in some places, detailed errors are returned:
```typescript
{ error: 'Failed to fetch sales data' }  // ⚠️ Too specific
```

**Recommendation:**

**For Junior Devs:**

1. **Create a standard error response:**

```typescript
// src/lib/utils/api-response.ts
export function apiSuccess(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export function apiError(
  message: string,
  status: number = 500,
  details?: any
) {
  // Don't expose internal details in production
  const isDev = process.env.NODE_ENV === 'development'

  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(isDev && details ? { details } : {}),
      },
    },
    { status }
  )
}
```

2. **Use in API routes:**

```typescript
// Instead of:
return NextResponse.json({ error: 'Sales query failed' }, { status: 500 })

// Use:
return apiError('Unable to fetch sales data', 500)
```

---

### 8. Missing CSRF Protection

**Severity:** MEDIUM

**Description:**
State-changing operations (POST, PUT, DELETE) do not have CSRF (Cross-Site Request Forgery) protection.

**Risk:**
An attacker could trick users into performing actions they didn't intend.

**Recommendation:**

**For Junior Devs:**

Since you're using Supabase Auth with Next.js middleware, CSRF protection is partially implemented through the authentication token validation. However, for additional security:

1. **Ensure all state-changing operations verify authentication:**

```typescript
export async function POST(request: Request) {
  // Always verify user first
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Then process the request
  // ...
}
```

2. **Use SameSite cookies:**

In your middleware, ensure cookies are set with SameSite attribute (Supabase SSR does this by default).

---

### 9. Authentication Edge Cases

**Severity:** MEDIUM

**Description:**
The middleware protects `/dashboard` routes but has some edge cases:

```typescript
export const config = {
  matcher: ['/dashboard/:path*', '/login/:path*'],
}
```

**Issues:**
1. API routes under `/api` are not protected by middleware
2. Some routes might be accessible without authentication

**Recommendation:**

**For Junior Devs:**

Each API route should verify authentication individually (which you're already doing in some routes):

```typescript
export async function GET(request: Request) {
  // Always check auth
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Continue with authenticated request
  // ...
}
```

**Verify all API routes do this check.**

---

### 10. Service Role Key Usage

**Severity:** MEDIUM

**Description:**
The service role key exists in the codebase. While properly isolated in `admin.ts`, its usage should be audited.

**Current Implementation:**
```typescript
// src/lib/supabase/admin.ts
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient can only be used server-side')
  }
  // ... good protection
}
```

**Recommendation:**

**For Junior Devs:**

1. **Search for all usages of `createAdminClient`:**
   ```bash
   grep -r "createAdminClient" src/
   ```

2. **For each usage, verify:**
   - It's only used in server components or API routes
   - There's proper permission checking before use
   - It's absolutely necessary (could anon key work instead?)

3. **Document why service role is needed in each case**

4. **Never use in client-side code**

---

## 🟢 LOW PRIORITY ISSUES

### 11. Missing Content Security Policy

**Severity:** LOW

**Description:**
No Content Security Policy (CSP) headers are set. CSP helps prevent XSS attacks.

**Recommendation:**

**For Junior Devs:**

Add security headers to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}
```

---

### 12. Debug Mode in Production

**Severity:** LOW

**Description:**
`NEXT_PUBLIC_ENABLE_DEBUG=true` is set in environment variables. Debug mode can expose sensitive information.

**Recommendation:**

**For Junior Devs:**

1. **Set to false in production:**
   In Vercel environment variables:
   ```
   NEXT_PUBLIC_ENABLE_DEBUG=false
   ```

2. **Check code that uses this flag:**
   ```bash
   grep -r "ENABLE_DEBUG" src/
   ```

3. **Ensure debug output doesn't expose secrets**

---

### 13. Verbose Logging

**Severity:** LOW

**Description:**
Some console.log statements might expose sensitive data in production logs.

**Recommendation:**

**For Junior Devs:**

1. **Find all console.log statements:**
   ```bash
   grep -r "console.log" src/ | wc -l
   ```

2. **Create a logging utility:**

```typescript
// src/lib/utils/logger.ts
const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.log('[DEBUG]', ...args)
  },
  info: (...args: any[]) => {
    console.log('[INFO]', ...args)
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args)
  },
}
```

3. **Use the logger instead of console.log:**
   ```typescript
   import { logger } from '@/lib/utils/logger'

   logger.debug('User data:', user)  // Only logs in dev
   logger.error('API error:', error)  // Always logs
   ```

---

### 14. Dependency Updates

**Severity:** LOW

**Description:**
Regular dependency updates are important for security.

**Recommendation:**

**For Junior Devs:**

1. **Check for updates weekly:**
   ```bash
   npm outdated
   ```

2. **Update dependencies:**
   ```bash
   npm update
   ```

3. **Run security audit:**
   ```bash
   npm audit
   npm audit fix
   ```

---

## ✅ SECURITY STRENGTHS

The application has several good security practices in place:

1. **✅ Row Level Security (RLS)** - Database-level access control
2. **✅ Supabase Auth** - Proper authentication implementation
3. **✅ Role-Based Access Control** - Admin, Manager, Supervisor, Viewer roles
4. **✅ Service Role Isolation** - Properly protected in admin.ts
5. **✅ Environment Variables** - Using .env files (except the commit issue)
6. **✅ HTTPS** - Automatic SSL via Vercel
7. **✅ Middleware Authentication** - Route protection
8. **✅ API Route Auth Checks** - Most routes verify users
9. **✅ .gitignore** - Properly configured for env files

---

## 📋 ACTION PLAN (In Order of Priority)

### Week 1 (Critical)
1. ✅ Rotate service role key
2. ✅ Remove keys from .env.local in repository
3. ✅ Update XLSX library to fix prototype pollution
4. ✅ Update Next.js to fix cache vulnerability

### Week 2-3 (High Priority)
5. ✅ Re-enable ESLint/TypeScript in builds
6. ✅ Implement input validation for all API routes
7. ✅ Add rate limiting to public endpoints

### Week 4-6 (Medium Priority)
8. ✅ Standardize error handling
9. ✅ Audit service role key usage
10. ✅ Add security headers
11. ✅ Create logging utility
12. ✅ Review all API route authentication

### Ongoing (Low Priority)
13. ✅ Weekly dependency updates
14. ✅ Regular security audits
15. ✅ Monitor for new vulnerabilities

---

## 🛡️ SECURITY CHECKLIST FOR NEW CODE

Before deploying any new code, verify:

- [ ] No hardcoded secrets
- [ ] Input validation using Zod schemas
- [ ] Authentication check in API routes
- [ ] Authorization check (user has permission)
- [ ] Rate limiting on public endpoints
- [ ] Error handling doesn't expose sensitive info
- [ ] No console.log with sensitive data
- [ ] RLS policy exists for new tables
- [ ] Dependencies are up to date
- [ ] Tests cover security scenarios

---

## 📞 ESCALATION PROCEDURES

### If a security incident occurs:

1. **Immediate Actions:**
   - Rotate all API keys
   - Check audit logs for unusual activity
   - Check user list for unknown users
   - Review recent git commits

2. **Report to:**
   - Senior developer
   - Project manager
   - Security team (if available)

3. **Document:**
   - What happened
   - When it happened
   - What was affected
   - What was done to fix it

---

## 📚 LEARNING RESOURCES

For junior developers wanting to learn more:

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/configuring/security
- **Supabase Security:** https://supabase.com/docs/guides/security
- **Zod Validation:** https://zod.dev/

---

## 🔄 VERSION HISTORY

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-23 | 1.0 | Initial security review |

---

**Disclaimer:** This security review is based on the code as of March 23, 2026. Security is an ongoing process, and regular reviews should be conducted.

**Generated by:** Security Specialist
**For:** Grupo Omniprise Development Team
**Next Review:** Recommended within 3 months or after major changes
