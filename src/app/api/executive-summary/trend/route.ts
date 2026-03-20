import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get last 30 days of sales
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('sales')
      .select('date, net_amount')
      .eq('status', 'completed')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Trend query error:', error)
      return NextResponse.json({ error: 'Failed to fetch trend data' }, { status: 500 })
    }

    // Group by date
    const trend = data?.reduce((acc, sale) => {
      const date = sale.date
      if (!acc[date]) {
        acc[date] = { date, amount: 0 }
      }
      acc[date].amount += Number(sale.net_amount)
      return acc
    }, {} as Record<string, { date: string; amount: number }>)

    return NextResponse.json(Object.values(trend))

  } catch (error) {
    console.error('Trend API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
