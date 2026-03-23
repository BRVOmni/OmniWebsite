-- ============================================================================
-- MIGRATION 24: Forecasting Materialized Views
-- ============================================================================
-- Creates optimized views for forecasting queries
-- These views aggregate sales data for fast forecast generation

-- ============================================================================
-- DAILY SALES FORECASTING VIEW
-- ============================================================================

-- Materialized view for sales forecasting data
-- Aggregates sales by day, location, brand, and channel
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_sales_forecasting AS
SELECT
  date,
  location_id,
  brand_id,
  channel_id,
  COUNT(*) as orders_count,
  SUM(net_amount) as net_sales,
  SUM(total_amount) as gross_sales,
  AVG(net_amount) as avg_ticket,
  SUM(items_count) as total_items
FROM sales
WHERE status = 'completed'
GROUP BY date, location_id, brand_id, channel_id
ORDER BY date DESC;

-- Index for fast date range queries
CREATE INDEX IF NOT EXISTS idx_mv_daily_sales_forecasting_date
  ON mv_daily_sales_forecasting(date DESC);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_mv_daily_sales_forecasting_location
  ON mv_daily_sales_forecasting(location_id, date DESC);

-- Index for brand-based queries
CREATE INDEX IF NOT EXISTS idx_mv_daily_sales_forecasting_brand
  ON mv_daily_sales_forecasting(brand_id, date DESC);

-- ============================================================================
-- PRODUCT DAILY SALES VIEW (for Inventory Forecasting)
-- ============================================================================

-- Materialized view for product-level sales
-- Aggregates product sales by day
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_product_daily_sales AS
SELECT
  s.date,
  si.product_id,
  COALESCE(si.product_name, p.name) as product_name,
  COALESCE(p.category, 'Other') as category,
  SUM(si.quantity) as quantity_sold,
  COUNT(DISTINCT s.id) as orders_count,
  SUM(si.total_price) as total_revenue,
  AVG(si.unit_price) as avg_unit_price
FROM sale_items si
JOIN sales s ON s.id = si.sale_id
LEFT JOIN products p ON p.id = si.product_id
WHERE s.status = 'completed'
GROUP BY s.date, si.product_id, si.product_name, p.name, p.category
ORDER BY s.date DESC, quantity_sold DESC;

-- Index for product queries
CREATE INDEX IF NOT EXISTS idx_mv_product_daily_sales_date
  ON mv_product_daily_sales(date DESC);

CREATE INDEX IF NOT EXISTS idx_mv_product_daily_sales_product
  ON mv_product_daily_sales(product_id, date DESC);

-- ============================================================================
-- HOURLY SALES VIEW (for Staffing Forecasting)
-- ============================================================================

-- Materialized view for hourly sales patterns
-- Aggregates sales by hour of day for staffing predictions
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_hourly_sales_patterns AS
SELECT
  location_id,
  EXTRACT(DOW FROM date::timestamp) as day_of_week, -- 0=Sunday, 6=Saturday
  EXTRACT(HOUR FROM time::timestamp) as hour,
  COUNT(*) as orders_count,
  SUM(net_amount) as net_sales,
  AVG(net_amount) as avg_ticket
FROM sales
WHERE status = 'completed'
GROUP BY location_id, EXTRACT(DOW FROM date::timestamp), EXTRACT(HOUR FROM time::timestamp)
ORDER BY location_id, day_of_week, hour;

-- Index for hourly pattern queries
CREATE INDEX IF NOT EXISTS idx_mv_hourly_sales_patterns_location
  ON mv_hourly_sales_patterns(location_id, day_of_week, hour);

-- ============================================================================
-- UPDATE REFRESH FUNCTION
-- ============================================================================

-- Add new views to the refresh function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  -- Refresh existing views
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_location_daily_metrics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales_summary;

  -- Refresh forecasting views
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales_forecasting;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_daily_sales;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hourly_sales_patterns;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON mv_daily_sales_forecasting TO authenticated;
GRANT SELECT ON mv_product_daily_sales TO authenticated;
GRANT SELECT ON mv_hourly_sales_patterns TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON MATERIALIZED VIEW mv_daily_sales_forecasting IS
'Aggregated daily sales data for forecasting. Grouped by date, location, brand, and channel.';

COMMENT ON MATERIALIZED VIEW mv_product_daily_sales IS
'Product-level daily sales data for inventory forecasting. Shows quantity sold and order count per product.';

COMMENT ON MATERIALIZED VIEW mv_hourly_sales_patterns IS
'Hourly sales patterns for staffing forecasts. Shows orders and revenue by day of week and hour.';

COMMENT ON FUNCTION refresh_materialized_views() IS
'Refreshes all materialized views including forecasting views. Run after data imports or periodically.';
