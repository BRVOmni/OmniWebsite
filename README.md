# 🍽️ Grupo Omniprise - Corporate Food Service Dashboard

**Multi-Brand Food Service Chain Management Platform**

---

## 📋 PROJECT OVERVIEW

A modern, executive-level corporate dashboard for managing a multi-brand food service chain across multiple locations and countries.

**Design Philosophy:** Modern, fresh, young, premium, and crystal clear for fast decision-making.

**Company:** Grupo Omniprise

---

**Current Version:** v1.15.7 - Corrective Actions Page Fixed 🔧✅

**Production URL:** https://dashboard.omniprise.com.py

**Status:** ✅ Live and Operational - All Modules Complete with Working Translations

---

## 🎯 PRIMARY OBJECTIVE

Enable executive management (GM, CFO, Admin Management, Supervision Team) to understand business health in **under 30 seconds** by answering:

1. 💰 How much was sold?
2. 📈 How much was earned?
3. ⚠️ Where is money being lost?
4. 🏪 Which location/brand is out of control?
5. 💸 Where are there cash differences?
6. 🔝 Which products are best-selling?
7. 📍 Which locations perform best/worst?
8. 🚨 Which alerts require immediate attention?
9. 📦 Are there merchandise shortages?
10. ✅ Is supervision team complying with visits?

---

## 🎨 DESIGN PRINCIPLES

### Visual Style
- **Look:** Modern corporate-tech / premium retail / mature startup
- **Feel:** Executive management software for serious food service chain
- **Anti-Patterns:** NOT old ERP, NOT overloaded, NOT traditional corporate

### Core UX Principles
1. ✨ Modern, clean, young design
2. 💎 Premium but simple
3. 📱 Mobile-first, desktop-optimized
4. 🧩 Reusable, scalable components
5. 👁️ Quick reading with strong visual hierarchy
6. 🎯 Intuitive navigation without saturation
7. ⏱️ Business understanding in <30 seconds
8. 💡 Tooltips on ALL critical metrics
9. 🌍 Multi-country, multi-currency ready
10. 🚀 NOT tied to Paraguay - globally scalable

### Visual Language
- Wide spaces, rounded edges, soft shadows
- Clean cards with clear hierarchy
- Traffic lights: 🟢 Good | 🟡 Attention | 🔴 Problem
- Modern icons (Lucide)
- Professional typography
- Badges, tooltips, clear tables

---

## 🏗️ PRODUCT ARCHITECTURE

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  HEADER (Top) - User, Language, Notifications, Date    │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  LEFT    │         MAIN CONTENT AREA                   │
│  SIDEBAR │                                              │
│          │  ┌────────────────────────────────────────┐ │
│  •       │  │   FILTER BAR (Global filters)          │ │
│  Module  │  ├────────────────────────────────────────┤ │
│  Nav     │  │                                        │ │
│  Menu    │  │   KPI CARDS (Top Metrics)              │ │
│          │  │                                        │ │
│  - Exec  │  ├────────────────────────────────────────┤ │
│  Summary │  │                                        │ │
│  - Sales │  │   CHARTS / TABLES / RANKINGS           │ │
│  - Profit│  │                                        │ │
│  - Locs  │  │                                        │ │
│  - Brands│  │                                        │ │
│  - Prods │  │                                        │ │
│  - Cash  │  │                                        │ │
│  - Purch │  │                                        │ │
│  - Pay   │  │                                        │ │
│  - Superv│  │                                        │ │
│  - Alerts│  │                                        │ │
│  - Config│  └────────────────────────────────────────┘ │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

---

## 📦 MODULES

### 1. Executive Summary
Main screen for Manager. Shows global business health.

**KPI Cards:**
- Net Sales
- Orders
- Average Ticket
- Food Cost %
- Estimated Profitability
- Centralized Payments
- Total Cash Difference
- Active Alerts

**Features:**
- Global filters (country, city, location, brand, channel, date)
- Top alerts visible
- Daily sales vs payments trend
- Quick location ranking
- Traffic lights by brand
- Traffic lights by location

---

### 2. Sales
Detailed sales analysis module.

**Dimensions:**
- By location, brand, channel, payment method
- By country/city
- Daily, weekly, monthly evolution
- Period comparisons

