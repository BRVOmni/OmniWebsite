-- ============================================================================
-- MIGRATION 7: Supervision & Inventory
-- ============================================================================

-- Supervision Visits
CREATE TABLE IF NOT EXISTS supervision_visits (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id              UUID REFERENCES locations(id) ON DELETE RESTRICT,
  supervisor_id            UUID,
  date                     DATE NOT NULL,
  start_time               TIME,
  end_time                 TIME,
  overall_score            INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  compliance_score         INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
  status                   VARCHAR(20) DEFAULT 'pending',
  findings                 JSONB,
  critical_findings_count  INTEGER DEFAULT 0,
  corrective_actions_required BOOLEAN DEFAULT false,
  corrective_actions       JSONB,
  follow_up_visit_date     DATE,
  report_url               TEXT,
  observations             TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   UUID REFERENCES locations(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity      INTEGER NOT NULL DEFAULT 0,
  min_stock     INTEGER DEFAULT 0,
  max_stock     INTEGER DEFAULT 0,
  is_low_stock  BOOLEAN DEFAULT false,
  is_overstock  BOOLEAN DEFAULT false,
  last_stock_check DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, product_id)
);

-- Inventory Movements
CREATE TABLE IF NOT EXISTS inventory_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id    UUID REFERENCES inventory(id) ON DELETE CASCADE,
  location_id     UUID REFERENCES locations(id) ON DELETE RESTRICT,
  product_id      UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity        INTEGER NOT NULL,
  movement_type   VARCHAR(20) NOT NULL,
  reference_id    UUID,
  unit_cost       DECIMAL(10,2),
  total_cost      DECIMAL(12,2),
  observations    TEXT,
  created_by      UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_supervision_visits_location_date ON supervision_visits(location_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_supervision_visits_supervisor_date ON supervision_visits(supervisor_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_supervision_visits_status ON supervision_visits(status);

CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(location_id, is_low_stock)
  WHERE is_low_stock = true;

CREATE INDEX IF NOT EXISTS idx_inventory_movements_location_date ON inventory_movements(location_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_date ON inventory_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);

-- Triggers for updated_at
CREATE TRIGGER update_supervision_visits_updated_at BEFORE UPDATE ON supervision_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 7 completed: Supervision Visits and Inventory tables created';
END $$;
