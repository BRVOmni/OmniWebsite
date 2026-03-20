# 📋 COMPREHENSIVE OPERATIONAL SUPERVISION ANALYSIS

**Corporate Food Service Dashboard - Phase 12**

---

## 🎯 SYSTEM OVERVIEW

You have a **highly sophisticated, well-structured operational supervision system** with:

- ✅ **Documented procedures** (OPRC-PR-001)
- ✅ **2 supervisors** with defined routes
- ✅ **17 real locations** with assigned coverage
- ✅ **Visit frequency standards** (2x/week + 1x/month audit + 1x/month surprise)
- ✅ **10-minute rapid visit process** (5 structured steps)
- ✅ **6-category checklist** (21 items)
- ✅ **Scoring system** with classifications
- ✅ **Corrective action tracking**
- ✅ **Performance analytics** (13 Excel sheets)

---

## 📊 CURRENT SYSTEM STRUCTURE

### Team Structure

**Supervisors:**
1. **Rogger Bogado** - Assigned route with specific locations
2. **Sebastian Weil** - Assigned route with specific locations

**Coverage:** 17 locations across different cities

### Visit Frequency Standards

| Visit Type | Frequency | Purpose |
|------------|-----------|---------|
| **Visita Operativa Rápida** | 2x/week per location | Quick operational check |
| **Auditoría Completa** | 1x/month per location | Full comprehensive audit |
| **Visita Sorpresa** | 1x/month per location | Unannounced inspection |

**Total Visits per Location per Month:**
- Rapid visits: 8 visits (2x/week × 4 weeks)
- Full audit: 1 visit
- Surprise visit: 1 visit
- **Total: 10 visits per location per month**

**Total Network Visits per Month:**
- 17 locations × 10 visits = **170 visits per month**
- Divided by 2 supervisors = **85 visits per supervisor per month**
- ~**20 visits per supervisor per week**

### 10-Minute Rapid Visit Process

**Step 1: Silent Observation (2 min)**
- Observe customer flow
- Check store order
- Monitor staff activity

**Step 2: Operations Check (3 min)**
- Verify staffing levels (appropriate for traffic)
- Check manager leadership
- Assess customer service

**Step 3: Cash Control (2 min)**
- Review cash count
- Check petty cash/fund
- Verify differences

**Step 4: Product Control (2 min)**
- Check critical stock
- Verify expiration dates
- Assess storage organization

**Step 5: Equipment & Maintenance (1 min)**
- Check refrigeration equipment
- Verify freezers
- Test key equipment

### 5 Key Questions Every Visit Must Answer

1. ¿La operación está funcionando correctamente? (Is operations working correctly?)
2. ¿El dinero está controlado? (Is money controlled?)
3. ¿El producto está bien gestionado? (Is product well managed?)
4. ¿La experiencia del cliente es adecuada? (Is customer experience adequate?)
5. ¿El Encargado tiene control del equipo? (Does the manager have control of the team?)

### Operational Alerts (Critical Findings)

- **Diferencias de caja sin justificar** (Unjustified cash differences)
- **Productos vencidos o en mal estado** (Expired or spoiled products)
- **Equipos críticos fuera de servicio** (Critical equipment out of service)
- **Falta de limpieza en cocina, baños o salón** (Lack of cleanliness in kitchen, bathrooms, or dining area)
- **Encargado ausente o sin control del turno** (Manager absent or not in control of shift)

---

## 🗺️ SUPERVISOR ROUTES ANALYSIS

### Route Structure

**Geographic Distribution:**
- Locations across multiple cities
- Grouped by efficiency/travel time
- No priority by city (all locations have equal priority)

**Route Planning:**
- Each supervisor has a defined set of locations
- Routes optimized for travel efficiency
- Mix of visit types (rapid, audit, surprise)

### Current Coverage Model

**Strengths:**
✅ Clear ownership (each location has assigned supervisor)
✅ Defined frequency standards
✅ Structured visit process
✅ Geographic optimization
✅ Mix of visit types for comprehensive coverage

**Opportunities for Enhancement:**
📊 **Visibility:** Real-time view of visit compliance
📊 **Scheduling:** Automated scheduling based on last visit date
📊 **Route Optimization:** Dynamic routing based on traffic, priorities
📊 **Coverage Gaps:** Automated alerts when location is overdue
📊 **Performance:** Supervisor productivity metrics
📊 **Integration:** Connect visit findings with sales, cash differences, and alerts

---

## 💾 PROPOSED DATABASE SCHEMA (ENHANCED)

Based on your complete system, here's the enhanced database schema:

### Core Tables (Revised)