**Features:**
- Detailed table
- Advanced filters
- Channel mix chart
- Payment method mix chart
- Channel × Payment matrix

---

### 3. Profitability
Clear financial view for Management/Finance.

**Shows:**
- Profitability by location/brand
- Food cost, gross margin
- Petty cash expenses
- Merchandise purchases
- Centralized payments
- Sales vs Purchases vs Payments comparison

**Key:**
Visual language showing which locations make money vs destroy margin.

---

### 4. Locations
Individual location detail view.

**Per Location:**
- Sales, profitability
- Cash differences
- Supervision visits
- Open alerts
- Merchandise shortages
- Historical performance
- Network ranking
- Comparison vs others

**General Views:**
- Top locations
- Locations under observation
- Critical locations

---

### 5. Brands
Brand-focused analytics.

**Shows:**
- Sales by brand
- Profitability by brand
- Best-selling products
- Best-performing locations
- Period evolution
- Alerts by brand

---

### 6. Products
Commercial and operational product insights.

**Shows:**
- Best-selling products
- Least-selling products
- Highest billing products
- Highest volume products
- Products with sales drop
- Products by brand/location
- Shortage/stock breakage alerts

**Answers:**
- What sells most?
- What sells least?
- What drives profitability?
- Where are shortages?

---

### 7. Cash and Closing
**CRITICAL MODULE** - Cash control and daily closing.

**Shows (by location, by date):**
- Expected: Cash, Bancard, Upay sales
- Petty cash rendering
- Counted: Cash, Bancard, Upay
- Differences by payment method
- Total difference

**Closing States:**
- ✅ Closed correctly
- ⚠️ Closed with difference
- 🔴 Pending review

**Alerts:**
- Cash shortage
- Bancard/Upay difference
- Unclosed cash
- Cash closed outside schedule
- Cash with observation

---

### 8. Purchases and Merchandise
Procurement and inventory control.

**Shows:**
- Merchandise purchases
- By location/brand/supplier
- Stock shortages
- Critical stock alerts
- Consumption variation
- Purchase vs Sales relationship
- Food cost correlation

**Objective:**
Detect excessive purchasing, poor buying, operational shortages.

---

### 9. Payments
Centralized financial module.

**Shows:**
- Payments made/pending/urgent
- Payments outside calendar
- By supplier/type/location/brand
- Payment discipline
- Supplier ranking by amount

**Alerts:**
- Excess urgent payments
- Payments outside policy
- Excessive supplier concentration

---

### 10. Operational Supervision 🔍
**KEY MODULE** - Field operations oversight and compliance tracking.

**Status:** ✅ **Complete** (100%)

**Features:**
- ✅ Database foundation (14 tables created)
- ✅ Seed data (categories, items, supervisors, templates)
- ✅ RLS policies (comprehensive security)
- ✅ Core components (10+ reusable components)
- ✅ Translations (200+ EN/ES keys)
- ✅ Sidebar navigation
- ✅ Main supervision dashboard with 8 KPIs
- ✅ Visit schedule module (calendar/list views)
- ✅ Mobile visit entry form (5-step process)
- ✅ Findings & actions management pages
- ✅ Location supervision views (list & detail)
- ✅ Supervisor performance tracking
- ✅ Photo upload system (Supabase Storage)
- ✅ Auto-scheduling system (intelligent algorithm)
- ✅ Alert integration (database triggers)
- ✅ API endpoints for alert management

**Shows:**
- Visits made/pending
- Days since last visit by location
- Locations without visit
- Operational compliance score
- Critical findings
- Corrective actions status

**Alerts:**
- No visit in X days
- Open findings
- Recurring issues
- Low route compliance

---

### 11. Alerts
Centralized critical issues screen.

**Alert Types:**
- Cash
- Merchandise
- Payments
- Supervision
- Sales
- Profitability

**Per Alert:**
- Criticality level
- Affected location/brand
- Date
- Suggested action
- Link to related module

---

### 12. Configuration / Masters
System configuration.

**Manage:**
- Countries, cities, locations
- Brands, sales channels, payment methods
- Product categories, suppliers
- Users and roles
- Alert parameters

---

## 🎛️ MANDATORY GLOBAL FILTERS

Available across ALL modules:

