-- ============================================================================
-- MIGRATION 16: Comprehensive Seed Data
-- ============================================================================
-- This creates multiple locations, cash closings, and more sales data
-- to properly test all modules

-- Insert more locations
INSERT INTO locations (city_id, name, brand_id, address, phone, email, opens_at, closes_at) VALUES
-- Asunción locations
((SELECT id FROM cities WHERE name = 'Asunción'), 'Shopping Mariscal - Local 45', (SELECT id FROM brands WHERE name = 'Burger King'), 'Av. Mariscal López y Av. Eusebio Ayala', '+595 21 123 456', 'mariscal@corp.py', '10:00', '22:00'),
((SELECT id FROM cities WHERE name = 'Asunción'), 'Shopping del Sol - Local 12', (SELECT id FROM brands WHERE name = 'Pizza Hut'), 'Av. Aviadores del Chaco', '+595 21 234 567', 'delsol@corp.py', '11:00', '23:00'),
((SELECT id FROM cities WHERE name = 'Asunción'), 'Mcal. Lopez 1234', (SELECT id FROM brands WHERE name = 'Starbucks'), 'Av. Mariscal López 1234', '+595 21 345 678', 'starbucks1@corp.py', '07:00', '22:00'),
((SELECT id FROM cities WHERE name = 'Asunción'), 'Villa Morra Center', (SELECT id FROM brands WHERE name = 'KFC'), 'Av. Eusebio Ayala c/ Venezuela', '+595 21 456 789', 'kfc1@corp.py', '10:30', '22:30'),

-- Ciudad del Este locations
((SELECT id FROM cities WHERE name = 'Ciudad del Este'), 'Shopping Paris - Local 8', (SELECT id FROM brands WHERE name = 'Burger King'), 'Av. Principal y CME', '+595 61 123 456', 'paris@corp.py', '10:00', '22:00'),
((SELECT id FROM cities WHERE name = 'Ciudad del Este'), 'AcuÑa 234', (SELECT id FROM brands WHERE name = 'Pizza Hut'), 'Av. Acuña Carballo 234', '+595 61 234 567', 'acetua@corp.py', '11:00', '23:00'),

-- Encarnación location
((SELECT id FROM cities WHERE name = 'Encarnación'), 'Costanera 456', (SELECT id FROM brands WHERE name = 'Starbucks'), 'Av. Costanera 456', '+595 71 123 456', 'encarnacion@corp.py', '08:00', '21:00'),

-- San Lorenzo location
((SELECT id FROM cities WHERE name = 'San Lorenzo'), 'Route 2 KM 5', (SELECT id FROM brands WHERE name = 'KFC'), 'Ruta 2 Km 5', '+595 21 567 890', 'sanlorenzo@corp.py', '10:00', '22:00')
ON CONFLICT (city_id, name) DO NOTHING;

-- Insert location brand assignments
INSERT INTO location_brands (location_id, brand_id, is_primary)
SELECT l.id, b.id, true
FROM locations l
JOIN brands b ON b.name = CASE
  WHEN l.name LIKE '%Burger King%' THEN 'Burger King'
  WHEN l.name LIKE '%Pizza Hut%' THEN 'Pizza Hut'
  WHEN l.name LIKE '%Starbucks%' THEN 'Starbucks'
  WHEN l.name LIKE '%KFC%' THEN 'KFC'
  ELSE 'Burger King'
END
ON CONFLICT (location_id, brand_id) DO NOTHING;

-- Insert more sales data for all locations (last 30 days)
INSERT INTO sales (
  location_id,
  brand_id,
  channel_id,
  payment_method_id,
  date,
  time,
  order_number,
  total_amount,
  net_amount,
  items_count,
  status
)
SELECT
  l.id,
  l.brand_id,
  c.id,
  pm.id,
  CURRENT_DATE - FLOOR(RANDOM() * 30)::INTEGER,
  (CASE WHEN FLOOR(RANDOM() * 10)::INTEGER < 5 THEN '12:30:00'::time WHEN FLOOR(RANDOM() * 10)::INTEGER < 8 THEN '19:45:00'::time ELSE '15:20:00'::time END),
  'ORD-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0'),
  (RANDOM() * 80000 + 25000)::DECIMAL(12,2),
  (RANDOM() * 80000 + 25000)::DECIMAL(12,2),
  (FLOOR(RANDOM() * 6) + 1)::INTEGER,
  'completed'
FROM locations l
CROSS JOIN sales_channels c
CROSS JOIN payment_methods pm
CROSS JOIN generate_series(1, 15)
ON CONFLICT DO NOTHING;

