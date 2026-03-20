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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'location' // 'location' or 'brand'
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]

    if (type === 'brand') {
      // Get brand rankings
      const { data, error } = await supabase
        .from('sales')
        .select('brand_id, brands(name, color), net_amount')
        .eq('status', 'completed')
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) {
        console.error('Brand rankings error:', error)
        return NextResponse.json({ error: 'Failed to fetch brand rankings' }, { status: 500 })
      }

      // Aggregate by brand
      const rankings = data?.reduce((acc, sale) => {
        const brandId = sale.brand_id || 'unknown'
        const brand = (sale.brands as any)?.name || 'Unknown'
        const color = (sale.brands as any)?.color || '#000000'
        if (!acc[brandId]) {
          acc[brandId] = { id: brandId, name: brand, color, totalSales: 0 }
        }
        acc[brandId].totalSales += Number(sale.net_amount)
        return acc
      }, {} as Record<string, { id: string; name: string; color: string; totalSales: number }>)

      const brands = Object.values(rankings).sort((a, b) => b.totalSales - a.totalSales)

      // Add traffic lights
      const maxSales = brands[0]?.totalSales || 1
      const brandsWithStatus = brands.map((brand) => ({
        ...brand,
        status: brand.totalSales >= maxSales * 0.8 ? 'success' : brand.totalSales >= maxSales * 0.5 ? 'warning' : 'danger',
      }))

      return NextResponse.json(brandsWithStatus)
    }

    // Get location rankings (default)
    const { data, error } = await supabase
      .from('sales')
      .select('location_id, locations(name), net_amount')
      .eq('status', 'completed')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      console.error('Location rankings error:', error)
      return NextResponse.json({ error: 'Failed to fetch location rankings' }, { status: 500 })
    }

    // Aggregate by location
    const rankings = data?.reduce((acc, sale) => {
      const locId = sale.location_id || 'unknown'
      const locName = (sale.locations as any)?.name || 'Unknown'
      if (!acc[locId]) {
        acc[locId] = { id: locId, name: locName, totalSales: 0 }
      }
      acc[locId].totalSales += Number(sale.net_amount)
      return acc
    }, {} as Record<string, { id: string; name: string; totalSales: number }>)

    const locations = Object.values(rankings).sort((a, b) => b.totalSales - a.totalSales)

    return NextResponse.json(locations)

  } catch (error) {
    console.error('Rankings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
