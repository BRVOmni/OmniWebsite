/**
 * Executive Summary Queries
 *
 * Database queries for the Executive Summary dashboard
 */

import { createClient } from '../supabase/client'

// Type definitions for Supabase query results
interface SaleWithLocation {
  location_id: string
  net_amount: number | string
  locations: {
    name?: string
  } | null
}

interface SaleWithBrand {
  brand_id: string
  net_amount: number | string
  brands: {
    name?: string
    color?: string
  } | null
}

/**
 * Get executive summary KPIs
 */
export async function getExecutiveSummaryKPIs(filters: {
  startDate?: string
  endDate?: string
  locationId?: string
  brandId?: string
  channelId?: string
}) {
  const supabase = createClient()

  // Build date range filter
  const start = filters.startDate || new Date().toISOString().split('T')[0]
  const end = filters.endDate || new Date().toISOString().split('T')[0]

  // Get sales data
  let salesQuery = supabase
    .from('sales')
    .select('total_amount, net_amount, items_count, date')
    .eq('status', 'completed')
    .gte('date', start)
    .lte('date', end)

  if (filters.locationId) salesQuery = salesQuery.eq('location_id', filters.locationId)
  if (filters.brandId) salesQuery = salesQuery.eq('brand_id', filters.brandId)
  if (filters.channelId) salesQuery = salesQuery.eq('channel_id', filters.channelId)

  const { data: sales, error: salesError } = await salesQuery

  if (salesError) throw salesError

  // Calculate KPIs
  const netSales = sales?.reduce((sum, sale) => sum + Number(sale.net_amount), 0) || 0
  const orders = sales?.length || 0
  const averageTicket = orders > 0 ? netSales / orders : 0

  // TODO: Calculate these from actual data
  const foodCostPercent = 28.5 // Will calculate from sales_items
  const estimatedProfitability = netSales * (1 - foodCostPercent / 100)
  const centralizedPayments = 0 // Will get from payments table
  const totalCashDifference = 0 // Will get from cash_closings table
  const activeAlerts = 0 // Will get from alerts table

  return {
    netSales,
    orders,
    averageTicket,
    foodCostPercent,
    estimatedProfitability,
    centralizedPayments,
    totalCashDifference,
    activeAlerts,
    period: { start, end },
  }
}

/**
 * Get sales trend data (last 30 days)
 */
export async function getSalesTrend(filters: {
  locationId?: string
  brandId?: string
}) {
  const supabase = createClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  let query = supabase
    .from('sales')
    .select('date, net_amount')
    .eq('status', 'completed')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (filters.locationId) query = query.eq('location_id', filters.locationId)
  if (filters.brandId) query = query.eq('brand_id', filters.brandId)

  const { data, error } = await query

  if (error) throw error

  // Group by date
  const trend = data?.reduce((acc, sale) => {
    const date = sale.date
    if (!acc[date]) {
      acc[date] = { date, amount: 0 }
    }
    acc[date].amount += Number(sale.net_amount)
    return acc
  }, {} as Record<string, { date: string; amount: number }>)

  return Object.values(trend)
}

/**
 * Get location rankings
 */
export async function getLocationRankings(filters: {
  startDate?: string
  endDate?: string
}) {
  const supabase = createClient()

  const start = filters.startDate || new Date().toISOString().split('T')[0]
  const end = filters.endDate || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('sales')
    .select('location_id, locations(name), net_amount')
    .eq('status', 'completed')
    .gte('date', start)
    .lte('date', end)

  if (error) throw error

  // Aggregate by location
  const rankings = (data as SaleWithLocation[])?.reduce((acc, sale) => {
    const locId = sale.location_id
    const locName = sale.locations?.name || 'Unknown'
    if (!acc[locId]) {
      acc[locId] = { locationId: locId, locationName: locName, totalSales: 0 }
    }
    acc[locId].totalSales += Number(sale.net_amount)
    return acc
  }, {} as Record<string, { locationId: string; locationName: string; totalSales: number }>)

  return Object.values(rankings).sort((a, b) => b.totalSales - a.totalSales)
}

/**
 * Get brand rankings with traffic lights
 */
export async function getBrandRankings(filters: {
  startDate?: string
  endDate?: string
}) {
  const supabase = createClient()

  const start = filters.startDate || new Date().toISOString().split('T')[0]
  const end = filters.endDate || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('sales')
    .select('brand_id, brands(name, color), net_amount')
    .eq('status', 'completed')
    .gte('date', start)
    .lte('date', end)

  if (error) throw error

  // Aggregate by brand
  const rankings = (data as SaleWithBrand[])?.reduce((acc, sale) => {
    const brandId = sale.brand_id
    const brand = sale.brands?.name || 'Unknown'
    const color = sale.brands?.color || '#000000'
    if (!acc[brandId]) {
      acc[brandId] = { brandId, brand, color, totalSales: 0 }
    }
    acc[brandId].totalSales += Number(sale.net_amount)
    return acc
  }, {} as Record<string, { brandId: string; brand: string; color: string; totalSales: number }>)

  const brands = Object.values(rankings).sort((a, b) => b.totalSales - a.totalSales)

  // Add traffic lights based on performance
  const maxSales = brands[0]?.totalSales || 1
  return brands.map((brand, index) => ({
    ...brand,
    status: index === 0 ? 'success' : brand.totalSales >= maxSales * 0.7 ? 'warning' : 'danger',
  }))
}

/**
 * Get active alerts
 */
export async function getActiveAlerts(filters: {
  locationId?: string
  brandId?: string
  limit?: number
}) {
  const supabase = createClient()

  let query = supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(filters.limit || 10)

  if (filters.locationId) query = query.eq('location_id', filters.locationId)
  if (filters.brandId) query = query.eq('brand_id', filters.brandId)

  const { data, error } = await query

  if (error) throw error

  return data || []
}
