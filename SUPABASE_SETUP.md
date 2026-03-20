# 🚀 Supabase Project Setup Guide

**Corporate Food Service Dashboard**

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### Step 1: Create New Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in with your existing account

2. **Create New Project** (Separate from restaurant-dashboard)
   - Click **"New Project"** button
   - Fill in the form:
     ```
     Organization: [Your existing org]
     Name: Corporate Dashboard
     Database Password: [Generate strong password - SAVE THIS!]
     Region: South America (São Paulo) - closest to Paraguay
     Pricing Plan: Free (you can upgrade later)
     ```
   - Click **"Create new project"**

3. **Wait for Provisioning**
   - Takes about 2-3 minutes
   - You'll see a progress indicator
   - Project will be ready when status shows "Active"

---

### Step 2: Get Your Credentials

Once the project is ready:

1. **Go to Project Settings**
   - Click the gear icon ⚙️ in the left sidebar
   - Or click "Settings" → "API"

2. **Copy Your Credentials** (save these somewhere safe!)
   ```
   Project URL: https://xxxxxxxxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET!)
   ```

---

### Step 3: Configure Environment Variables

1. **Copy the template**
   ```bash
   cd /home/bruno-rivas/corporate-food-dashboard
   cp .env.local.example .env.local
   ```

2. **Edit the file**
   ```bash
   nano .env.local
   ```

3. **Paste your Supabase credentials**
   ```env
   # Supabase - Corporate Dashboard
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=Corporate Dashboard

   # Features
   NEXT_PUBLIC_ENABLE_ANALYTICS=false
   NEXT_PUBLIC_ENABLE_DEBUG=true
   ```

4. **Save**: `Ctrl+X`, then `Y`, then `Enter`

---

### Step 4: Apply Database Schema

1. **Open SQL Editor**
   - In Supabase dashboard
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"**

2. **Apply Migrations in Order**

   I've created organized migration files for you. Run each section in order:

   **Migration 1: Core Tables (Countries, Cities, Brands)**
   - Copy from `supabase/migrations/01_core_tables.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️
   - Wait for "Success" message

   **Migration 2: Locations & Channels**
   - Copy from `supabase/migrations/02_locations_channels.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 3: Products & Suppliers**
   - Copy from `supabase/migrations/03_products_suppliers.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 4: Sales Tables**
   - Copy from `supabase/migrations/04_sales.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 5: Cash Closings**
   - Copy from `supabase/migrations/05_cash_closings.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 6: Purchases & Payments**
   - Copy from `supabase/migrations/06_purchases_payments.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 7: Supervision & Inventory**
   - Copy from `supabase/migrations/07_supervision_inventory.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 8: Alerts**
   - Copy from `supabase/migrations/08_alerts.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 9: Users & Roles**
   - Copy from `supabase/migrations/09_users_roles.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 10: Indexes**
   - Copy from `supabase/migrations/10_indexes.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 11: Materialized Views**
   - Copy from `supabase/migrations/11_materialized_views.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

   **Migration 12: Seed Data**
   - Copy from `supabase/migrations/12_seed_data.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

3. **Verify Setup**
   - Click **"Database"** in left sidebar
   - You should see all tables listed
   - Click **"SQL Editor"** → Run this:
   ```sql
   SELECT COUNT(*) as table_count
   FROM information_schema.tables
   WHERE table_schema = 'public';
   -- Should show 24+ tables
   ```

---

### Step 5: Set Up Row Level Security (RLS)

1. **Enable RLS on Critical Tables**
   - Copy from `supabase/migrations/13_rls_policies.sql`
   - Paste into SQL Editor
   - Click **"Run"** ▶️

2. **Verify RLS**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   -- Most tables should show rowsecurity = true
   ```

---

### Step 6: Create First User (Admin)

1. **Go to Authentication**
   - Click **"Authentication"** in left sidebar
   - Click **"Users"** tab

2. **Create Admin User**
   - Click **"Add user"** → **"Create new user"**
   - Email: `admin@omniprise.com.py`
   - Password: [Use a strong password]
   - Auto Confirm User: ✅ ON
   - Click **"Create user"**

3. **Add User Profile**
   - Go to SQL Editor
   - Run this:
   ```sql
   INSERT INTO users (id, email, full_name, role, is_active)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@omniprise.com.py'),
     'admin@omniprise.com.py',
     'Admin User',
     'admin',
     true
   );
   ```

---

### Step 7: Test Connection

1. **Run Development Server**
   ```bash
   cd /home/bruno-rivas/corporate-food-dashboard
   npm run dev
   ```

2. **Open Debug Page**
   - Visit: http://localhost:3000/debug
   - Should show:
     - ✅ Connected successfully!
     - ✅ Database tables found
     - ✅ Countries in database: 1+

---

## ✅ CHECKLIST

- [ ] New Supabase project created (separate from restaurant-dashboard)
- [ ] Credentials saved to .env.local
- [ ] Database schema applied (12 migrations)
- [ ] Row Level Security enabled
- [ ] Admin user created
- [ ] Connection tested successfully

---

## 🔧 TROUBLESHOOTING

### "Invalid API Key"
**Solution**: Check .env.local has correct keys from NEW project

### "Table doesn't exist"
**Solution**: Run all migrations in order (1-12)

### "Permission denied"
**Solution**: Enable RLS policies (migration 13)

### "Connection timeout"
**Solution**: Check Supabase project is active (not paused)

---

## 📞 NEXT STEPS

After Supabase setup is complete:

1. ✅ Test connection at http://localhost:3000/debug
2. ✅ Create login page with Supabase Auth
3. ✅ Build sidebar navigation
4. ✅ Create Executive Summary page
5. ✅ Build first dashboard components

---

## 📚 IMPORTANT NOTES

- This is a **separate project** from restaurant-dashboard
- Different database, different tables, different structure
- Both projects can coexist in your Supabase account
- Each has its own credentials in separate `.env.local` files

---

**Ready to proceed?** Follow the steps above and let me know when you're ready for the next phase!
