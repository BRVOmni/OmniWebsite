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
    const limit = parseInt(searchParams.get('limit') || '10')

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Alerts query error:', error)
      // Return empty array if alerts table doesn't have data yet
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])

  } catch (error) {
    console.error('Alerts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