```sql
-- 1. Supervisors (existing structure, add fields)
CREATE TABLE supervisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  active BOOLEAN DEFAULT true,
  hired_at DATE,

  -- Route coverage
  base_city VARCHAR(100),
  max_visits_per_day INTEGER DEFAULT 10,
  max_visits_per_week INTEGER DEFAULT 50,

  -- Performance metrics
  avg_visit_duration_minutes DECIMAL(5,2),
  visits_completed_last_30_days INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Location Supervision Configuration (add to existing locations table)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS
  primary_supervisor_id UUID REFERENCES supervisors(id);

ALTER TABLE locations ADD COLUMN IF NOT EXISTS
  backup_supervisor_id UUID REFERENCES supervisors(id);

ALTER TABLE locations ADD COLUMN IF NOT EXISTS
  supervision_priority VARCHAR(20) DEFAULT 'regular'; -- high, regular, low

ALTER TABLE locations ADD COLUMN IF NOT EXISTS
  required_rapid_visits_per_week INTEGER DEFAULT 2;

ALTER TABLE locations ADD COLUMN IF NOT EXISTS
  required_full_audit_per_month INTEGER DEFAULT 1;

ALTER TABLE locations ADD COLUMN IF NOT EXISTS
  required_surprise_visits_per_month INTEGER DEFAULT 1;

-- 3. Visit Schedule (enhanced)
CREATE TABLE supervision_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES supervisors(id) ON DELETE SET NULL,

  -- Scheduling details
  planned_date DATE NOT NULL,
  planned_shift VARCHAR(20), -- mañana, tarde, noche
  visit_type VARCHAR(30) NOT NULL, -- rapida, completa, sorpresa
  visit_subtype VARCHAR(30), -- based on your procedure

  -- Estimated duration
  estimated_duration_minutes INTEGER DEFAULT 10,

  -- Priority
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, missed, cancelled

  -- Completion tracking
  completed_visit_id UUID,
  missed_reason TEXT,

  -- Auto-scheduling
  is_auto_scheduled BOOLEAN DEFAULT false,
  schedule_rule_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT schedule_unique UNIQUE (location_id, planned_date, visit_type)
);

CREATE INDEX idx_schedule_date ON supervision_schedule(planned_date);
CREATE INDEX idx_schedule_supervisor ON supervision_schedule(supervisor_id, planned_date);
CREATE INDEX idx_schedule_location ON supervision_schedule(location_id, planned_date);
CREATE INDEX idx_schedule_status ON supervision_schedule(status);
CREATE INDEX idx_schedule_overdue ON supervision_schedule(planned_date, status) WHERE status = 'pending';

-- 4. Supervision Visits (enhanced)
CREATE TABLE supervision_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_visit_id UUID REFERENCES supervision_schedule(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES supervisors(id) ON DELETE SET NULL,

  -- Manager info
  manager_name VARCHAR(100),
  manager_present BOOLEAN,
  manager_in_control BOOLEAN,

  -- Visit details
  visit_date DATE NOT NULL,
  visit_shift VARCHAR(20), -- mañana, tarde, noche
  visit_type VARCHAR(30) NOT NULL, -- rapida, completa, sorpresa

  -- Time tracking
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- 5-step process completion
  step1_observation_completed BOOLEAN DEFAULT false,
  step2_operations_completed BOOLEAN DEFAULT false,
  step3_cash_completed BOOLEAN DEFAULT false,
  step4_product_completed BOOLEAN DEFAULT false,
  step5_equipment_completed BOOLEAN DEFAULT false,

  -- Overall scores (your 6 categories)
  score_liderazgo DECIMAL(5,2), -- Leadership
  score_orden DECIMAL(5,2), -- Order
  score_caja DECIMAL(5,2), -- Cash
  score_stock DECIMAL(5,2), -- Stock
  score_limpieza DECIMAL(5,2), -- Cleanliness
  score_equipos DECIMAL(5,2), -- Equipment
  score_total DECIMAL(5,2),
  score_operacion DECIMAL(5,2), -- liderazgo + orden

  -- Classification
  classification VARCHAR(20), -- excelente, bueno, regular, critico

  -- 5 key questions responses
  operations_functioning BOOLEAN,
  money_controlled BOOLEAN,
  product_managed BOOLEAN,
  customer_experience_adequate BOOLEAN,
  manager_team_control BOOLEAN,

  -- General observations
  observations_general TEXT,

  -- Weather/conditions
  weather_conditions VARCHAR(50),
  ambient_conditions TEXT,

  -- Visit completion
  visit_completed BOOLEAN DEFAULT true,
  completion_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT visit_date_location_unique UNIQUE (visit_date, location_id)
);

CREATE INDEX idx_supervision_visits_date ON supervision_visits(visit_date DESC);
CREATE INDEX idx_supervision_visits_location ON supervision_visits(location_id);
CREATE INDEX idx_supervision_visits_supervisor ON supervision_visits(supervisor_id);
CREATE INDEX idx_supervision_visits_type ON supervision_visits(visit_type);
CREATE INDEX idx_supervision_visits_classification ON supervision_visits(classification);

-- 5. Checklist Categories (your 6 categories)
CREATE TABLE checklist_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_es VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Checklist Items (your 21 items)
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES checklist_categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  name_es VARCHAR(200) NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_critical BOOLEAN DEFAULT false, -- Flag critical items
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Visit Checklist Results (10-minute process steps)
CREATE TABLE visit_checklist_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES supervision_visits(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,

  -- Compliance
  compliant BOOLEAN NOT NULL,

  -- Details
  notes TEXT,
  severity VARCHAR(20), -- low, medium, high, critical
  requires_action BOOLEAN DEFAULT false,

  -- Photo evidence
  photo_count INTEGER DEFAULT 0,

  -- Time tracking
  time_spent_seconds INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT visit_item_unique UNIQUE (visit_id, checklist_item_id)
);

-- 8. Operational Findings (your 5 alert types)
CREATE TABLE operational_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES supervision_visits(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE SET NULL,

  -- Finding details
  category VARCHAR(50), -- liderazgo, orden, caja, stock, limpieza, equipos, personal
  severity VARCHAR(20), -- low, medium, high, critical
  title VARCHAR(200) NOT NULL,
  description TEXT,

  -- Your 5 operational alerts types
  finding_type VARCHAR(50), -- caja_diferencias, stock_vencidos, equipos_falla, limpieza_deficiente, personal_ausente

  -- Photo evidence
  requires_photo BOOLEAN DEFAULT false,
  photo_url TEXT,
  additional_photos TEXT[], -- Array of photo URLs

  -- Recurrence tracking
  is_recurring BOOLEAN DEFAULT false,
  recurrence_count INTEGER DEFAULT 0,
  previous_occurrence_dates DATE[],

  -- Corrective action link
  corrective_action_required BOOLEAN DEFAULT true,
  immediate_action_taken TEXT,

  -- 5 key questions impact
  affects_operations BOOLEAN DEFAULT false,
  affects_money BOOLEAN DEFAULT false,
  affects_product BOOLEAN DEFAULT false,
  affects_customer_experience BOOLEAN DEFAULT false,
  affects_manager_control BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operational_findings_visit ON operational_findings(visit_id);
CREATE INDEX idx_operational_findings_severity ON operational_findings(severity);
CREATE INDEX idx_operational_findings_type ON operational_findings(finding_type);
CREATE INDEX idx_operational_findings_category ON operational_findings(category);
CREATE INDEX idx_operational_findings_recurring ON operational_findings(is_recurring);

-- 9. Corrective Actions (enhanced)
CREATE TABLE corrective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID REFERENCES operational_findings(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES supervision_visits(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,

  -- Action details
  description TEXT NOT NULL,
  immediate_action TEXT,
  long_term_solution TEXT,

  -- Responsibility
  responsible_person VARCHAR(100),
  responsible_role VARCHAR(50), -- encargado, supervisor, gerente, mantenimiento, limpieza, etc.

  -- Priority
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical

  -- Deadline tracking
  committed_date DATE,
  estimated_completion_hours DECIMAL(5,2),
  actual_completion_date DATE,

  -- Status workflow
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, overdue, cancelled, verified

  -- Verification (before/after photos)
  before_photo_url TEXT,
  after_photo_url TEXT,
  verified_by VARCHAR(100),
  verification_date DATE,
  verification_notes TEXT,

  -- Overdue tracking
  is_overdue BOOLEAN DEFAULT false,
  days_overdue INTEGER DEFAULT 0,
  overdue_reason TEXT,

  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_corrective_actions_visit ON corrective_actions(visit_id);
CREATE INDEX idx_corrective_actions_location ON corrective_actions(location_id);
CREATE INDEX idx_corrective_actions_status ON corrective_actions(status);
CREATE INDEX idx_corrective_actions_overdue ON corrective_actions(is_overdue);
CREATE INDEX idx_corrective_actions_deadline ON corrective_actions(committed_date);
CREATE INDEX idx_corrective_actions_responsible ON corrective_actions(responsible_role);

-- 10. Visit Photos (for documentation)
CREATE TABLE visit_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES supervision_visits(id) ON DELETE CASCADE,
  finding_id UUID REFERENCES operational_findings(id) ON DELETE SET NULL,
  action_id UUID REFERENCES corrective_actions(id) ON DELETE SET NULL,

  -- Photo details
  photo_type VARCHAR(30), -- finding, before, after, general, evidence
  description TEXT,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Metadata
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by VARCHAR(100),

  -- Tags
  category VARCHAR(50),
  severity VARCHAR(20),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visit_photos_visit ON visit_photos(visit_id);
CREATE INDEX idx_visit_photos_finding ON visit_photos(finding_id);
CREATE INDEX idx_visit_photos_action ON visit_photos(action_id);
CREATE INDEX idx_visit_photos_type ON visit_photos(photo_type);

-- 11. Supervisor Performance Metrics (enhanced)
CREATE TABLE supervisor_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id UUID REFERENCES supervisors(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,

  -- Visit completion metrics
  visits_scheduled INTEGER DEFAULT 0,
  visits_completed INTEGER DEFAULT 0,
  visits_missed INTEGER DEFAULT 0,
  visit_completion_rate DECIMAL(5,2),
  visits_completed_on_time INTEGER DEFAULT 0,
  on_time_completion_rate DECIMAL(5,2),

  -- Duration metrics
  avg_duration_minutes DECIMAL(8,2),
  avg_duration_rapida DECIMAL(8,2),
  avg_duration_completa DECIMAL(8,2),
  avg_duration_sorpresa DECIMAL(8,2),

  -- Quality metrics
  avg_location_score DECIMAL(5,2),
  avg_score_by_category JSONB, -- {liderazgo: 85, orden: 90, ...}

  -- Finding metrics
  total_findings INTEGER DEFAULT 0,
  findings_per_visit DECIMAL(5,2),
  critical_findings INTEGER DEFAULT 0,
  high_findings INTEGER DEFAULT 0,

  -- 5 key questions metrics
  operations_functioning_rate DECIMAL(5,2),
  money_controlled_rate DECIMAL(5,2),
  product_managed_rate DECIMAL(5,2),
  customer_experience_adequate_rate DECIMAL(5,2),
  manager_team_control_rate DECIMAL(5,2),

  -- Corrective action metrics
  actions_identified INTEGER DEFAULT 0,
  actions_completed INTEGER DEFAULT 0,
  actions_completed_on_time INTEGER DEFAULT 0,
  actions_overdue INTEGER DEFAULT 0,
  action_completion_rate DECIMAL(5,2),

  -- Efficiency metrics
  locations_covered INTEGER DEFAULT 0,
  visits_per_day DECIMAL(5,2),
  travel_time_hours DECIMAL(8,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT supervisor_metric_date UNIQUE (supervisor_id, metric_date)
);

CREATE INDEX idx_supervisor_metrics_date ON supervisor_metrics(metric_date DESC);
CREATE INDEX idx_supervisor_metrics_supervisor ON supervisor_metrics(supervisor_id);

-- 12. Location Supervision Metrics (enhanced)
CREATE TABLE location_supervision_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,

  -- Score metrics
  avg_score_total DECIMAL(5,2),
  avg_score_operacion DECIMAL(5,2), -- liderazgo + orden
  avg_score_caja DECIMAL(5,2),
  avg_score_stock DECIMAL(5,2),
  avg_score_limpieza DECIMAL(5,2),
  avg_score_equipos DECIMAL(5,2),

  -- Score trends
  score_trend VARCHAR(20), -- improving, stable, declining
  score_change_30_days DECIMAL(5,2),

  -- Visit compliance metrics
  last_visit_date DATE,
  days_since_last_visit INTEGER,
  days_since_last_rapida INTEGER,
  days_since_last_completa INTEGER,
  days_since_last_sorpresa INTEGER,

  visits_this_month INTEGER DEFAULT 0,
  rapid_visits_this_month INTEGER DEFAULT 0,
  full_audits_this_month INTEGER DEFAULT 0,
  surprise_visits_this_month INTEGER DEFAULT 0,

  -- Visit compliance vs standards
  rapid_visit_compliance_rate DECIMAL(5,2), -- actual / expected (8/month)
  full_audit_compliance_rate DECIMAL(5,2), -- actual / expected (1/month)
  surprise_visit_compliance_rate DECIMAL(5,2), -- actual / expected (1/month)

  -- Issue metrics
  open_findings INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  high_findings INTEGER DEFAULT 0,
  recurring_findings INTEGER DEFAULT 0,
  total_findings INTEGER DEFAULT 0,

  -- 5 key questions metrics
  operations_functioning_rate DECIMAL(5,2),
  money_controlled_rate DECIMAL(5,2),
  product_managed_rate DECIMAL(5,2),
  customer_experience_adequate_rate DECIMAL(5,2),
  manager_team_control_rate DECIMAL(5,2),

  -- Corrective action metrics
  open_actions INTEGER DEFAULT 0,
  overdue_actions INTEGER DEFAULT 0,
  critical_actions INTEGER DEFAULT 0,
  completed_this_month INTEGER DEFAULT 0,
  action_completion_rate DECIMAL(5,2),

  -- Risk assessment
  risk_level VARCHAR(20), -- low, medium, high, critical
  risk_score DECIMAL(5,2),
  risk_factors JSONB, -- {overdue_visits: true, critical_findings: 3, ...}
  classification VARCHAR(20), -- excelente, bueno, regular, critico

  -- Manager performance
  manager_present_rate DECIMAL(5,2),
  manager_in_control_rate DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT location_metric_date UNIQUE (location_id, metric_date)
);

CREATE INDEX idx_location_supervision_metrics_date ON location_supervision_metrics(metric_date DESC);
CREATE INDEX idx_location_supervision_metrics_location ON location_supervision_metrics(location_id);
CREATE INDEX idx_location_supervision_metrics_risk ON location_supervision_metrics(risk_level);
CREATE INDEX idx_location_supervision_metrics_classification ON location_supervision_metrics(classification);

-- 13. Auto-Scheduling Rules
CREATE TABLE scheduling_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- frequency, overdue, risk_based

  -- Rule parameters
  visit_type VARCHAR(30), -- rapida, completa, sorpresa
  target_frequency INTEGER, -- per week/month
  frequency_period VARCHAR(20), -- week, month

  -- Trigger conditions
  trigger_condition JSONB, -- {days_since_last_visit: > X, score: < Y, ...}

  -- Priority
  priority INTEGER DEFAULT 0,

  -- Active status
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Visit Templates (for different visit types)
CREATE TABLE visit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_es VARCHAR(100) NOT NULL,
  description TEXT,

  -- Template configuration
  visit_type VARCHAR(30) NOT NULL, -- rapida, completa, sorpresa
  estimated_duration_minutes INTEGER DEFAULT 10,

  -- 5-step process configuration
  include_observation BOOLEAN DEFAULT true,
  include_operations BOOLEAN DEFAULT true,
  include_cash BOOLEAN DEFAULT true,
  include_product BOOLEAN DEFAULT true,
  include_equipment BOOLEAN DEFAULT true,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE visit_template_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES visit_templates(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
  required BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT template_item_unique UNIQUE (template_id, checklist_item_id)
);
```

