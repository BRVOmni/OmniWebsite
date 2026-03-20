-- ============================================================================
-- MIGRATION 21: Operational Supervision RLS Policies
-- ============================================================================
-- This migration enables Row Level Security on all supervision tables and
-- creates appropriate policies for different user roles.
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL SUPERVISION TABLES
-- ============================================================================
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervision_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervision_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_checklist_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_supervision_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduling_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_template_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICY: Public read access for reference data
-- ============================================================================

-- Checklist categories - everyone can read
CREATE POLICY "Public can view checklist categories"
ON checklist_categories FOR SELECT
USING (true);

-- Checklist items - everyone can read
CREATE POLICY "Public can view checklist items"
ON checklist_items FOR SELECT
USING (true);

-- Visit templates - everyone can read
CREATE POLICY "Public can view visit templates"
ON visit_templates FOR SELECT
USING (true);

-- Visit template items - everyone can read
CREATE POLICY "Public can view visit template items"
ON visit_template_items FOR SELECT
USING (true);

-- Scheduling rules - everyone can read
CREATE POLICY "Public can view scheduling rules"
ON scheduling_rules FOR SELECT
USING (true);

-- ============================================================================
-- POLICY: Admins can do everything
-- ============================================================================

CREATE POLICY "Admins can view all supervisors"
ON supervisors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert supervisors"
ON supervisors FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update supervisors"
ON supervisors FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete supervisors"
ON supervisors FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert checklist categories"
ON checklist_categories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update checklist categories"
ON checklist_categories FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete checklist categories"
ON checklist_categories FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert checklist items"
ON checklist_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update checklist items"
ON checklist_items FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete checklist items"
ON checklist_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can view all supervision schedule"
ON supervision_schedule FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert supervision schedule"
ON supervision_schedule FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update supervision schedule"
ON supervision_schedule FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete supervision schedule"
ON supervision_schedule FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can view all supervision visits"
ON supervision_visits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert supervision visits"
ON supervision_visits FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update supervision visits"
ON supervision_visits FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete supervision visits"
ON supervision_visits FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can view all visit checklist results"
ON visit_checklist_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert visit checklist results"
ON visit_checklist_results FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update visit checklist results"
ON visit_checklist_results FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete visit checklist results"
ON visit_checklist_results FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can view all operational findings"
ON operational_findings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert operational findings"
ON operational_findings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update operational findings"
ON operational_findings FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete operational findings"
ON operational_findings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can view all corrective actions"
ON corrective_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert corrective actions"
ON corrective_actions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update corrective actions"
ON corrective_actions FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete corrective actions"
ON corrective_actions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can view all visit photos"
ON visit_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert visit photos"
ON visit_photos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update visit photos"
ON visit_photos FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete visit photos"
ON visit_photos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can view all supervisor metrics"
ON supervisor_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert supervisor metrics"
ON supervisor_metrics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update supervisor metrics"
ON supervisor_metrics FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete supervisor metrics"
ON supervisor_metrics FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can view all location supervision metrics"
ON location_supervision_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert location supervision metrics"
ON location_supervision_metrics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update location supervision metrics"
ON location_supervision_metrics FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete location supervision metrics"
ON location_supervision_metrics FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert scheduling rules"
ON scheduling_rules FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update scheduling rules"
ON scheduling_rules FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete scheduling rules"
ON scheduling_rules FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert visit templates"
ON visit_templates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update visit templates"
ON visit_templates FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete visit templates"
ON visit_templates FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert visit template items"
ON visit_template_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update visit template items"
ON visit_template_items FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can delete visit template items"
ON visit_template_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLICY: Supervisors can access their assigned locations and own visits
-- ============================================================================

CREATE POLICY "Supervisors can view their supervision schedule"
ON supervision_schedule FOR SELECT
USING (
  supervisor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'supervisor'
    AND location_id = ANY(users.assigned_location_ids)
  )
);

CREATE POLICY "Supervisors can insert their supervision schedule"
ON supervision_schedule FOR INSERT
WITH CHECK (
  supervisor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'supervisor'
    AND location_id = ANY(users.assigned_location_ids)
  )
);

CREATE POLICY "Supervisors can update their supervision schedule"
ON supervision_schedule FOR UPDATE
USING (
  supervisor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'supervisor'
    AND location_id = ANY(users.assigned_location_ids)
  )
);

CREATE POLICY "Supervisors can view their supervision visits"
ON supervision_visits FOR SELECT
USING (
  supervisor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'supervisor'
    AND location_id = ANY(users.assigned_location_ids)
  )
);

