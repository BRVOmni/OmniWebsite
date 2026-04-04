# Deployment Runbook

## Normal Deployment

Every push to `main` triggers an automatic Vercel deployment. No manual steps required.

```
git push origin main
```

Monitor at: https://vercel.com

---

## Manual Deployment (Emergency)

If Vercel auto-deploy fails or you need to deploy outside the normal pipeline:

```bash
cd Website
npm run build
npx vercel --prod
```

You will be prompted to log in if not already authenticated.

---

## Rollback

### Option 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com → Select project → Deployments
2. Find the last working deployment
3. Click the `...` menu → **Promote to Production**

This redeploys a previous build without any code changes.

### Option 2: Git Revert

```bash
git revert HEAD
git push origin main
```

This creates a new commit that undoes the last commit and triggers a fresh deploy.

---

## DNS Configuration

| Record | Type | Value |
|---|---|---|
| `omniprise.com.py` | A | `76.76.21.21` |
| `www.omniprise.com.py` | CNAME | `cname.vercel-dns.com` |

DNS changes propagate in up to 24 hours. Do not change these without confirming with the domain registrar.

---

## Vercel Settings

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `Website` |
| Build Command | `next build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm install` (default) |
| Production Branch | `main` |

**Never change Root Directory away from `Website`.** The monorepo structure requires Vercel to build from the `Website/` subdirectory.

---

## Troubleshooting

### Build fails on Vercel but passes locally

1. Check Node.js version matches (CI uses Node 22; local should be 22.x)
2. Check `package-lock.json` is committed
3. Check for missing devDependencies used at build time

### Website shows old content after deploy

1. Check Vercel deployment status — it may still be building
2. Hard-refresh with Ctrl+Shift+R to clear CDN cache
3. Check that the correct branch (`main`) was deployed

### Formspree forms stop working

1. Check Formspree dashboard for rate limits or account issues
2. Verify the form endpoint IDs in source code match Formspree
3. Check browser console for CORS or CSP errors