---

## 📊 DASHBOARD MODULE DESIGN

### Main Pages Structure

**1. Supervision Dashboard (`/dashboard/supervision`)**
- **KPI Cards (8 cards):**
  - Scheduled visits this month
  - Completed visits this month
  - Overdue visits
  - Visit completion rate
  - Critical findings requiring attention
  - Open corrective actions
  - Overdue corrective actions
  - Average network score

- **Charts & Visualizations:**
  - Visit completion trend (last 30 days)
  - Score distribution by category
  - Findings by type and severity
  - Supervisor performance comparison
  - Risk level distribution
  - Visit type distribution

**2. Visit Schedule (`/dashboard/supervision/schedule`)**
- **Calendar View:**
  - Monthly calendar with scheduled visits
  - Color-coded by visit type (rapida, completa, sorpresa)
  - Filter by supervisor, location, visit type
  - Drag-and-drop rescheduling
  - Add new scheduled visits

- **List View:**
  - Upcoming visits
  - Overdue visits (highlighted)
  - Visit history
  - Filter options

- **Auto-Scheduling:**
  - "Generate next month's schedule" button
  - Based on your frequency rules
  - Respects supervisor capacity
  - Optimizes routes

**3. Locations Supervision (`/dashboard/supervision/locations`)**
- **Location Cards:**
  - Location name and city
  - Last visit date
  - Days since last visit
  - Current score with classification
  - Open findings count
  - Overdue actions count
  - Risk level indicator
  - Compliance rate vs standards

