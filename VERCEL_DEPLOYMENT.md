# 🚀 Vercel Deployment Guide

**Grupo Omniprise - Corporate Food Service Dashboard**

---

## 🎉 Deployment Status

### ✅ Dashboard is LIVE!

**Current URL:** https://corporate-food-dashboard.vercel.app

**Status:** Production deployment successful
**Date:** 2026-03-20
**Version:** v1.13.0

---

## 📋 Quick Deployment Guide

### Deploy Updates (One Command)

```bash
# From project directory
./deploy.sh
```

Or manually:

```bash
vercel --prod --yes --scope brs-projects-c425e547
```

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel

```bash
# Replace with your actual domain
vercel domains add dashboard.yourdomain.com --scope brs-projects-c425e547
```

### Step 2: Add DNS Record in cPanel

1. Log in to cPanel
2. Go to **Zone Editor** or **DNS**
3. Add CNAME record:
   - **Name:** `dashboard`
   - **Type:** `CNAME`
   - **Record:** `cname.vercel-dns.com`
   - **TTL:** 3600 (or default)

### Step 3: Verify DNS Propagation

```bash
# Check if DNS is propagated
dig dashboard.yourdomain.com
```

Wait 1-24 hours for DNS propagation.

### Step 4: SSL Certificate

Vercel automatically provisions SSL certificates for custom domains.
No action required - SSL will be active once DNS propagates.

---

## 🔧 Environment Variables

All environment variables are configured in Vercel:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_APP_NAME`
- ✅ `NEXT_PUBLIC_ENABLE_ANALYTICS`
- ✅ `NEXT_PUBLIC_ENABLE_DEBUG`

### Update Environment Variables

```bash
# List all environment variables
vercel env ls --scope brs-projects-c425e547

# Add new variable
vercel env add VARIABLE_NAME production --scope brs-projects-c425e547

# Remove variable
vercel env rm VARIABLE_NAME production --scope brs-projects-c425e547
```

---

## 📊 Deployment Workflow

### Standard Update Process

```bash
# 1. Make code changes
# Edit files...

# 2. Test locally
npm run build
npm run start

# 3. Commit to GitLab
git add .
git commit -m "description of changes"
git push origin main

# 4. Deploy to Vercel
./deploy.sh

# 5. Verify deployment
# Visit: https://corporate-food-dashboard.vercel.app
```

---

## 🛠️ Troubleshooting

### Build Fails

```bash
# Check build logs
vercel inspect --logs --scope brs-projects-c425e547

# Common issues:
# - Missing dependencies → Run: npm install
# - Environment variables → Check: vercel env ls
# - Build errors → Check: npm run build locally
```

### Deployment Issues

```bash
# Redeploy last commit
vercel redeploy --scope brs-projects-c425e547

# List recent deployments
vercel ls --scope brs-projects-c425e547
```

### DNS Issues

```bash
# Check DNS propagation
dig dashboard.yourdomain.com

# Check whois
whois yourdomain.com

# DNS still pointing elsewhere?
# - Wait longer (up to 24 hours)
# - Check DNS settings in cPanel
# - Verify CNAME record is correct
```

### Environment Variable Issues

```bash
# List all variables
vercel env ls --scope brs-projects-c425e547

# Pull environment to local file
vercel env pull .env.local --scope brs-projects-c425e547
```

---

## 📈 Monitoring

### View Deployment Status

```bash
# List deployments
vercel ls --scope brs-projects-c425e547

# View specific deployment
vercel inspect [deployment-url] --scope brs-projects-c425e547
```

### View Logs

```bash
# Real-time logs
vercel logs --scope brs-projects-c425e547

# Logs for specific deployment
vercel logs [deployment-url] --scope brs-projects-c425e547
```

---

## 💰 Cost & Limits

### Current Plan: Free Tier

- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ 100GB-hostname (vercel.app)
- ✅ Custom domains
- ✅ Serverless functions
- ✅ Edge functions

### When to Upgrade to Pro ($20/month)

- ❌ Exceed 100GB bandwidth
- ❌ Need team collaboration features
- ❌ Want analytics dashboard
- ❌ Need faster edge function limits

### Current Usage

**Estimated for your dashboard:**
- 10-50 users = ~5-20GB/month
- Well within free tier limits

---

## 🔒 Security

### Environment Variables

- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Hidden (server-side only)
- ⚠️ `NEXT_PUBLIC_*` variables - Visible in browser (but this is OK for anon key)

### Best Practices

1. **Never commit `.env.local` files**
2. **Use different Supabase projects** for dev/prod
3. **Rotate API keys** if compromised
4. **Monitor usage** in Vercel dashboard
5. **Keep dependencies updated**

---

## 🔄 Backup & Recovery

### GitLab is Your Backup

All code is safely stored in GitLab:
- Repository: https://gitlab.com/sbrv-group/omniprise
- Private and secure
- Version history maintained

### Disaster Recovery

```bash
# If Vercel deployment is lost:
# 1. Clone from GitLab
git clone https://gitlab.com/sbrv-group/omniprise.git

# 2. Install dependencies
npm install

# 3. Deploy to Vercel
./deploy.sh
```

---

## 📞 Support

### Vercel Resources
- Dashboard: https://vercel.com/dashboard
- Documentation: https://vercel.com/docs
- Status: https://vercel.com/status

### Project Resources
- GitLab: https://gitlab.com/sbrv-group/omniprise
- Issues: https://gitlab.com/sbrv-group/omniprise/-/issues

---

## ✅ Pre-Deployment Checklist

Before deploying updates:

- [ ] Code works locally (`npm run build` passes)
- [ ] Tested in development environment
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] No hardcoded secrets in code
- [ ] Git repository is clean
- [ ] Changelog updated (if needed)

---

## 📝 Deployment Log

| Date | Version | Status | Notes |
|------|---------|--------|-------|
| 2026-03-20 | v1.13.0 | ✅ Success | Initial deployment to Vercel |
| | | | |

---

**Last Updated:** 2026-03-20
**Deployment Method:** Vercel CLI (no GitLab integration)
**Cost:** Free tier
**Status:** Production Ready
