/**
 * Supabase Queries
 *
 * Database query functions organized by entity
 */

import { createClient } from '../supabase/client'
import type { Database } from '../supabase/database.types'

/**
 * Get all countries
 */
export async function getCountries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

/**
 * Get cities by country
 */
export async function getCitiesByCountry(countryId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('country_id', countryId)
    .order('name')

  if (error) throw error
  return data
}

/**
 * Get all locations
 */
export async function getLocations(filters?: {
  countryId?: string
  cityId?: string
  brandId?: string
  active?: boolean
}) {
  const supabase = createClient()
  let query = supabase
    .from('locations')
    .select('*')
    .order('name')

  if (filters?.countryId) {
    query = query.eq('city.country_id', filters.countryId)
  }
  if (filters?.cityId) {
    query = query.eq('city_id', filters.cityId)
  }
  if (filters?.brandId) {
    query = query.eq('brand_id', filters.brandId)
  }
  if (filters?.active !== undefined) {
    query = query.eq('is_active', filters.active)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

/**
 * Get all brands
 */
export async function getBrands(activeOnly = true) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')
    .eq('active', activeOnly)

  if (error) throw error
  return data
}

/**
 * Get sales channels
 */
export async function getSalesChannels() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sales_channels')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  if (error) throw error
  return data
}

/**
 * Get payment methods
 */
export async function getPaymentMethods() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  if (error) throw error
  return data
}

/**
 * Get sales with filters
 */
export async function getSales(filters: {
  locationId?: string
  brandId?: string
  channelId?: string
  paymentMethodId?: string
  startDate?: string
  endDate?: string
  limit?: number
}) {
  const supabase = createClient()
  let query = supabase
    .from('sales')
    .select('*')
    .eq('status', 'completed')
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (filters.locationId) {
    query = query.eq('location_id', filters.locationId)
  }
  if (filters.brandId) {
    query = query.eq('brand_id', filters.brandId)
  }
  if (filters.channelId) {
    query = query.eq('channel_id', filters.channelId)
  }
  if (filters.paymentMethodId) {
    query = query.eq('payment_method_id', filters.paymentMethodId)
  }
  if (filters.startDate) {
    query = query.gte('date', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('date', filters.endDate)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats(filters: {
  locationId?: string
  brandId?: string
  startDate: string
  endDate: string
}) {
  const supabase = createClient()

  let query = supabase
    .from('sales')
    .select('net_amount, items_count')
    .eq('status', 'completed')
    .gte('date', filters.startDate)
    .lte('date', filters.endDate)

  if (filters.locationId) {
    query = query.eq('location_id', filters.locationId)
  }
  if (filters.brandId) {
    query = query.eq('brand_id', filters.brandId)
  }

  const { data, error } = await query

  if (error) throw error

  const netSales = data?.reduce((sum, sale) => sum + Number(sale.net_amount), 0) || 0
  const orders = data?.length || 0
  const averageTicket = orders > 0 ? netSales / orders : 0

  return {
    netSales,
    orders,
    averageTicket,
    // TODO: Add more metrics from other tables
    foodCostPercent: 0,
    estimatedProfitability: 0,
    centralizedPayments: 0,
    totalCashDifference: 0,
    activeAlerts: 0,
  }
}

/**
 * Get cash closings
 */
export async function getCashClosings(filters: {
  locationId?: string
  startDate?: string
  endDate?: string
  status?: 'pending' | 'closed_correctly' | 'with_difference' | 'under_review'
}) {
  const supabase = createClient()
  let query = supabase
    .from('cash_closings')
    .select('*')
    .order('date', { ascending: false })

  if (filters.locationId) {
    query = query.eq('location_id', filters.locationId)
  }
  if (filters.startDate) {
    query = query.gte('date', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('date', filters.endDate)
  }
  if (filters.status) {
    query = query.eq('closing_status', filters.status)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

/**
 * Get alerts
 */
export async function getAlerts(filters: {
  locationId?: string
  brandId?: string
  type?: string
  severity?: string
  status?: 'active' | 'acknowledged' | 'resolved' | 'dismissed'
  limit?: number
}) {
  const supabase = createClient()
  let query = supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.locationId) {
    query = query.eq('location_id', filters.locationId)
  }
  if (filters.brandId) {
    query = query.eq('brand_id', filters.brandId)
  }
  if (filters.type) {
    query = query.eq('type', filters.type)
  }
  if (filters.severity) {
    query = query.eq('severity', filters.severity)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) throw error
  return user
}

/**
 * Get user profile with role
 */
export async function getUserProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