- 📅 Date
- 🌎 Country
- 🏙️ City
- 📍 Location
- 🏷️ Brand
- 📡 Sales Channel
- 💳 Payment Method

---

## 🧩 MANDATORY UX COMPONENTS

- 💡 Tooltips on ALL KPIs and technical concepts
- 📇 Summary cards
- 🏷️ Status badges
- 🚦 Traffic lights
- 📊 Tables with filters and search
- 📑 Tabs to switch views
- 🍞 Breadcrumbs
- 📤 Export buttons
- 📭 Well-designed empty states
- ⏳ Modern loading states
- ⚠️ Clear error messages
- ✨ Smooth hover states
- 🪟 Simple, elegant modals
- 📱 Responsive design

---

## 🚨 ALERT LOGIC

Automatic alerts for:

- Cash difference / shortage
- Merchandise / critical stock shortage
- High food cost
- Low / negative profitability
- Excessive urgent payments
- Payments outside calendar
- Location without supervision visit
- Low supervisor compliance
- Abrupt sales drop
- Abrupt average ticket drop

---

## 🏆 IMPORTANT RANKINGS

Clear rankings for:
- 📍 Top sales locations
- 💰 Highest profitability locations
- 📉 Worst profitability locations
- 🔝 Best-selling products

---

## 🛠️ TECH STACK

```
Frontend:  Next.js 15, React 19, TypeScript
Styling:   Tailwind CSS + shadcn/ui
State:     Zustand + React Query
Charts:    Recharts
DB:        Supabase (PostgreSQL)
Auth:      Supabase Auth
i18n:      next-intl
Validation: Zod
Icons:     Lucide React
```

---

## 📁 PROJECT STRUCTURE

```
corporate-food-dashboard/
├── src/
│   ├── app/                      # Next.js app router
│   │   ├── dashboard/           # Main dashboard pages
│   │   ├── auth/                # Authentication
│   │   └── api/                 # API routes
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── modules/             # Feature-specific components
│   │   ├── layout/              # Layout components (Sidebar, Header)
│   │   └── shared/              # Shared components (Cards, Badges, etc.)
│   ├── lib/
│   │   ├── db/                  # Database queries
│   │   ├── utils/               # Helper functions
│   │   └── validations/         # Zod schemas
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript types
│   ├── config/                  # Configuration files
│   └── styles/                  # Global styles
```

---

## 🚀 DESIGN DECISIONS (Avoiding Previous Mistakes)

### ✅ What We're Doing Right

1. **Centralized Sidebar Navigation** - No more confusing `/admin` vs `/dashboard` routes
2. **Role-Based Component Visibility** - UI components hide/show based on permissions
3. **Security-First Architecture** - Audit logging, rate limiting planned from day one
4. **Multi-Country Ready** - Currency, country, city built into core data model
5. **Tooltip Strategy** - Every KPI has explanatory tooltip
6. **Alert-First Design** - Alerts visible everywhere, not hidden
7. **Clear Visual Hierarchy** - KPI cards → Rankings → Details
8. **Component Library** - Reusable cards, badges, tables from the start

### ❌ Previous Mistakes We're Avoiding

1. ❌ Confusing route hierarchy
2. ❌ Overloaded dashboards
3. ❌ Security as afterthought
4. ❌ No audit trails
5. ❌ Hardcoded role checks everywhere
6. ❌ Single-country limitation
7. ❌ Missing tooltips
8. ❌ Hidden critical information

---

## 📊 DATA MODEL (Core Entities)

```
Countries
  └── Cities
      └── Locations
          ├── Brands (multiple brands per location possible)
          ├── Sales
          ├── CashClosings
          ├── Purchases
          ├── Payments
          ├── SupervisionVisits
          └── Alerts

SalesChannels (In-store, Own Delivery, PedidosYa, Monchis)
PaymentMethods (Bancard, Upay, Cash)

Products
  ├── Categories
  └── Suppliers

Users
  └── Roles (Admin, Manager, Supervisor, CFO, Viewer, etc.)
```

---

## 📝 VERSION HISTORY

### v1.15.7 (2026-03-23) - Corrective Actions Page Fixed 🔧✅

**Completed:**
- ✅ Fixed 400 error when fetching corrective_actions from database
- ✅ Added defensive filters to prevent rendering invalid data
- ✅ Added fallback values for undefined/null properties
- ✅ Created RLS policy migration for database fix
- ✅ Fixed potential crash on null location relationships

