-- ============================================================================
-- MIGRATION 6: Purchases & Payments
-- ============================================================================

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID REFERENCES locations(id) ON DELETE RESTRICT,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
  date            DATE NOT NULL,
  invoice_number  VARCHAR(100),
  delivery_note   VARCHAR(100),
  total_amount    DECIMAL(12,2) NOT NULL,
  tax_amount      DECIMAL(12,2) DEFAULT 0,
  net_amount      DECIMAL(12,2) NOT NULL,
  payment_status  VARCHAR(20) DEFAULT 'pending',
  payment_due_date DATE,
  payment_date    DATE,
  status          VARCHAR(20) DEFAULT 'received',
  created_by      UUID,
  approved_by     UUID,
  observations    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Items
CREATE TABLE IF NOT EXISTS purchase_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id     UUID REFERENCES purchases(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity        INTEGER NOT NULL,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_price     DECIMAL(12,2) NOT NULL,
  product_name    VARCHAR(255),
  product_sku     VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID REFERENCES locations(id) ON DELETE RESTRICT,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
  date            DATE NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  payment_method  VARCHAR(50),
  reference       VARCHAR(255),
  bank_account    VARCHAR(100),
  is_urgent       BOOLEAN DEFAULT false,
  urgency_reason  TEXT,
  status          VARCHAR(20) DEFAULT 'pending',
  requested_by    UUID,
  approved_by     UUID,
  approved_at     TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  observations    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_location_date ON purchases(location_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_date ON purchases(supplier_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_location_date ON payments(location_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_supplier_date ON payments(supplier_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_urgent ON payments(is_urgent) WHERE is_urgent = true;

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product ON purchase_items(product_id);

-- Triggers for updated_at
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 6 completed: Purchases and Payments tables created';
END $$;
