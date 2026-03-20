# 🚀 cPanel Deployment Guide

**Grupo Omniprise - Corporate Food Service Dashboard**

---

## 📋 Table of Contents

1. [Deployment Options](#deployment-options)
2. [Option 1: Node.js App in cPanel (Recommended)](#option-1-nodejs-app-in-cpanel-recommended)
3. [Option 2: VPS with Custom Domain](#option-2-vps-with-custom-domain)
4. [Option 3: Subdomain to Vercel/VPS](#option-3-subdomain-to-vercelvps)
5. [Domain Configuration](#domain-configuration)
6. [SSL Certificate](#ssl-certificate)
7. [Post-Deployment Checklist](#post-deployment-checklist)

---

## 🎯 Deployment Options

### Option Comparison

| Option | Difficulty | Performance | Features | Best For |
|--------|-----------|-------------|----------|----------|
| **Node.js in cPanel** | Medium | Good | Full Next.js features | Shared hosting with Node.js enabled |
| **VPS with Docker** | Hard | Excellent | Full control | High traffic, custom needs |
| **Vercel + Custom Domain** | Easy | Excellent | All features | Easiest deployment |

### Recommended: Node.js App in cPanel

This guide focuses on deploying your Next.js app as a Node.js application directly in cPanel.

---

## Option 1: Node.js App in cPanel (Recommended)

### Prerequisites

Your hosting must support:
- ✅ Node.js applications in cPanel
- ✅ SSH access (recommended)
- ✅ Ability to set environment variables
- ✅ PM2 or similar process manager

**Check if your cPanel supports Node.js:**
1. Log in to cPanel
2. Look for "Setup Node.js App" or "Node.js Selector" icon
3. If not present, contact your hosting provider

---

### Step 1: Prepare Your Application

#### 1.1 Build the Application

```bash
# Navigate to your project
cd /home/bruno-rivas/corporate-food-dashboard

# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm run start
```

#### 1.2 Verify Build Output

You should see:
- `.next/` folder with compiled files
- `public/` folder with static assets
- `package.json` with start script

---

### Step 2: Configure Environment Variables

Create a production `.env` file:

```bash
# In your project directory
cat > .env.production << 'EOF'
# Supabase - Production
NEXT_PUBLIC_SUPABASE_URL=https://nzpjfdfnmutbzvxijhic.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App - Production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Grupo Omniprise

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
EOF
```

**⚠️ Important:** Replace `your-domain.com` with your actual domain.

---

### Step 3: Upload Files to cPanel

#### Option A: Using File Manager (GUI)

1. **Create a ZIP file:**
```bash
cd /home/bruno-rivas
zip -r omniprise-dashboard.zip corporate-food-dashboard/ \
  -x "corporate-food-dashboard/node_modules/*" \
  -x "corporate-food-dashboard/.next/*" \
  -x "corporate-food-dashboard/.git/*"
```

2. **Upload to cPanel:**
   - Log in to cPanel
   - Go to File Manager
   - Navigate to your domain folder (usually `public_html` or a subdirectory)
   - Upload the ZIP file
   - Extract it

3. **Install dependencies on server:**
   - Open Terminal in cPanel or connect via SSH
   - Navigate to your app directory
   - Run: `npm install --production`

#### Option B: Using Git (Recommended)

1. **Clone directly on server:**
```bash
# Via SSH or cPanel Terminal
cd ~/your-domain-folder
git clone https://gitlab.com/sbrv-group/omniprise.git .
```

2. **Install dependencies:**
```bash
npm install --production
```

3. **Build on server:**
```bash
npm run build
```

---

### Step 4: Configure Node.js App in cPanel

1. **Open "Setup Node.js App" in cPanel**

2. **Create a new application:**
   - **Node.js version:** 18.x or 20.x (recommended)
   - **Application mode:** Production
   - **Application root:** Path to your app folder
   - **Application URL:** Your domain or subdomain
   - **Application startup file:** `package.json` (cPanel will detect it)

3. **Configure environment variables:**
   - Scroll to "Environment variables"
   - Add each variable from `.env.production`:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://nzpjfdfnmutbzvxijhic.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your_key
     SUPABASE_SERVICE_ROLE_KEY = your_key
     NEXT_PUBLIC_APP_URL = https://your-domain.com
     NEXT_PUBLIC_APP_NAME = Grupo Omniprise
     NEXT_PUBLIC_ENABLE_ANALYTICS = false
     NEXT_PUBLIC_ENABLE_DEBUG = false
     ```

4. **Save and Restart:**
   - Click "Create Application"
   - Wait for it to start
   - Check the status - should be "Running"

---

### Step 5: Configure .htaccess (if needed)

Create/edit `.htaccess` in your public directory:

```apache
# Redirect all traffic to Next.js app
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

### Step 6: Verify Deployment

1. **Visit your domain:** `https://your-domain.com`
2. **Check:**
   - ✅ Homepage loads with Grupo Omniprise logo
   - ✅ Login page works
   - ✅ Can sign in with your credentials
   - ✅ Dashboard loads with data
   - ✅ All modules accessible

3. **Check browser console for errors:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

---

## Option 2: VPS with Custom Domain

If your hosting doesn't support Node.js apps, use a VPS:

### Recommended VPS Providers

| Provider | Starting Price | Features |
|----------|---------------|----------|
| **DigitalOcean** | $6/month | Easy setup, good docs |
| **Linode** | $5/month | Good performance |
| **Vultr** | $6/month | Global locations |
| **Hetzner** | €4/month | Best value in Europe |

### VPS Deployment Steps

#### 1. Set up VPS

```bash
# Connect to your VPS via SSH
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Git
apt install -y git
```

#### 2. Clone and Build Application

```bash
# Clone repository
cd /var/www
git clone https://gitlab.com/sbrv-group/omniprise.git
cd omniprise

# Install dependencies
npm install

# Build application
npm run build

# Create .env file
cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://nzpjfdfnmutbzvxijhic.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Grupo Omniprise
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
EOF
```

#### 3. Start with PM2

```bash
# Start application
pm2 start npm --name "omniprise" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on reboot
pm2 startup
```

#### 4. Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/omniprise
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
# Create symlink
ln -s /etc/nginx/sites-available/omniprise /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

## Option 3: Subdomain to Vercel (Easiest)

If you want the easiest deployment:

### Deploy to Vercel + Connect Custom Domain

1. **Deploy to Vercel:**
   - Connect your GitLab repository to Vercel
   - Vercel auto-deploys on push

2. **Add custom domain in Vercel:**
   - Go to project Settings → Domains
   - Add your domain (e.g., `dashboard.your-domain.com`)
   - Vercel will give you DNS records to add

3. **Update DNS in cPanel:**
   - Go to cPanel → Zone Editor
   - Add CNAME record:
     ```
     Name: dashboard
     Type: CNAME
     Record: cname.vercel-dns.com
     ```

4. **Wait for DNS propagation** (usually 1-24 hours)

---

## Domain Configuration

### Point Domain to Hosting

1. **If domain is registered elsewhere:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Find DNS settings
   - Update nameservers to your hosting's nameservers
   - Or add A record pointing to your hosting IP

2. **If domain is in cPanel:**
   - Domain is already configured
   - Just deploy to the right folder

### Subdomain Setup (Optional)

For `dashboard.your-domain.com`:

1. **In cPanel:**
   - Go to "Subdomains"
   - Create: `dashboard.your-domain.com`
   - Point to: `omniprise` folder (or your app folder)

2. **Deploy app to that subdirectory**

---

## SSL Certificate

### Free SSL with Let's Encrypt (cPanel)

1. **In cPanel, find "SSL/TLS Status"**
2. **Select your domain**
3. **Click "Run AutoSSL"**
4. **Wait for certificate to install**

### Force HTTPS

Add to `.htaccess`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

Or in Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # ... rest of config
}
```

---

## Post-Deployment Checklist

### Security
- [ ] SSL certificate installed and working
- [ ] HTTPS forced redirect active
- [ ] Environment variables set (no hardcoded secrets)
- [ ] Debug mode disabled in production
- [ ] Database backups configured

### Functionality
- [ ] Homepage loads correctly
- [ ] Login/signup works
- [ ] All dashboard modules load
- [ ] Data displays correctly from Supabase
- [ ] File uploads work (Supabase Storage)
- [ ] Language toggle works
- [ ] No console errors

### Performance
- [ ] Page load time under 3 seconds
- [ ] Images optimized
- [ ] CDN configured (optional)
- [ ] Caching enabled

### Monitoring
- [ ] Uptime monitoring set up (optional)
- [ ] Error tracking configured (optional)
- [ ] Analytics enabled (optional)

---

## Troubleshooting

### Common Issues

#### 1. "Application not starting"
- Check Node.js version compatibility (needs 18+)
- Verify build completed successfully
- Check logs in cPanel Node.js app interface

#### 2. "Environment variables not working"
- Ensure variables are set in cPanel Node.js app interface
- Restart application after adding variables
- Check variable names match exactly

#### 3. "Blank page"
- Check if build ran successfully
- Verify `.next` folder exists
- Check browser console for errors
- Ensure all dependencies installed

#### 4. "Can't connect to database"
- Verify Supabase URL is correct
- Check API keys are valid
- Ensure Supabase project is active

#### 5. "404 errors on routes"
- Ensure all files uploaded
- Check if routing is configured correctly
- Verify `.htaccess` rules

---

## Need Help?

### cPanel Resources
- cPanel documentation: https://docs.cpanel.net/
- Node.js in cPanel: Ask your hosting provider

### Project Resources
- GitLab: https://gitlab.com/sbrv-group/omniprise
- Supabase: https://supabase.com/dashboard

### Common Commands

```bash
# Check Node.js version
node -v

# Check if app is running
pm2 list

# View app logs
pm2 logs omniprise

# Restart app
pm2 restart omniprise

# Stop app
pm2 stop omniprise
```

---

**Last Updated:** 2026-03-20
**Version:** 1.0.0