**Database Action Required:**
Run the RLS policy migration in Supabase Dashboard SQL Editor to enable corrective_actions access.

### v1.15.6 (2026-03-21) - Findings Page Translations Complete ✅

**Completed:**
- ✅ Added translation support for finding types
- ✅ Created getFindingTypeLabel mapping function
- ✅ Finding types now translate correctly:
  - caja_diferencias ↔ Cash Differences / Diferencias de Caja
  - stock_vencidos ↔ Expired Products / Productos Vencidos
  - equipos_falla ↔ Equipment Failure / Falla de Equipos
  - limpieza_deficiente ↔ Poor Cleanliness / Limpieza Deficiente
  - personal_ausente ↔ Staff Absent / Personal Ausente
- ✅ Filter dropdown now shows translated types
- ✅ "Findings by Type" cards now show translated types
- ✅ All FindingCard translations working perfectly
- ✅ All VisitTypeBadge translations working

### v1.15.5 (2026-03-21) - Supervision Module Fully Fixed ✅

**Completed:**
- ✅ Fixed VisitTypeBadge undefined config error
- ✅ Added 'use client' directive to VisitTypeBadge
- ✅ Added defaultConfig with hardcoded fallback values
- ✅ Made type prop optional to handle undefined values
- ✅ Removed all debug console.log statements
- ✅ All supervision module pages now working without errors
- ✅ Translations working perfectly (EN/ES)

### v1.15.4 (2026-03-21) - Translation System Refinement ✅

**Completed:**
- ✅ Removed t() dependency from config objects
- ✅ Hardcoded config values that never depend on translations
- ✅ Translations applied only in JSX during render
- ✅ Simplified code and eliminated timing issues

### v1.15.3 (2026-03-21) - Bulletproof Config System ✅

**Completed:**
- ✅ Added useMemo for all config objects
- ✅ Added validation for severity/status/priority values
- ✅ Added safeConfig fallback with hardcoded defaults
- ✅ All configs guaranteed to be defined

### v1.15.2 (2026-03-21) - Findings Page Fixed ✅

**Completed:**
- ✅ Fixed "Cannot read properties of undefined (reading 'bgClass')" error
- ✅ Added defensive checks to filter out invalid findings
- ✅ Added fallback for getSeverityConfig function
- ✅ Removed non-existent photoCount prop from all pages
- ✅ All translation fixes preserved and working
- ✅ Findings page now loads without errors

### v1.15.1 (2026-03-21) - Translation System Fixed ✅

**Completed:**
- ✅ Fixed FindingCard translations with text normalization
- ✅ Fixed ActionCard translations with text normalization
- ✅ All Spanish titles/descriptions now translate to English
- ✅ Handle line breaks and extra whitespace in database values
- ✅ All severity, priority, and status labels translating correctly
- ✅ Removed debug console.log statements
- ✅ Verified production deployment has latest changes

### v1.14.0 (2026-03-20) - Production Deployment ✅

**Completed:**
- ✅ Deployed to Vercel (free tier - $0/month)
- ✅ Custom domain configured: https://dashboard.omniprise.com.py
- ✅ SSL certificate automatically provisioned
- ✅ DNS configured and propagated
- ✅ Root page redirects to login
- ✅ All 14 modules live and accessible
- ✅ Environment variables configured
- ✅ Global CDN enabled
- ✅ Deployment script created (`./deploy.sh`)

### v1.13.0 (2026-03-20) - Grupo Omniprise Branding ✅

**Completed:**
- ✅ Updated company name to "Grupo Omniprise" throughout application
- ✅ Added Omniprise logo to all pages (landing, login, signup, sidebar)
- ✅ Updated app metadata and page titles
- ✅ Renamed package to `omniprise-dashboard`
- ✅ Consistent branding across all user-facing pages

### v1.12.0 (2026-03-20) - User Permissions System ✅

**Completed:**
- ✅ Four-tier role system (Admin, Branch Manager, Supervisor, Viewer)
- ✅ Granular page-level permissions (11 modules)
- ✅ Location and brand access controls
- ✅ Database migration for user_permissions table
- ✅ RLS policies for secure access control
- ✅ Permission configuration UI in Users page
- ✅ Auto-assign permissions on user creation
- ✅ Permission checking utilities

