# 🚀 Production Deployment Guide

**Grupo Omniprise - Corporate Food Service Dashboard**

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Platforms](#deployment-platforms)
4. [GitLab CI/CD Setup](#gitlab-cicd-setup)
5. [Domain Configuration](#domain-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-Deployment Checklist

### Security & Configuration
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Verify Supabase project is on production plan (if needed)
- [ ] Set up production database (separate from development)
- [ ] Configure environment variables for production
- [ ] Enable SSL/HTTPS for all connections
- [ ] Set up backup strategy for database

### Code Review
- [ ] All sensitive data removed from code
- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded credentials in source code
- [ ] All user-facing text uses translation keys
- [ ] Error handling is proper and secure
- [ ] Database RLS policies are correct

### Testing
- [ ] Run `npm run build` successfully
- [ ] Test all 12 modules locally
- [ ] Verify translations work in both languages
- [ ] Test authentication flow
- [ ] Test alert system
- [ ] Verify file uploads work (Supabase Storage)

---

## ⚙️ Environment Configuration

### Production Environment Variables

Create `.env.production` (DO NOT commit this file):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Corporate Food Dashboard

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (server-only) | `eyJhbGc...` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Production domain | `https://dashboard.company.com` |
| `NEXT_PUBLIC_APP_NAME` | ❌ | Application name | `Corporate Dashboard` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | ❌ | Enable analytics tracking | `true` |
| `NEXT_PUBLIC_ENABLE_DEBUG` | ❌ | Enable debug mode | `false` |

---

## 🌐 Deployment Platforms

### Option 1: Vercel (Recommended)

**Setup Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Select your project → Settings → Environment Variables
   - Add all variables from the table above

**Vercel-Specific Configuration:**

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

**Setup Steps:**

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Create `netlify.toml`:**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"

   [build.environment]
     NEXT_PUBLIC_SUPABASE_URL = "https://xxx.supabase.co"
     NEXT_PUBLIC_SUPABASE_ANON_KEY = "your_anon_key"
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Option 3: Custom VPS (Docker)

**Create `Dockerfile`:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Build and Run:**
```bash
docker build -t corporate-dashboard .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=xxx \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  corporate-dashboard
```

---

## 🔄 GitLab CI/CD Setup

### Create `.gitlab-ci.yml`

Create this file in your project root for automated deployment:

```yaml
stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "18"
  CACHE_KEY: "${CI_COMMIT_REF_SLUG}"

# Cache node_modules
cache:
  key: ${CACHE_KEY}
  paths:
    - node_modules/

# Build stage
build:
  stage: build
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/
      - public/
    expire_in: 1 hour
  only:
    - main
    - develop

# Test stage
test:
  stage: test
  image: node:18-alpine
  script:
    - npm ci
    - npm run lint
  dependencies:
    - build
  only:
    - main
    - develop

# Deploy to production
deploy:production:
  stage: deploy
  image: node:18-alpine
  script:
    - npm install -g vercel
    - vercel --prod --token=$VERCEL_TOKEN
  environment:
    name: production
    url: https://your-domain.com
  dependencies:
    - build
  only:
    - main
  when: manual

# Deploy to staging
deploy:staging:
  stage: deploy
  image: node:18-alpine
  script:
    - npm install -g vercel
    - vercel --token=$VERCEL_TOKEN
  environment:
    name: staging
    url: https://staging.your-domain.com
  dependencies:
    - build
  only:
    - develop
```

### GitLab Variables Setup

1. Go to: **Settings → CI/CD → Variables**
2. Add the following variables (protected & masked):

| Variable | Protected | Masked | Description |
|----------|-----------|--------|-------------|
| `VERCEL_TOKEN` | ✅ | ✅ | Vercel deployment token |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ❌ | Production Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | Production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | Service role key |

---

## 🌐 Domain Configuration

### Custom Domain Setup (Vercel)

1. **In Vercel Dashboard:**
   - Go to: Settings → Domains
   - Add your custom domain: `dashboard.company.com`

2. **DNS Configuration:**
   - Add A record or CNAME record as directed by Vercel
   - Example DNS records:
     ```
     Type: CNAME
     Name: dashboard
     Value: cname.vercel-dns.com
     TTL: 3600
     ```

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - Wait for certificate to be issued (usually 5-10 minutes)

### Custom Domain Setup (Netlify)

1. **In Netlify Dashboard:**
   - Go to: Domain settings → Add custom domain
   - Enter: `dashboard.company.com`

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: dashboard
   Value: your-site.netlify.app
   ```

---

## ✅ Post-Deployment Verification

### Health Check List

- [ ] **Homepage loads**: https://your-domain.com
- [ ] **Login works**: Test authentication flow
- [ ] **Dashboard loads**: Verify all KPIs display
- [ ] **All modules accessible**: Test all 12 modules
- [ ] **Language toggle works**: Test EN/ES switching
- [ ] **Responsive design**: Test on mobile devices
- [ ] **No console errors**: Check browser dev tools
- [ ] **API endpoints work**: Test at least one API call
- [ ] **Database queries work**: Verify data loads
- [ ] **File uploads work**: Test photo upload feature

### Performance Check

- [ ] **Page load time < 3s**: Test on 3G connection
- [ ] **Lighthouse score > 90**: Run Lighthouse audit
- [ ] **No memory leaks**: Monitor over 30 minutes
- [ ] **Images optimized**: Check image sizes

### Security Check

- [ ] **HTTPS enabled**: Verify SSL certificate
- [ ] **No mixed content**: All resources use HTTPS
- [ ] **Environment variables secure**: Not exposed in client code
- [ ] **RLS policies active**: Test with different user roles

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules .next
npm install
npm run build
```

#### Issue: Environment variables not working

**Solution:**
1. Verify variables are set in deployment platform
2. Check variable names match exactly (case-sensitive)
3. Restart the deployment
4. Check for trailing spaces in variable values

#### Issue: Database connection fails

**Solution:**
1. Verify Supabase project is active
2. Check RLS policies allow access
3. Verify service role key is correct
4. Check Supabase logs for errors

#### Issue: Build fails on GitLab CI

**Solution:**
1. Check build logs in GitLab CI/CD
2. Verify all dependencies are in package.json
3. Check Node version matches in .gitlab-ci.yml
4. Try running build locally first

#### Issue: Deployed site shows old code

**Solution:**
1. Clear browser cache
2. Verify correct branch is deployed
3. Check deployment logs for errors
4. Purge CDN cache if using one

#### Issue: Images not loading

**Solution:**
1. Verify Supabase Storage bucket is public
2. Check image URLs are correct
3. Verify bucket policies allow access
4. Check for CORS issues

---

## 📞 Support & Resources

### Documentation Links
- **GitLab Repository**: https://gitlab.com/sbrv-group/omniprise
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

### Getting Help

1. **Check GitLab Issues**: https://gitlab.com/sbrv-group/omniprise/-/issues
2. **Review CHANGELOG.md**: For recent changes
3. **Check Troubleshooting section**: Above
4. **Contact Development Team**: For production issues

---

## 🔄 Update Process

### Making Updates to Production

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test locally:**
   ```bash
   npm run dev
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature
   ```

4. **Create merge request in GitLab:**
   - Go to GitLab project
   - Merge Requests → New Merge Request
   - Select your branch → main
   - Describe your changes
   - Assign reviewers

5. **After approval:**
   - Merge the MR
   - GitLab CI/CD will automatically deploy to production
   - Verify deployment in GitLab CI/CD pipelines

### Rollback Process

If something goes wrong:

1. **Identify broken commit:**
   ```bash
   git log --oneline
   ```

2. **Revert to previous commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Or force revert (emergency only):**
   ```bash
   git reset --hard <previous-commit-id>
   git push --force origin main
   ```

---

**Last Updated:** 2026-03-20
**Version:** 1.9.0
