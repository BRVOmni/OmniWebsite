/**
 * API Route: Staffing Forecasting
 *
 * GET /api/forecasting/staffing
 *
 * Generates staffing forecasts based on hourly sales patterns.
 * Returns recommended staff counts for each hour of the day.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ForecastRequest, ForecastHorizon, ForecastMethod } from '@/lib/forecasting/types'

interface HourlyPattern {
  hour: number
  avg_sales: number
  avg_transactions: number
  avg_ticket: number
}

interface StaffingRecommendation {
  hour: number
  time_label: string
  expected_sales: number
  expected_transactions: number
  recommended_staff: number
  busy_period: boolean
  transactions_per_staff: number
}

interface StaffingForecastResult {
  location_id?: string
  date: string
  horizon: ForecastHorizon
  patterns: StaffingRecommendation[]
  summary: {
    peak_hour: number
    peak_sales: number
    total_staff_needed: number
    total_transactions: number
  }
}

/**
 * GET /api/forecasting/staffing
 *
 * Query parameters:
 * - locationId: Filter by specific location
 * - dayOfWeek: Day of week (0-6, 0=Sunday) - defaults to today
 * - horizon: 'short' | 'medium' | 'long'
 * - method: Forecast method (for future use)
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
    const locationId = searchParams.get('locationId')
    const dayOfWeekParam = searchParams.get('dayOfWeek')
    const horizon = (searchParams.get('horizon') || 'medium') as ForecastHorizon

    // Default to today's day of week
    const today = new Date()
    const dayOfWeek = dayOfWeekParam ? parseInt(dayOfWeekParam) : today.getDay()

    // Build query for hourly patterns
    let query = supabase
      .from('mv_hourly_sales_patterns')
      .select('*')
      .eq('day_of_week', dayOfWeek)

    // Apply location filter if provided
    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    // Order by hour
    query = query.order('hour', { ascending: true })

    // Fetch data
    const { data, error } = await query

    if (error) {
      console.error('Staffing forecast API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch hourly sales patterns' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No hourly sales data found for the specified criteria' },
        { status: 404 }
      )
    }

    // Aggregate by hour (across all locations if no location filter)
    const hourlyAggregates = new Map<number, HourlyPattern>()

    data.forEach((row: any) => {
      const hour = row.hour
      const existing = hourlyAggregates.get(hour)

      if (existing) {
        existing.avg_sales += row.avg_sales || 0
        existing.avg_transactions += row.orders_count || 0
        existing.avg_ticket = existing.avg_sales / Math.max(1, existing.avg_transactions)
      } else {
        hourlyAggregates.set(hour, {
          hour,
          avg_sales: row.avg_sales || 0,
          avg_transactions: row.orders_count || 0,
          avg_ticket: row.avg_sales / Math.max(1, row.orders_count || 1)
        })
      }
    })

    // Calculate averages if we aggregated multiple locations
    const locationCount = locationId ? 1 : (data.length / 24)
    const hourlyPatterns: HourlyPattern[] = Array.from(hourlyAggregates.values()).map(h => ({
      hour: h.hour,
      avg_sales: h.avg_sales / Math.max(1, locationCount),
      avg_transactions: h.avg_transactions / Math.max(1, locationCount),
      avg_ticket: h.avg_ticket
    }))

    // Generate staffing recommendations
    const recommendations: StaffingRecommendation[] = hourlyPatterns.map(pattern => {
      // Calculate recommended staff based on sales volume
      // Rule of thumb: 1 staff per ₲500,000 in hourly sales
      const recommendedStaff = Math.max(1, Math.min(10, Math.ceil(pattern.avg_sales / 500000)))

      // Determine if this is a busy period (top 30% of sales)
      const salesValues = hourlyPatterns.map(h => h.avg_sales)
      const salesThreshold = salesValues.sort((a, b) => b - a)[Math.floor(hourlyPatterns.length * 0.3)]
      const busyPeriod = pattern.avg_sales >= salesThreshold

      return {
        hour: pattern.hour,
        time_label: `${pattern.hour.toString().padStart(2, '0')}:00`,
        expected_sales: Math.round(pattern.avg_sales),
        expected_transactions: Math.round(pattern.avg_transactions),
        recommended_staff: recommendedStaff,
        busy_period: busyPeriod,
        transactions_per_staff: Math.round(pattern.avg_transactions / Math.max(1, recommendedStaff) * 10) / 10
      }
    })

    // Calculate summary statistics
    const peakHour = recommendations.reduce((max, r) =>
      r.expected_sales > max.expected_sales ? r : max
    , recommendations[0])

    const summary = {
      peak_hour: peakHour.hour,
      peak_sales: peakHour.expected_sales,
      total_staff_needed: recommendations.reduce((sum, r) => sum + r.recommended_staff, 0),
      total_transactions: Math.round(recommendations.reduce((sum, r) => sum + r.expected_transactions, 0))
    }

    const result: StaffingForecastResult = {
      location_id: locationId || undefined,
      date: today.toISOString().split('T')[0],
      horizon,
      patterns: recommendations,
      summary
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Staffing forecast API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
