-- ============================================================================
-- MIGRATION 14: Public Access Policies for Reference Data
-- ============================================================================
-- This allows the anon key (unauthenticated users) to read reference data
-- needed for the application to function

-- Enable RLS on reference tables (if not already enabled)
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Public read access for reference tables
CREATE POLICY "Public can view countries"
ON countries FOR SELECT
USING (true);

CREATE POLICY "Public can view cities"
ON cities FOR SELECT
USING (true);

CREATE POLICY "Public can view brands"
ON brands FOR SELECT
USING (true);

CREATE POLICY "Public can view sales channels"
ON sales_channels FOR SELECT
USING (true);

CREATE POLICY "Public can view payment methods"
ON payment_methods FOR SELECT
USING (true);

CREATE POLICY "Public can view product categories"
ON product_categories FOR SELECT
USING (true);

CREATE POLICY "Public can view suppliers"
ON suppliers FOR SELECT
USING (true);

CREATE POLICY "Public can view products"
ON products FOR SELECT
USING (true);

CREATE POLICY "Public can view locations"
ON locations FOR SELECT
USING (true);

-- Allow authenticated users to insert/update (will be further restricted by other policies)
CREATE POLICY "Authenticated can insert countries"
ON countries FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert cities"
ON cities FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 14 completed: Public RLS policies created';
    RAISE NOTICE 'Reference tables now allow public read access';
END $$;
