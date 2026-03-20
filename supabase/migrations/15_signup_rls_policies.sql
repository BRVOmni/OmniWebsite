-- ============================================================================
-- MIGRATION 15: Signup RLS Policies
-- ============================================================================
-- Allows users to create their own profiles during signup

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 15 completed: Signup RLS policies created';
    RAISE NOTICE 'Users can now create their own profiles during signup';
END $$;
