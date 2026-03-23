-- ============================================================================
-- Fix Corrective Actions: Add Missing Columns and Fix RLS
-- ============================================================================
-- This migration:
-- 1. Adds completed_at column (alias for actual_completion_date)
-- 2. Adds before_photos and after_photos array columns (for multiple photos)
-- 3. Copies data from old columns to new ones
-- 4. Fixes RLS policy using the same pattern as working tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add columns if they don't exist
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- Add completed_at as a generated column (alias for actual_completion_date)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'corrective_actions' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE corrective_actions
    ADD COLUMN completed_at DATE
    GENERATED ALWAYS AS (actual_completion_date) STORED;

    RAISE NOTICE 'Added completed_at generated column';
  END IF;

  -- Add before_photos array column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'corrective_actions' AND column_name = 'before_photos'
  ) THEN
    ALTER TABLE corrective_actions
    ADD COLUMN before_photos TEXT[];

    -- Copy existing data
    UPDATE corrective_actions
    SET before_photos = ARRAY[before_photo_url]
    WHERE before_photo_url IS NOT NULL;

    RAISE NOTICE 'Added before_photos array column and migrated data';
  END IF;

  -- Add after_photos array column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'corrective_actions' AND column_name = 'after_photos'
  ) THEN
    ALTER TABLE corrective_actions
    ADD COLUMN after_photos TEXT[];

    -- Copy existing data
    UPDATE corrective_actions
    SET after_photos = ARRAY[after_photo_url]
    WHERE after_photo_url IS NOT NULL;

    RAISE NOTICE 'Added after_photos array column and migrated data';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. Drop ALL existing policies on corrective_actions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated can view corrective_actions" ON corrective_actions;
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
DROP POLICY IF EXISTS "Viewers can view corrective actions" ON corrective_actions;

-- ----------------------------------------------------------------------------
-- 3. Create simple RLS policy using the same pattern as working tables
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated can view corrective_actions"
ON corrective_actions FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert corrective_actions"
ON corrective_actions FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update corrective_actions"
ON corrective_actions FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete corrective_actions"
ON corrective_actions FOR DELETE
USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 4. Add helpful comments
-- ----------------------------------------------------------------------------
COMMENT ON COLUMN corrective_actions.completed_at IS 'Generated column alias for actual_completion_date';
COMMENT ON COLUMN corrective_actions.before_photos IS 'Array of before photo URLs (migrated from before_photo_url)';
COMMENT ON COLUMN corrective_actions.after_photos IS 'Array of after photo URLs (migrated from after_photo_url)';

-- ----------------------------------------------------------------------------
-- 5. Success message
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE '1. Added completed_at, before_photos, after_photos columns';
    RAISE NOTICE '2. Migrated data from old columns to new ones';
    RAISE NOTICE '3. Fixed RLS policies using auth.role() pattern';
    RAISE NOTICE '4. Corrective actions page should now work correctly';
END $$;
