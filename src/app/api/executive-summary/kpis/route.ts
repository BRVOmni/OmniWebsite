import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const locationId = searchParams.get('locationId') || undefined
    const brandId = searchParams.get('brandId') || undefined
    const channelId = searchParams.get('channelId') || undefined

    // Calculate KPIs
    const start = startDate || new Date().toISOString().split('T')[0]
    const end = endDate || new Date().toISOString().split('T')[0]

    // Get sales data
    let salesQuery = supabase
      .from('sales')
      .select('total_amount, net_amount, items_count, date')
      .eq('status', 'completed')
      .gte('date', start)
      .lte('date', end)

    if (locationId) salesQuery = salesQuery.eq('location_id', locationId)
    if (brandId) salesQuery = salesQuery.eq('brand_id', brandId)
    if (channelId) salesQuery = salesQuery.eq('channel_id', channelId)

    const { data: sales, error: salesError } = await salesQuery

    if (salesError) {
      console.error('Sales query error:', salesError)
      return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 })
    }

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

    return NextResponse.json({
      netSales,
      orders,
      averageTicket,
      foodCostPercent,
      estimatedProfitability,
      centralizedPayments,
      totalCashDifference,
      activeAlerts,
      period: { start, end },
    })

  } catch (error) {
    console.error('KPI API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
