-- ============================================================================
-- MIGRATION 19: Operational Supervision Tables
-- ============================================================================
-- This migration creates the complete database schema for the Operational
-- Supervision Module, preserving the existing Excel-based system structure
-- while adding industry best practices and automation capabilities.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Supervisors Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supervisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  photo_url TEXT,

  -- Employment details
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  termination_date DATE,

  -- Location assignments (JSON array of location IDs)
  assigned_location_ids UUID[],

  -- Schedule preferences
  preferred_shifts VARCHAR(50)[], -- ['mañana', 'tarde', 'noche']
  preferred_days VARCHAR(20)[], -- ['lunes', 'martes', etc.]

  -- Performance metrics
  avg_visit_duration_minutes DECIMAL(5,2),
  visits_completed_last_30_days INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supervisors_active ON supervisors(is_active);
CREATE INDEX IF NOT EXISTS idx_supervisors_assigned_locations ON supervisors USING GIN(assigned_location_ids);

-- ----------------------------------------------------------------------------
-- 2. Checklist Categories (6 categories from existing system)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checklist_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_es VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_categories_active ON checklist_categories(active);
CREATE INDEX IF NOT EXISTS idx_checklist_categories_order ON checklist_categories(display_order);

-- ----------------------------------------------------------------------------
-- 3. Checklist Items (21 items from existing system)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES checklist_categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  name_es VARCHAR(200) NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_critical BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_category ON checklist_items(category_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_active ON checklist_items(active);
CREATE INDEX IF NOT EXISTS idx_checklist_items_critical ON checklist_items(is_critical);
CREATE INDEX IF NOT EXISTS idx_checklist_items_order ON checklist_items(display_order);

-- ----------------------------------------------------------------------------
-- 4. Supervision Schedule
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supervision_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES supervisors(id) ON DELETE SET NULL,

  -- Scheduling details
  planned_date DATE NOT NULL,
  planned_shift VARCHAR(20),
  visit_type VARCHAR(30) NOT NULL, -- rapida, completa, sorpresa
  visit_subtype VARCHAR(30),

  -- Estimated duration
  estimated_duration_minutes INTEGER DEFAULT 10,

  -- Priority
  priority VARCHAR(20) DEFAULT 'normal',

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending',

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

CREATE INDEX IF NOT EXISTS idx_supervision_schedule_date ON supervision_schedule(planned_date);
CREATE INDEX IF NOT EXISTS idx_supervision_schedule_supervisor ON supervision_schedule(supervisor_id, planned_date);
CREATE INDEX IF NOT EXISTS idx_supervision_schedule_location ON supervision_schedule(location_id, planned_date);
CREATE INDEX IF NOT EXISTS idx_supervision_schedule_status ON supervision_schedule(status);
CREATE INDEX IF NOT EXISTS idx_supervision_schedule_overdue ON supervision_schedule(planned_date, status) WHERE status = 'pending';

-- ----------------------------------------------------------------------------
-- 5. Supervision Visits
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supervision_visits (
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
  visit_shift VARCHAR(20),
  visit_type VARCHAR(30) NOT NULL,

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

  -- Overall scores (6 categories)
  score_liderazgo DECIMAL(5,2),
  score_orden DECIMAL(5,2),
  score_caja DECIMAL(5,2),
  score_stock DECIMAL(5,2),
  score_limpieza DECIMAL(5,2),
  score_equipos DECIMAL(5,2),
  score_total DECIMAL(5,2),
  score_operacion DECIMAL(5,2),

  -- Classification
  classification VARCHAR(20),

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

CREATE INDEX IF NOT EXISTS idx_supervision_visits_date ON supervision_visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_supervision_visits_location ON supervision_visits(location_id);
CREATE INDEX IF NOT EXISTS idx_supervision_visits_supervisor ON supervision_visits(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_supervision_visits_type ON supervision_visits(visit_type);
CREATE INDEX IF NOT EXISTS idx_supervision_visits_classification ON supervision_visits(classification);

-- ----------------------------------------------------------------------------
-- 6. Visit Checklist Results
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_checklist_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES supervision_visits(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,

  -- Compliance
  compliant BOOLEAN NOT NULL,

  -- Details
  notes TEXT,
  severity VARCHAR(20),
  requires_action BOOLEAN DEFAULT false,

  -- Photo evidence
  photo_count INTEGER DEFAULT 0,

  -- Time tracking
  time_spent_seconds INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT visit_item_unique UNIQUE (visit_id, checklist_item_id)
);

CREATE INDEX IF NOT EXISTS idx_visit_checklist_results_visit ON visit_checklist_results(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_checklist_results_item ON visit_checklist_results(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_visit_checklist_results_compliant ON visit_checklist_results(compliant);

-- ----------------------------------------------------------------------------
-- 7. Operational Findings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operational_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES supervision_visits(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE SET NULL,

  -- Finding details
  category VARCHAR(50),
  severity VARCHAR(20),
  title VARCHAR(200) NOT NULL,
  description TEXT,

  -- 5 operational alert types
  finding_type VARCHAR(50),

  -- Photo evidence
  requires_photo BOOLEAN DEFAULT false,
  photo_url TEXT,
  additional_photos TEXT[],

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

CREATE INDEX IF NOT EXISTS idx_operational_findings_visit ON operational_findings(visit_id);
CREATE INDEX IF NOT EXISTS idx_operational_findings_severity ON operational_findings(severity);
CREATE INDEX IF NOT EXISTS idx_operational_findings_type ON operational_findings(finding_type);
CREATE INDEX IF NOT EXISTS idx_operational_findings_category ON operational_findings(category);
CREATE INDEX IF NOT EXISTS idx_operational_findings_recurring ON operational_findings(is_recurring);

-- ----------------------------------------------------------------------------
-- 8. Corrective Actions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS corrective_actions (
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
  responsible_role VARCHAR(50),

  -- Priority
  priority VARCHAR(20) DEFAULT 'medium',

  -- Deadline tracking
  committed_date DATE,
  estimated_completion_hours DECIMAL(5,2),
  actual_completion_date DATE,

  -- Status workflow
  status VARCHAR(20) DEFAULT 'pending',

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

CREATE INDEX IF NOT EXISTS idx_corrective_actions_visit ON corrective_actions(visit_id);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_location ON corrective_actions(location_id);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_status ON corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_overdue ON corrective_actions(is_overdue);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_deadline ON corrective_actions(committed_date);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_responsible ON corrective_actions(responsible_role);

-- ----------------------------------------------------------------------------
-- 9. Visit Photos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES supervision_visits(id) ON DELETE CASCADE,
  finding_id UUID REFERENCES operational_findings(id) ON DELETE SET NULL,
  action_id UUID REFERENCES corrective_actions(id) ON DELETE SET NULL,

  -- Photo details
  photo_type VARCHAR(30),
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

CREATE INDEX IF NOT EXISTS idx_visit_photos_visit ON visit_photos(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_photos_finding ON visit_photos(finding_id);
CREATE INDEX IF NOT EXISTS idx_visit_photos_action ON visit_photos(action_id);
CREATE INDEX IF NOT EXISTS idx_visit_photos_type ON visit_photos(photo_type);

-- ----------------------------------------------------------------------------
-- 10. Supervisor Metrics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supervisor_metrics (
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
  avg_score_by_category JSONB,

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

CREATE INDEX IF NOT EXISTS idx_supervisor_metrics_date ON supervisor_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_supervisor_metrics_supervisor ON supervisor_metrics(supervisor_id);

-- ----------------------------------------------------------------------------
-- 11. Location Supervision Metrics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS location_supervision_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,

  -- Score metrics
  avg_score_total DECIMAL(5,2),
  avg_score_operacion DECIMAL(5,2),
  avg_score_caja DECIMAL(5,2),
  avg_score_stock DECIMAL(5,2),
  avg_score_limpieza DECIMAL(5,2),
  avg_score_equipos DECIMAL(5,2),

  -- Score trends
  score_trend VARCHAR(20),
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
  rapid_visit_compliance_rate DECIMAL(5,2),
  full_audit_compliance_rate DECIMAL(5,2),
  surprise_visit_compliance_rate DECIMAL(5,2),

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
  risk_level VARCHAR(20),
  risk_score DECIMAL(5,2),
  risk_factors JSONB,
  classification VARCHAR(20),

  -- Manager performance
  manager_present_rate DECIMAL(5,2),
  manager_in_control_rate DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT location_metric_date UNIQUE (location_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_location_supervision_metrics_date ON location_supervision_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_location_supervision_metrics_location ON location_supervision_metrics(location_id);
CREATE INDEX IF NOT EXISTS idx_location_supervision_metrics_risk ON location_supervision_metrics(risk_level);

-- ----------------------------------------------------------------------------
-- 12. Scheduling Rules (for auto-scheduling)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheduling_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Visit frequency rules
  rapid_visits_per_week INTEGER DEFAULT 2,
  full_audit_per_month INTEGER DEFAULT 1,
  surprise_visits_per_month INTEGER DEFAULT 1,

  -- Priority rules
  high_priority_locations UUID[],

  -- Supervisor capacity
  max_visits_per_day INTEGER DEFAULT 8,
  max_visits_per_week INTEGER DEFAULT 40,

  -- Geographic optimization
  optimize_by_geography BOOLEAN DEFAULT true,

  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduling_rules_active ON scheduling_rules(active);

-- ----------------------------------------------------------------------------
-- 13. Visit Templates
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_es VARCHAR(100) NOT NULL,
  description TEXT,
  visit_type VARCHAR(30) NOT NULL,
  estimated_duration_minutes INTEGER DEFAULT 10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visit_templates_type ON visit_templates(visit_type);
CREATE INDEX IF NOT EXISTS idx_visit_templates_active ON visit_templates(active);

-- ----------------------------------------------------------------------------
-- 14. Visit Template Items (template checklists)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES visit_templates(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE CASCADE,
  display_order INTEGER,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT template_item_unique UNIQUE (template_id, checklist_item_id)
);

CREATE INDEX IF NOT EXISTS idx_visit_template_items_template ON visit_template_items(template_id);

-- ----------------------------------------------------------------------------
-- Triggers for updated_at
-- ----------------------------------------------------------------------------
CREATE TRIGGER update_supervisors_updated_at BEFORE UPDATE ON supervisors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supervision_schedule_updated_at BEFORE UPDATE ON supervision_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supervision_visits_updated_at BEFORE UPDATE ON supervision_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_corrective_actions_updated_at BEFORE UPDATE ON corrective_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduling_rules_updated_at BEFORE UPDATE ON scheduling_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Add supervision columns to existing locations table
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- Check if column exists before adding
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'primary_supervisor_id'
  ) THEN
    ALTER TABLE locations ADD COLUMN primary_supervisor_id UUID REFERENCES supervisors(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'backup_supervisor_id'
  ) THEN
    ALTER TABLE locations ADD COLUMN backup_supervisor_id UUID REFERENCES supervisors(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'supervision_priority'
  ) THEN
    ALTER TABLE locations ADD COLUMN supervision_priority VARCHAR(20) DEFAULT 'regular';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'required_rapid_visits_per_week'
  ) THEN
    ALTER TABLE locations ADD COLUMN required_rapid_visits_per_week INTEGER DEFAULT 2;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'required_full_audit_per_month'
  ) THEN
    ALTER TABLE locations ADD COLUMN required_full_audit_per_month INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'required_surprise_visits_per_month'
  ) THEN
    ALTER TABLE locations ADD COLUMN required_surprise_visits_per_month INTEGER DEFAULT 1;
  END IF;
END $$;

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 19 completed: Operational Supervision tables created (14 tables)';
END $$;
