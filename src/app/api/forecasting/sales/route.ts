/**
 * API Route: Sales Forecasting
 *
 * POST /api/forecasting/sales
 * GET /api/forecasting/sales
 *
 * Generates sales forecasts using various algorithms.
 * Returns forecast with confidence intervals and accuracy metrics.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateForecast } from '@/lib/forecasting/algorithms'
import type { ForecastRequest, ForecastHorizon, ForecastMethod, ForecastDimension } from '@/lib/forecasting/types'

/**
 * GET /api/forecasting/sales
 *
 * Query parameters:
 * - horizon: 'short' | 'medium' | 'long'
 * - method: Forecast method name
 * - dimension: 'location' | 'brand' | 'channel'
 * - dimensionId: Specific ID for the dimension
 * - locationId: Filter by location
 * - brandId: Filter by brand
 * - channelId: Filter by channel
 * - startDate: Start date for historical data
 * - endDate: End date for historical data
 * - confidence: Confidence level (0.90, 0.95, 0.99)
 * - window: Window size for moving average
 * - alpha: Smoothing factor for exponential smoothing
 * - beta: Trend smoothing factor
 * - gamma: Seasonal smoothing factor
 * - period: Seasonal period (7=weekly, 12=monthly)
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
    const method = (searchParams.get('method') || 'triple-exponential-smoothing') as ForecastMethod
    const dimension = (searchParams.get('dimension') || 'location') as ForecastDimension
    const dimensionId = searchParams.get('dimensionId') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const confidence = parseFloat(searchParams.get('confidence') || '0.95')

    // Algorithm parameters
    const window = parseInt(searchParams.get('window') || '7')
    const alpha = parseFloat(searchParams.get('alpha') || '0.3')
    const beta = parseFloat(searchParams.get('beta') || '0.1')
    const gamma = parseFloat(searchParams.get('gamma') || '0.3')
    const period = parseInt(searchParams.get('period') || '7')

    // Build query filters
    let query = supabase
      .from('mv_daily_sales_forecasting')
      .select('*')

    // Apply dimension filter
    if (dimension === 'location' && dimensionId) {
      query = query.eq('location_id', dimensionId)
    } else if (dimension === 'brand' && dimensionId) {
      query = query.eq('brand_id', dimensionId)
    } else if (dimension === 'channel' && dimensionId) {
      query = query.eq('channel_id', dimensionId)
    }

    // Apply additional filters
    const locationId = searchParams.get('locationId')
    const brandId = searchParams.get('brandId')
    const channelId = searchParams.get('channelId')

    if (locationId) query = query.eq('location_id', locationId)
    if (brandId) query = query.eq('brand_id', brandId)
    if (channelId) query = query.eq('channel_id', channelId)

    // Apply date range
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    } else {
      // Default to last 365 days if no end date specified
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      query = query.gte('date', yearAgo.toISOString().split('T')[0])
    }

    // Order by date ascending
    query = query.order('date', { ascending: true })

    // Fetch data
    const { data, error } = await query

    if (error) {
      console.error('Sales forecast API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No sales data found for the specified criteria' },
        { status: 404 }
      )
    }

    // Transform data into time series format
    const timeSeriesData = data.map((row: any) => ({
      date: row.date,
      value: row.net_sales || 0,
      metadata: {
        ordersCount: row.orders_count || 0,
        avgTicket: row.avg_ticket || 0
      }
    }))

    // Create forecast request
    const forecastRequest: ForecastRequest = {
      horizon,
      method,
      dimension,
      dimensionId,
      confidence,
      window,
      alpha,
      beta,
      gamma,
      period
    }

    // Generate forecast
    const forecast = generateForecast(timeSeriesData, forecastRequest)

    return NextResponse.json(forecast)

  } catch (error) {
    console.error('Sales forecast API error:', error)
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
 * POST /api/forecasting/sales
 *
 * Alternative method with JSON body for complex requests
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.horizon || !body.method || !body.dimension) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['horizon', 'method', 'dimension']
        },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('mv_daily_sales_forecasting')
      .select('*')

    // Apply dimension filter
    if (body.dimension === 'location' && body.dimensionId) {
      query = query.eq('location_id', body.dimensionId)
    } else if (body.dimension === 'brand' && body.dimensionId) {
      query = query.eq('brand_id', body.dimensionId)
    } else if (body.dimension === 'channel' && body.dimensionId) {
      query = query.eq('channel_id', body.dimensionId)
    }

    // Apply filters
    if (body.locationId) query = query.eq('location_id', body.locationId)
    if (body.brandId) query = query.eq('brand_id', body.brandId)
    if (body.channelId) query = query.eq('channel_id', body.channelId)

    // Apply date range
    if (body.startDate) {
      query = query.gte('date', body.startDate)
    }
    if (body.endDate) {
      query = query.lte('date', body.endDate)
    } else {
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      query = query.gte('date', yearAgo.toISOString().split('T')[0])
    }

    query = query.order('date', { ascending: true })

    // Fetch data
    const { data, error } = await query

    if (error) {
      console.error('Sales forecast API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sales data' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No sales data found' },
        { status: 404 }
      )
    }

    // Transform data
    const timeSeriesData = data.map((row: any) => ({
      date: row.date,
      value: row.net_sales || 0,
      metadata: {
        ordersCount: row.orders_count || 0,
        avgTicket: row.avg_ticket || 0
      }
    }))

    // Generate forecast
    const forecast = generateForecast(timeSeriesData, body as ForecastRequest)

    return NextResponse.json(forecast)

  } catch (error) {
    console.error('Sales forecast API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
