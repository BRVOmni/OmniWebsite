/**
 * User Permissions Utilities
 *
 * Check user permissions for accessing different pages and features.
 * Provides granular access control based on user_permissions table.
 */

import { createClient } from '@/lib/supabase/client'

export interface UserPermissions {
  can_view_executive_summary: boolean
  can_view_sales: boolean
  can_view_profitability: boolean
  can_view_cash_closing: boolean
  can_view_locations: boolean
  can_view_products: boolean
  can_view_brands: boolean
  can_view_alerts: boolean
  can_view_supervision: boolean
  can_view_purchases: boolean
  can_view_payments: boolean

  can_create_users: boolean
  can_edit_users: boolean
  can_delete_users: boolean
  can_reset_passwords: boolean
  can_configure_settings: boolean

  location_access: string[]
  brand_access: string[]
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  can_view_executive_summary: false,
  can_view_sales: false,
  can_view_profitability: false,
  can_view_cash_closing: false,
  can_view_locations: false,
  can_view_products: false,
  can_view_brands: false,
  can_view_alerts: false,
  can_view_supervision: false,
  can_view_purchases: false,
  can_view_payments: false,

  can_create_users: false,
  can_edit_users: false,
  can_delete_users: false,
  can_reset_passwords: false,
  can_configure_settings: false,

  location_access: [],
  brand_access: [],
}

/**
 * Get user permissions from database
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return DEFAULT_PERMISSIONS
    }

    return {
      can_view_executive_summary: data.can_view_executive_summary ?? false,
      can_view_sales: data.can_view_sales ?? false,
      can_view_profitability: data.can_view_profitability ?? false,
      can_view_cash_closing: data.can_view_cash_closing ?? false,
      can_view_locations: data.can_view_locations ?? false,
      can_view_products: data.can_view_products ?? false,
      can_view_brands: data.can_view_brands ?? false,
      can_view_alerts: data.can_view_alerts ?? false,
      can_view_supervision: data.can_view_supervision ?? false,
      can_view_purchases: data.can_view_purchases ?? false,
      can_view_payments: data.can_view_payments ?? false,

      can_create_users: data.can_create_users ?? false,
      can_edit_users: data.can_edit_users ?? false,
      can_delete_users: data.can_delete_users ?? false,
      can_reset_passwords: data.can_reset_passwords ?? false,
      can_configure_settings: data.can_configure_settings ?? false,

      location_access: data.location_access || [],
      brand_access: data.brand_access || [],
    }
  } catch (error) {
    return DEFAULT_PERMISSIONS
  }
}

/**
 * Check if user can view a specific page
 */
export async function canViewPage(
  userId: string,
  pagePath: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId)

  // Admin can view everything
  const supabase = createClient()
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (user?.role === 'admin') {
    return true
  }

  // Check page-specific permissions
  switch (pagePath) {
    case '/dashboard':
    case '/dashboard/executive':
      return permissions.can_view_executive_summary
    case '/dashboard/sales':
      return permissions.can_view_sales
    case '/dashboard/profitability':
      return permissions.can_view_profitability
    case '/dashboard/cash-closing':
      return permissions.can_view_cash_closing
    case '/dashboard/locations':
      return permissions.can_view_locations
    case '/dashboard/products':
      return permissions.can_view_products
    case '/dashboard/brands':
      return permissions.can_view_brands
    case '/dashboard/alerts':
      return permissions.can_view_alerts
    case '/dashboard/supervision':
      return permissions.can_view_supervision
    case '/dashboard/users':
    case '/dashboard/settings':
      // These are handled separately by role
      return user?.role === 'admin' || user?.role === 'manager'
    default:
      // For sub-pages, check parent permission
      if (pagePath.startsWith('/dashboard/supervision/')) {
        return permissions.can_view_supervision
      }
      return true
  }
}

/**
 * Update user permissions
 */
export async function updateUserPermissions(
  userId: string,
  permissions: Partial<UserPermissions>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('user_permissions')
      .update({
        ...permissions,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check if user can manage other users
 */
export async function canManageUsers(userId: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.can_create_users || permissions.can_edit_users
}

/**
 * Check if user can access specific location
 */
export async function canAccessLocation(
  userId: string,
  locationId: string
): Promise<boolean> {
  const supabase = createClient()

  // Check if user is admin
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (user?.role === 'admin') {
    return true
  }

  const permissions = await getUserPermissions(userId)

  // If location_access is empty, they can access all locations
  if (permissions.location_access.length === 0) {
    return true
  }

  return permissions.location_access.includes(locationId)
}

/**
 * Check if user can access specific brand
 */
export async function canAccessBrand(
  userId: string,
  brandId: string
): Promise<boolean> {
  const supabase = createClient()

  // Check if user is admin
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (user?.role === 'admin') {
    return true
  }

  const permissions = await getUserPermissions(userId)

  // If brand_access is empty, they can access all brands
  if (permissions.brand_access.length === 0) {
    return true
  }

  return permissions.brand_access.includes(brandId)
}
