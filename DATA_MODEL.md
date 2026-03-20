# 🗄️ Data Model & Schema

**Corporate Food Service Dashboard**

---

## 📊 ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE ENTITIES                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Countries ──┬──> Cities ──┬──> Locations ──┬──> Sales
             │             │                ├──> CashClosings
             │             │                ├──> Purchases
             │             │                ├──> Payments
             │             │                ├──> SupervisionVisits
             │             │                ├──> Inventory
             │             │                └──> Alerts

Locations ───> LocationBrands <──┬── Brands
                              │
Products ───> ProductCategories
Products ───> Suppliers

Users ───> Roles ───> Permissions
```

---

## 📋 TABLE DEFINITIONS

### 1. Countries

```sql
CREATE TABLE countries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(3) UNIQUE NOT NULL,      -- PY, AR, BR, US, etc.
  name            VARCHAR(100) NOT NULL,
  currency_code   VARCHAR(3) NOT NULL,             -- PYG, USD, EUR, etc.
  currency_symbol VARCHAR(10) NOT NULL,            -- ₲, $, €, etc.
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_countries_active ON countries(active);
```

---

### 2. Cities

```sql
CREATE TABLE cities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  UUID REFERENCES countries(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_id, name)
);

-- Indexes
CREATE INDEX idx_cities_country_id ON cities(country_id);
CREATE INDEX idx_cities_active ON cities(active);
```

---

### 3. Brands

```sql
CREATE TABLE brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color       VARCHAR(7),                          -- Brand color for UI (#FF5733)
  logo_url    TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brands_active ON brands(active);
```

---

### 4. Locations

```sql
CREATE TABLE locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id         UUID REFERENCES cities(id) ON DELETE RESTRICT,
  name            VARCHAR(100) NOT NULL,
  address         TEXT,
  phone           VARCHAR(50),
  email           VARCHAR(255),
  opening_date    DATE,
  brand_id        UUID REFERENCES brands(id) ON DELETE SET NULL,  -- Primary brand

  -- Operational
  is_active       BOOLEAN DEFAULT true,
  opens_at        TIME,
  closes_at       TIME,

  -- Cash & Closing
  cash_tolerance  DECIMAL(10,2) DEFAULT 0,           -- Acceptable cash difference
  last_cash_close DATE,

  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(city_id, name)
);

-- Indexes
CREATE INDEX idx_locations_city_id ON locations(city_id);
CREATE INDEX idx_locations_brand_id ON locations(brand_id);
CREATE INDEX idx_locations_active ON locations(is_active);
CREATE INDEX idx_locations_opening_date ON locations(opening_date);
```

---

### 5. LocationBrands (Many-to-Many)

```sql
CREATE TABLE location_brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  brand_id    UUID REFERENCES brands(id) ON DELETE CASCADE,
  is_primary  BOOLEAN DEFAULT false,
  started_at  DATE DEFAULT CURRENT_DATE,
  active      BOOLEAN DEFAULT true,

  UNIQUE(location_id, brand_id)
);

-- Indexes
CREATE INDEX idx_location_brands_location ON location_brands(location_id);
CREATE INDEX idx_location_brands_brand ON location_brands(brand_id);
CREATE INDEX idx_location_brands_active ON location_brands(active);
```

---

### 6. SalesChannels

```sql
CREATE TABLE sales_channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50) UNIQUE NOT NULL,          -- In-store, Delivery, PedidosYa, Monchis
  description TEXT,
  color       VARCHAR(7),                          -- For UI
  icon        VARCHAR(50),                         -- Icon name
  is_external BOOLEAN DEFAULT false,                -- True for third-party (PedidosYa, etc.)
  active      BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sales_channels_active ON sales_channels(active);
```

---

### 7. PaymentMethods

```sql
CREATE TABLE payment_methods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50) UNIQUE NOT NULL,          -- Cash, Bancard, Upay
  description TEXT,
  color       VARCHAR(7),                          -- For UI
  icon        VARCHAR(50),                         -- Icon name
  requires_closing BOOLEAN DEFAULT true,           -- Requires cash closing
  active      BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_methods_active ON payment_methods(active);
