-- ============================================================================
-- MIGRATION 2: Locations & Sales Channels
-- ============================================================================

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id         UUID REFERENCES cities(id) ON DELETE RESTRICT,
  name            VARCHAR(100) NOT NULL,
  address         TEXT,
  phone           VARCHAR(50),
  email           VARCHAR(255),
  opening_date    DATE,
  brand_id        UUID REFERENCES brands(id) ON DELETE SET NULL,
  is_active       BOOLEAN DEFAULT true,
  opens_at        TIME,
  closes_at       TIME,
  cash_tolerance  DECIMAL(10,2) DEFAULT 0,
  last_cash_close DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, name)
);

-- LocationBrands (Many-to-Many)
CREATE TABLE IF NOT EXISTS location_brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  brand_id    UUID REFERENCES brands(id) ON DELETE CASCADE,
  is_primary  BOOLEAN DEFAULT false,
  started_at  DATE DEFAULT CURRENT_DATE,
  active      BOOLEAN DEFAULT true,
  UNIQUE(location_id, brand_id)
);

-- Sales Channels
CREATE TABLE IF NOT EXISTS sales_channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color       VARCHAR(7),
  icon        VARCHAR(50),
  is_external BOOLEAN DEFAULT false,
  active      BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(50) UNIQUE NOT NULL,
  description      TEXT,
  color            VARCHAR(7),
  icon             VARCHAR(50),
  requires_closing BOOLEAN DEFAULT true,
  active           BOOLEAN DEFAULT true,
  sort_order       INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_locations_city_id ON locations(city_id);
CREATE INDEX IF NOT EXISTS idx_locations_brand_id ON locations(brand_id);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);
CREATE INDEX IF NOT EXISTS idx_location_brands_location ON location_brands(location_id);
CREATE INDEX IF NOT EXISTS idx_location_brands_brand ON location_brands(brand_id);
CREATE INDEX IF NOT EXISTS idx_location_brands_active ON location_brands(active);
CREATE INDEX IF NOT EXISTS idx_sales_channels_active ON sales_channels(active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(active);

-- Triggers for updated_at
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 2 completed: Locations, Sales Channels, Payment Methods created';
END $$;
