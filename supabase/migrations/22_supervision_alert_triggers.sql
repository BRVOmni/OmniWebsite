-- ============================================================================
-- MIGRATION 22: Supervision Alert Integration
-- ============================================================================
-- Creates automatic alert generation for critical supervision events

-- ----------------------------------------------------------------------------
-- 1. CRITICAL FINDING ALERT TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_critical_finding_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_location_id UUID;
  v_brand_id UUID;
  v_alert_title VARCHAR;
  v_alert_desc TEXT;
  v_severity VARCHAR;
BEGIN
  -- Only create alerts for critical/high severity findings
  IF NEW.severity NOT IN ('critical', 'high') THEN
    RETURN NEW;
  END IF;

  -- Get location info
  SELECT location_id, brand_id INTO v_location_id, v_brand_id
  FROM supervision_visits
  WHERE id = NEW.visit_id;

  -- Determine severity and title based on finding severity
  v_severity := CASE
    WHEN NEW.severity = 'critical' THEN 'critical'
    WHEN NEW.severity = 'high' THEN 'high'
    ELSE 'medium'
  END;

  v_alert_title := CASE
    WHEN NEW.severity = 'critical' THEN '⚠️ CRITICAL: ' || COALESCE(NEW.title, 'Operational Finding')
    ELSE '🔴 High Priority: ' || COALESCE(NEW.title, 'Operational Finding')
  END;

  v_alert_desc := format(
    'Critical operational finding detected during supervision visit.%s%s%s',
    CASE WHEN NEW.title IS NOT NULL THEN E'\n\nTitle: ' || NEW.title ELSE '' END,
    CASE WHEN NEW.description IS NOT NULL THEN E'\n\nDescription: ' || NEW.description ELSE '' END,
    CASE WHEN NEW.category IS NOT NULL THEN E'\n\nCategory: ' || NEW.category ELSE '' END
  );

  -- Create the alert
  PERFORM create_alert(
    p_location_id => v_location_id,
    p_brand_id => v_brand_id,
    p_type => 'supervision',
    p_severity => v_severity,
    p_title => v_alert_title,
    p_description => v_alert_desc,
    p_related_entity_type => 'operational_finding',
    p_related_entity_id => NEW.id,
    p_related_date => NEW.created_at::date
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for critical findings
DROP TRIGGER IF EXISTS critical_finding_alert_trigger ON operational_findings;
CREATE TRIGGER critical_finding_alert_trigger
  AFTER INSERT ON operational_findings
  FOR EACH ROW
  EXECUTE FUNCTION handle_critical_finding_alert();

-- ----------------------------------------------------------------------------
-- 2. OVERDUE VISIT ALERT TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_overdue_visits()
RETURNS void AS $$
DECLARE
  v_overdue_visits RECORD;
  v_days_overdue INTEGER;
BEGIN
  -- Find all pending scheduled visits that are past due
  FOR v_overdue_visits IN
    SELECT
      ss.id,
      ss.location_id,
      l.brand_id,
      ss.scheduled_date,
      ss.scheduled_shift,
      s.name as supervisor_name,
      (CURRENT_DATE - ss.scheduled_date) as days_overdue
    FROM supervision_schedule ss
    JOIN locations l ON ss.location_id = l.id
    JOIN supervisors s ON ss.supervisor_id = s.id
    WHERE ss.status = 'pending'
      AND ss.scheduled_date < CURRENT_DATE
      -- Only create alerts for visits overdue by 1+ days to avoid same-day noise
      AND (CURRENT_DATE - ss.scheduled_date) >= 1
      -- Check if alert doesn't already exist
      AND NOT EXISTS (
        SELECT 1 FROM alerts
        WHERE related_entity_type = 'supervision_schedule'
          AND related_entity_id = ss.id
          AND status = 'active'
      )
  LOOP
    v_days_overdue := v_overdue_visits.days_overdue;

    PERFORM create_alert(
      p_location_id => v_overdue_visits.location_id,
      p_brand_id => v_overdue_visits.brand_id,
      p_type => 'supervision',
      p_severity => CASE
        WHEN v_days_overdue >= 7 THEN 'critical'
        WHEN v_days_overdue >= 3 THEN 'high'
        ELSE 'medium'
      END,
      p_title => format('Overdue Supervision Visit (%s days)', v_days_overdue),
      p_description => format(
        'Scheduled supervision visit is overdue by %s days.%s%s%sScheduled for: %s (%s)%sSupervisor: %s',
        v_days_overdue,
        E'\n\n',
        (SELECT name FROM locations WHERE id = v_overdue_visits.location_id),
        E'\n\n',
        v_overdue_visits.scheduled_date,
        v_overdue_visits.scheduled_shift,
        E'\n\n',
        v_overdue_visits.supervisor_name
      ),
      p_related_entity_type => 'supervision_schedule',
      p_related_entity_id => v_overdue_visits.id,
      p_related_date => v_overdue_visits.scheduled_date
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. OVERDUE CORRECTIVE ACTION ALERT TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_overdue_actions()
RETURNS void AS $$
DECLARE
  v_overdue_actions RECORD;
  v_days_overdue INTEGER;
BEGIN
  -- Find all pending corrective actions that are past deadline
  FOR v_overdue_actions IN
    SELECT
      ca.id,
      ca.location_id,
      l.brand_id,
      ca.deadline,
      ca.description,
      ca.priority,
      (CURRENT_DATE - ca.deadline) as days_overdue,
      COALESCE(ca.responsible_person, 'Unassigned') as responsible_person
    FROM corrective_actions ca
    JOIN locations l ON ca.location_id = l.id
    WHERE ca.status IN ('pending', 'in_progress')
      AND ca.deadline < CURRENT_DATE
      -- Only create alerts for actions overdue by 1+ days
      AND (CURRENT_DATE - ca.deadline) >= 1
      -- Check if alert doesn't already exist
      AND NOT EXISTS (
        SELECT 1 FROM alerts
        WHERE related_entity_type = 'corrective_action'
          AND related_entity_id = ca.id
          AND status = 'active'
      )
  LOOP
    v_days_overdue := v_overdue_actions.days_overdue;

    PERFORM create_alert(
      p_location_id => v_overdue_actions.location_id,
      p_brand_id => v_overdue_actions.brand_id,
      p_type => 'supervision',
      p_severity => CASE
        WHEN v_overdue_actions.priority = 'critical' OR v_days_overdue >= 7 THEN 'critical'
        WHEN v_overdue_actions.priority = 'high' OR v_days_overdue >= 3 THEN 'high'
        ELSE 'medium'
      END,
      p_title => format('Overdue Corrective Action (%s days)', v_days_overdue),
      p_description => format(
        'Corrective action is overdue by %s days.%s%s%sPriority: %s%sResponsible: %s%sDeadline: %s',
        v_days_overdue,
        E'\n\n',
        v_overdue_actions.description,
        E'\n\n',
        v_overdue_actions.priority,
        E'\n\n',
        v_overdue_actions.responsible_person,
        E'\n\n',
        v_overdue_actions.deadline
      ),
      p_related_entity_type => 'corrective_action',
      p_related_entity_id => v_overdue_actions.id,
      p_related_date => v_overdue_actions.deadline
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. RECURRING ISSUE ALERT (3rd occurrence)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_recurring_issues()
RETURNS TRIGGER AS $$
DECLARE
  v_recurrence_count INTEGER;
  v_location_id UUID;
  v_brand_id UUID;
  v_category VARCHAR;
BEGIN
  -- Get location info
  SELECT location_id INTO v_location_id
  FROM supervision_visits
  WHERE id = NEW.visit_id;

  SELECT brand_id INTO v_brand_id
  FROM locations
  WHERE id = v_location_id;

  v_category := NEW.category;

  -- Count occurrences of similar findings in last 90 days
  SELECT COUNT(*) INTO v_recurrence_count
  FROM operational_findings of
  JOIN supervision_visits sv ON of.visit_id = sv.id
  WHERE sv.location_id = v_location_id
    AND of.category = v_category
    AND of.severity IN ('critical', 'high')
    AND of.created_at > NOW() - INTERVAL '90 days'
    AND of.id != NEW.id;  -- Exclude current finding

  -- Only alert on 3rd+ occurrence
  IF v_recurrence_count >= 2 THEN
    PERFORM create_alert(
      p_location_id => v_location_id,
      p_brand_id => v_brand_id,
      p_type => 'supervision',
      p_severity => 'critical',
      p_title => '🔄 Recurring Critical Issue Detected',
      p_description => format(
        'A critical operational issue has recurred for the %s time in the last 90 days.%sCategory: %s%sLocation: %s%sThis indicates a systemic problem requiring immediate intervention.',
        v_recurrence_count + 1,
        E'\n\n',
        v_category,
        E'\n\n',
        (SELECT name FROM locations WHERE id = v_location_id),
        E'\n\n'
      ),
      p_related_entity_type => 'operational_finding',
      p_related_entity_id => NEW.id,
      p_related_date => CURRENT_DATE
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for recurring issues
DROP TRIGGER IF EXISTS recurring_issue_alert_trigger ON operational_findings;
CREATE TRIGGER recurring_issue_alert_trigger
  AFTER INSERT ON operational_findings
  FOR EACH ROW
  EXECUTE FUNCTION check_recurring_issues();

-- ----------------------------------------------------------------------------
-- 5. SCHEDULED JOBS FOR PERIODIC CHECKS
-- ----------------------------------------------------------------------------

-- Function to run all periodic checks
CREATE OR REPLACE FUNCTION run_supervision_alert_checks()
RETURNS void AS $$
BEGIN
  -- Check for overdue visits
  PERFORM check_overdue_visits();

  -- Check for overdue actions
  PERFORM check_overdue_actions();
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 22 completed: Supervision alert integration triggers created';
    RAISE NOTICE 'Note: Schedule run_supervision_alert_checks() to run periodically (e.g., via pg_cron or external scheduler)';
END $$;