```

---

### 8. Products

```sql
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  category_id     UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  sku             VARCHAR(100) UNIQUE,
  barcode         VARCHAR(100),

  -- Pricing
  cost_price      DECIMAL(10,2),
  sale_price      DECIMAL(10,2),

  -- Inventory
  current_stock   INTEGER DEFAULT 0,
  min_stock       INTEGER DEFAULT 0,               -- Alert threshold
  max_stock       INTEGER DEFAULT 0,

  -- Suppliers
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_sku    VARCHAR(100),

  -- Attributes
  unit_of_measure VARCHAR(20),                     -- kg, liter, unit, etc.
  is_active       BOOLEAN DEFAULT true,

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
```

---

### 9. ProductCategories

```sql
CREATE TABLE product_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  parent_id   UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  description TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_product_categories_active ON product_categories(active);
```

---

### 10. Suppliers

```sql
CREATE TABLE suppliers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  tax_id      VARCHAR(50),
  contact_name VARCHAR(255),
  email       VARCHAR(255),
  phone       VARCHAR(50),
  address     TEXT,
  city_id     UUID REFERENCES cities(id) ON DELETE SET NULL,
  country_id  UUID REFERENCES countries(id) ON DELETE SET NULL,
  payment_terms INTEGER,                           -- Days (30, 60, 90)
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_suppliers_active ON suppliers(active);
CREATE INDEX idx_suppliers_city ON suppliers(city_id);
```

---

### 11. Sales (Transactions)

```sql
CREATE TABLE sales (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id         UUID REFERENCES locations(id) ON DELETE RESTRICT,
  brand_id            UUID REFERENCES brands(id) ON DELETE SET NULL,
  channel_id          UUID REFERENCES sales_channels(id) ON DELETE RESTRICT,
  payment_method_id   UUID REFERENCES payment_methods(id) ON DELETE RESTRICT,

  -- Transaction Info
  date                DATE NOT NULL,
  time                TIME NOT NULL,
  order_number        VARCHAR(100),

  -- Financials
  total_amount        DECIMAL(12,2) NOT NULL,
  discount_amount     DECIMAL(12,2) DEFAULT 0,
  tax_amount          DECIMAL(12,2) DEFAULT 0,
  net_amount          DECIMAL(12,2) NOT NULL,      -- total_amount - discount_amount

  -- Items
  items_count         INTEGER DEFAULT 1,
  products_summary    JSONB,                        -- Quick product summary

  -- External
  is_external         BOOLEAN DEFAULT false,        -- PedidosYa, Monchis
  external_commission DECIMAL(12,2) DEFAULT 0,
  external_order_id   VARCHAR(255),

  -- Status
  status              VARCHAR(20) DEFAULT 'completed',  -- completed, cancelled, pending
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Metadata
  created_by          UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (CRITICAL FOR PERFORMANCE)
CREATE INDEX idx_sales_location_date ON sales(location_id, date DESC);
CREATE INDEX idx_sales_brand_date ON sales(brand_id, date DESC);
CREATE INDEX idx_sales_channel_date ON sales(channel_id, date DESC);
CREATE INDEX idx_sales_payment_date ON sales(payment_method_id, date DESC);
CREATE INDEX idx_sales_date ON sales(date DESC);
CREATE INDEX idx_sales_location_brand_date ON sales(location_id, brand_id, date DESC);
CREATE INDEX idx_sales_status ON sales(status);

-- Partition by year/month for large datasets (optional)
-- PARTITION BY RANGE (date);
```

---

### 12. SaleItems

```sql
CREATE TABLE sale_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id         UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Quantity & Price
  quantity        INTEGER NOT NULL,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_price     DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  cost_price      DECIMAL(10,2),

  -- Product snapshot (for historical accuracy)
  product_name    VARCHAR(255),
  product_sku     VARCHAR(100),

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);  -- For product analytics
```

---

### 13. CashClosings

```sql
CREATE TABLE cash_closings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id         UUID REFERENCES locations(id) ON DELETE RESTRICT,
  date                DATE NOT NULL,

  -- Expected amounts (system calculated)
  expected_cash       DECIMAL(12,2) DEFAULT 0,
  expected_bancard    DECIMAL(12,2) DEFAULT 0,
  expected_upay       DECIMAL(12,2) DEFAULT 0,
  expected_total      DECIMAL(12,2) DEFAULT 0,

  -- Actual amounts (counted/declared)
  actual_cash         DECIMAL(12,2) DEFAULT 0,
  actual_bancard      DECIMAL(12,2) DEFAULT 0,
  actual_upay         DECIMAL(12,2) DEFAULT 0,
  actual_total        DECIMAL(12,2) DEFAULT 0,

  -- Differences
  cash_difference     DECIMAL(12,2) DEFAULT 0,
  bancard_difference  DECIMAL(12,2) DEFAULT 0,
  upay_difference     DECIMAL(12,2) DEFAULT 0,
  total_difference    DECIMAL(12,2) DEFAULT 0,

  -- Petty cash
  petty_cash_rendered DECIMAL(12,2) DEFAULT 0,

  -- Status
  closing_status      VARCHAR(20) DEFAULT 'pending',  -- pending, closed_correctly, with_difference, under_review
  closed_at           TIMESTAMPTZ,
  closed_by           UUID REFERENCES users(id),

  -- Observations
  observation         TEXT,
  requires_review     BOOLEAN DEFAULT false,
  reviewed_by         UUID REFERENCES users(id),
  reviewed_at         TIMESTAMPTZ,

  -- Metadata
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(location_id, date)
);