- **Filters:**
  - By city
  - By brand
  - By risk level
  - By classification
  - By overdue status

- **Actions:**
  - Click to location detail
  - Schedule new visit
  - View visit history

**4. Location Supervision Detail (`/dashboard/supervision/locations/[id]`)**
- **Location Overview:**
  - Location info (name, city, brand, address)
  - Assigned supervisors
  - Visit compliance metrics
  - Score history chart

- **Score Trends:**
  - Total score over time (last 90 days)
  - Category breakdown trends
  - Comparison with network average

- **Visit History:**
  - List of all visits
  - Filter by date, type, supervisor
  - Click to visit details

- **Findings & Issues:**
  - Active findings
  - Recurring issues
  - Trend analysis

- **Corrective Actions:**
  - Open actions
  - Overdue actions
  - Completion timeline

- **Visit Calendar:**
  - Past and future visits
  - Schedule compliance

**5. Supervisor Performance (`/dashboard/supervision/supervisors`)**
- **Supervisor List:**
  - Name and contact
  - Assigned locations
  - Visit metrics this month
  - Performance ratings

- **Performance Metrics:**
  - Visit completion rate
  - On-time completion rate
  - Average visit duration
  - Average location score
  - Findings per visit
  - Actions completed on time

- **Rankings:**
  - Best performing supervisor
  - Most efficient (visits per day)
  - Best quality scores