### v1.11.0 (2026-03-20) - Settings & Users Management ✅

**Completed:**
- ✅ Settings page for system configuration
- ✅ Users page for user management
- ✅ Role-based access control
- ✅ Full translation support for new pages

### v1.1.1 (2026-03-19) - Complete Translation System ✅

**Completed:**
- ✅ **Sidebar Translation**: All navigation items now translate (menu items, tooltips, buttons)
  - Added "alerts" key for consistent sidebar labeling ("Alerts" → "Alertas")
- ✅ **Page Title Translation**: All module page titles translate (alerts, sales, profitability, etc.)
- ✅ **DashboardLayout Translation**: Wrapper component now uses translation keys
- ✅ **Full Language Support**: Switch between English/Spanish, everything translates
  - Sidebar: "Dashboard" → "Panel de Control", "Alerts" → "Alertas"
  - Alerts: "Alerts Management" → "Gestión de Alertas"
  - Sales: "Sales Analytics" → "Análisis de Ventas"
  - And all other modules!
- ✅ **Consistent Translation Rules**: Entire dashboard follows same translation pattern
- ✅ **Alerts Module Complete Translation**:
  - KPI card titles and tooltips
  - Section headers (Alerts by Type, Active Alerts by Severity)
  - Table headers (Severity, Type, Title, Location, Status, Created)
  - Filter labels (All Severities, All Types, All Locations, All Statuses)
  - Status badges (Active/Resolved)
  - Empty state messages
  - **Card content translations** (alert types, severity levels inside cards)
  - **Table cell translations** (severity badges, alert type labels)
  - **Filter dropdown options** (alert types translated)
- ✅ **50+ New Translation Keys**: Added comprehensive translation support for alerts module
  - Alert types: Cash → Caja, Profitability → Rentabilidad, Supervision → Supervisión, Merchandise → Mercadería, Sales → Ventas
  - Severities: Critical → Crítica, High → Alta, Medium → Media, Low → Baja
- ✅ **Helper Functions**: Added `getSeverityLabel()`, `getAlertTypeLabel()` for consistent translations
- ✅ **ALL text in alerts module now follows translation rules**

### v1.1.0 (2026-03-19) - Alerts Module & Sidebar Navigation ✅

**Completed:**
- ✅ **Alerts Module**: Centralized alert management dashboard
  - Alert breakdown by type and severity
  - Advanced filtering system
  - Alert history with detailed information
  - Color-coded severity badges and status indicators
- ✅ **Sidebar Navigation**: Professional corporate navigation system
  - Applied to all 10 modules
  - Collapsible sidebar with active page highlighting
  - Mobile-friendly with hamburger menu
  - Clean, modern design
- ✅ **Improved UX**: Consistent navigation across all modules
- ✅ **Better mobile support**: Responsive design improvements

### v1.0.1 (2026-03-19) - Data Accuracy & Translation Fixes ✅

**Completed:**
- ✅ **Objective Card Bonus Calculation**: Shows actual % > 100% for bonus celebration
- ✅ **Real KPI Data**: All Executive Summary KPIs calculated from database
  - Net Sales, Food Cost %, Profitability from real data
  - Cash Differences from cash_closings table
  - Active Alerts count from alerts table
  - Centralized Payments from payments table
- ✅ **Sales Trend Chart Fix**: Uses selected date range (not hardcoded 30 days)
- ✅ **Complete Translation System**:
  - Alert content translations (supervision, stock, payments, cash, etc.)
  - Alert severity badges (Low → Baja, High → Alta, etc.)
  - Quick Stats cards (Locations Active, Brands Operating, etc.)
  - Objective Card (progress, daily avg, bonus celebration, time periods)
  - Smart keyword-based translation for dynamic content
- ✅ **UI/UX Polish**: Number formatting (1 decimal for Food Cost %), cleaner Quick Stats

### v1.0.0 (2026-03-18) - Products Module ✅

**Completed:**
- ✅ Products analytics dashboard with 4 KPIs
- ✅ Product rankings (Best-selling, Least-selling, Highest billing, Highest volume)
- ✅ Rank badges (🥇1st, 🥈2nd, 🥉3rd)
- ✅ Product metrics (Sales, Revenue, Quantity, Average Price)
- ✅ Product alerts from stock shortages
- ✅ Parses products_summary JSON from sales data
- ✅ Date range filtering and full translations