-- Indexes
CREATE INDEX idx_cash_closings_location_date ON cash_closings(location_id, date DESC);
CREATE INDEX idx_cash_closings_status ON cash_closings(closing_status);
CREATE INDEX idx_cash_closings_requires_review ON cash_closings(requires_review) WHERE requires_review = true;
```

---

### 14. Purchases

```sql
CREATE TABLE purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID REFERENCES locations(id) ON DELETE RESTRICT,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE RESTRICT,

  -- Purchase Info
  date            DATE NOT NULL,
  invoice_number  VARCHAR(100),
  delivery_note   VARCHAR(100),

  -- Financials
  total_amount    DECIMAL(12,2) NOT NULL,
  tax_amount      DECIMAL(12,2) DEFAULT 0,
  net_amount      DECIMAL(12,2) NOT NULL,

  -- Payment
  payment_status  VARCHAR(20) DEFAULT 'pending',  -- pending, paid, partial, overdue
  payment_due_date DATE,
  payment_date    DATE,

  -- Status
  status          VARCHAR(20) DEFAULT 'received',  -- ordered, received, cancelled

  -- Metadata
  created_by      UUID REFERENCES users(id),
  approved_by     UUID REFERENCES users(id),
  observations    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_purchases_location_date ON purchases(location_id, date DESC);