**6. Findings & Issues (`/dashboard/supervision/findings`)**
- **Active Findings List:**
  - Severity indicator
  - Finding type
  - Location and date
  - Responsible person
  - Status

- **Filters:**
  - By severity
  - By category (your 6 categories)
  - By finding type (your 5 operational alerts)
  - By location
  - By date range

- **Analytics:**
  - Findings by category chart
  - Severity distribution
  - Trend analysis
  - Recurring issues

**7. Corrective Actions (`/dashboard/supervision/actions`)**
- **Actions List:**
  - Description
  - Location
  - Responsible person
  - Priority
  - Deadline
  - Status
  - Days overdue

- **Filters:**
  - By status
  - By priority
  - By location
  - By responsible person
  - By overdue status

- **Timeline View:**
  - Upcoming deadlines
  - Overdue actions
  - Completion trend

**8. New Visit Entry (`/dashboard/supervision/new-visit`)**
- **Mobile-Friendly Form:**
  - Select location (from assigned locations)
  - Select visit type
  - Select shift
  - Pre-populated with checklist

- **10-Minute Process Flow:**
  - Step 1: Observation (2 min) - Checkboxes
  - Step 2: Operations (3 min) - Checkboxes
  - Step 3: Cash (2 min) - Checkboxes
  - Step 4: Product (2 min) - Checkboxes
  - Step 5: Equipment (1 min) - Checkboxes

