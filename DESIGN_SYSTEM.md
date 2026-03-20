# 🎨 Design System

**Grupo Omniprise - Corporate Food Service Dashboard**

---

## 📋 TABLE OF CONTENTS

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Visual States](#visual-states)
7. [Icons](#icons)
8. [Responsive Design](#responsive-design)

---

## 🎯 DESIGN PRINCIPLES

### Core Values
```
Modern → Not old-school corporate
Clean  → Not cluttered or heavy
Premium → Not cheap or basic
Clear  → Not confusing or ambiguous
Fast   → Under 30 seconds to understand
```

### Visual Hierarchy
```
1. KPI Cards (Top metrics - first thing seen)
2. Alerts (Critical issues - immediate attention)
3. Rankings (Relative performance)
4. Details (Drill-down data)
```

---

## 🎨 COLOR SYSTEM

### Primary Colors

```css
/* Brand Colors */
--color-primary: {
  50:  #f0f9ff;
  100: #e0f2fe;
  200: #bae6fd;
  300: #7dd3fc;
  400: #38bdf8;
  500: #0ea5e9;  /* Primary brand color */
  600: #0284c7;
  700: #0369a1;
  800: #075985;
  900: #0c4a6e;
}

/* Accent: Success/Good */
--color-success: {
  50:  #f0fdf4;
  100: #dcfce7;
  200: #bbf7d0;
  300: #86efac;
  400: #4ade80;
  500: #22c55e;  /* Green - Good */
  600: #16a34a;
  700: #15803d;
  800: #166534;
  900: #14532d;
}

/* Accent: Warning/Attention */
--color-warning: {
  50:  #fefce8;
  100: #fef9c3;
  200: #fef08a;
  300: #fde047;
  400: #facc15;
  500: #eab308;  /* Yellow - Attention */
  600: #ca8a04;
  700: #a16207;
  800: #854d0e;
  900: #713f12;
}

/* Accent: Error/Problem */
--color-error: {
  50:  #fef2f2;
  100: #fee2e2;
  200: #fecaca;
  300: #fca5a5;
  400: #f87171;
  500: #ef4444;  /* Red - Problem */
  600: #dc2626;
  700: #b91c1c;
  800: #991b1b;
  900: #7f1d1d;
}

/* Accent: Info */
--color-info: {
  50:  #eff6ff;
  100: #dbeafe;
  200: #bfdbfe;
  300: #93c5fd;
  400: #60a5fa;
  500: #3b82f6;  /* Blue - Info */
  600: #2563eb;
  700: #1d4ed8;
  800: #1e40af;
  900: #1e3a8a;
}
```

### Semantic Colors (Traffic Lights)

```css
/* 🟢 GOOD - Positive indicators */
--color-good: #22c55e;      /* Green 500 */
--color-good-bg: #dcfce7;   /* Green 100 */
--color-good-text: #15803d; /* Green 700 */

/* 🟡 ATTENTION - Needs review */
--color-attention: #eab308;     /* Yellow 500 */
--color-attention-bg: #fef9c3;  /* Yellow 100 */
--color-attention-text: #a16207; /* Yellow 700 */

/* 🔴 PROBLEM - Critical issues */
--color-problem: #ef4444;      /* Red 500 */
--color-problem-bg: #fee2e2;   /* Red 100 */
--color-problem-text: #b91c1c; /* Red 700 */
```

### Neutral Colors (Backgrounds, Text, Borders)

```css
--color-white: #ffffff;
--color-slate: {
  50:  #f8fafc;   /* Lightest bg */
  100: #f1f5f9;   /* Light bg */
  200: #e2e8f0;   /* Border */
  300: #cbd5e1;   /* Border hover */
  400: #94a3b8;   /* Text muted */
  500: #64748b;   /* Text secondary */
  600: #475569;   /* Text */
  700: #334155;   /* Text primary */
  800: #1e293b;   /* Dark bg */
  900: #0f172a;   /* Darkest bg */
  950: #020617;   /* Almost black */
}
```

### Functional Colors

```css
/* Links */
--color-link: #0ea5e9;
--color-link-hover: #0284c7;

/* Focus rings */
--color-focus-ring: rgba(14, 165, 233, 0.4);

/* Overlays */
--color-overlay: rgba(15, 23, 42, 0.8);
--color-backdrop: rgba(255, 255, 255, 0.8);

/* Disabled */
--color-disabled-bg: #f1f5f9;
--color-disabled-text: #94a3b8;
--color-disabled-border: #e2e8f0;
```

---

## ✍️ TYPOGRAPHY

### Font Families

```css
/* Primary font (Inter) */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace font (JetBrains Mono) - for numbers, codes */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

```css
/* Text sizes */
--text-xs:   0.75rem;    /* 12px */
--text-sm:   0.875rem;   /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg:   1.125rem;   /* 18px */
--text-xl:   1.25rem;    /* 20px */
--text-2xl:  1.5rem;     /* 24px */
--text-3xl:  1.875rem;   /* 30px */
--text-4xl:  2.25rem;    /* 36px */
--text-5xl:  3rem;       /* 48px */
```

### Font Weights

```css
--font-light:   300;
--font-normal:  400;
--font-medium:  500;
--font-semibold: 600;
--font-bold:    700;
```

### Line Heights

```css
--leading-tight:   1.25;
--leading-normal:  1.5;
--leading-relaxed: 1.75;
```

### Typography Usage

| Element | Size | Weight | Line Height | Color |
|---------|------|--------|-------------|-------|
| H1 (Page Title) | 2rem | 700 | 1.25 | slate-900 |
| H2 (Section Title) | 1.5rem | 600 | 1.25 | slate-800 |
| H3 (Card Title) | 1.125rem | 600 | 1.25 | slate-700 |
| Body (Default) | 0.875rem | 400 | 1.5 | slate-600 |
| Small (Caption) | 0.75rem | 400 | 1.5 | slate-500 |
| KPI Value | 1.875rem | 700 | 1 | slate-900 (mono) |
| KPI Label | 0.75rem | 500 | 1.25 | slate-500 |

---

## 📏 SPACING & LAYOUT

### Spacing Scale

```css
--spacing-0:   0;
--spacing-1:   0.25rem;  /* 4px */
--spacing-2:   0.5rem;   /* 8px */
--spacing-3:   0.75rem;  /* 12px */
--spacing-4:   1rem;     /* 16px */
--spacing-5:   1.25rem;  /* 20px */
--spacing-6:   1.5rem;   /* 24px */
--spacing-8:   2rem;     /* 32px */
--spacing-10:  2.5rem;   /* 40px */
--spacing-12:  3rem;     /* 48px */
--spacing-16:  4rem;     /* 64px */
--spacing-20:  5rem;     /* 80px */
```

### Container Widths

```css
--container-sm:  640px;   /* Small container */
--container-md:  768px;   /* Medium container */
--container-lg:  1024px;  /* Large container */
--container-xl:  1280px;  /* Extra large */
--container-2xl: 1536px;  /* Full width */
```

### Layout Grid

```css
/* Responsive grid */
.grid {
  display: grid;
  gap: var(--spacing-4);
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

### Card Spacing

```css
.card {
  padding: var(--spacing-6);      /* 24px internal padding */
  border-radius: 0.75rem;         /* 12px rounded corners */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-header {
  margin-bottom: var(--spacing-4);  /* 16px below header */
}
```

---

## 🧩 COMPONENTS

### Cards

```typescript
// Card component structure
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

### KPI Cards (With Tooltip)

```typescript
// KPICard component
interface KPICardProps {
  title: string
  value: number
  format: 'currency' | 'number' | 'percent'
  tooltip: string              // Required! Explains what this means
  trend?: number               // Percentage change
  status?: 'good' | 'attention' | 'problem'
}

// Visual hierarchy
┌─────────────────────────┐
│ Title          [?]      │  ← Title + Tooltip icon
│                         │
│ ₲ 12,345,678           │  ← Large value (mono font)
│                        │
│ ↑ 12.5% vs last month   │  ← Trend indicator (green/red)
└─────────────────────────┘
```

### Status Badges

```typescript
// Badge component
<Badge variant="good">Closed Correctly</Badge>
<Badge variant="attention">Pending Review</Badge>
<Badge variant="problem">Cash Difference</Badge>

// Colors
- good:      green bg + green text
- attention: yellow bg + yellow text
- problem:   red bg + red text
- info:      blue bg + blue text
```

### Data Tables

```typescript
// Table component with:
// - Sortable columns
// - Filterable
// - Searchable
// - Exportable
<DataTable
  columns={columns}
  data={data}
  sortable
  filterable
  searchable
  exportable
/>

// Visual style
┌─────────────────────────────────────────┐
│ Location    Sales    Status    Actions │
├─────────────────────────────────────────┤
│ Location A  ₲1.2M   🟢 Active  [⋯]     │
│ Location B  ₲800K   🟡 Review  [⋯]     │
│ Location C  ₲500K   🔴 Issue   [⋯]     │
└─────────────────────────────────────────┘
```

### Tooltips

```typescript
// Tooltip on EVERY KPI and technical term
<Tooltip content="This is the explanation...">
  <InfoIcon className="w-4 h-4" />
</Tooltip>

// Tooltip positioning
- Follows cursor on desktop
- Shows below on mobile
- Max width: 250px
- Delay: 500ms
```

---

## 🎭 VISUAL STATES

### Good (Positive) State

```css
/* 🟢 Green theme */
.badge-good {
  background: var(--color-good-bg);
  color: var(--color-good-text);
  border: 1px solid var(--color-good);
}

.trend-up {
  color: var(--color-good);
}

/* Usage: Good performance, no issues, within target */
```

### Attention (Warning) State

```css
/* 🟡 Yellow theme */
.badge-attention {
  background: var(--color-attention-bg);
  color: var(--color-attention-text);
  border: 1px solid var(--color-attention);
}

.trend-neutral {
  color: var(--color-attention);
}

/* Usage: Needs review, pending, caution */
```

### Problem (Critical) State

```css
/* 🔴 Red theme */
.badge-problem {
  background: var(--color-problem-bg);
  color: var(--color-problem-text);
  border: 1px solid var(--color-problem);
}

.trend-down {
  color: var(--color-problem);
}

/* Usage: Critical issue, cash difference, below target */
```

### Loading State

```typescript
// Skeleton loaders
<Card>
  <Skeleton className="h-4 w-24" />      {/* Title */}
  <Skeleton className="h-8 w-32 mt-2" />  {/* Value */}
</Card>

// Spinner for actions
<Spinner className="h-4 w-4 animate-spin" />
```

### Empty State

```typescript
<EmptyState
  icon={PackageIcon}
  title="No purchases found"
  description="There are no purchases for the selected filters."
  action={
    <Button>Clear filters</Button>
  }
/>
```

### Error State

```typescript
<ErrorState
  title="Failed to load data"
  message="Please try again or contact support if the issue persists."
  action={
    <Button onClick={retry}>Try again</Button>
  }
/>
```

---

## 🎯 ICONS

### Icon Set (Lucide React)

```typescript
// Navigation icons
- Home
- BarChart3
- DollarSign
- CreditCard
- ShoppingCart
- Package
- Users
- Settings
- AlertTriangle
- Bell

// Status icons
- CheckCircle (good)
- AlertCircle (attention)
- XCircle (problem)
- Info (info)

// Action icons
- Eye (view)
- Pencil (edit)
- Trash (delete)
- Download (export)
- Filter
- Search
- RefreshCw
- MoreVertical (menu)

// Trend icons
- TrendingUp (positive)
- TrendingDown (negative)
- Minus (neutral)
```

### Icon Usage Guidelines

```css
/* Size */
.icon-xs:  0.75rem;  /* 12px */
.icon-sm:  1rem;     /* 16px */
.icon-md:  1.25rem;  /* 20px */
.icon-lg:  1.5rem;   /* 24px */
.icon-xl:  2rem;     /* 32px */

/* Colors */
.icon-default: slate-400
.icon-hover:   slate-600
.icon-active:  primary-500
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm:  640px;   /* Small tablets */
--breakpoint-md:  768px;   /* Tablets */
--breakpoint-lg:  1024px;  /* Laptops */
--breakpoint-xl:  1280px;  /* Desktops */
--breakpoint-2xl: 1536px;  /* Large screens */
```

### Responsive Layouts

```typescript
// Grid: 1 column → 2 columns → 4 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Sidebar: Hidden on mobile, fixed on desktop
<Sidebar className="hidden md:flex" />

// Filters: Horizontal on desktop, accordion on mobile
<Filters className="flex-row md:flex-row flex-col" />

// Tables: Card view on mobile, table on desktop
{isMobile ? <CardView data={data} /> : <TableView data={data} />}
```

### Mobile Navigation

```typescript
// Bottom sheet for mobile filters
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Filters</Button>
  </SheetTrigger>
  <SheetContent side="bottom">
    <FilterPanel />
  </SheetContent>
</Sheet>
```

---

## 🎨 SPECIFIC USE CASES

### Dashboard Grid

```css
/* KPI Cards Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

### Charts

```css
/* Chart colors */
--chart-colors: {
  blue:   #0ea5e9,
  green:  #22c55e,
  yellow: #eab308,
  red:    #ef4444,
  purple: #a855f7,
  orange: #f97316,
  pink:   #ec4899,
  cyan:   #06b6d4,
}

/* Chart tooltip */
.chart-tooltip {
  background: rgba(15, 23, 42, 0.95);
  color: white;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Sidebar Navigation

```css
/* Fixed left sidebar */
.sidebar {
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  border-right: 1px solid var(--color-slate-200);
  background: white;
  overflow-y: auto;
}

/* Sidebar nav item */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: var(--color-slate-600);
  transition: all 150ms;
}

.nav-item:hover {
  background: var(--color-slate-100);
  color: var(--color-slate-900);
}

.nav-item.active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}
```

---

## ✅ DESIGN CHECKLIST

### Before Implementing
- [ ] Does this look modern and premium?
- [ ] Is the visual hierarchy clear?
- [ ] Are all KPIs explained with tooltips?
- [ ] Is the status clear (green/yellow/red)?
- [ ] Does it work on mobile?
- [ ] Is there an empty state?
- [ ] Is there a loading state?
- [ ] Is there an error state?
- [ ] Are the colors accessible?
- [ ] Is the contrast sufficient?

---

**Last Updated:** 2026-03-17
**Status:** ✅ Design System Defined
