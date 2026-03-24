# Supervision Module - Gap Analysis

## Overview
The Supervision Module has a solid foundation with database schema, seed data, and RLS policies. However, several critical components are missing for it to be **complete, polished, and functional**.

---

## ✅ What Exists (Implemented)

### Database
- ✅ **14 tables** with complete schema (Migration 19)
- ✅ **Seed data** for categories, items, supervisors, templates (Migration 20)
- ✅ **RLS policies** for all tables (Migration 21)
- ✅ **Alerts integration** utility

### Frontend Pages (8 pages)
- ✅ Main Dashboard (`/dashboard/supervision`)
- ✅ Schedule Page (`/dashboard/supervision/schedule`)
- ✅ Supervisors Page (`/dashboard/supervision/supervisors`)
- ✅ Locations Page (`/dashboard/supervision/locations`)
- ✅ Location Detail Page (`/dashboard/supervision/locations/[id]`)
- ✅ New Visit Form (`/dashboard/supervision/new-visit`)
- ✅ Findings Page (`/dashboard/supervision/findings`)
- ✅ Actions Page (`/dashboard/supervision/actions`)

### Components (7 components)
- ✅ ScoreCard
- ✅ VisitStatusBadge
- ✅ VisitTypeBadge
- ✅ FindingCard
- ✅ ActionCard
- ✅ ChecklistItem
- ✅ ProgressStepper
- ✅ PhotoUploader (basic)

### Utilities
- ✅ Supervision alerts integration

---

## ❌ What's Missing (Critical Gaps)

### 1. **AUTO-SCHEDULING SYSTEM** 🔴 CRITICAL
**Issue:** Schedule page imports `generateSchedule` and `previewNextMonthSchedule` from `@/lib/utils/auto-schedule` which **doesn't exist**

**Needed:**
```typescript
// /src/lib/utils/auto-schedule.ts
- generateSchedule() - Auto-generate monthly visit schedules
- previewNextMonthSchedule() - Preview upcoming schedules
- optimizeSupervisorRoutes() - Geographic optimization
- checkVisitCompliance() - Verify compliance with visit frequency rules
- suggestReschedule() - Suggest alternative dates for missed visits
```

**Impact:** Schedule page is broken, no auto-scheduling functionality

---

### 2. **API ROUTES** 🔴 CRITICAL
**Only 1 API route exists:** `/api/supervision/run-alert-checks`

**Missing API Routes:**

#### Visits API
- `POST /api/supervision/visits` - Create new visit
- `PUT /api/supervision/visits/[id]` - Update visit
- `GET /api/supervision/visits/[id]` - Get visit details
- `GET /api/supervision/visits` - List visits with filters

#### Schedule API
- `POST /api/supervision/schedule` - Create scheduled visit
- `PUT /api/supervision/schedule/[id]` - Update schedule
- `DELETE /api/supervision/schedule/[id]` - Cancel schedule
- `GET /api/supervision/schedule/calendar` - Get calendar data
- `POST /api/supervision/schedule/auto-generate` - Generate monthly schedule

#### Findings & Actions API
- `POST /api/supervision/findings` - Create operational finding
- `PUT /api/supervision/findings/[id]` - Update finding
- `POST /api/supervision/actions` - Create corrective action
- `PUT /api/supervision/actions/[id]` - Update action status
- `PUT /api/supervision/actions/[id]/complete` - Mark action complete
- `PUT /api/supervision/actions/[id]/verify` - Verify completed action

#### Supervisors API
- `GET /api/supervision/supervisors` - List supervisors
- `POST /api/supervision/supervisors` - Add supervisor
- `PUT /api/supervision/supervisors/[id]` - Update supervisor
- `GET /api/supervision/supervisors/[id]/metrics` - Get supervisor metrics

#### Metrics API
- `GET /api/supervision/metrics/location/[id]` - Get location supervision metrics
- `GET /api/supervision/metrics/summary` - Network-wide supervision metrics
- `POST /api/supervision/metrics/calculate` - Recalculate metrics

**Impact:** All data operations are client-side, no server-side validation or business logic

---

### 3. **SCORE CALCULATION LOGIC** 🔴 CRITICAL
**Issue:** 6-category scoring system not implemented

**Missing:**
```typescript
// /src/lib/utils/supervision-scoring.ts
- calculateVisitScores() - Calculate all 6 category scores
- calculateOverallScore() - Calculate weighted total score
- determineClassification() - Determine: Excellent | Good | Fair | Poor
- validateScores() - Score validation logic
```

**6-Category Scoring System:**
1. Liderazgo (Leadership) - 15% weight
2. Orden (Order) - 20% weight
3. Caja (Cash Management) - 25% weight
4. Stock (Inventory) - 20% weight
5. Limpieza (Cleanliness) - 10% weight
6. Equipos (Equipment) - 10% weight

