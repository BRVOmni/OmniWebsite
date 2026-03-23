-- ============================================================================
-- Fix Corrective Actions RLS Policies
-- ============================================================================
-- Uses the same pattern as working tables (sales, alerts, supervision_visits)
-- Key: Use auth.role() = 'authenticated' instead of TO authenticated USING (true)
-- ============================================================================

-- Drop ALL existing policies on corrective_actions
DROP POLICY IF EXISTS "Admins can do anything on actions" ON corrective_actions;
DROP POLICY IF EXISTS "Authenticated users can read actions" ON corrective_actions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON corrective_actions;
DROP POLICY IF EXISTS "Admins can view all corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Admins can insert corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Admins can update corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Admins can delete corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Supervisors can view their corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Supervisors can insert corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Supervisors can update corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Supervisors can view their location corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Managers can view their corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Managers can update their corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Managers can view their location corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Managers can update their location corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Viewers can view corrective actions" ON corrective_actions;
DROP POLICY IF EXISTS "Authenticated users can view corrective_actions" ON corrective_actions;

-- Create policy using the same pattern as working tables
CREATE POLICY "Authenticated can view corrective_actions"
ON corrective_actions FOR SELECT
USING (auth.role() = 'authenticated');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 20260323 completed: Corrective actions RLS fixed';
    RAISE NOTICE 'Policy now uses auth.role() = ''authenticated'' pattern';
    RAISE NOTICE 'This matches the pattern used by sales, alerts, and supervision_visits tables';
END $$;
