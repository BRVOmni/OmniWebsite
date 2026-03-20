-- ============================================================================
-- MIGRATION 13: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervision_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICY: Admins can see/do everything
-- ============================================================================

CREATE POLICY "Admins can view all sales"
ON sales FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can insert sales"
ON sales FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can update all cash closings"
ON cash_closings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLICY: CFO can view all financial data
-- ============================================================================

CREATE POLICY "CFO can view all sales"
ON sales FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'cfo'
  )
);

CREATE POLICY "CFO can view all cash closings"
ON cash_closings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'cfo'
  )
);

CREATE POLICY "CFO can view all purchases"
ON purchases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'cfo'
  )
);

CREATE POLICY "CFO can view all payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'cfo'
  )
);

-- ============================================================================
-- POLICY: Managers can only see their location
-- ============================================================================

CREATE POLICY "Managers can view their location sales"
ON sales FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'manager'
  )
);

CREATE POLICY "Managers can view their location cash closings"
ON cash_closings FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'manager'
  )
);

CREATE POLICY "Managers can view their location alerts"
ON alerts FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'manager'
  )
);

-- ============================================================================
-- POLICY: Supervisors can view assigned locations
-- ============================================================================

CREATE POLICY "Supervisors can view their location visits"
ON supervision_visits FOR SELECT
USING (
  location_id IN (
    SELECT location_id FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'supervisor'
  )
  OR supervisor_id = auth.uid()
);

-- ============================================================================
-- POLICY: Viewers can read but not modify
-- ============================================================================

CREATE POLICY "Viewers can view sales"
ON sales FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'viewer'
  )
);

-- Note: Viewers cannot INSERT/UPDATE/DELETE because no policies allow it (default-deny)

-- ============================================================================
-- ENABLE AUTH USERS TO SEE THEIR OWN PROFILE
-- ============================================================================

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 13 completed: RLS policies enabled';
    RAISE NOTICE 'Users can only access data based on their role';
END $$;