**Impact:** Visit scoring is incomplete, no classification logic

---

### 4. **DATABASE QUERY FUNCTIONS** 🟡 HIGH
**Issue:** No centralized query functions for supervision

**Missing:**
```typescript
// /src/lib/db/queries/supervision-queries.ts
- getUpcomingVisits() - Get scheduled visits
- getRecentVisits() - Get completed visits
- getVisitDetails() - Full visit with checklist results
- getOverdueVisits() - Visits past scheduled date
- getOpenFindings() - Findings without completed actions
- getOverdueActions() - Actions past deadline
- getRecurringFindings() - Issues that keep occurring
- getSupervisorPerformance() - Supervisor metrics
- getLocationSupervisionMetrics() - Location supervision KPIs
- getNetworkSupervisionSummary() - Network-wide metrics
```

**Impact:** Inefficient queries, duplicated code across pages

---

### 5. **METRICS CALCULATION SYSTEM** 🟡 HIGH
**Issue:** Metrics tables exist but no calculation logic

**Missing:**
```typescript
// /src/lib/utils/supervision-metrics.ts
- calculateSupervisorMetrics() - Calculate supervisor_daily_metrics
- calculateLocationMetrics() - Calculate location_supervision_metrics
- calculateScoreTrends() - Calculate score changes over time
- calculateComplianceMetrics() - Visit compliance rates
- calculateFindingMetrics() - Finding statistics
- calculateActionMetrics() - Corrective action tracking
- identifyRecurringIssues() - Detect patterns across visits
- assessLocationRisk() - Risk assessment algorithm
```

**Missing Database Triggers/Functions:**
- Trigger on visit completion to update metrics
- Scheduled job to recalculate metrics
- Automatic risk score updates

**Impact:** No performance tracking, no trend analysis

---

### 6. **PHOTO UPLOAD & STORAGE** 🟡 HIGH
**Issue:** PhotoUploader component exists but no Supabase storage integration

**Missing:**
- Supabase storage bucket configuration
- Upload API endpoint
- Photo compression/resizing
- Before/after photo pairing
- Thumbnail generation
- Photo metadata tagging
- Storage cleanup for old photos

**Impact:** No photo evidence for findings and actions

---

### 7. **SUPERVISOR MANAGEMENT** 🟡 HIGH
**Issue:** Supervisors page exists but incomplete

**Missing:**
- Add/Edit supervisor form
- Supervisor location assignment
- Supervisor performance dashboard
- Supervisor ranking/leaderboard
- Supervisor schedule view
- Supervisor capacity planning

**Impact:** Can't manage supervisors effectively

---

### 8. **5-STEP VISIT WORKFLOW** 🟡 MEDIUM
**Issue:** New visit form may have bugs in 5-step process

**Steps:**
1. ✅ Observation (Step 1)
2. ✅ Operations (Step 2) - Leadership & Order categories
3. ✅ Cash (Step 3) - Cash Management category
4. ✅ Product (Step 4) - Stock category
5. ✅ Equipment (Step 5) - Cleanliness & Equipment categories
6. ❓ Review & Submit - May need verification

**Potential Issues:**
- Step completion tracking
- Data persistence between steps
- Validation at each step
- Final score calculation on submit

---

### 9. **CORRECTIVE ACTION WORKFLOW** 🟡 MEDIUM
**Issue:** Action tracking incomplete

**Missing:**
- Action status workflow (pending → in_progress → completed → verified)
- Action assignment to responsible parties
- Deadline reminders
- Action verification with before/after photos
- Action follow-up scheduling
- Action escalation for overdue items
- Bulk action updates

**Impact:** Can't track corrective actions to completion

---

### 10. **CALENDAR VIEW** 🟢 MEDIUM
**Issue:** Schedule page has list view but calendar view incomplete

**Missing:**
- Full calendar component with month/week/day views
- Drag-and-drop scheduling
- Conflict detection (same location, same time)
- Color-coded by visit type/status
- Calendar export (iCal format)

**Impact:** Hard to visualize schedule

---

### 11. **EXPORT & REPORTING** 🟢 MEDIUM
**Missing:**
- Visit report PDF generation
- Action items export to Excel
- Supervisor performance reports
- Location supervision reports
- Network-wide supervision summary
- Score trend charts export
- Photo evidence compilation

**Impact:** No reporting capability

---

### 12. **NOTIFICATIONS & ALERTS** 🟢 MEDIUM
**Issue:** Alert creation exists but delivery missing

**Missing:**
- Email notifications for overdue visits
- Email notifications for overdue actions
- Supervisor daily schedule email
- Manager notification for critical findings
- Dashboard notification center
- Push notifications for mobile
- Alert escalation rules

**Impact:** No proactive communication

---

### 13. **LOCATION SUPERVISION DETAIL** 🟢 LOW
**Issue:** Location detail page needs enhancement

