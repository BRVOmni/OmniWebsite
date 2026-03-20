-- ============================================================================
-- MIGRATION 18: Add Products Summary to Sales
-- ============================================================================
-- This updates existing sales records to include product information

-- First, get product names to use
WITH product_list AS (
  SELECT name FROM products
),

location_list AS (
  SELECT id FROM locations
)

-- Add products_summary to existing sales (first 100 without products_summary)
UPDATE sales s
SET products_summary = jsonb_build_array(
    jsonb_build_object(
        'name', pl.name,
        'quantity', (FLOOR(RANDOM() * 3) + 1)::INTEGER
    )
)
FROM (
    SELECT s.id
    FROM sales s
    WHERE s.products_summary IS NULL
    LIMIT 100
) sales_to_update
CROSS JOIN LATERAL (
    SELECT name FROM product_list ORDER BY RANDOM() LIMIT 1
) pl
WHERE s.id = sales_to_update.id;

-- Insert new sales with proper products_summary (80+ sales)
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
  products_summary,
  status
)
SELECT
  l.id,
  l.brand_id,
  c.id,
  pm.id,
  CURRENT_DATE - FLOOR(RANDOM() * 30)::INTEGER,
  CASE
    WHEN FLOOR(RANDOM() * 10)::INTEGER < 5 THEN '12:30:00'::time
    WHEN FLOOR(RANDOM() * 10)::INTEGER < 8 THEN '19:45:00'::time
    ELSE '15:20:00'::time
  END,
  'PROD-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0'),
  (RANDOM() * 100000 + 30000)::DECIMAL(12,2),
  (RANDOM() * 100000 + 30000)::DECIMAL(12,2),
  (FLOOR(RANDOM() * 4) + 1)::INTEGER,
  -- Create realistic products_summary with 1-3 items
  CASE
    WHEN RANDOM() < 0.33 THEN
      jsonb_build_array(
        jsonb_build_object(
          'name', (SELECT name FROM products WHERE name LIKE '%Burger%' ORDER BY RANDOM() LIMIT 1),
          'quantity', (FLOOR(RANDOM() * 2) + 1)::INTEGER
        )
      )
    WHEN RANDOM() < 0.66 THEN
      jsonb_build_array(
        jsonb_build_object(
          'name', (SELECT name FROM products WHERE name LIKE '%Pizza%' OR name LIKE '%Coca%' ORDER BY RANDOM() LIMIT 1),
          'quantity', 1
        ),
        jsonb_build_object(
          'name', (SELECT name FROM products WHERE name LIKE '%Fries%' OR name LIKE '%Beverage%' ORDER BY RANDOM() LIMIT 1),
          'quantity', (FLOOR(RANDOM() * 2) + 1)::INTEGER
        )
      )
    ELSE
      jsonb_build_array(
        jsonb_build_object(
          'name', (SELECT name FROM products ORDER BY RANDOM() LIMIT 1),
          'quantity', 1
        ),
        jsonb_build_object(
          'name', (SELECT name FROM products WHERE name LIKE '%Fries%' ORDER BY RANDOM() LIMIT 1),
          'quantity', 1
        ),
        jsonb_build_object(
          'name', (SELECT name FROM products ORDER BY RANDOM() LIMIT 1),
          'quantity', 1
        )
      )
  END,
  'completed'
FROM locations l
CROSS JOIN sales_channels c
CROSS JOIN payment_methods pm
CROSS JOIN generate_series(1, 10) -- 10 sales per location
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 18 completed: Products summary added to sales';
    RAISE NOTICE 'Products module now has sample data to display!';
    RAISE NOTICE 'Created 80+ new sales with product details';
END $$;