### v0.9.0 (2026-03-18) - Locations Module ✅

**Completed:**
- ✅ Locations list view with network overview
- ✅ Individual location detail pages
- ✅ Location ranking by sales (1st, 2nd, 3rd badges)
- ✅ Health status indicators (🟢 Healthy, 🟡 Attention, 🔴 Critical)
- ✅ Location cards with key metrics
- ✅ Network KPIs (Total Locations, Network Sales, Active Alerts)
- ✅ Sales trend chart (last 30 days) per location
- ✅ Recent alerts display per location

### v0.8.0 (2026-03-18) - Cash & Closing Module ✅

**Completed:**
- ✅ Cash control dashboard with 8 KPIs
- ✅ Cash closings detail table with status badges
- ✅ Status badges (✅ Closed Correctly, ⚠️ With Difference, ⏳ Under Review)
- ✅ Cash difference tracking by payment method
- ✅ Color-coded difference indicators (green/+/red/-)
- ✅ Location-level cash difference summary

### v0.7.0 (2026-03-18) - Profitability Module ✅

**Completed:**
- ✅ Financial analysis dashboard with 8 KPIs
- ✅ Profitability by Location with traffic lights
- ✅ Profitability by Brand with traffic lights
- ✅ Sales vs Purchases vs Payments comparison
- ✅ Food Cost %, Gross Margin, Petty Cash tracking
- ✅ Multi-source data aggregation (Sales, Purchases, Payments, Cash Closings)
- ✅ Traffic light system (🟢 Good, 🟡 Attention, 🔴 Problem)

### v0.6.0 (2026-03-18) - Sales Analytics Module ✅

**Completed:**
- ✅ Sales Analytics page with transaction table
- ✅ KPI cards (Total Sales, Orders, Average Ticket, Transaction Rate)
- ✅ Channel breakdown pie chart
- ✅ Payment method breakdown bar chart
- ✅ Advanced dimension filters (location, brand, channel, payment method)
- ✅ Export to Excel with professional formatting
- ✅ Summary sheet with KPIs in Excel export
- ✅ Full translations (English/Spanish)
- ✅ Date range filtering

### v0.5.0 (2026-03-17) - Objective Card & Polish ✅

**Completed:**
- ✅ Professional monthly sales objective card
- ✅ Monthly target: ₲30,000,000 (₲1M/day)
- ✅ Smart extrapolation based on date range
- ✅ Progress bar with color coding
- ✅ Daily average indicator
- ✅ Target achievement tracking

### v0.4.0 (2026-03-17) - Executive Summary Complete ✅

**Completed:**
- ✅ Executive Summary module with 8 KPIs
- ✅ Sales trend chart (last 30 days)
- ✅ Location and brand rankings
- ✅ Active alerts panel
- ✅ Date range filter (Today, 7d, 30d, 90d, All Time, Custom)
- ✅ Language toggle (English/Spanish)
- ✅ Tooltips on all KPIs
- ✅ Traffic light system for quick assessment

### v0.2.0 (2026-03-17) - Database & Supabase Configured ✅

**Completed:**
- ✅ Supabase project created
- ✅ 18 SQL migrations created and applied
- ✅ Database schema designed
- ✅ Comprehensive seed data (8 locations, 120+ sales, 40+ closings, 24 alerts)
- ✅ RLS policies configured

### v0.1.0 (2026-03-17) - Project Foundation ✅

**Completed:**
- ✅ Next.js 15 project initialized
- ✅ TypeScript configured
- ✅ Tailwind CSS v4 set up
- ✅ shadcn/ui configured
- ✅ Core dependencies installed

---

**Current Progress:** 12 of 12 modules complete (100%) ✅

---

## 🎉 PROJECT COMPLETE

### All Modules Implemented ✅

The Grupo Omniprise Dashboard is now **100% complete** with all 14 modules fully functional and deployed to production:

