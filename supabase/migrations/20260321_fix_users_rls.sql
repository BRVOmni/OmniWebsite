-- Fix Users Table RLS Policies
-- Allows admins to manage users while maintaining security

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON users;
DROP POLICY IF EXISTS "Users can view all data" ON users;
DROP POLICY IF EXISTS "Service role can do everything" ON users;

-- Create policies that allow admins to manage users
CREATE POLICY "Authenticated users can view users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if current user is admin
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    -- Allow service role (for signup/auth process)
    OR pg_has_role(current_user, 'service_role')
  );

CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow if current user is admin
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
    -- Allow users to update their own full_name
    OR (id = auth.uid())
  );

CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    -- Allow if current user is admin
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
