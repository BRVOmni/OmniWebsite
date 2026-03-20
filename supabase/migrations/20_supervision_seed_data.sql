-- ============================================================================
-- MIGRATION 20: Operational Supervision Seed Data
-- ============================================================================
-- This migration populates the supervision system with seed data including
-- categories, checklist items, supervisors, and default templates.
-- ============================================================================

-- ============================================================================
-- 1. Supervisors
-- ============================================================================
INSERT INTO supervisors (name, email, phone, is_active) VALUES
('Rogger Bogado', 'rogger@omniprise.com', '+595999999', true),
('Sebastian Weil', 'sebastian@omniprise.com', '+595999998', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. Checklist Categories (6 categories)
-- ============================================================================
INSERT INTO checklist_categories (name, name_es, description, display_order, active) VALUES
('Leadership', 'Liderazgo', 'Management and team leadership evaluation', 1, true),
('Order', 'Orden', 'Operational order and efficiency', 2, true),
('Cash Management', 'Caja', 'Cash handling and management procedures', 3, true),
('Inventory', 'Stock', 'Stock management and FIFO compliance', 4, true),
('Cleanliness', 'Limpieza', 'Cleanliness and hygiene standards', 5, true),
('Equipment', 'Equipos', 'Equipment maintenance and functionality', 6, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 3. Checklist Items (21 items across 6 categories)
-- ============================================================================

-- Leadership (3 items)
INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Proper staffing',
  'Dotación correcta',
  'Verify appropriate staffing levels for current traffic',
  1,
  false,
  true
FROM checklist_categories WHERE name_es = 'Liderazgo'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Clear and active tasks',
  'Tareas claras y activas',
  'Staff have clear responsibilities and are actively working',
  2,
  false,
  true
FROM checklist_categories WHERE name_es = 'Liderazgo'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Manager leading',
  'Encargado liderando',
  'Manager is present and leading the team effectively',
  3,
  true,
  true
FROM checklist_categories WHERE name_es = 'Liderazgo'
ON CONFLICT DO NOTHING;

-- Order (2 items)
INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Wait time within standard',
  'Espera dentro estándar',
  'Customer wait times are within acceptable standards',
  1,
  false,
  true
FROM checklist_categories WHERE name_es = 'Orden'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Presentation and hygiene',
  'Presentación e higiene',
  'Staff presentation and personal hygiene standards met',
  2,
  false,
  true
FROM checklist_categories WHERE name_es = 'Orden'
ON CONFLICT DO NOTHING;

-- Cash Management (4 items)
INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Cash count and float',
  'Corte y fondo fijo',
  'Cash count completed and petty cash fund verified',
  1,
  true,
  true
FROM checklist_categories WHERE name_es = 'Caja'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Differences justified',
  'Diferencias justificadas',
  'Any cash differences are properly documented and justified',
  2,
  true,
  true
FROM checklist_categories WHERE name_es = 'Caja'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Organized cash',
  'Caja ordenada',
  'Cash drawer is organized and properly secured',
  3,
  false,
  true
FROM checklist_categories WHERE name_es = 'Caja'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Payment supports',
  'Soporte de cobros',
  'All payment receipts and supporting documents present',
  4,
  false,
  true
FROM checklist_categories WHERE name_es = 'Caja'
ON CONFLICT DO NOTHING;

-- Inventory (5 items)
INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Sufficient critical stock',
  'Stock crítico suficiente',
  'Critical stock levels are maintained',
  1,
  true,
  true
FROM checklist_categories WHERE name_es = 'Stock'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Proper FIFO rotation',
  'FIFO correcto',
  'First-in-first-out stock rotation properly implemented',
  2,
  false,
  true
FROM checklist_categories WHERE name_es = 'Stock'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'No expired products',
  'Sin vencidos',
  'No expired products found in inventory',
  3,
  true,
  true
FROM checklist_categories WHERE name_es = 'Stock'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Organized storage',
  'Depósito ordenado',
  'Storage areas are clean and organized',
  4,
  false,
  true
FROM checklist_categories WHERE name_es = 'Stock'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Star product presentation',
  'Producto estrella',
  'Featured products properly displayed and presented',
  5,
  false,
  true
FROM checklist_categories WHERE name_es = 'Stock'
ON CONFLICT DO NOTHING;

-- Cleanliness (3 items)
INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Dining and kitchen clean',
  'Salón y cocina',
  'Dining area and kitchen are clean and sanitary',
  1,
  true,
  true
FROM checklist_categories WHERE name_es = 'Limpieza'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Restrooms and supplies',
  'Baños y abastecimiento',
  'Restrooms clean and properly supplied',
  2,
  true,
  true
FROM checklist_categories WHERE name_es = 'Limpieza'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Waste management',
  'Residuos controlados',
  'Waste properly managed and disposed',
  3,
  false,
  true
FROM checklist_categories WHERE name_es = 'Limpieza'
ON CONFLICT DO NOTHING;

-- Equipment (4 items)
INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Facade and access',
  'Fachada/acceso',
  'Store front and access areas clean and welcoming',
  1,
  false,
  true
FROM checklist_categories WHERE name_es = 'Equipos'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Cold equipment',
  'Equipos de frío',
  'Refrigeration and freezing equipment functioning properly',
  2,
  true,
  true
FROM checklist_categories WHERE name_es = 'Equipos'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Key equipment',
  'Equipos clave',
  'Critical operational equipment in working order',
  3,
  true,
  true
FROM checklist_categories WHERE name_es = 'Equipos'
ON CONFLICT DO NOTHING;

INSERT INTO checklist_items (category_id, name, name_es, description, display_order, is_critical, active)
SELECT
  id,
  'Lights and maintenance',
  'Luces/desperfectos',
  'Lighting functional and no maintenance issues visible',
  4,
  false,
  true
FROM checklist_categories WHERE name_es = 'Equipos'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. Visit Templates
-- ============================================================================
INSERT INTO visit_templates (name, name_es, description, visit_type, estimated_duration_minutes, active) VALUES
('Rapid Visit', 'Visita Rápida', '10-minute rapid supervision visit', 'rapida', 10, true),
('Full Audit', 'Auditoría Completa', 'Comprehensive audit visit', 'completa', 30, true),
('Surprise Visit', 'Visita Sorpresa', 'Unannounced supervision visit', 'sorpresa', 15, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 5. Default Scheduling Rule
-- ============================================================================
INSERT INTO scheduling_rules (
  name,
  description,
  rapid_visits_per_week,
  full_audit_per_month,
  surprise_visits_per_month,
  max_visits_per_day,
  max_visits_per_week,
  optimize_by_geography,
  active
) VALUES (
  'Standard Coverage',
  'Default scheduling rule for standard location coverage',
  2,
  1,
  1,
  8,
  40,
  true,
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration 20 completed: Operational Supervision seed data inserted';
    RAISE NOTICE '- 2 supervisors created';
    RAISE NOTICE '- 6 checklist categories created';
    RAISE NOTICE '- 21 checklist items created';
    RAISE NOTICE '- 3 visit templates created';
    RAISE NOTICE '- 1 scheduling rule created';
END $$;