-- Insert cash closings (last 7 days)
INSERT INTO cash_closings (
  location_id,
  date,
  expected_cash,
  expected_bancard,
  expected_upay,
  expected_total,
  actual_cash,
  actual_bancard,
  actual_upay,
  actual_total,
  cash_difference,
  bancard_difference,
  upay_difference,
  total_difference,
  petty_cash_rendered,
  closing_status,
  requires_review
)
SELECT
  l.id,
  CURRENT_DATE - FLOOR(RANDOM() * 7)::INTEGER,
  -- Expected amounts
  (RANDOM() * 300000 + 100000)::DECIMAL(12,2),
  (RANDOM() * 400000 + 150000)::DECIMAL(12,2),
  (RANDOM() * 200000 + 50000)::DECIMAL(12,2),
  (RANDOM() * 900000 + 300000)::DECIMAL(12,2),
  -- Actual amounts (with small random differences)
  (RANDOM() * 300000 + 100000)::DECIMAL(12,2) + (RANDOM() * 10000 - 5000)::DECIMAL(12,2),
  (RANDOM() * 400000 + 150000)::DECIMAL(12,2) + (RANDOM() * 5000 - 2500)::DECIMAL(12,2),
  (RANDOM() * 200000 + 50000)::DECIMAL(12,2) + (RANDOM() * 3000 - 1500)::DECIMAL(12,2),
  (RANDOM() * 900000 + 300000)::DECIMAL(12,2) + (RANDOM() * 15000 - 7500)::DECIMAL(12,2),
  -- Differences
  (RANDOM() * 10000 - 5000)::DECIMAL(12,2),
  (RANDOM() * 5000 - 2500)::DECIMAL(12,2),
  (RANDOM() * 3000 - 1500)::DECIMAL(12,2),
  (RANDOM() * 15000 - 7500)::DECIMAL(12,2),
  -- Petty cash
  (RANDOM() * 100000 + 50000)::DECIMAL(12,2),
  -- Status (80% closed correctly, 15% with difference, 5% under review)
  CASE
    WHEN RANDOM() < 0.80 THEN 'closed_correctly'
    WHEN RANDOM() < 0.95 THEN 'with_difference'
    ELSE 'under_review'
  END,
  CASE
    WHEN RANDOM() < 0.85 THEN false
    ELSE true
  END
FROM locations l
CROSS JOIN generate_series(1, 5) -- 5 closings per location
ON CONFLICT DO NOTHING;

-- Insert sample alerts
INSERT INTO alerts (
  location_id,
  brand_id,
  type,
  severity,
  title,
  description,
  status,
  created_at
)
SELECT
  l.id,
  l.brand_id,
  CASE
    WHEN RANDOM() < 0.2 THEN 'cash'
    WHEN RANDOM() < 0.4 THEN 'profitability'
    WHEN RANDOM() < 0.6 THEN 'supervision'
    WHEN RANDOM() < 0.8 THEN 'merchandise'
    ELSE 'sales'
  END,
  CASE
    WHEN RANDOM() < 0.3 THEN 'critical'
    WHEN RANDOM() < 0.6 THEN 'high'
    WHEN RANDOM() < 0.85 THEN 'medium'
    ELSE 'low'
  END,
  CASE
    WHEN RANDOM() < 0.2 THEN 'Cash Shortage Detected'
    WHEN RANDOM() < 0.4 THEN 'High Food Cost Alert'
    WHEN RANDOM() < 0.6 THEN 'Supervision Visit Required'
    WHEN RANDOM() < 0.8 THEN 'Stock Shortage Warning'
    ELSE 'Sales Drop Alert'
  END,
  CASE
    WHEN RANDOM() < 0.2 THEN 'Cash shortage detected in daily closing'
    WHEN RANDOM() < 0.4 THEN 'Food cost above 35% threshold'
    WHEN RANDOM() < 0.6 THEN 'No supervision visit in 10 days'
    WHEN RANDOM() < 0.8 THEN 'Critical stock shortage: Burgers'
    ELSE 'Sales dropped 15% vs last week'
  END,
  CASE
    WHEN RANDOM() < 0.7 THEN 'resolved'
    ELSE 'active'
  END,
  CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '10 days')
FROM locations l
CROSS JOIN generate_series(1, 3) -- 3 alerts per location
ON CONFLICT DO NOTHING;

-- Insert sample purchases
INSERT INTO purchases (
  location_id,
  supplier_id,
  date,
  invoice_number,
  total_amount,
  tax_amount,
  net_amount,
  payment_status,
  status
)
SELECT
  l.id,
  (SELECT id FROM suppliers ORDER BY RANDOM() LIMIT 1),
  CURRENT_DATE - FLOOR(RANDOM() * 15)::INTEGER,
  'INV-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0'),
  (RANDOM() * 5000000 + 1000000)::DECIMAL(12,2),
  (RANDOM() * 500000)::DECIMAL(12,2),
  (RANDOM() * 5000000 + 1000000)::DECIMAL(12,2),
  CASE
    WHEN RANDOM() < 0.5 THEN 'paid'
    WHEN RANDOM() < 0.8 THEN 'pending'
    ELSE 'partial'
  END,
  'received'
FROM locations l
CROSS JOIN generate_series(1, 5) -- 5 purchases per location
ON CONFLICT DO NOTHING;

-- Insert sample payments
INSERT INTO payments (
  location_id,
  supplier_id,
  date,
  amount,
  payment_method,
  is_urgent,
  status
)
SELECT
  l.id,
  (SELECT id FROM suppliers ORDER BY RANDOM() LIMIT 1),
  CURRENT_DATE - FLOOR(RANDOM() * 20)::INTEGER,
  (RANDOM() * 3000000 + 500000)::DECIMAL(12,2),
  CASE
    WHEN RANDOM() < 0.4 THEN 'transfer'
    WHEN RANDOM() < 0.7 THEN 'cash'
    ELSE 'check'
  END,
  RANDOM() < 0.2, -- 20% urgent
  CASE
    WHEN RANDOM() < 0.5 THEN 'paid'
    WHEN RANDOM() < 0.8 THEN 'approved'
    ELSE 'pending'
  END
FROM locations l
CROSS JOIN generate_series(1, 3) -- 3 payments per location
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 16 completed: Comprehensive seed data inserted';
    RAISE NOTICE 'Created: 8 locations, cash closings, alerts, purchases, payments';
    RAISE NOTICE 'All modules now have sample data for testing!';
END $$;
