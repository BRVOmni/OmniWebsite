-- ============================================================================
-- MIGRATION 8: Alerts
-- ============================================================================

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id         UUID REFERENCES locations(id) ON DELETE CASCADE,
  brand_id            UUID REFERENCES brands(id) ON DELETE SET NULL,
  type                VARCHAR(50) NOT NULL,
  severity            VARCHAR(20) NOT NULL,
  title               VARCHAR(255) NOT NULL,
  description         TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id   UUID,
  related_date        DATE,
  status              VARCHAR(20) DEFAULT 'active',
  acknowledged_by     UUID,
  acknowledged_at      TIMESTAMPTZ,
  resolved_by         UUID,
  resolved_at         TIMESTAMPTZ,
  resolution_notes    TEXT,
  suggested_action    TEXT,
  action_taken        TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Alerts (CRITICAL - must be fast)
CREATE INDEX IF NOT EXISTS idx_alerts_location_status ON alerts(location_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_type_severity ON alerts(type, severity);
CREATE INDEX IF NOT EXISTS idx_alerts_brand ON alerts(brand_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create alert automatically
CREATE OR REPLACE FUNCTION create_alert(
  p_location_id UUID,
  p_brand_id UUID,
  p_type VARCHAR,
  p_severity VARCHAR,
  p_title VARCHAR,
  p_description TEXT,
  p_related_entity_type VARCHAR DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_related_date DATE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  INSERT INTO alerts (
    location_id,
    brand_id,
    type,
    severity,
    title,
    description,
    related_entity_type,
    related_entity_id,
    related_date
  ) VALUES (
    p_location_id,
    p_brand_id,
    p_type,
    p_severity,
    p_title,
    p_description,
    p_related_entity_type,
    p_related_entity_id,
    p_related_date
  ) RETURNING id INTO v_alert_id;

  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 8 completed: Alerts table and helper function created';
END $$;
