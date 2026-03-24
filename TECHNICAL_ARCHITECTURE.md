# 🏗️ Technical Architecture

**Grupo Omniprise - Corporate Food Service Dashboard**

---

## 📋 TABLE OF CONTENTS

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Architecture Patterns](#architecture-patterns)
4. [Security Architecture](#security-architecture)
5. [State Management](#state-management)
6. [API Design](#api-design)
7. [Performance Strategy](#performance-strategy)
8. [Deployment Strategy](#deployment-strategy)

---

## 🛠️ TECHNOLOGY STACK

### Frontend
```typescript
{
  "framework": "Next.js 15 (App Router)",
  "language": "TypeScript 5.8+",
  "styling": "Tailwind CSS 4.0",
  "components": "shadcn/ui + Radix UI",
  "state": "Zustand + React Query (TanStack Query)",
  "charts": "Recharts",
  "forms": "React Hook Form + Zod",
  "i18n": "next-intl",
  "icons": "Lucide React",
  "date": "date-fns"
}
```

### Backend
```typescript
{
  "runtime": "Node.js (Edge where possible)",
  "api": "Next.js Route Handlers",
  "database": "Supabase (PostgreSQL 16)",
  "auth": "Supabase Auth + RLS",
  "storage": "Supabase Storage (for receipts, images)",
  "realtime": "Supabase Realtime (for live updates)",
  "functions": "Supabase Edge Functions (for heavy tasks)"
}
```

### DevOps
```typescript
{
  "hosting": "Vercel (Edge Network)",
  "ci/cd": "GitHub Actions",
  "monitoring": "Vercel Analytics + Sentry",
  "logs": "Vercel Logs + Datadog (optional)",
  "secrets": "Vercel Environment Variables"
}
```

---

## 📁 PROJECT STRUCTURE

```
corporate-food-dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Dashboard route group (with sidebar)
│   │   │   ├── executive-summary/    # Module 1
│   │   │   ├── sales/                # Module 2
│   │   │   ├── profitability/        # Module 3
│   │   │   ├── locations/            # Module 4
│   │   │   ├── brands/               # Module 5
│   │   │   ├── products/             # Module 6
│   │   │   ├── cash/                 # Module 7
│   │   │   ├── purchases/            # Module 8
│   │   │   ├── payments/             # Module 9
│   │   │   ├── supervision/          # Module 10
│   │   │   ├── alerts/               # Module 11
│   │   │   ├── config/               # Module 12
│   │   │   └── layout.tsx            # Dashboard layout (Sidebar + Header)
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   ├── sales/
│   │   │   ├── cash/
│   │   │   ├── alerts/
│   │   │   └── trpc/                 # tRPC (optional, for type-safe APIs)
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home/redirect
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── sidebar.tsx           # Persistent left sidebar
│   │   │   ├── header.tsx            # Top header (user, notifications, etc.)
│   │   │   ├── global-filters.tsx    # Global filter bar
│   │   │   └── mobile-nav.tsx        # Mobile navigation
│   │   │
│   │   ├── shared/                   # Shared components across modules
│   │   │   ├── kpi-card/             # Reusable KPI card with tooltip
│   │   │   ├── data-table/           # Sortable, filterable table
│   │   │   ├── date-range-picker/    # Custom date range picker
│   │   │   ├── status-badge/         # Status badges (green/yellow/red)
│   │   │   ├── ranking-list/         # Ranking display component
│   │   │   ├── alert-item/           # Alert display component
│   │   │   ├── export-button/        # Export functionality
│   │   │   └── loading-state/        # Loading skeletons
│   │   │
│   │   └── modules/                  # Module-specific components
│   │       ├── executive-summary/    # Executive summary components
│   │       ├── sales/                # Sales module components
│   │       ├── cash/                 # Cash closing components
│   │       └── ...                   # Other modules
│   │
│   ├── lib/
│   │   ├── db/                       # Database layer
│   │   │   ├── queries/              # Database queries (organized by entity)
│   │   │   │   ├── sales.ts
│   │   │   │   ├── cash-closings.ts
│   │   │   │   ├── locations.ts
│   │   │   │   ├── alerts.ts
│   │   │   │   └── ...
│   │   │   ├── supabase/             # Supabase client setup
│   │   │   │   ├── client.ts         # Browser client
│   │   │   │   ├── server.ts         # Server client
│   │   │   │   └── admin.ts          # Admin client (service role)
│   │   │   └── types.ts              # DB type exports
│   │   │
│   │   ├── validations/              # Zod validation schemas
│   │   │   ├── sales.ts
│   │   │   ├── cash-closings.ts
│   │   │   ├── alerts.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── format.ts             # Currency, numbers, dates
│   │   │   ├── calculations.ts       # Business calculations
│   │   │   ├── dates.ts              # Date helpers
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/                # Application constants
│   │   │   ├── sales-channels.ts
│   │   │   ├── payment-methods.ts
│   │   │   ├── alert-types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── hooks/                    # Custom hooks (if needed)
│   │       ├── use-alerts.ts
│   │       └── use-filters.ts
│   │
│   ├── hooks/                        # React hooks
│   │   ├── use-global-filters.ts     # Global filter state
│   │   ├── use-current-user.ts       # Current user hook
│   │   ├── use-permissions.ts        # Permission checking
│   │   ├── use-alerts.ts             # Real-time alerts
│   │   ├── use-breakpoint.ts         # Responsive breakpoints
│   │   └── use-tooltip.ts            # Tooltip management
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── global-filters.ts         # Global filter state
│   │   ├── user-session.ts           # User session state
│   │   ├── alerts.ts                 # Alerts state
│   │   └── index.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── database.ts               # Database types (generated)
│   │   ├── models.ts                 # Application models
│   │   ├── api.ts                    # API request/response types
│   │   └── index.ts
│   │
│   ├── config/                       # Configuration files
│   │   ├── site.ts                   # Site config
│   │   ├── navigation.ts             # Navigation config
│   │   ├── modules.ts                # Module definitions
│   │   ├── permissions.ts            # Permission matrix
│   │   └── alerts.ts                 # Alert rules/thresholds
│   │
│   ├── styles/                       # Global styles
│   │   └── globals.css               # Global CSS with Tailwind
│   │
│   └── middleware.ts                 # Next.js middleware (auth, i18n)
│
├── public/                           # Static assets
│   ├── icons/                        # Custom icons
│   ├── images/                       # Brand images, logos
│   └── locales/                      # Translation files (if needed)
│
├── supabase/                         # Supabase specific files
│   ├── migrations/                   # Database migrations
│   ├── functions/                    # Edge functions
│   └── seed.sql                      # Seed data
│
├── .env.local.example                # Environment variables template
├── .env.local                        # Local environment (gitignored)
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── components.json                   # shadcn/ui config
└── package.json                      # Dependencies
```

---

## 🏛️ ARCHITECTURE PATTERNS

### 1. **Layered Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Pages, Components, Hooks - Pure UI, no business logic)     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (Custom hooks, Services, Business logic, Validations)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer                        │
│  (Supabase queries, API routes, Type-safe queries)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  (PostgreSQL, RLS policies, Materialized views)              │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Component Architecture**

```typescript
// Pattern: Presentational + Container Components

// 1. Presentational Component (Pure UI, receives props)
export function KPICard({ title, value, format, tooltip, trend }: KPICardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Tooltip content={tooltip} />
      </CardHeader>
      <CardContent>
        <FormattedValue value={value} format={format} />
        {trend && <TrendIndicator value={trend} />}
      </CardContent>
    </Card>
  )
}

// 2. Container Component (Fetches data, handles state)
export function DashboardKPICards() {
  const { data, isLoading, error } = useDashboardStats()

  if (isLoading) return <KPICardsSkeleton />
  if (error) return <ErrorState error={error} />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard title="Net Sales" value={data?.netSales} format="currency" tooltip="..." />
      <KPICard title="Orders" value={data?.orders} format="number" tooltip="..." />
      {/* ... more cards */}
    </div>
  )
}
```

### 3. **Module Pattern**

```typescript
// Each module is self-contained with:
// - Components (UI)
// - Hooks (State)
// - Queries (Data)
// - Types (Types)

// Example: sales module
src/
├── modules/
│   └── sales/
│       ├── components/
│       │   ├── sales-table.tsx
│       │   ├── sales-chart.tsx
│       │   └── sales-filters.tsx
│       ├── hooks/
│       │   └── use-sales-data.ts
│       ├── types/
│       │   └── sales.types.ts
│       └── index.ts
```

---

## 🔒 SECURITY ARCHITECTURE

### Authentication & Authorization

```typescript
// 1. Authentication (Supabase Auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 2. Authorization (Role-Based Access Control)
type UserRole = 'admin' | 'cfo' | 'manager' | 'supervisor' | 'viewer'

interface UserPermissions {
  canViewAllLocations: boolean
  canViewAllBrands: boolean
  canViewCashDifferences: boolean
  canViewProfitability: boolean
  canApprovePayments: boolean
  canDismissAlerts: boolean
  // ... more permissions
}

// 3. Permission Matrix (config/permissions.ts)
export const PERMISSION_MATRIX: Record<UserRole, UserPermissions> = {
  admin: {
    canViewAllLocations: true,
    canViewAllBrands: true,
    canViewCashDifferences: true,
    canViewProfitability: true,
    canApprovePayments: true,
    canDismissAlerts: true,
    // ...
  },
  manager: {
    canViewAllLocations: false,  // Only assigned location
    canViewAllBrands: false,
    canViewCashDifferences: true,
    canViewProfitability: true,
    canApprovePayments: false,
    canDismissAlerts: false,
    // ...
  },
  // ...
}
```

### Row Level Security (RLS)

```sql
-- Users can only see data based on their role and location

-- Admins see everything
CREATE POLICY "Admins can see all data"
ON sales FOR SELECT
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Managers see only their location
CREATE POLICY "Managers see their location"
ON sales FOR SELECT
USING (
  location_id = (SELECT location_id FROM users WHERE id = auth.uid())
);

-- Supervisors see locations they supervise
CREATE POLICY "Supervisors see supervised locations"
ON sales FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM supervisor_assignments
    WHERE supervisor_id = auth.uid()
  )
);
```

### API Security

```typescript
// 1. Input validation (Zod schemas)
import { saleFilterSchema } from '@/lib/validations/sales'

export async function GET(req: NextRequest) {
  // Validate query parameters
  const result = saleFilterSchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid filters', details: result.error }, { status: 400 })
  }

  // Proceed with validated data
  const filters = result.data
  // ...
}

// 2. Rate limiting (Vercel Edge Config)
export const config = {
  runtime: 'edge',
  regions: ['iad1'],  // US East
}

// 3. CSRF protection (Next.js middleware)
export async function middleware(request: NextRequest) {
  // Verify CSRF token for state-changing operations
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token')
    // Validate token...
  }
}
```

### Audit Logging

```typescript
// Log all critical actions
import { AuditLog } from '@/lib/db/queries/audit-logs'

await AuditLog.create({
  userId: user.id,
  action: 'cash_closing_reviewed',
  entityType: 'cash_closing',
  entityId: closingId,
  metadata: {
    locationId: closing.location_id,
    date: closing.date,
    previousStatus: closing.status,
    newStatus: 'approved',
  },
  ipAddress: req.headers.get('x-forwarded-for'),
  userAgent: req.headers.get('user-agent'),
})
```

---

## 💾 STATE MANAGEMENT

### Global State (Zustand)

```typescript
// stores/global-filters.ts
interface GlobalFiltersState {
  // Filters
  dateRange: { from: Date; to: Date }
  countries: string[]
  cities: string[]
  locations: string[]
  brands: string[]
  channels: string[]
  paymentMethods: string[]

  // Actions
  setDateRange: (range: { from: Date; to: Date }) => void
  setLocation: (locationId: string) => void
  resetFilters: () => void

  // Computed
  hasActiveFilters: boolean
}

export const useGlobalFilters = create<GlobalFiltersState>((set, get) => ({
  dateRange: { from: startOfMonth(new Date()), to: new Date() },
  countries: [],
  cities: [],
  locations: [],
  brands: [],
  channels: [],
  paymentMethods: [],

  setDateRange: (range) => set({ dateRange: range }),
  setLocation: (locationId) => set({ locations: [locationId] }),
  resetFilters: () => set({
    countries: [],
    cities: [],
    locations: [],
    brands: [],
    channels: [],
    paymentMethods: [],
  }),

  hasActiveFilters: () => {
    const s = get()
    return s.countries.length > 0
      || s.cities.length > 0
      || s.locations.length > 0
      || s.brands.length > 0
  },
}))
```

### Server State (React Query)

```typescript
// hooks/use-dashboard-stats.ts
export function useDashboardStats() {
  const filters = useGlobalFilters()

  return useQuery({
    queryKey: ['dashboard-stats', filters],
    queryFn: () => fetchDashboardStats(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Automatic refetching on filter change
// Optimistic updates
// Background refetching
```

---

## 🌐 API DESIGN

### RESTful API Routes

```typescript
// Standard API pattern
app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── refresh/route.ts
├── sales/
│   ├── route.ts              # GET /api/sales (list)
│   ├── [id]/route.ts         # GET /api/sales/:id (detail)
│   └── summary/route.ts      # GET /api/sales/summary
├── cash-closings/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── [id]/approve/route.ts
├── alerts/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── [id]/dismiss/route.ts
└── exports/
    └── sales/route.ts        # POST /api/exports/sales
```

### API Response Format

```typescript
// Success response
{
  success: true,
  data: { /* actual data */ },
  meta: {
    page: 1,
    perPage: 20,
    total: 150,
    hasMore: true
  }
}

// Error response
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid date range',
    details: { /* validation errors */ }
  }
}
```

---

## ⚡ PERFORMANCE STRATEGY

### 1. **Data Fetching**

```typescript
// Parallel queries with React Query
function useDashboardData() {
  return useQueries({
    queries: [
      { queryKey: ['stats'], queryFn: fetchStats },
      { queryKey: ['sales'], queryFn: fetchSales },
      { queryKey: ['locations'], queryFn: fetchLocations },
      { queryKey: ['alerts'], queryFn: fetchAlerts },
    ]
  })
}

// Materialized views for expensive queries
SELECT * FROM mv_location_daily_metrics
WHERE date >= '2026-01-01' AND date <= '2026-01-31'

-- Instead of:
SELECT s.date, s.location_id, ...
FROM sales s
LEFT JOIN cash_closings cc ON ...
LEFT JOIN supervision_visits sv ON ...
GROUP BY s.date, s.location_id
```

### 2. **Rendering**

```typescript
// Virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual'

// Code splitting per module
const SalesModule = dynamic(() => import('@/modules/sales'))
const CashModule = dynamic(() => import('@/modules/cash'))

// Lazy loading images
<Image src={logo} loading="lazy" />
```

### 3. **Caching**

```typescript
// React Query cache
staleTime: 5 * 60 * 1000,     // Fresh for 5 min
cacheTime: 10 * 60 * 1000,    // Keep in cache for 10 min

// HTTP caching headers
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
```

---

## 🚀 DEPLOYMENT STRATEGY

### Environment Variables

```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Server-side only

NEXT_PUBLIC_APP_URL=https://dashboard.example.com
NEXT_PUBLIC_APP_NAME=Corporate Dashboard

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## 📊 MONITORING & LOGGING

### Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return event
  },
})
```

### Analytics

```typescript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 🎯 DEVELOPMENT WORKFLOW

1. **Feature Development**
   - Create feature branch from `main`
   - Implement feature with tests
   - Create PR for review
   - Merge to `main` after approval

2. **Testing**
   - Unit tests with Vitest
   - Integration tests with Playwright
   - E2E tests for critical flows

3. **Code Quality**
   - ESLint + Prettier
   - TypeScript strict mode
   - Husky pre-commit hooks

---

## 📝 CHECKLIST

### Before Starting Development
- [ ] Set up Supabase project
- [ ] Run database migrations
- [ ] Configure environment variables
- [ ] Set up shadcn/ui
- [ ] Configure Tailwind CSS

### Before Production
- [ ] Enable RLS on all tables
- [ ] Set up audit logging
- [ ] Configure rate limiting
- [ ] Set up error monitoring
- [ ] Test all critical flows
- [ ] Load test with sample data

---

**Last Updated:** 2026-03-24
**Status:** ✅ Architecture Defined & Phase 1 Complete