**Missing:**
- Location supervision history timeline
- Score trend chart
- Visit compliance tracking
- Finding history
- Action history
- Manager performance tracking
- Comparison with similar locations

**Impact:** Limited location insights

---

### 14. **TRANSLATIONS** 🟢 LOW
**Missing:** Supervision-specific translation keys

**Need to add to `/src/lib/translations.ts`:**
```typescript
supervision: {
  // Module
  operationalSupervision: { en: "Operational Supervision", es: "Supervisión Operativa" }

  // Visit types
  visitaRapida: { en: "Rapid Visit", es: "Visita Rápida" }
  auditoriaCompleta: { en: "Full Audit", es: "Auditoría Completa" }
  visitaSorpresa: { en: "Surprise Visit", es: "Visita Sorpresa" }

  // Categories
  liderazgo: { en: "Leadership", es: "Liderazgo" }
  orden: { en: "Order", es: "Orden" }
  caja: { en: "Cash Management", es: "Gestión de Caja" }
  stock: { en: "Inventory", es: "Inventario" }
  limpieza: { en: "Cleanliness", es: "Limpieza" }
  equipos: { en: "Equipment", es: "Equipos" }

  // Classifications
  excelente: { en: "Excellent", es: "Excelente" }
  bueno: { en: "Good", es: "Bueno" }
  regular: { en: "Fair", es: "Regular" }
  deficiente: { en: "Poor", es: "Deficiente" }

  // Statuses
  pendiente: { en: "Pending", es: "Pendiente" }
  enProgreso: { en: "In Progress", es: "En Progreso" }
  completado: { en: "Completed", es: "Completado" }
  verificado: { en: "Verified", es: "Verificado" }
  atrasado: { en: "Overdue", es: "Atrasado" }

  // And many more...
}
```

---

### 15. **MOBILE OPTIMIZATION** 🟢 LOW
**Missing:**
- Mobile-optimized checklist
- Offline mode for visits
- Mobile photo capture
- GPS location verification
- Touch-friendly UI elements
- Responsive tables/cards

**Impact:** Poor mobile experience for supervisors

---

### 16. **RECURRENCE DETECTION** 🟢 LOW
**Issue:** Database supports recurrence but detection logic missing

**Missing:**
```typescript
- detectRecurringFindings() - Find issues that repeat
- trackRecurrencePatterns() - Pattern analysis
- updateRecurrenceCount() - Update recurrence tracking
- alertOnRecurrence() - Alert on 3rd occurrence
```

**Impact:** Can't identify systemic issues

---

## Priority Work Plan

### Phase 1: Critical (Get it Working)
1. ✅ Create auto-scheduling utility
2. ✅ Implement score calculation logic
3. ✅ Create core API routes (visits, schedule, findings, actions)
4. ✅ Fix 5-step visit workflow

### Phase 2: High (Make it Useful)
5. ✅ Implement metrics calculation system
6. ✅ Create database query functions
7. ✅ Add photo upload & storage
8. ✅ Complete supervisor management

### Phase 3: Medium (Polish & Enhance)
9. ✅ Build calendar view
10. ✅ Implement action workflow
11. ✅ Add export & reporting
12. ✅ Implement notifications

### Phase 4: Low (Nice to Have)
13. ✅ Complete translations
14. ✅ Enhance location detail page
15. ✅ Add recurrence detection
16. ✅ Mobile optimization

---

## Estimated Effort

| Priority | Tasks | Est. Time |
|----------|-------|-----------|
| 🔴 Critical | 4 | 16-20 hours |
| 🟡 High | 4 | 16-20 hours |
| 🟢 Medium | 4 | 12-16 hours |
| 🟢 Low | 4 | 8-12 hours |
| **Total** | **16** | **52-68 hours** |

---

## Key Files to Create

1. `/src/lib/utils/auto-schedule.ts` - Auto-scheduling logic
2. `/src/lib/utils/supervision-scoring.ts` - Score calculation
3. `/src/lib/utils/supervision-metrics.ts` - Metrics calculation
4. `/src/lib/db/queries/supervision-queries.ts` - Centralized queries
5. `/src/app/api/supervision/visits/route.ts` - Visits API
6. `/src/app/api/supervision/schedule/route.ts` - Schedule API
7. `/src/app/api/supervision/findings/route.ts` - Findings API
8. `/src/app/api/supervision/actions/route.ts` - Actions API
9. `/src/app/api/supervision/upload-photo/route.ts` - Photo upload
10. `/src/app/api/supervision/metrics/route.ts` - Metrics API

---

## Next Steps

Would you like me to:
1. Start with Phase 1 (Critical) - Auto-scheduling, scoring, APIs
2. Start with Phase 2 (High) - Metrics, queries, photos
3. Focus on a specific area you choose
4. Create detailed task list for all items