CREATE POLICY "Supervisors can insert their supervision visits"
ON supervision_visits FOR INSERT
WITH CHECK (
  supervisor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'supervisor'
    AND location_id = ANY(users.assigned_location_ids)
  )
);

CREATE POLICY "Supervisors can update their supervision visits"
ON supervision_visits FOR UPDATE
USING (
  supervisor_id = auth.uid()
);

CREATE POLICY "Supervisors can view their visit checklist results"
ON visit_checklist_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = visit_checklist_results.visit_id
    AND (supervision_visits.supervisor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'supervisor'
        AND supervision_visits.location_id = ANY(users.assigned_location_ids)
      ))
  )
);

CREATE POLICY "Supervisors can insert visit checklist results"
ON visit_checklist_results FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = visit_checklist_results.visit_id
    AND supervision_visits.supervisor_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can update their visit checklist results"
ON visit_checklist_results FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = visit_checklist_results.visit_id
    AND supervision_visits.supervisor_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can view their operational findings"
ON operational_findings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = operational_findings.visit_id
    AND (supervision_visits.supervisor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'supervisor'
        AND supervision_visits.location_id = ANY(users.assigned_location_ids)
      ))
  )
);

CREATE POLICY "Supervisors can insert operational findings"
ON operational_findings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = operational_findings.visit_id
    AND supervision_visits.supervisor_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can update their operational findings"
ON operational_findings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = operational_findings.visit_id
    AND supervision_visits.supervisor_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can view their corrective actions"
ON corrective_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = corrective_actions.visit_id
    AND (supervision_visits.supervisor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'supervisor'
        AND supervision_visits.location_id = ANY(users.assigned_location_ids)
      ))
  )
);

CREATE POLICY "Supervisors can insert corrective actions"
ON corrective_actions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = corrective_actions.visit_id
    AND supervision_visits.supervisor_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can update corrective actions"
ON corrective_actions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = corrective_actions.visit_id
    AND supervision_visits.supervisor_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can view their visit photos"
ON visit_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = visit_photos.visit_id
    AND (supervision_visits.supervisor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'supervisor'
        AND supervision_visits.location_id = ANY(users.assigned_location_ids)
      ))
  )
);

CREATE POLICY "Supervisors can insert visit photos"
ON visit_photos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = visit_photos.visit_id
    AND supervision_visits.supervisor_id = auth.uid()
  )
);

CREATE POLICY "Supervisors can view their metrics"
ON supervisor_metrics FOR SELECT
USING (supervisor_id = auth.uid());

-- ============================================================================
-- POLICY: Managers can view their location's supervision data
-- ============================================================================

CREATE POLICY "Managers can view their supervision schedule"
ON supervision_schedule FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'manager'
  )
);

CREATE POLICY "Managers can view their supervision visits"
ON supervision_visits FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'manager'
  )
);

CREATE POLICY "Managers can view their visit checklist results"
ON visit_checklist_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = visit_checklist_results.visit_id
    AND supervision_visits.location_id IN (
      SELECT location_id FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'manager'
    )
  )
);

CREATE POLICY "Managers can view their operational findings"
ON operational_findings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = operational_findings.visit_id
    AND supervision_visits.location_id IN (
      SELECT location_id FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'manager'
    )
  )
);

CREATE POLICY "Managers can view their corrective actions"
ON corrective_actions FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'manager'
  )
);

CREATE POLICY "Managers can update their corrective actions"
ON corrective_actions FOR UPDATE
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'manager'
  )
);

CREATE POLICY "Managers can view their visit photos"
ON visit_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM supervision_visits
    WHERE supervision_visits.id = visit_photos.visit_id
    AND supervision_visits.location_id IN (
      SELECT location_id FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'manager'
    )
  )
);

CREATE POLICY "Managers can view their location supervision metrics"
ON location_supervision_metrics FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'manager'
  )
);

-- ============================================================================
-- POLICY: Viewers can read but not modify
-- ============================================================================

CREATE POLICY "Viewers can view supervisors"
ON supervisors FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

CREATE POLICY "Viewers can view supervision schedule"
ON supervision_schedule FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

CREATE POLICY "Viewers can view supervision visits"
ON supervision_visits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

CREATE POLICY "Viewers can view visit checklist results"
ON visit_checklist_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

CREATE POLICY "Viewers can view operational findings"
ON operational_findings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

CREATE POLICY "Viewers can view corrective actions"
ON corrective_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

CREATE POLICY "Viewers can view visit photos"
ON visit_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

CREATE POLICY "Viewers can view supervisor metrics"
ON supervisor_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

CREATE POLICY "Viewers can view location supervision metrics"
ON location_supervision_metrics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 21 completed: Operational Supervision RLS policies enabled';
    RAISE NOTICE 'Users can only access supervision data based on their role';
END $$;
