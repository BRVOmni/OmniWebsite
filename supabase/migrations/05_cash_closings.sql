-- ============================================================================
-- MIGRATION 5: Cash Closings
-- ============================================================================

-- Cash Closings
CREATE TABLE IF NOT EXISTS cash_closings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id         UUID REFERENCES locations(id) ON DELETE RESTRICT,
  date                DATE NOT NULL,
  expected_cash       DECIMAL(12,2) DEFAULT 0,
  expected_bancard    DECIMAL(12,2) DEFAULT 0,
  expected_upay       DECIMAL(12,2) DEFAULT 0,
  expected_total      DECIMAL(12,2) DEFAULT 0,
  actual_cash         DECIMAL(12,2) DEFAULT 0,
  actual_bancard      DECIMAL(12,2) DEFAULT 0,
  actual_upay         DECIMAL(12,2) DEFAULT 0,
  actual_total        DECIMAL(12,2) DEFAULT 0,
  cash_difference     DECIMAL(12,2) DEFAULT 0,
  bancard_difference  DECIMAL(12,2) DEFAULT 0,
  upay_difference     DECIMAL(12,2) DEFAULT 0,
  total_difference    DECIMAL(12,2) DEFAULT 0,
  petty_cash_rendered DECIMAL(12,2) DEFAULT 0,
  closing_status      VARCHAR(20) DEFAULT 'pending',
  closed_at           TIMESTAMPTZ,
  closed_by           UUID,
  observation         TEXT,
  requires_review     BOOLEAN DEFAULT false,
  reviewed_by         UUID,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, date)
);

-- Indexes for Cash Closings
CREATE INDEX IF NOT EXISTS idx_cash_closings_location_date ON cash_closings(location_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_closings_status ON cash_closings(closing_status);
CREATE INDEX IF NOT EXISTS idx_cash_closings_requires_review ON cash_closings(requires_review)
  WHERE requires_review = true;

-- Trigger for updated_at
CREATE TRIGGER update_cash_closings_updated_at BEFORE UPDATE ON cash_closings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 5 completed: Cash Closings table created';
END $$;
