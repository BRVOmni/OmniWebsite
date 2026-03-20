-- ============================================================================
-- MIGRATION 10: Performance Indexes (FIXED)
-- ============================================================================

-- Additional indexes for query optimization
-- These complement the indexes already created in previous migrations

-- Sales analytics indexes
CREATE INDEX IF NOT EXISTS idx_sales_date_location_brand ON sales(date DESC, location_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_sales_date_channel ON sales(date DESC, channel_id);
CREATE INDEX IF NOT EXISTS idx_sales_date_status ON sales(date DESC, status);

-- Cash closing indexes
CREATE INDEX IF NOT EXISTS idx_cash_closings_date_location ON cash_closings(date DESC, location_id);
CREATE INDEX IF NOT EXISTS idx_cash_closings_total_difference ON cash_closings(total_difference)
  WHERE total_difference != 0;

-- Location performance indexes
CREATE INDEX IF NOT EXISTS idx_locations_opening_date_active ON locations(opening_date DESC, is_active)
  WHERE is_active = true;

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_active_name ON products(name)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active)
  WHERE is_active = true;

-- Alert indexes for active alerts
CREATE INDEX IF NOT EXISTS idx_alerts_severity_active ON alerts(severity, created_at DESC)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_alerts_type_active ON alerts(type, created_at DESC)
  WHERE status = 'active';

-- Supervision visit indexes
CREATE INDEX IF NOT EXISTS idx_supervision_visits_date_status ON supervision_visits(date DESC, status);
CREATE INDEX IF NOT EXISTS idx_supervision_visits_score ON supervision_visits(overall_score)
  WHERE overall_score IS NOT NULL;

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_date_status ON payments(date DESC, status);
CREATE INDEX IF NOT EXISTS idx_payments_urgent_date ON payments(date DESC)
  WHERE is_urgent = true;

-- Purchase indexes
CREATE INDEX IF NOT EXISTS idx_purchases_date_status ON purchases(date DESC, status);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_due ON purchases(payment_due_date)
  WHERE payment_status = 'pending';

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date_type ON inventory_movements(created_at DESC, movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_location_product ON inventory(location_id, product_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 10 completed: Performance indexes created';
    RAISE NOTICE 'All critical tables are now optimized for fast queries';
END $$;
