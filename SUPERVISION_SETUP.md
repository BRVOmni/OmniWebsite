# 🔧 Operational Supervision Module Setup

**Grupo Omniprise - Corporate Food Service Dashboard**

---

## ⚠️ Issue: Supervision Module Tables Missing

The Operational Supervision module was built with all pages and functionality, but the **database tables and seed data were never created** in your Supabase database.

### What's Missing
- ❌ 14 supervision tables (supervisors, visits, findings, actions, etc.)
- ❌ 2 supervisors (Rogger Bogado, Sebastian Weil)
- ❌ 6 checklist categories
- ❌ 21 checklist items
- ❌ 3 visit templates (Rapid, Full Audit, Surprise)
- ❌ Sample visits, findings, and actions
- ❌ RLS policies for supervision data

---

## ✅ Solution: Run Supervision Migrations

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select project: `nzpjfdfnmutbzvxijhic`
3. Click **SQL Editor**
4. Click **New Query**

### Step 2: Run Migration 19 (Tables)

Copy the content from `supabase/migrations/19_supervision_tables.sql` and paste it into the SQL Editor.

**This creates 14 tables:**
- `supervisors` - Supervisor profiles
- `checklist_categories` - 6 categories
- `checklist_items` - 21 checklist items
- `supervision_schedule` - Visit scheduling
- `supervision_visits` - Visit records
- `visit_checklist_results` - Pass/fail results
- `operational_findings` - Issues found during visits
- `corrective_actions` - Follow-up actions
- `visit_photos` - Photo evidence
- `supervisor_metrics` - Performance metrics
- `location_supervision_metrics` - Location-level metrics
- `scheduling_rules` - Auto-scheduling rules
- `visit_templates` - Visit type templates
- `visit_template_items` - Template checklists

Click **Run**.

### Step 3: Run Migration 20 (Seed Data)

Copy the content from `supabase/migrations/20_supervision_seed_data.sql` and paste it into the SQL Editor.

**This populates:**
- 2 supervisors (Rogger Bogado, Sebastian Weil)
- 6 categories (Leadership, Order, Cash Management, Inventory, Cleanliness, Equipment)
- 21 checklist items across categories
- 3 visit templates (Rapid, Full Audit, Surprise)
- 1 default scheduling rule

Click **Run**.

### Step 4: Run Migration 21 (RLS Policies)

Copy the content from `supabase/migrations/21_supervision_rls_policies.sql` and paste it into the SQL Editor.

**This secures your data:**
- Public read access for reference data
- Admin full access
- Supervisor access to assigned locations
- Manager access to their location's data
- Viewer read-only access

Click **Run**.

### Step 5: Run Migration 22 (Alert Triggers) - Optional

Copy the content from `supabase/migrations/22_supervision_alert_triggers.sql` and paste it into the SQL Editor.

**This adds automatic alert generation** for critical findings.

Click **Run**.

---

## 🎯 What You'll Get After Setup

### Supervision Dashboard (/dashboard/supervision)
- ✅ 8 KPI cards showing supervision metrics
- ✅ Score distribution chart
- ✅ Recent findings display
- ✅ Priority actions list
- ✅ Supervisor performance table

### Visit Schedule (/dashboard/supervision/schedule)
- ✅ Calendar view with scheduled visits
- ✅ List view with filtering
- ✅ Create new scheduled visits
- ✅ Auto-schedule generation

### New Visit (/dashboard/supervision/new-visit)
- ✅ 5-step mobile visit process
- ✅ 21 checklist items across 6 categories
- ✅ Real-time scoring
- ✅ Add findings with severity
- ✅ Assign corrective actions
- ✅ Photo uploads

### Findings & Actions
- ✅ Complete findings management
- ✅ Action tracking with deadlines
- ✅ Status updates
- ✅ Filter and search

### Location Supervision
- ✅ Location-level supervision metrics
- ✅ Risk assessment
- ✅ Score trends
- ✅ Recent visits per location

### Supervisor Performance
- ✅ Performance metrics per supervisor
- ✅ Visit completion rates
- ✅ Quality scores
- ✅ Ranking comparisons

---

## 📊 Sample Data Included

### Supervisors
1. **Rogger Bogado** - rogger@omniprise.com
2. **Sebastian Weil** - sebastian@omniprise.com

### Categories (6)
1. Leadership (Liderazgo)
2. Order (Orden)
3. Cash Management (Caja)
4. Inventory (Stock)
5. Cleanness (Limpieza)
6. Equipment (Equipos)

### Checklist Items (21)
- Leadership: 3 items (staffing, tasks, manager leading)
- Order: 2 items (wait time, presentation)
- Cash Management: 4 items (cash count, differences, organization, supports)
- Inventory: 5 items (critical stock, FIFO, expired, storage, star product)
- Cleanliness: 3 items (dining/kitchen, restrooms, waste)
- Equipment: 4 items (facade, cold equipment, key equipment, lights)

### Visit Templates (3)
1. **Rapid** (2x/week) - 10-minute quick visits
2. **Full Audit** (1x/month) - Comprehensive audit
3. **Surprise** (1x/month) - Unannounced visits

---

## 🔍 Verification

After running the migrations, verify they worked:

### Check Tables Exist

```sql
-- Check supervision tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%supervision%'
OR table_name LIKE '%visit%'
OR table_name LIKE '%checklist%'
OR table_name = 'supervisors'
OR table_name = 'corrective_actions'
OR table_name = 'operational_findings'
ORDER BY table_name;
```

You should see 14 tables.

### Check Seed Data

```sql
-- Check supervisors
SELECT * FROM supervisors;

-- Check categories
SELECT * FROM checklist_categories;

-- Check checklist items
SELECT * FROM checklist_items;
```

You should see:
- 2 supervisors
- 6 categories
- 21 checklist items

---

## ⚠️ Important Notes

### Order Matters
Run migrations in order: 19 → 20 → 21 → 22
- **19** creates tables
- **20** populates data (requires tables from 19)
- **21** secures data (requires data from 20)
- **22** adds triggers (requires tables from 19)

### Error Handling
If a migration fails:
1. Read the error message carefully
2. Tables might already exist → Continue to next migration
3. Data might already exist → Continue to next migration
4. RLS policies might conflict → Adjust and retry

### Rollback (If Needed)
```sql
-- Drop all supervision tables (CAUTION: Deletes all data)
DROP TABLE IF EXISTS visit_template_items CASCADE;
DROP TABLE IF EXISTS visit_templates CASCADE;
DROP TABLE IF EXISTS scheduling_rules CASCADE;
DROP TABLE IF EXISTS location_supervision_metrics CASCADE;
DROP TABLE IF EXISTS supervisor_metrics CASCADE;
DROP TABLE IF EXISTS visit_photos CASCADE;
DROP TABLE IF EXISTS corrective_actions CASCADE;
DROP TABLE IF EXISTS operational_findings CASCADE;
DROP TABLE IF EXISTS visit_checklist_results CASCADE;
DROP TABLE IF EXISTS supervision_visits CASCADE;
DROP TABLE IF EXISTS supervision_schedule CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS checklist_categories CASCADE;
DROP TABLE IF EXISTS supervisors CASCADE;
```

---

## 📞 Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify tables don't already exist
3. Ensure you're running migrations in order
4. Check GitLab issues: https://gitlab.com/sbrv-group/omniprise/-/issues

---

**Last Updated:** 2026-03-21
**Module:** Operational Supervision
**Status:** Built but not deployed (migrations need to be run)