- **5 Key Questions:**
  - Yes/No for each question
  - Auto-calculates based on checklist

- **Findings Entry:**
  - Select severity
  - Select finding type
  - Enter description
  - Upload photos (multiple)
  - Mark if recurring

- **Immediate Actions:**
  - Enter action description
  - Assign responsible person
  - Set deadline
  - Mark priority

- **Auto-Save:**
  - Saves progress every 30 seconds
  - Can complete later

**9. Visit Detail (`/dashboard/supervision/visits/[id]`)**
- **Visit Overview:**
  - Location, supervisor, date, type
  - Duration and timing
  - Overall score and classification
  - 5 key questions responses

- **Checklist Results:**
  - All 21 items with compliant/not compliant
  - Notes for each item
  - Photos attached

- **Findings:**
  - All findings from visit
  - Photos
  - Severity indicators

- **Corrective Actions:**
  - Actions created from this visit
  - Status tracking
  - Before/after photos

**10. Supervisor Routes (`/dashboard/supervision/routes`)**
- **Route Overview:**
  - Supervisor name
  - Assigned locations list
  - Total locations
  - Visit frequency per location

- **Route Visualization:**
  - Map view (if locations have addresses)
  - Sequence of visits
  - Travel time estimates

- **Optimization Suggestions:**
  - Recommended order
  - Alternative routes
  - Efficiency improvements

---

## 🎯 IMPLEMENTATION PRIORITIES

### Phase 1: Core Database & Data Import (Week 1)
**Essential for everything to work**

**Deliverables:**
1. Create all 14 database tables
2. Write seed data (categories, items, supervisors, locations)
3. Create indexes for performance
4. Set up RLS policies
5. **Build Excel import tool** to import your existing data
6. Import historical data from Excel sheets

**Success Criteria:**
- Database schema matches your Excel structure
- All existing data imported successfully
- Can query visits, findings, and actions

### Phase 2: Visit Scheduling & Calendar (Week 2)
**High priority - enables proactive management**

**Deliverables:**
1. Visit schedule page with calendar/list views
2. Add new scheduled visit form
3. Auto-scheduling based on your frequency rules:
   - 2x/week rapid visits
   - 1x/month full audit
   - 1x/month surprise visit
4. Overdue visit alerts
5. Supervisor route views
6. Manual schedule editing

**Success Criteria:**
- Can see all scheduled visits
- Can add/edit/delete scheduled visits
- Auto-generates next month's schedule
- Alerts when visits are overdue

### Phase 3: Visit Entry & Data Collection (Week 2-3)
**Critical - enables ongoing data collection**

**Deliverables:**
1. Mobile-friendly new visit form
2. 10-minute process flow (5 steps)
3. 21-item checklist with pass/fail
4. 5 key questions (yes/no)
5. Findings entry form
6. Photo upload functionality
7. Immediate action entry
8. Auto-save functionality

**Success Criteria:**
- Supervisors can complete visits on mobile
- All checklist items captured
- Findings documented with photos
- Actions assigned and tracked

### Phase 4: Main Dashboard & Analytics (Week 3)
**High priority - provides visibility**

**Deliverables:**
1. Main supervision dashboard
2. 8 KPI cards
3. Charts and visualizations
4. Location supervision views
5. Supervisor performance tracking
6. Score trends and comparisons

**Success Criteria:**
- Real-time view of supervision status
- Performance metrics visible
- Can drill down to details

### Phase 5: Findings & Actions Management (Week 4)
**Important - tracks issues and resolution**

**Deliverables:**
1. Findings list with filters
2. Corrective actions tracking
3. Overdue action alerts
4. Action verification workflow
5. Before/after photo upload
6. Recurring issue detection

**Success Criteria:**
- All findings tracked
- Actions monitored and completed
- Overdue items flagged

### Phase 6: Advanced Analytics & Reports (Week 4)
**Enhancement - provides deeper insights**

**Deliverables:**
1. Trend analysis charts
2. Score correlations with sales/financials
3. Recurring issue identification
4. Performance benchmarking
5. Export to Excel/PDF
6. Executive summary report

**Success Criteria:**
- Advanced analytics available
- Reports generated on demand
- Can export data for external use

### Phase 7: Automation & Alerts (Week 5)
**Enhancement - proactive notifications**

**Deliverables:**
1. Automated overdue visit alerts
2. Critical finding notifications
3. Action deadline reminders
4. Recurring issue auto-detection
5. Risk level escalation
6. Email notifications

**Success Criteria:**
- Proactive alerts working
- Notifications delivered
- Risk escalation active

---

## 🚀 WHAT YOU'RE DOING WELL (Keep!)

### ✅ Your System Strengths

1. **Structured Procedures**
   - Documented procedure (OPRC-PR-001)
   - Clear 10-minute visit process
   - 5 structured steps
   - Consistent methodology

