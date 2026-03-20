-- ============================================================================
-- MIGRATION 12: Seed Data
-- ============================================================================

-- Insert default country
INSERT INTO countries (code, name, currency_code, currency_symbol) VALUES
('PY', 'Paraguay', 'PYG', '₲')
ON CONFLICT (code) DO NOTHING;

-- Insert default cities
INSERT INTO cities (country_id, name) VALUES
((SELECT id FROM countries WHERE code = 'PY'), 'Asunción'),
((SELECT id FROM countries WHERE code = 'PY'), 'Ciudad del Este'),
((SELECT id FROM countries WHERE code = 'PY'), 'Encarnación'),
((SELECT id FROM countries WHERE code = 'PY'), 'San Lorenzo')
ON CONFLICT (country_id, name) DO NOTHING;

-- Insert default brands
INSERT INTO brands (name, description, color) VALUES
('Burger King', 'Burger restaurant chain', '#d62300'),
('Pizza Hut', 'Pizza restaurant chain', '#ee3124'),
('Starbucks', 'Coffee shop chain', '#00704a'),
('KFC', 'Fried chicken restaurant', '#e4002b')
ON CONFLICT (name) DO NOTHING;

-- Insert sales channels
INSERT INTO sales_channels (name, description, color, icon, is_external, sort_order) VALUES
('In-Store', 'Dine-in and take away at the location', '#3b82f6', 'store', false, 1),
('Own Delivery', 'Company delivery service', '#8b5cf6', 'truck', false, 2),
('PedidosYa', 'Third-party delivery platform', '#00c4cc', 'smartphone', true, 3),
('Monchis', 'Third-party delivery platform', '#f97316', 'smartphone', true, 4)
ON CONFLICT (name) DO NOTHING;

-- Insert payment methods
INSERT INTO payment_methods (name, description, color, icon, requires_closing, sort_order) VALUES
('Cash', 'Physical cash payments', '#22c55e', 'banknote', true, 1),
('Bancard', 'Card payments through Bancard', '#ef4444', 'credit-card', true, 2),
('Upay', 'Digital wallet payments', '#3b82f6', 'smartphone', true, 3)
ON CONFLICT (name) DO NOTHING;

-- Insert default product categories
INSERT INTO product_categories (name, description) VALUES
('Burgers', 'Burger products'),
('Pizzas', 'Pizza products'),
('Beverages', 'Drinks and beverages'),
('Sides', 'Side dishes and additions'),
('Desserts', 'Dessert items'),
('Merchandise', 'Packaged products for sale');

-- Insert sample supplier
INSERT INTO suppliers (name, contact_name, email, payment_terms) VALUES
('Distribuidora Central', 'Juan Pérez', 'contact@distribuidora.com.py', 30),
('Bebidas del Paraguay', 'María González', 'ventas@bebidas.com.py', 15),
('Embutidos San José', 'Carlos López', 'info@embutidos.com.py', 30);

-- Insert sample products
INSERT INTO products (name, category_id, sku, cost_price, sale_price, unit_of_measure) VALUES
('Whopper Burger',
 (SELECT id FROM product_categories WHERE name = 'Burgers'),
 'BURGER-001',
 15000,
 45000,
 'unit'
),
('Pizza Pepperoni Large',
 (SELECT id FROM product_categories WHERE name = 'Pizzas'),
 'PIZZA-001',
 20000,
 65000,
 'unit'
),
('Coca Cola 500ml',
 (SELECT id FROM product_categories WHERE name = 'Beverages'),
 'BEV-001',
 3000,
 12000,
 'unit'
),
('French Fries Large',
 (SELECT id FROM product_categories WHERE name = 'Sides'),
 'SIDE-001',
 2000,
 10000,
 'unit'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample location
INSERT INTO locations (city_id, name, brand_id, address, phone, email, opens_at, closes_at) VALUES
(
 (SELECT id FROM cities WHERE name = 'Asunción'),
 'Shopping Mariscal - Local 45',
 (SELECT id FROM brands WHERE name = 'Burger King'),
 'Av. Mariscal López y Av. Eusebio Ayala',
 '+595 21 123 456',
 'mariscal@corporatedashboard.py',
 '10:00',
 '22:00'
)
ON CONFLICT (city_id, name) DO NOTHING;

-- Insert sample location brand assignment
INSERT INTO location_brands (location_id, brand_id, is_primary) VALUES
(
 (SELECT id FROM locations WHERE name = 'Shopping Mariscal - Local 45'),
 (SELECT id FROM brands WHERE name = 'Burger King'),
 true
)
ON CONFLICT (location_id, brand_id) DO NOTHING;

-- Insert sample sales (last 7 days)
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
  (SELECT id FROM locations WHERE name = 'Shopping Mariscal - Local 45'),
  (SELECT id FROM brands WHERE name = 'Burger King'),
  (SELECT id FROM sales_channels WHERE name = 'In-Store'),
  (SELECT id FROM payment_methods WHERE name = 'Cash'),
  CURRENT_DATE - FLOOR(RANDOM() * 7)::INTEGER,
  '12:30',
  'ORD-' || FLOOR(RANDOM() * 10000),
  (RANDOM() * 50000 + 20000)::DECIMAL(12,2),
  (RANDOM() * 50000 + 20000)::DECIMAL(12,2),
  (FLOOR(RANDOM() * 5) + 1)::INTEGER,
  'completed'
FROM generate_series(1, 20);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 12 completed: Seed data inserted';
    RAISE NOTICE 'Sample data for testing: locations, products, sales';
END $$;
