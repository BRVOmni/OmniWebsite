/**
 * API Route: Supervision Metrics
 *
 * Provides comprehensive analytics for the supervision module including:
 * - Dashboard KPIs
 * - Supervisor performance metrics
 * - Location performance metrics
 * - Finding patterns analysis
 * - Action completion metrics
 * - Heat map data
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  getSupervisionDashboardKPIs,
  getAllSupervisorsMetrics,
  getAllLocationsMetrics,
  analyzeFindingPatterns,
  calculateActionMetrics,
  generateHeatMapData
} from '@/lib/utils/supervision-metrics'

// ============================================================================
// GET - Fetch metrics
// ============================================================================

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'
    const days = parseInt(searchParams.get('days') || '30')
    const supervisorId = searchParams.get('supervisorId')
    const locationId = searchParams.get('locationId')

    // Return dashboard KPIs
    if (type === 'dashboard') {
      const kpis = await getSupervisionDashboardKPIs(days)
      return NextResponse.json({ kpis })
    }

    // Return all supervisors metrics
    if (type === 'supervisors') {
      const metrics = await getAllSupervisorsMetrics(days)
      return NextResponse.json({ metrics })
    }

    // Return specific supervisor metrics
    if (type === 'supervisor' && supervisorId) {
      const { calculateSupervisorMetrics } = await import('@/lib/utils/supervision-metrics')
      const metrics = await calculateSupervisorMetrics(supervisorId, days)

      if (!metrics) {
        return NextResponse.json({ error: 'Supervisor not found' }, { status: 404 })
      }

      return NextResponse.json({ metrics })
    }

    // Return all locations metrics
    if (type === 'locations') {
      const metrics = await getAllLocationsMetrics(days)
      return NextResponse.json({ metrics })
    }

    // Return specific location metrics
    if (type === 'location' && locationId) {
      const { calculateLocationMetrics } = await import('@/lib/utils/supervision-metrics')
      const metrics = await calculateLocationMetrics(locationId, days)

      if (!metrics) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 })
      }

      return NextResponse.json({ metrics })
    }

    // Return finding patterns
    if (type === 'patterns') {
      const patterns = await analyzeFindingPatterns(days)
      return NextResponse.json({ patterns })
    }

    // Return action metrics
    if (type === 'actions') {
      const metrics = await calculateActionMetrics(days)
      return NextResponse.json({ metrics })
    }

    // Return heat map data
    if (type === 'heatmap') {
      const data = await generateHeatMapData()
      return NextResponse.json({ data })
    }

    // Return all metrics (comprehensive)
    if (type === 'all') {
      const [kpis, supervisors, locations, patterns, actions, heatmap] = await Promise.all([
        getSupervisionDashboardKPIs(days),
        getAllSupervisorsMetrics(days),
        getAllLocationsMetrics(days),
        analyzeFindingPatterns(days),
        calculateActionMetrics(days),
        generateHeatMapData()
      ])

      return NextResponse.json({
        kpis,
        supervisors,
        locations,
        patterns,
        actions,
        heatmap
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    console.error('Supervision metrics GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