2. **Comprehensive Coverage**
   - 6 categories, 21 checklist items
   - Multiple visit types (rapid, full, surprise)
   - Defined frequency standards
   - All locations covered

3. **Scoring System**
   - Category-based scoring
   - Clear classifications
   - Weighted importance
   - Performance tracking

4. **Issue Management**
   - Findings documentation
   - Corrective actions tracking
   - Responsibility assignment
   - Deadline monitoring

5. **Team Structure**
   - 2 supervisors with defined routes
   - Clear ownership
   - Geographic optimization
   - Manageable workload

6. **5 Key Questions**
   - Holistic business view
   - Quick assessment framework
   - Decision-making support
   - Management insights

---

## 💡 INDUSTRY BEST PRACTICES COMPARISON

### What You're Already Doing (✅ Excellent!)

| Practice | Your System | Industry Standard | Status |
|----------|-------------|-------------------|--------|
| **Structured visits** | 10-min process, 5 steps | 15-30 min, variable | ✅ Better (faster) |
| **Visit frequency** | 10x/month/location | 4-8x/month/location | ✅ Better coverage |
| **Checklist items** | 21 items, 6 categories | 25-35 items, 8-10 categories | ✅ Comprehensive |
| **Scoring system** | Category scores + total | Weighted scoring | ✅ Clear & effective |
| **Issue tracking** | Findings + actions | Full lifecycle tracking | ✅ Good |
| **Documentation** | Excel-based | Database + photos | ⚠️ Opportunity |
| **Real-time visibility** | Manual Excel updates | Live dashboard | ⚠️ Opportunity |
| **Proactive alerts** | Manual identification | Automated alerts | ⚠️ Opportunity |
| **Photo evidence** | Not required | Required for critical | ⚠️ Opportunity |
| **Mobile access** | Desktop Excel | Mobile/web forms | ⚠️ Opportunity |
| **Integration** | Standalone | Integrated with sales/financials | ⚠️ Opportunity |

### Industry Enhancements to Consider

**1. Photo Evidence Management**
- **What industry leaders do:**
  - Require photos for all critical findings
  - Before/after photos for corrective actions
  - Photo tagging by category
  - Cloud storage with organization
  - Photo gallery for each location

- **Why it matters:**
  - Objective evidence
  - Verification of corrections
  - Training documentation
  - Legal protection
  - Shareable with stakeholders

**2. Time & Duration Tracking**
- **What industry leaders do:**
  - Track actual visit duration
  - Compare to expected duration
  - Identify efficiency issues
  - Optimize routes based on time

- **Why it matters:**
  - Productivity measurement
  - Resource allocation
  - Cost control
  - Performance optimization

**3. Advanced Trend Analysis**
- **What industry leaders do:**
  - Category-level trend analysis
  - Seasonal patterns
  - Correlation with sales performance
  - Correlation with cash differences
  - Predictive risk scoring

- **Why it matters:**
  - Proactive problem prevention
  - Resource allocation
  - Training focus areas
  - Strategic planning
  - ROI justification

**4. Multi-Location Benchmarking**
- **What industry leaders do:**
  - Compare similar locations
  - Identify outliers (good/bad)
  - Best practice sharing
  - Performance targets
  - Continuous improvement

- **Why it matters:**
  - Standardization
  - Knowledge transfer
  - Performance improvement
  - Healthy competition

**5. Integration with Business Metrics**
- **What industry leaders do:**
  - Correlate supervision scores with:
    - Sales performance
    - Customer satisfaction
    - Employee turnover
    - Food cost variance
    - Cash differences
    - Inventory shrinkage

- **Why it matters:**
  - ROI justification
  - Root cause analysis
  - Holistic view
  - Data-driven decisions
  - Business impact

**6. Automated Alert Escalation**
- **What industry leaders do:**
  - Automatic escalation for:
    - Missed deadlines
    - Critical findings
    - 3rd recurrence
    - Below-threshold scores
  - Notification hierarchies
  - SLA tracking

- **Why it matters:**
  - Accountability
  - Rapid response
  - Issue resolution
  - Risk mitigation

**7. Supervisor Calibration**
- **What industry leaders do:**
  - Regular calibration sessions
  - Inter-rater reliability checks
  - Certification requirements
  - Ongoing training

- **Why it matters:**
  - Consistency
  - Quality assurance
  - Standardization
  - Professional development

---

## 🔗 INTEGRATION OPPORTUNITIES

### With Existing Dashboard Modules

**1. Executive Summary Integration**
- Add supervision score to main KPIs
- Include critical findings count
- Show overdue visits
- Display compliance rate

**2. Locations Module Enhancement**
- Add supervision score to location cards
- Show last visit date
- Display risk level
- Link to supervision detail

**3. Alerts Module Integration**
- Supervision findings → Auto-create alerts
- Critical findings → High priority alerts
- Overdue actions → Warning alerts
- Recurring issues → Critical alerts

**4. Cash & Closing Module Connection**
- Correlate cash differences with supervision scores
- Check if "cash controlled" issues predict actual differences
- Track improvement over time