**Completed Modules:**
- ✅ Executive Summary (with sidebar navigation)
- ✅ Sales Analytics (with Excel export)
- ✅ Profitability (multi-source aggregation)
- ✅ Cash & Closing (status badges & tracking)
- ✅ Locations (list & detail pages)
- ✅ Products (rankings & analytics)
- ✅ Brands (brand performance analytics)
- ✅ Alerts (centralized alert management)
- ✅ Purchases & Merchandise (procurement control)
- ✅ Payments (centralized payments module)
- ✅ Operational Supervision (100% complete)
- ✅ Settings (system configuration)
- ✅ Users (user management & permissions)
- ✅ Login/Signup (authentication)

### Module Status
- **Progress:** 14 of 14 modules complete (100%)
- **Deployment:** ✅ Production live at https://dashboard.omniprise.com.py
- **User Permissions:** ✅ 4-tier role system implemented
- **Authentication:** ✅ Supabase Auth integrated
- **Translations:** ✅ English/Spanish complete

**Completed Modules:**
- ✅ Executive Summary (with sidebar navigation)
- ✅ Sales Analytics (with Excel export)
- ✅ Profitability (multi-source aggregation)
- ✅ Cash & Closing (status badges & tracking)
- ✅ Locations (list & detail pages)
- ✅ Products (rankings & analytics)
- ✅ Alerts (centralized alert management)
- ✅ Brands (brand performance analytics & profitability)
- ✅ Purchases & Merchandise (procurement control)
- ✅ Payments (centralized payments module)
- ✅ Operational Supervision (100% complete)
- ✅ Configuration (system settings)

---

## 📚 Documentation

### Core Documentation
- **README.md** - This file, project overview and quick start
- **CHANGELOG.md** - Detailed version history and release notes
- **VERCEL_DEPLOYMENT.md** - Vercel deployment guide and maintenance
- **CPANEL_DEPLOYMENT.md** - Alternative cPanel deployment options
- **GITLAB_WORKFLOW.md** - GitLab collaboration and workflow guide
- **TROUBLESHOOTING.md** - Diagnostic and troubleshooting guide

### Technical Documentation
- **DATA_MODEL.md** - Database schema and relationships
- **DESIGN_SYSTEM.md** - UI/UX design principles
- **TECHNICAL_ARCHITECTURE.md** - System architecture overview
- **PROJECT_PLAN.md** - Development roadmap
- **SUPABASE_SETUP.md** - Supabase configuration guide
- **OPERATIONAL_SUPERVISION_COMPREHENSIVE.md** - Supervision module details

### Quick Links
- 🌐 **Live Dashboard:** https://dashboard.omniprise.com.py
- 🚀 **Vercel Deployment:** See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- 🔄 **GitLab Workflow:** See [GITLAB_WORKFLOW.md](GITLAB_WORKFLOW.md)
- 🔧 **Troubleshooting:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- 📊 **Database Schema:** See [DATA_MODEL.md](DATA_MODEL.md)

---

## 🚀 QUICK START

```bash
# Navigate to project
cd /home/bruno-rivas/corporate-food-dashboard

# Install dependencies (if not done)
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Access Points

**Production:**
- **🌐 Live Dashboard:** https://dashboard.omniprise.com.py
- **🔐 Login:** https://dashboard.omniprise.com.py/login
- **📊 Dashboard:** https://dashboard.omniprise.com.py/dashboard

**Development:**
- **🏠 Home:** http://localhost:3000/
- **🔐 Login:** http://localhost:3000/login
- **📊 Dashboard:** http://localhost:3000/dashboard (requires auth)
- **🔍 Debug:** http://localhost:3000/debug

### Environment Variables

Already configured in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://nzpjfdfnmutbzvxijhic.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (configured)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (configured)
```

### Build Commands

```bash
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 👥 TEAM & CONTACT

**Company:** Grupo Omniprise
**Product Design:** Senior Product Designer + UX/UI Designer
**Frontend Architecture:** Senior Frontend Architect
**Domain:** Corporate Dashboards for Food Chains in Expansion

**Links:**
- **Live Dashboard:** https://dashboard.omniprise.com.py
- **GitLab Repository:** https://gitlab.com/sbrv-group/omniprise
- **Vercel Dashboard:** https://vercel.com/brs-projects-c425e547/corporate-food-dashboard

---

## 📄 LICENSE

Proprietary and Confidential.

© 2026 Grupo Omniprise. All rights reserved.
