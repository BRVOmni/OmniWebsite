-- ============================================================================
-- MIGRATION 4: Sales Tables
-- ============================================================================

-- Sales (Transactions)
CREATE TABLE IF NOT EXISTS sales (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id         UUID REFERENCES locations(id) ON DELETE RESTRICT,
  brand_id            UUID REFERENCES brands(id) ON DELETE SET NULL,
  channel_id          UUID REFERENCES sales_channels(id) ON DELETE RESTRICT,
  payment_method_id   UUID REFERENCES payment_methods(id) ON DELETE RESTRICT,
  date                DATE NOT NULL,
  time                TIME NOT NULL,
  order_number        VARCHAR(100),
  total_amount        DECIMAL(12,2) NOT NULL,
  discount_amount     DECIMAL(12,2) DEFAULT 0,
  tax_amount          DECIMAL(12,2) DEFAULT 0,
  net_amount          DECIMAL(12,2) NOT NULL,
  items_count         INTEGER DEFAULT 1,
  products_summary    JSONB,
  is_external         BOOLEAN DEFAULT false,
  external_commission DECIMAL(12,2) DEFAULT 0,
  external_order_id   VARCHAR(255),
  status              VARCHAR(20) DEFAULT 'completed',
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_by          UUID,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id         UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity        INTEGER NOT NULL,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_price     DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  cost_price      DECIMAL(10,2),
  product_name    VARCHAR(255),
  product_sku     VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Sales (CRITICAL FOR PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_sales_location_date ON sales(location_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_brand_date ON sales(brand_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_channel_date ON sales(channel_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payment_date ON sales(payment_method_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_location_brand_date ON sales(location_id, brand_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);

-- Trigger for updated_at
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 4 completed: Sales and Sale Items tables created';
END $$;