**5. Products Module Connection**
- Correlate stock findings with inventory issues
- Track "product managed" compliance
- Monitor "FIFO correcto" compliance

---

## 📋 ENHANCED FEATURES BASED ON YOUR SYSTEM

### Your Unique Advantages (Keep These!)

**1. 10-Minute Rapid Visit Process**
- ✅ **Keep:** Your structured 5-step process
- ✅ **Enhance:** Add time tracking for each step
- ✅ **Enhance:** Auto-calculate step completion

**2. 5 Key Questions Framework**
- ✅ **Keep:** Your holistic assessment approach
- ✅ **Enhance:** Auto-calculate based on checklist results
- ✅ **Enhance:** Track trends over time

**3. Multiple Visit Types**
- ✅ **Keep:** Rapid (2x/week), Full (1x/month), Surprise (1x/month)
- ✅ **Enhance:** Track compliance with each type
- ✅ **Enhance:** Auto-schedule based on last visit

**4. Two Supervisors with Defined Routes**
- ✅ **Keep:** Your current team structure
- ✅ **Enhance:** Add supervisor performance metrics
- ✅ **Enhance:** Route optimization suggestions

**5. 21-Item Checklist Across 6 Categories**
- ✅ **Keep:** Your comprehensive checklist
- ✅ **Enhance:** Add photo evidence for critical items
- ✅ **Enhance:** Track item-level compliance trends

### New Features to Add

**1. Visit Compliance Dashboard**
- Track: Rapid visits (expected 8x/month, actual: ?)
- Track: Full audits (expected 1x/month, actual: ?)
- Track: Surprise visits (expected 1x/month, actual: ?)
- Show: Overdue visits (alert if >7 days since last visit)
- Show: Supervisor completion rates

**2. Photo Evidence System**
- Required photos for critical findings
- Before/after photos for corrective actions
- Photo gallery by location
- Photo tagging by category
- Mobile photo upload

**3. Real-Time Alerts**
- Overdue visit alerts
- Critical finding notifications
- Action deadline reminders
- Recurring issue detection (3rd occurrence)
- Risk level escalation

**4. Performance Correlations**
- Supervision score vs Sales performance
- "Money controlled" vs Actual cash differences
- "Product managed" vs Food cost variance
- Manager control vs Employee turnover
- Cleanliness vs Customer complaints

**5. Trend Analysis**
- Score trends by category
- Improving vs declining locations
- Seasonal patterns
- Recurring issue patterns
- Supervisor performance trends

**6. Route Optimization**
- Suggest optimal visit order
- Consider travel time
- Balance supervisor workload
- Prioritize high-risk locations
- Respect visit type requirements

---

## 🎯 RECOMMENDED IMPLEMENTATION APPROACH

### Option A: Full Migration (Recommended)
**Timeline:** 5 weeks
**Scope:** Everything in Phase 1-7

**Pros:**
- Complete system
- All enhancements
- Fully integrated
- Future-proof

**Cons:**
- Longer implementation
- More complex
- Higher cost

### Option B: Core Features First
**Timeline:** 3 weeks
**Scope:** Phases 1-4 only

**Pros:**
- Faster time to value
- Lower complexity
- Learn and adjust

**Cons:**
- Missing advanced features
- Need follow-up work
- Less automation

### Option C: Minimum Viable Product
**Timeline:** 2 weeks
**Scope:** Phases 1-3 only

**Pros:**
- Fastest implementation
- Basic functionality
- Test and learn

**Cons:**
- Limited features
- Manual processes remain
- Not full value

---

## 🤔 KEY QUESTIONS FOR YOU

Before I start building, I need to clarify:

1. **Data Import:**
   - Do you have historical visit data in Excel to import?
   - How many historical visits exist?
   - Should I build an import tool?

2. **Photo Upload:**
   - Do you want photo upload functionality?
   - Should photos be required for critical findings?
   - Cloud storage preference?

3. **Mobile Access:**
   - Should visit entry be mobile-optimized?
   - Will supervisors use tablets/phones on location?
   - Or continue desktop-based entry?

4. **Auto-Scheduling:**
   - Should I build auto-scheduling based on your frequency rules?
   - Or manual scheduling only?
   - How far in advance should visits be scheduled?

5. **Alert Integration:**
   - Should supervision findings auto-create alerts in the main alerts module?
   - Should critical findings trigger immediate notifications?

6. **Implementation Priority:**
   - Option A: Full migration (5 weeks, all features)
   - Option B: Core features first (3 weeks)
   - Option C: MVP (2 weeks, basic features)
   - Or a custom approach?

---

## 📊 NEXT STEPS

Once you answer these questions, I will:

1. **Create database migration scripts** (14 tables)
2. **Build the dashboard pages** (10 pages)
3. **Implement data import tools** (Excel → Database)
4. **Add photo upload functionality**
5. **Create mobile-friendly forms**
6. **Build automated alerts**
7. **Test and deploy**

**What are your answers to the questions above? And which implementation option do you prefer?**

I'm ready to start building as soon as you give me the green light! 🚀
