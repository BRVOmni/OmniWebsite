/**
 * API Route: Seasonal Forecasting
 *
 * GET /api/forecasting/seasonal
 *
 * Analyzes seasonal patterns in sales data.
 * Returns weekly, monthly patterns and seasonal indices.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ForecastRequest, ForecastHorizon } from '@/lib/forecasting/types'

interface DayOfWeekPattern {
  day_of_week: number
  day_name: string
  avg_sales: number
  avg_orders: number
  avg_ticket: number
  seasonal_index: number
  is_peak: boolean
  is_trough: boolean
}

interface MonthlyPattern {
  month: number
  month_name: string
  avg_sales: number
  avg_orders: number
  seasonal_index: number
  year_over_year_change: number
}

interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable'
  strength: number // 0-1
  description: string
}

interface SeasonalForecastResult {
  date: string
  horizon: ForecastHorizon
  data_period_days: number
  weekly_pattern: DayOfWeekPattern[]
  monthly_pattern?: MonthlyPattern[]
  trend: TrendAnalysis
  summary: {
    peak_day: string
    trough_day: string
    peak_month?: string
    trough_month?: string
    seasonal_variation_percent: number
  }
}

/**
 * GET /api/forecasting/seasonal
 *
 * Query parameters:
 * - horizon: 'short' (30 days) | 'medium' (90 days) | 'long' (365 days)
 * - locationId: Filter by location
 * - brandId: Filter by brand
 * - channelId: Filter by channel
 */
export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const horizon = (searchParams.get('horizon') || 'medium') as ForecastHorizon
    const locationId = searchParams.get('locationId')
    const brandId = searchParams.get('brandId')
    const channelId = searchParams.get('channelId')

    // Determine data period based on horizon
    const dataPeriodDays = horizon === 'short' ? 30 : horizon === 'medium' ? 90 : 365

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - dataPeriodDays)

    // Build query for sales data
    let query = supabase
      .from('sales')
      .select('date, net_amount, total_amount, time')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .eq('status', 'completed')

    // Apply filters
    if (locationId) query = query.eq('location_id', locationId)
    if (brandId) query = query.eq('brand_id', brandId)
    if (channelId) query = query.eq('channel_id', channelId)

    // Fetch data
    const { data: salesData, error } = await query

    if (error) {
      console.error('Seasonal forecast API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      )
    }

    if (!salesData || salesData.length === 0) {
      return NextResponse.json(
        { error: 'No sales data found for the specified criteria' },
        { status: 404 }
      )
    }

    // Analyze day of week patterns
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayOfWeekMap = new Map<number, {
      total_sales: number
      total_orders: number
      count: number
    }>()

    salesData.forEach((sale: any) => {
      const dayOfWeek = new Date(sale.date).getDay()
      const existing = dayOfWeekMap.get(dayOfWeek)

      if (existing) {
        existing.total_sales += Number(sale.net_amount)
        existing.total_orders += 1
        existing.count += 1
      } else {
        dayOfWeekMap.set(dayOfWeek, {
          total_sales: Number(sale.net_amount),
          total_orders: 1,
          count: 1
        })
      }
    })

    // Calculate weekly patterns and seasonal indices
    const weeklyPattern: DayOfWeekPattern[] = []
    let overallAvgSales = 0

    dayOfWeekMap.forEach((stats, dayOfWeek) => {
      const avgSales = stats.total_sales / stats.count
      const avgOrders = stats.total_orders / stats.count
      const avgTicket = avgSales / Math.max(1, avgOrders)
      overallAvgSales += avgSales

      weeklyPattern.push({
        day_of_week: dayOfWeek,
        day_name: dayNames[dayOfWeek],
        avg_sales: Math.round(avgSales),
        avg_orders: Math.round(avgOrders),
        avg_ticket: Math.round(avgTicket),
        seasonal_index: 0, // Will calculate after overall avg
        is_peak: false,
        is_trough: false
      })
    })

    overallAvgSales /= 7

    // Calculate seasonal indices and identify peak/trough days
    weeklyPattern.forEach(day => {
      day.seasonal_index = Math.round((day.avg_sales / overallAvgSales) * 100) / 100
    })

    const maxSales = Math.max(...weeklyPattern.map(d => d.avg_sales))
    const minSales = Math.min(...weeklyPattern.map(d => d.avg_sales))

    weeklyPattern.forEach(day => {
      day.is_peak = day.avg_sales >= maxSales * 0.95
      day.is_trough = day.avg_sales <= minSales * 1.05
    })

    // Sort by day of week
    weeklyPattern.sort((a, b) => a.day_of_week - b.day_of_week)

    // Analyze trend (simple linear regression on daily totals)
    const dailyTotals = new Map<string, number>()
    salesData.forEach((sale: any) => {
      const date = sale.date
      dailyTotals.set(date, (dailyTotals.get(date) || 0) + Number(sale.net_amount))
    })

    const sortedDates = Array.from(dailyTotals.keys()).sort()
    const values = sortedDates.map(d => dailyTotals.get(d) || 0)

    const trendAnalysis = analyzeTrend(values)

    // Calculate summary
    const peakDay = weeklyPattern.find(d => d.is_peak) || weeklyPattern[0]
    const troughDay = weeklyPattern.find(d => d.is_trough) || weeklyPattern[0]
    const seasonalVariation = ((maxSales - minSales) / minSales) * 100

    const result: SeasonalForecastResult = {
      date: new Date().toISOString().split('T')[0],
      horizon,
      data_period_days: dataPeriodDays,
      weekly_pattern: weeklyPattern,
      trend: trendAnalysis,
      summary: {
        peak_day: peakDay.day_name,
        trough_day: troughDay.day_name,
        seasonal_variation_percent: Math.round(seasonalVariation * 10) / 10
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Seasonal forecast API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Simple linear regression to analyze trend
 */
function analyzeTrend(values: number[]): TrendAnalysis {
  const n = values.length
  if (n < 2) {
    return {
      direction: 'stable',
      strength: 0,
      description: 'Insufficient data for trend analysis'
    }
  }

  // Calculate slope using least squares
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0

  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const avgY = sumY / n

  // Calculate R-squared to determine strength
  const predictions = values.map((_, i) => avgY + slope * i)
  const ssRes = values.reduce((sum, y, i) => sum + Math.pow(y - predictions[i], 2), 0)
  const ssTot = values.reduce((sum, y) => sum + Math.pow(y - avgY, 2), 0)
  const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0

  // Determine direction and description
  const percentChange = Math.abs((slope * n) / avgY) * 100
  let direction: 'increasing' | 'decreasing' | 'stable'
  let description = ''

  if (Math.abs(slope) < avgY * 0.01) {
    direction = 'stable'
    description = 'Sales are stable with no clear trend'
  } else if (slope > 0) {
    direction = 'increasing'
    description = `Sales trending up at ${percentChange.toFixed(1)}% over the period`
  } else {
    direction = 'decreasing'
    description = `Sales trending down at ${percentChange.toFixed(1)}% over the period`
  }

  return {
    direction,
    strength: Math.min(1, Math.max(0, rSquared)),
    description
  }
}
