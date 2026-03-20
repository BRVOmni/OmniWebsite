# 🚀 DATABASE SETUP CHEAT SHEET

**Corporate Dashboard - Supabase Migrations**

---

## 📋 COPY AND PASTE EACH SECTION IN ORDER

### Step 1: Core Tables
```
File: supabase/migrations/01_core_tables.sql
Status: ⏳ Pending
```
1. Open `supabase/migrations/01_core_tables.sql` in your editor
2. Copy ALL the code
3. Paste in Supabase SQL Editor
4. Click **▶ Run**
5. Look for: "✓ Success" message

---

### Step 2: Locations & Channels
```
File: supabase/migrations/02_locations_channels.sql
Status: ⏳ Pending
```
1. Open file, copy, paste, click Run

---

### Step 3: Products & Suppliers
```
File: supabase/migrations/03_products_suppliers.sql
Status: ⏳ Pending
```

---

### Step 4: Sales Tables
```
File: supabase/migrations/04_sales.sql
Status: ⏳ Pending
```

---

### Step 5: Cash Closings
```
File: supabase/migrations/05_cash_closings.sql
Status: ⏳ Pending
```

---

### Step 6: Purchases & Payments
```
File: supabase/migrations/06_purchases_payments.sql
Status: ⏳ Pending
```

---

### Step 7: Supervision & Inventory
```
File: supabase/migrations/07_supervision_inventory.sql
Status: ⏳ Pending
```

---

### Step 8: Alerts
```
File: supabase/migrations/08_alerts.sql
Status: ⏳ Pending
```

---

### Step 9: Users & Roles
```
File: supabase/migrations/09_users_roles.sql
Status: ⏳ Pending
```
---

### Step 10: Performance Indexes
```
File: supabase/migrations/10_indexes.sql
Status: ⏳ Pending
```

---

### Step 11: Materialized Views
```
File: supabase/migrations/11_materialized_views.sql
Status: ⏳ Pending
```

---

### Step 12: Seed Data (Sample Data)
```
File: supabase/migrations/12_seed_data.sql
Status: ⏳ Pending
```
This adds:
- 1 country (Paraguay)
- 4 cities
- 4 brands
- 4 sales channels
- 3 payment methods
- Sample products
- Sample location
- 20 sample sales

---

### Step 13: Row Level Security (RLS)
```
File: supabase/migrations/13_rls_policies.sql
Status: ⏳ Pending
```
⚠️ CRITICAL: This secures your database!

---

## ✅ VERIFICATION

After completing all 13 migrations, run this in SQL Editor to verify:

```sql
-- Check tables (should show 24+ tables)
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check countries (should be 1)
SELECT COUNT(*) FROM countries;

-- Check brands (should be 4)
SELECT COUNT(*) FROM brands;

-- Check sales (should be 20 sample records)
SELECT COUNT(*) FROM sales;
```

---

## 🎯 ALL DONE? NEXT STEPS:

1. ✅ Go to: **Authentication** → **Users**
2. ✅ Create admin user
3. ✅ Test connection: `npm run dev` → visit http://localhost:3000/debug

---

**Pro Tip:** Each migration takes 2-10 seconds. Total time: ~2-3 minutes.

**Let me know when you've completed all 13 migrations!** 🚀