CREATE INDEX idx_purchases_supplier_date ON purchases(supplier_id, date DESC);
CREATE INDEX idx_purchases_payment_status ON purchases(payment_status);
```

---

### 15. PurchaseItems

```sql
CREATE TABLE purchase_items (
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

-- Indexes
CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product ON purchase_items(product_id);
```

---

### 16. Payments

```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID REFERENCES locations(id) ON DELETE RESTRICT,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE RESTRICT,

  -- Payment Info
  date            DATE NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  payment_method  VARCHAR(50),                    -- transfer, cash, check, etc.

  -- Reference
  reference       VARCHAR(255),                   -- Invoice numbers, etc.
  bank_account    VARCHAR(100),

  -- Urgency
  is_urgent       BOOLEAN DEFAULT false,
  urgency_reason  TEXT,

  -- Status
  status          VARCHAR(20) DEFAULT 'pending',  -- pending, approved, paid, cancelled

  -- Approval
  requested_by    UUID REFERENCES users(id),
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,

  -- Observations
  observations    TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_location_date ON payments(location_id, date DESC);
CREATE INDEX idx_payments_supplier_date ON payments(supplier_id, date DESC);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_urgent ON payments(is_urgent) WHERE is_urgent = true;
```

---

### 17. SupervisionVisits

```sql
CREATE TABLE supervision_visits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID REFERENCES locations(id) ON DELETE RESTRICT,
  supervisor_id   UUID REFERENCES users(id) ON DELETE RESTRICT,

  -- Visit Info
  date            DATE NOT NULL,
  start_time      TIME,
  end_time        TIME,

  -- Scoring
  overall_score   INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),

  -- Status
  status          VARCHAR(20) DEFAULT 'pending',  -- pending, completed, cancelled

  -- Findings
  findings        JSONB,                         -- Array of findings
  critical_findings_count INTEGER DEFAULT 0,

  -- Follow-up
  corrective_actions_required BOOLEAN DEFAULT false,
  corrective_actions      JSONB,
  follow_up_visit_date    DATE,

  -- Report
  report_url      TEXT,
  observations    TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_supervision_visits_location_date ON supervision_visits(location_id, date DESC);
CREATE INDEX idx_supervision_visits_supervisor_date ON supervision_visits(supervisor_id, date DESC);
CREATE INDEX idx_supervision_visits_status ON supervision_visits(status);
```

---

### 18. Inventory

```sql
CREATE TABLE inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID REFERENCES locations(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,

  quantity        INTEGER NOT NULL DEFAULT 0,
  min_stock       INTEGER DEFAULT 0,
  max_stock       INTEGER DEFAULT 0,

  -- Alerts
  is_low_stock    BOOLEAN DEFAULT false,
  is_overstock    BOOLEAN DEFAULT false,
  last_stock_check DATE,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(location_id, product_id)
);

-- Indexes
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_low_stock ON inventory(location_id, is_low_stock) WHERE is_low_stock = true;
```

---

### 19. InventoryMovements

```sql
CREATE TABLE inventory_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id    UUID REFERENCES inventory(id) ON DELETE CASCADE,
  location_id     UUID REFERENCES locations(id) ON DELETE RESTRICT,
  product_id      UUID REFERENCES products(id) ON DELETE RESTRICT,

  -- Movement
  quantity        INTEGER NOT NULL,                -- Positive = entry, Negative = exit
  movement_type   VARCHAR(20) NOT NULL,            -- purchase, sale, adjustment, transfer, waste, return
  reference_id    UUID,                           -- Sale ID, Purchase ID, etc.

  -- Values
  unit_cost       DECIMAL(10,2),
  total_cost      DECIMAL(12,2),

  -- Metadata
  observations    TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inventory_movements_location_date ON inventory_movements(location_id, created_at DESC);
CREATE INDEX idx_inventory_movements_product_date ON inventory_movements(product_id, created_at DESC);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
```

---

### 20. Alerts

```sql
CREATE TABLE alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID REFERENCES locations(id) ON DELETE CASCADE,
  brand_id        UUID REFERENCES brands(id) ON DELETE SET NULL,

  -- Alert Info
  type            VARCHAR(50) NOT NULL,            -- cash, merchandise, payments, supervision, sales, profitability
  severity        VARCHAR(20) NOT NULL,            -- low, medium, high, critical
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,

  -- Related Data
  related_entity_type VARCHAR(50),                -- location, brand, product, supplier, user
  related_entity_id   UUID,
  related_date        DATE,

  -- Resolution
  status          VARCHAR(20) DEFAULT 'active',    -- active, acknowledged, resolved, dismissed
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by     UUID REFERENCES users(id),
  resolved_at     TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Actions
  suggested_action TEXT,
  action_taken    TEXT,

  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alerts_location_status ON alerts(location_id, status);
