-- ============================================================================
-- MIGRATION 23: User Permissions System
-- ============================================================================

-- User Permissions Table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Module Access (which pages they can see)
  can_view_executive_summary BOOLEAN DEFAULT true,
  can_view_sales BOOLEAN DEFAULT true,
  can_view_profitability BOOLEAN DEFAULT true,
  can_view_cash_closing BOOLEAN DEFAULT true,
  can_view_locations BOOLEAN DEFAULT true,
  can_view_products BOOLEAN DEFAULT true,
  can_view_brands BOOLEAN DEFAULT true,
  can_view_alerts BOOLEAN DEFAULT true,
  can_view_supervision BOOLEAN DEFAULT true,
  can_view_purchases BOOLEAN DEFAULT true,
  can_view_payments BOOLEAN DEFAULT true,

  -- Location Access (which locations they can see)
  location_access TEXT[] DEFAULT '{}', -- empty = all

  -- Brand Access (which brands they can see)
  brand_access TEXT[] DEFAULT '{}', -- empty = all

  -- Additional Permissions
  can_create_users BOOLEAN DEFAULT false,
  can_edit_users BOOLEAN DEFAULT false,
  can_delete_users BOOLEAN DEFAULT false,
  can_reset_passwords BOOLEAN DEFAULT false,
  can_configure_settings BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- RLS Policies
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own permissions"
  ON user_permissions FOR SELECT
  USING (auth.uid() IN (SELECT id FROM users WHERE id = user_permissions.user_id));

CREATE POLICY "Admins can view all permissions"
  ON user_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert permissions"
  ON user_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update permissions"
  ON user_permissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete permissions"
  ON user_permissions FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to create permissions for new user (fixed parameter names)
CREATE OR REPLACE FUNCTION create_user_permissions(p_user_id UUID, p_user_role TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_permissions (user_id, can_view_supervision)
  VALUES (p_user_id, true)
  ON CONFLICT (user_id) DO NOTHING;

  IF p_user_role = 'admin' THEN
    UPDATE user_permissions SET
      can_view_executive_summary = true,
      can_view_sales = true,
      can_view_profitability = true,
      can_view_cash_closing = true,
      can_view_locations = true,
      can_view_products = true,
      can_view_brands = true,
      can_view_alerts = true,
      can_view_supervision = true,
      can_view_purchases = true,
      can_view_payments = true,
      can_create_users = true,
      can_edit_users = true,
      can_delete_users = true,
      can_reset_passwords = true,
      can_configure_settings = true
    WHERE user_id = p_user_id;

  ELSIF p_user_role = 'branch_manager' THEN
    UPDATE user_permissions SET
      can_view_executive_summary = true,
      can_view_sales = true,
      can_view_profitability = false,
      can_view_cash_closing = true,
      can_view_locations = true,
      can_view_products = false,
      can_view_brands = true,
      can_view_alerts = true,
      can_view_supervision = false,
      can_view_purchases = false,
      can_view_payments = true
    WHERE user_id = p_user_id;

  ELSIF p_user_role = 'supervisor' THEN
    UPDATE user_permissions SET
      can_view_supervision = true
    WHERE user_id = p_user_id;

  ELSIF p_user_role = 'viewer' THEN
    UPDATE user_permissions SET
      can_view_executive_summary = true,
      can_view_sales = true,
      can_view_alerts = true
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create permissions when user is created
CREATE OR REPLACE FUNCTION on_user_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_user_permissions(NEW.id, NEW.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_trigger ON users;

CREATE TRIGGER on_user_created_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION on_user_created();

-- Create permissions for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, role FROM users LOOP
    PERFORM create_user_permissions(user_record.id, user_record.role);
  END LOOP;
END $$;
