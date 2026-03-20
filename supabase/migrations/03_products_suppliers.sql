-- ============================================================================
-- MIGRATION 3: Products & Suppliers
-- ============================================================================

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  parent_id   UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  description TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  tax_id          VARCHAR(50),
  contact_name    VARCHAR(255),
  email           VARCHAR(255),
  phone           VARCHAR(50),
  address         TEXT,
  city_id         UUID REFERENCES cities(id) ON DELETE SET NULL,
  payment_terms   INTEGER,
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  category_id     UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  sku             VARCHAR(100) UNIQUE,
  barcode         VARCHAR(100),
  cost_price      DECIMAL(10,2),
  sale_price      DECIMAL(10,2),
  current_stock   INTEGER DEFAULT 0,
  min_stock       INTEGER DEFAULT 0,
  max_stock       INTEGER DEFAULT 0,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_sku    VARCHAR(100),
  unit_of_measure VARCHAR(20),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(active);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active);
CREATE INDEX IF NOT EXISTS idx_suppliers_city ON suppliers(city_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 3 completed: Products, Categories, and Suppliers created';
END $$;
