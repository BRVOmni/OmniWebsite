-- ============================================================================
-- MIGRATION 11: Materialized Views
-- ============================================================================

-- Materialized View: Daily Sales Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_sales_summary AS
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

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_sales_unique
  ON mv_daily_sales_summary(date, location_id, brand_id, channel_id);

-- Materialized View: Location Daily Metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_location_daily_metrics AS
SELECT
  s.date,
  s.location_id,
  COUNT(DISTINCT s.id) as orders_count,
  SUM(s.net_amount) as net_sales,
  SUM(CASE WHEN pm.name = 'Cash' THEN s.net_amount ELSE 0 END) as cash_sales,
  SUM(CASE WHEN pm.name = 'Bancard' THEN s.net_amount ELSE 0 END) as bancard_sales,
  SUM(CASE WHEN pm.name = 'Upay' THEN s.net_amount ELSE 0 END) as upay_sales,
  COALESCE(cc.total_difference, 0) as cash_difference,
  COALESCE(sv.compliance_score, 0) as supervision_score,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active') as active_alerts_count
FROM sales s
LEFT JOIN cash_closings cc ON cc.location_id = s.location_id AND cc.date = s.date
LEFT JOIN supervision_visits sv ON sv.location_id = s.location_id AND sv.date = s.date
  AND sv.status = 'completed'
LEFT JOIN alerts a ON a.location_id = s.location_id AND a.related_date = s.date
  AND a.status = 'active'
LEFT JOIN payment_methods pm ON pm.id = s.payment_method_id
WHERE s.status = 'completed'
GROUP BY s.date, s.location_id, cc.total_difference, sv.compliance_score;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_location_daily_unique
  ON mv_location_daily_metrics(date, location_id);

-- Materialized View: Alerts Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_alerts_summary AS
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

CREATE INDEX IF NOT EXISTS idx_mv_alerts_summary
  ON mv_alerts_summary(type, severity, status);

-- Function to refresh all materialized views
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
  RETURN QUERY SELECT 'mv_daily_sales_summary'::TEXT,
    EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER,
    'success'::TEXT;

  -- Refresh mv_location_daily_metrics
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_location_daily_metrics;
  end_time := clock_timestamp();
  RETURN QUERY SELECT 'mv_location_daily_metrics'::TEXT,
    EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER,
    'success'::TEXT;

  -- Refresh mv_alerts_summary
  start_time := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_alerts_summary;
  end_time := clock_timestamp();
  RETURN QUERY SELECT 'mv_alerts_summary'::TEXT,
    EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER,
    'success'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 11 completed: Materialized views created';
    RAISE NOTICE 'Refresh function created: refresh_materialized_views()';
END $$;