CREATE INDEX idx_alerts_type_severity ON alerts(type, severity);
CREATE INDEX idx_alerts_brand ON alerts(brand_id);
CREATE INDEX idx_alerts_active ON alerts(status) WHERE status = 'active';
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
```

---

### 21. Users

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  phone           VARCHAR(50),

  -- Role
  role            VARCHAR(50) NOT NULL,            -- admin, manager, supervisor, cfo, viewer, etc.
  role_id         UUID REFERENCES roles(id) ON DELETE SET NULL,

  -- Access
  location_id     UUID REFERENCES locations(id) ON DELETE SET NULL,  -- For location-specific users
  is_active       BOOLEAN DEFAULT true,

  -- Auth
  password_changed BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMPTZ,

  -- Profile
  avatar_url      TEXT,
  timezone        VARCHAR(50) DEFAULT 'America/Asuncion',
  language        VARCHAR(10) DEFAULT 'es',

  -- Timestamps
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(location_id);
CREATE INDEX idx_users_active ON users(is_active);
```

---

### 22. Roles

```sql
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  level       INTEGER NOT NULL,                   -- 1=viewer, 100=admin
  is_system   BOOLEAN DEFAULT false,              -- System roles cannot be deleted
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_roles_level ON roles(level);
```

---

### 23. Permissions

```sql
CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module      VARCHAR(50) NOT NULL,               -- sales, cash, purchases, etc.
  action      VARCHAR(50) NOT NULL,               -- view, create, edit, delete, approve
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_permissions_module ON permissions(module);
```

---

### 24. RolePermissions

```sql
CREATE TABLE role_permissions (
  role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted       BOOLEAN DEFAULT true,
  granted_at    TIMESTAMPTZ DEFAULT NOW(),
  granted_by    UUID REFERENCES users(id),

  PRIMARY KEY (role_id, permission_id)
);

-- Indexes
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
```

---

## 🎯 CRITICAL INDEXES SUMMARY

### Sales Analytics (Most Queried)
```sql
-- Location sales by date
CREATE INDEX idx_sales_location_date ON sales(location_id, date DESC);

-- Brand sales by date
CREATE INDEX idx_sales_brand_date ON sales(brand_id, date DESC);

-- Channel analytics
CREATE INDEX idx_sales_channel_date ON sales(channel_id, date DESC);

-- Payment method analytics
CREATE INDEX idx_sales_payment_date ON sales(payment_method_id, date DESC);

-- Global date queries
CREATE INDEX idx_sales_date ON sales(date DESC);

-- Combined location + brand + date (very common)
CREATE INDEX idx_sales_location_brand_date ON sales(location_id, brand_id, date DESC);
```

### Cash Closing (Critical for daily operations)
```sql
-- Location cash closings by date
CREATE INDEX idx_cash_closings_location_date ON cash_closings(location_id, date DESC);

-- Pending reviews
CREATE INDEX idx_cash_closings_requires_review ON cash_closings(requires_review)
WHERE requires_review = true;
```

### Alerts (Must be fast)
```sql
-- Active alerts by location
CREATE INDEX idx_alerts_location_status ON alerts(location_id, status);

-- Critical alerts
CREATE INDEX idx_alerts_type_severity ON alerts(type, severity);

-- All active alerts
CREATE INDEX idx_alerts_active ON alerts(status) WHERE status = 'active';
```

### Supervision (Compliance tracking)
```sql
-- Visits by location
CREATE INDEX idx_supervision_visits_location_date ON supervision_visits(location_id, date DESC);

-- Visits by supervisor
CREATE INDEX idx_supervision_visits_supervisor_date ON supervision_visits(supervisor_id, date DESC);

-- Pending visits
CREATE INDEX idx_supervision_visits_status ON supervision_visits(status);
```

---

## 📊 MATERIALIZED VIEWS (For Performance)

### mv_daily_sales_summary
```sql
CREATE MATERIALIZED VIEW mv_daily_sales_summary AS
SELECT
  date,
  location_id,
  brand_id,
  channel_id,
  COUNT(*) as orders_count,
  SUM(net_amount) as net_sales,
  SUM(total_amount) as gross_sales,
  AVG(net_amount) as avg_ticket,
  SUM(CASE WHEN is_external THEN external_commission ELSE 0 END) as external_commissions
FROM sales
WHERE status = 'completed'
GROUP BY date, location_id, brand_id, channel_id;

CREATE UNIQUE INDEX idx_mv_daily_sales_unique ON mv_daily_sales_summary(date, location_id, brand_id, channel_id);
```

