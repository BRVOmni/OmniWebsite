-- ============================================================================
-- MIGRATION 17: Data Access RLS Policies
-- ============================================================================
-- This allows authenticated users to read from operational data tables

-- Enable RLS on operational tables (if not already enabled)
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervision_visits ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read sales data
CREATE POLICY "Authenticated can view sales"
ON sales FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to read cash closings
CREATE POLICY "Authenticated can view cash closings"
ON cash_closings FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to read purchases
CREATE POLICY "Authenticated can view purchases"
ON purchases FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to read payments
CREATE POLICY "Authenticated can view payments"
ON payments FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to read alerts
CREATE POLICY "Authenticated can view alerts"
ON alerts FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to read location brands
CREATE POLICY "Authenticated can view location brands"
ON location_brands FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to read supervision visits
CREATE POLICY "Authenticated can view supervision visits"
ON supervision_visits FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert/update/delete (will be restricted by other policies later)
CREATE POLICY "Authenticated can insert sales"
ON sales FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update sales"
ON sales FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert cash closings"
ON cash_closings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update cash closings"
ON cash_closings FOR UPDATE
USING (auth.role() = 'authenticated');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 17 completed: Data access RLS policies created';
    RAISE NOTICE 'Authenticated users can now read from operational tables';
END $$;
