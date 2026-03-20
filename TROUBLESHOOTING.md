# 🔧 Troubleshooting Guide

**Grupo Omniprise - Corporate Food Service Dashboard**

---

## 📋 Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Common Issues](#common-issues)
3. [Module-Specific Issues](#module-specific-issues)
4. [Database Issues](#database-issues)
5. [Performance Issues](#performance-issues)
6. [Deployment Issues](#deployment-issues)
7. [Getting Help](#getting-help)

---

## 🔍 Quick Diagnostics

### Health Check Commands

```bash
# Check if development server runs
npm run dev

# Check build
npm run build

# Check for linting errors
npm run lint

# Check TypeScript types
npx tsc --noEmit

# Check environment variables
cat .env.local
```

### Browser Console Checks

Open browser DevTools (F12) and check:

**Console Tab:**
- ❌ Red errors = Critical issues
- ⚠️ Yellow warnings = Non-critical issues
- ℹ️ Blue info = Informational messages

**Network Tab:**
- Failed API requests (red status codes)
- Slow requests (> 1s)
- 404 errors for missing resources

**Application Tab:**
- React errors (if using React DevTools)
- Component render issues

---

## ⚠️ Common Issues

### Issue: White Screen / Blank Page

**Symptoms:**
- Page loads but shows nothing
- Browser console shows errors

**Diagnosis:**
```javascript
// Check browser console for:
// - React errors
// - Import errors
// - Supabase connection errors
```

**Solutions:**
1. **Check browser console** for specific errors
2. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```
4. **Check environment variables** in `.env.local`

---

### Issue: "Module not found" Error

**Symptoms:**
- Build fails with module not found
- Import errors in browser console

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

**Check import paths:**
- Ensure using `@/` alias for src imports
- Verify file extensions are correct (.tsx, .ts)
- Check for circular dependencies

---

### Issue: Supabase Connection Failed

**Symptoms:**
- "Failed to fetch" errors
- Authentication not working
- Data not loading

**Diagnosis:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Solutions:**
1. **Verify Supabase project is active**
   - Go to: https://supabase.com/dashboard
   - Check project status

2. **Check environment variables:**
   - `.env.local` exists and is configured
   - Values are correct (no extra spaces)
   - Variables are loaded (restart dev server)

3. **Check RLS policies:**
   ```sql
   -- In Supabase SQL Editor, test:
   SELECT * FROM users LIMIT 1;
   ```

4. **Verify Supabase URL format:**
   ```
   ✅ Correct: https://xxx.supabase.co
   ❌ Wrong:   https://xxx.supabase.co/
   ❌ Wrong:   xxx.supabase.co
   ```

---

### Issue: Translation Keys Not Working

**Symptoms:**
- Shows translation key instead of text
- Text appears as "supervisionAnalytics" instead of "Operational Supervision"

**Diagnosis:**
```javascript
// Check if translation key exists in translations.ts
console.log(t('yourKey')); // Should return translated string
```

**Solutions:**
1. **Check translation file:**
   - Open `src/lib/translations.ts`
   - Verify key exists in both `en` and `es`
   - Check for typos in key name

2. **Check usage:**
   ```tsx
   // Correct
   {t('supervisionAnalytics')}

   // Wrong (missing t())
   {'supervisionAnalytics'}
   ```

3. **Add missing keys:**
   ```typescript
   // In src/lib/translations.ts
   en: {
     yourMissingKey: 'Your Text',
   },
   es: {
     yourMissingKey: 'Tu Texto',
   }
   ```

---

### Issue: Build Fails

**Symptoms:**
- `npm run build` fails
- TypeScript errors
- Module resolution errors

**Solutions:**
```bash
# 1. Check for TypeScript errors
npx tsc --noEmit

# 2. Clean and rebuild
rm -rf .next node_modules
npm install
npm run build

# 3. Check specific error in build output
npm run build 2>&1 | grep -A 10 "error"
```

**Common build errors:**
- **Type error:** Fix type mismatches in code
- **Module not found:** Check import paths
- **Cannot access before initialization:** Check for circular dependencies

---

## 📊 Module-Specific Issues

### Supervision Module

**Issue: Schedule not loading**
```bash
# Check supervision_schedule table exists
# In Supabase SQL Editor:
SELECT * FROM supervision_schedule LIMIT 1;
```

**Issue: Auto-schedule fails**
```bash
# Check supervisor assignments
SELECT * FROM supervisors WHERE is_active = true;
```

### Alerts Module

**Issue: Alerts not appearing**
```sql
-- Check alerts table
SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10;

-- Check if alert triggers are working
SELECT * FROM operational_findings WHERE severity = 'critical';
```

### Sales Module

**Issue: No sales data**
```sql
-- Check sales table
SELECT COUNT(*) FROM sales;

-- Check for seed data
SELECT * FROM sales LIMIT 5;
```

---

## 🗄️ Database Issues

### Issue: RLS Policy Violations

**Symptoms:**
- "Permission denied" errors
- Data not loading for certain users

**Diagnosis:**
```sql
-- Check current RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test as specific user
SET ROLE your_role_name;
SELECT * FROM your_table LIMIT 1;
RESET ROLE;
```

**Solution:**
1. Review RLS policies in Supabase dashboard
2. Check user roles in `users` table
3. Verify policy conditions

### Issue: Migration Failed

**Symptoms:**
- Database schema outdated
- Missing tables or columns

**Solution:**
```bash
# Check applied migrations
# In Supabase dashboard: Database → Migrations

# Re-run specific migration
# Copy SQL from supabase/migrations/XX_migration_name.sql
# Run in Supabase SQL Editor
```

### Issue: Seed Data Missing

**Solution:**
```sql
-- Re-run seed data
-- Copy content from supabase/migrations/16_comprehensive_seed_data.sql
-- Run in Supabase SQL Editor

-- Verify data exists
SELECT COUNT(*) FROM locations;
SELECT COUNT(*) FROM sales;
SELECT COUNT(*) FROM users;
```

---

## ⚡ Performance Issues

### Issue: Slow Page Load

**Diagnosis:**
```javascript
// Check in browser DevTools → Network tab
// Look for slow requests (> 1s)
// Check for large assets (> 1MB)
```

**Solutions:**
1. **Optimize images:**
   - Compress images before upload
   - Use WebP format when possible
   - Lazy load images

2. **Reduce API calls:**
   - Implement caching
   - Use React Query for data fetching
   - Debounce search inputs

3. **Code splitting:**
   ```tsx
   // Dynamic imports for heavy components
   const HeavyComponent = dynamic(() => import('./HeavyComponent'))
   ```

### Issue: High Memory Usage

**Symptoms:**
- Browser tab using > 500MB memory
- Page becomes slow over time

**Solutions:**
1. **Check for memory leaks:**
   - Unsubscribe from event listeners
   - Clear intervals/timeouts
   - Clean up state on unmount

2. **Profile memory:**
   ```javascript
   // In browser DevTools → Memory tab
   // Take heap snapshot
   // Look for detached DOM elements
   ```

---

## 🚀 Deployment Issues

### Issue: Vercel Deployment Failed

**Diagnosis:**
```bash
# Check Vercel deployment logs
# In Vercel dashboard: Project → Deployments → Click on failed deployment
```

**Common causes:**
1. **Build timeout:** Increase timeout in vercel.json
2. **Environment variables missing:** Add in Vercel dashboard
3. **Node version mismatch:** Specify in package.json

**Solution:**
```json
// In package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Issue: GitLab CI/CD Pipeline Failed

**Diagnosis:**
```bash
# Check pipeline logs in GitLab
# Project → CI/CD → Pipelines → Click on failed job
```

**Solutions:**
1. **Check runner availability**
2. **Verify GitLab variables are set**
3. **Test build locally first**

### Issue: Custom Domain Not Working

**Symptoms:**
- Domain shows "Site not found"
- HTTPS not working

**Solutions:**
1. **DNS propagation:**
   - Wait 24-48 hours for DNS to propagate
   - Check DNS with: `nslookup your-domain.com`

2. **SSL certificate:**
   - Vercel auto-provisions SSL
   - Check certificate status in Vercel dashboard

3. **A/CNAME records:**
   ```
   Type: CNAME
   Name: dashboard (or @)
   Value: cname.vercel-dns.com
   ```

---

## 📱 Mobile-Specific Issues

### Issue: Layout Broken on Mobile

**Diagnosis:**
```javascript
// Test in Chrome DevTools → Device Toolbar
// Or test on actual mobile device
```

**Solutions:**
1. **Check responsive breakpoints:**
   ```css
   /* Tailwind responsive classes */
   className="sm:flex lg:hidden"
   ```

2. **Test viewport meta tag:**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```

3. **Check for fixed widths:**
   ```css
   /* Avoid */
   width: 500px;

   /* Use */
   max-width: 500px;
   width: 100%;
   ```

---

## 🔐 Security Issues

### Issue: Environment Variables Exposed

**Diagnosis:**
```bash
# Check if variables in client code
grep -r "NEXT_PUBLIC_" src/ | grep -v ".env"
```

**Solution:**
1. Never use `SUPABASE_SERVICE_ROLE_KEY` in client code
2. Only `NEXT_PUBLIC_*` variables are safe for client
3. Server-only variables should be in API routes

### Issue: CORS Errors

**Symptoms:**
- "CORS policy blocked" errors
- API requests failing

**Solution:**
```sql
-- In Supabase SQL Editor, add CORS policy:
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Or configure in Supabase dashboard:
-- Project → API → CORS Policy
```

---

## 📞 Getting Help

### Diagnostic Information to Collect

When reporting issues, include:

1. **Environment:**
   - OS: [Windows/Mac/Linux]
   - Browser: [Chrome/Firefox/Safari]
   - Node version: `node --version`

2. **Error Messages:**
   - Browser console errors
   - Terminal/build errors
   - Screenshot of error

3. **Steps to Reproduce:**
   - What you were doing
   - Expected behavior
   - Actual behavior

4. **Recent Changes:**
   - Last commits made
   - Recent deployments
   - Configuration changes

### Where to Get Help

1. **Documentation:**
   - README.md - Project overview
   - CHANGELOG.md - Version history
   - DEPLOYMENT.md - Deployment guide
   - GITLAB_WORKFLOW.md - GitLab guide

2. **GitLab Issues:**
   - https://gitlab.com/sbrv-group/omniprise/-/issues
   - Search existing issues first
   - Include diagnostic information

3. **Team Contacts:**
   - Tech Lead: [Contact info]
   - DevOps: [Contact info]
   - Product Manager: [Contact info]

### Emergency Contacts

**For production emergencies:**
1. Create GitLab issue with `critical` label
2. Notify team immediately via Slack/Teams
3. If available, create hotfix branch

---

**Last Updated:** 2026-03-20
**Version:** 1.9.0
