-- ============================================================================
-- MIGRATION 1: Core Tables
-- Countries, Cities, Brands
-- ============================================================================

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(3) UNIQUE NOT NULL,
  name            VARCHAR(100) NOT NULL,
  currency_code   VARCHAR(3) NOT NULL,
  currency_symbol VARCHAR(10) NOT NULL,
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  UUID REFERENCES countries(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_id, name)
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color       VARCHAR(7),
  logo_url    TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Core Tables
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_active ON countries(active);
CREATE INDEX IF NOT EXISTS idx_cities_country_id ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(active);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(active);

-- Functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 1 completed: Core tables created (countries, cities, brands)';
END $$;
