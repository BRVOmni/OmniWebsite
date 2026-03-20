-- ============================================================================
-- MIGRATION 9: Users & Roles
-- ============================================================================

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  level       INTEGER NOT NULL,
  is_system   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module      VARCHAR(50) NOT NULL,
  action      VARCHAR(50) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted       BOOLEAN DEFAULT true,
  granted_at    TIMESTAMPTZ DEFAULT NOW(),
  granted_by    UUID,
  PRIMARY KEY (role_id, permission_id)
);

-- Users (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               VARCHAR(255) NOT NULL,
  full_name           VARCHAR(255) NOT NULL,
  phone               VARCHAR(50),
  role                VARCHAR(50) NOT NULL,
  role_id             UUID REFERENCES roles(id) ON DELETE SET NULL,
  location_id         UUID REFERENCES locations(id) ON DELETE SET NULL,
  is_active           BOOLEAN DEFAULT true,
  avatar_url          TEXT,
  timezone            VARCHAR(50) DEFAULT 'America/Asuncion',
  language            VARCHAR(10) DEFAULT 'es',
  password_changed    BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(level);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO roles (name, description, level, is_system) VALUES
('admin', 'Full system access', 100, true),
('cfo', 'Financial oversight', 90, true),
('manager', 'Location management', 70, true),
('supervisor', 'Field supervision', 50, true),
('viewer', 'Read-only access', 10, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, module, action) VALUES
('view_dashboard', 'View executive dashboard', 'dashboard', 'view'),
('view_sales', 'View sales data', 'sales', 'view'),
('edit_sales', 'Edit sales records', 'sales', 'edit'),
('view_cash', 'View cash closings', 'cash', 'view'),
('approve_cash', 'Approve cash closings', 'cash', 'approve'),
('view_alerts', 'View alerts', 'alerts', 'view'),
('dismiss_alerts', 'Dismiss alerts', 'alerts', 'dismiss'),
('manage_users', 'Manage user accounts', 'admin', 'edit'),
('view_all_locations', 'View all locations', 'locations', 'view'),
('view_profitability', 'View profitability data', 'profitability', 'view')
ON CONFLICT (name) DO NOTHING;

-- Grant all permissions to admin role
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT
  (SELECT id FROM roles WHERE name = 'admin'),
  id,
  true
FROM permissions
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 9 completed: Users, Roles, and Permissions created';
END $$;