### mv_location_daily_metrics
```sql
CREATE MATERIALIZED VIEW mv_location_daily_metrics AS
SELECT
  s.date,
  s.location_id,
  COUNT(DISTINCT s.id) as orders_count,
  SUM(s.net_amount) as net_sales,
  SUM(CASE WHEN s.payment_method_id = (SELECT id FROM payment_methods WHERE name = 'Cash') THEN s.net_amount ELSE 0 END) as cash_sales,
  SUM(CASE WHEN s.payment_method_id = (SELECT id FROM payment_methods WHERE name = 'Bancard') THEN s.net_amount ELSE 0 END) as bancard_sales,
  SUM(CASE WHEN s.payment_method_id = (SELECT id FROM payment_methods WHERE name = 'Upay') THEN s.net_amount ELSE 0 END) as upay_sales,
  COALESCE(cc.total_difference, 0) as cash_difference,
  COALESCE(sv.compliance_score, 0) as supervision_score,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active') as active_alerts_count
FROM sales s
LEFT JOIN cash_closings cc ON cc.location_id = s.location_id AND cc.date = s.date
LEFT JOIN supervision_visits sv ON sv.location_id = s.location_id AND sv.date = s.date AND sv.status = 'completed'
LEFT JOIN alerts a ON a.location_id = s.location_id AND a.related_date = s.date AND a.status = 'active'
WHERE s.status = 'completed'
GROUP BY s.date, s.location_id, cc.total_difference, sv.compliance_score;

CREATE UNIQUE INDEX idx_mv_location_daily_unique ON mv_location_daily_metrics(date, location_id);
```

### mv_alerts_summary
```sql
CREATE MATERIALIZED VIEW mv_alerts_summary AS
SELECT
  type,
  severity,
  status,
  location_id,
  brand_id,
  COUNT(*) as count,
  MAX(created_at) as latest_at
FROM alerts
GROUP BY type, severity, status, location_id, brand_id;

CREATE INDEX idx_mv_alerts_summary ON mv_alerts_summary(type, severity, status);
```

---

## 🔄 REFRESH FUNCTION

```sql
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS TABLE(
  view_name TEXT,
  duration_ms INTEGER,
  status TEXT
) AS $$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
BEGIN
  -- Refresh mv_daily_sales_summary
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales_summary;
  end_time := clock_timestamp();
  RETURN QUERY SELECT 'mv_daily_sales_summary'::TEXT, EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER, 'success'::TEXT;

  -- Refresh mv_location_daily_metrics
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_location_daily_metrics;
  end_time := clock_timestamp();
  RETURN QUERY SELECT 'mv_location_daily_metrics'::TEXT, EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER, 'success'::TEXT;

  -- Refresh mv_alerts_summary
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_alerts_summary;
  end_time := clock_timestamp();
  RETURN QUERY SELECT 'mv_alerts_summary'::TEXT, EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER, 'success'::TEXT;
END;
$$ LANGUAGE plpgsql;
```

---

## 📝 ROW LEVEL SECURITY (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervision_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policy examples (admin can see all, managers only their location)
CREATE POLICY "Admins can view all sales"
ON sales FOR SELECT
TO authenticated_users
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'superadmin', 'cfo')
  )
);

CREATE POLICY "Managers can view their location sales"
ON sales FOR SELECT
TO authenticated_users
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
  )
);
```

---

## 🎯 NEXT STEPS

1. ✅ Data model designed
2. ⏳ Generate migration scripts
3. ⏳ Create seed data for development
4. ⏳ Set up Supabase project
5. ⏳ Apply migrations
6. ⏳ Test performance with sample data

---

**Last Updated:** 2026-03-17
**Status:** ✅ Data Model Complete
