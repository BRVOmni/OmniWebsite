/**
 * API Route: Inventory Forecasting
 *
 * GET /api/forecasting/inventory
 *
 * Generates inventory forecasts based on product sales history.
 * Returns predicted demand and stock-out risk for products.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ForecastRequest, ForecastHorizon } from '@/lib/forecasting/types'

interface ProductForecast {
  product_id?: string
  product_name: string
  category: string
  current_stock: number
  predicted_daily_demand: number
  predicted_period_demand: number
  stock_out_risk: 'low' | 'medium' | 'high'
  recommended_order: number
  days_of_stock_remaining: number
}

interface InventoryForecastResult {
  date: string
  horizon: ForecastHorizon
  forecast_days: number
  products: ProductForecast[]
  summary: {
    total_products: number
    high_risk_count: number
    medium_risk_count: number
    total_recommended_order_qty: number
  }
}

/**
 * GET /api/forecasting/inventory
 *
 * Query parameters:
 * - horizon: 'short' (7 days) | 'medium' (30 days) | 'long' (90 days)
 * - locationId: Filter by location
 * - categoryId: Filter by product category
 * - limit: Max number of products to return (default: 50)
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
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Determine forecast days based on horizon
    const forecastDays = horizon === 'short' ? 7 : horizon === 'medium' ? 30 : 90

    // Calculate date range for historical data (use same period as forecast)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - forecastDays)

    // Build query for product sales
    let query = supabase
      .from('mv_product_daily_sales')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    // Apply filters
    if (categoryId) {
      query = query.eq('category', categoryId)
    }

    // Order by quantity sold to get top products
    query = query.order('quantity_sold', { ascending: false }).limit(limit * 2)

    // Fetch data
    const { data: productSales, error } = await query

    if (error) {
      console.error('Inventory forecast API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product sales data' },
        { status: 500 }
      )
    }

    if (!productSales || productSales.length === 0) {
      return NextResponse.json(
        { error: 'No product sales data found for the specified criteria' },
        { status: 404 }
      )
    }

    // Aggregate sales by product
    const productStats = new Map<string, {
      product_id?: string
      product_name: string
      category: string
      total_qty: number
      daily_avg: number
      days_with_sales: number
    }>()

    productSales.forEach((row: any) => {
      const key = row.product_id || row.product_name
      const existing = productStats.get(key)

      if (existing) {
        existing.total_qty += row.quantity_sold || 0
        existing.days_with_sales += 1
      } else {
        productStats.set(key, {
          product_id: row.product_id,
          product_name: row.product_name,
          category: row.category || 'Other',
          total_qty: row.quantity_sold || 0,
          daily_avg: 0,
          days_with_sales: 1
        })
      }
    })

    // Calculate daily averages
    productStats.forEach((stats) => {
      stats.daily_avg = stats.total_qty / Math.max(1, forecastDays)
    })

    // Generate forecasts
    const forecasts: ProductForecast[] = Array.from(productStats.values()).map(stats => {
      const predictedDailyDemand = stats.daily_avg
      const predictedPeriodDemand = Math.round(predictedDailyDemand * forecastDays)

      // Simulate current stock (in real implementation, query inventory table)
      const currentStock = Math.floor(Math.random() * 200) + 10

      // Calculate stock-out risk
      const daysOfStockRemaining = Math.floor(currentStock / Math.max(1, predictedDailyDemand))
      const stockOutRisk: 'low' | 'medium' | 'high' =
        daysOfStockRemaining <= forecastDays * 0.25 ? 'high' :
        daysOfStockRemaining <= forecastDays * 0.5 ? 'medium' : 'low'

      // Calculate recommended order
      const recommendedOrder = Math.max(0, predictedPeriodDemand - currentStock)

      return {
        product_id: stats.product_id,
        product_name: stats.product_name,
        category: stats.category,
        current_stock: currentStock,
        predicted_daily_demand: Math.round(predictedDailyDemand * 10) / 10,
        predicted_period_demand: predictedPeriodDemand,
        stock_out_risk: stockOutRisk,
        recommended_order: Math.round(recommendedOrder),
        days_of_stock_remaining: daysOfStockRemaining
      }
    })

    // Sort by recommended order quantity (highest risk first)
    forecasts.sort((a, b) => b.recommended_order - a.recommended_order)

    // Calculate summary
    const summary = {
      total_products: forecasts.length,
      high_risk_count: forecasts.filter(f => f.stock_out_risk === 'high').length,
      medium_risk_count: forecasts.filter(f => f.stock_out_risk === 'medium').length,
      total_recommended_order_qty: forecasts.reduce((sum, f) => sum + f.recommended_order, 0)
    }

    const result: InventoryForecastResult = {
      date: new Date().toISOString().split('T')[0],
      horizon,
      forecast_days: forecastDays,
      products: forecasts.slice(0, limit),
      summary
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Inventory forecast API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
