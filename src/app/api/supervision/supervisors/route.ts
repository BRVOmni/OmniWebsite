/**
 * API Route: Supervisor Management
 *
 * Provides endpoints for supervisor analytics, performance tracking,
 * workload balancing, and route optimization.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  calculateSupervisorMetrics,
  getAllSupervisorsMetrics
} from '@/lib/utils/supervision-metrics'

// ============================================================================
// GET - Supervisor analytics and management data
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
    const type = searchParams.get('type') || 'all'
    const supervisorId = searchParams.get('supervisorId')
    const days = parseInt(searchParams.get('days') || '90')

    // Get all supervisors with rankings
    if (type === 'all') {
      const supervisors = await getAllSupervisorsMetrics(days)

      // Get additional data for each supervisor
      const enriched = await Promise.all(
        supervisors.map(async (supervisor) => {
          // Get assigned locations
          const { data: assignments } = await supabase
            .from('supervisor_assignments')
            .select(`
              locations(id, name, cities(name), latitude, longitude)
            `)
            .eq('supervisor_id', supervisor.supervisor_id)

          // Get upcoming scheduled visits
          const today = new Date().toISOString().split('T')[0]
          const nextWeek = new Date()
          nextWeek.setDate(nextWeek.getDate() + 7)
          const nextWeekStr = nextWeek.toISOString().split('T')[0]

          const { data: upcomingVisits } = await supabase
            .from('supervision_schedule')
            .select('id, planned_date, planned_shift, visit_type, locations(name, cities(name))')
            .eq('supervisor_id', supervisor.supervisor_id)
            .gte('planned_date', today)
            .lte('planned_date', nextWeekStr)
            .eq('status', 'pending')
            .order('planned_date', { ascending: true })
            .limit(5)

          return {
            ...supervisor,
            assigned_locations: assignments?.map(a => a.locations).filter(Boolean) || [],
            upcoming_visits: upcomingVisits || [],
            workload: calculateWorkload(assignments?.length || 0, supervisor.total_visits_completed)
          }
        })
      )

      return NextResponse.json({ supervisors: enriched })
    }

    // Get specific supervisor details
    if (type === 'supervisor' && supervisorId) {
      const metrics = await calculateSupervisorMetrics(supervisorId, days)

      if (!metrics) {
        return NextResponse.json({ error: 'Supervisor not found' }, { status: 404 })
      }

      // Get assigned locations with last visit info
      const { data: assignments } = await supabase
        .from('supervisor_assignments')
        .select(`
          locations(id, name, cities(name)),
          supervision_visits(id, visit_date, score_total, classification)
        `)
        .eq('supervisor_id', supervisorId)
        .order('locations(name)')

      const locationsWithVisits = (assignments || []).map((assignment: any) => {
        const visits = assignment.supervision_visits || []
        const lastVisit = visits.sort((a: any, b: any) =>
          new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
        )[0]

        return {
          location: assignment.locations,
          last_visit_date: lastVisit?.visit_date || null,
          last_visit_score: lastVisit?.score_total || null,
          last_visit_classification: lastVisit?.classification || null,
          total_visits: visits.length
        }
      })

      // Get upcoming schedule
      const today = new Date().toISOString().split('T')[0]
      const { data: upcomingSchedule } = await supabase
        .from('supervision_schedule')
        .select('*')
        .eq('supervisor_id', supervisorId)
        .gte('planned_date', today)
        .eq('status', 'pending')
        .order('planned_date', { ascending: true })
        .limit(10)

      return NextResponse.json({
        supervisor: {
          ...metrics,
          assigned_locations: locationsWithVisits,
          upcoming_schedule: upcomingSchedule || []
        }
      })
    }

    // Get leaderboard
    if (type === 'leaderboard') {
      const supervisors = await getAllSupervisorsMetrics(days)

      // Sort by multiple metrics for fair ranking
      const ranked = [...supervisors].sort((a, b) => {
        // Primary: Average score
        if (b.average_score !== a.average_score) {
          return b.average_score - a.average_score
        }
        // Secondary: Completion rate
        if (b.completion_rate !== a.completion_rate) {
          return b.completion_rate - a.completion_rate
        }
        // Tertiary: Compliance rate
        return b.compliance_rate - a.compliance_rate
      })

      // Add rank and calculate tier
      const leaderboard = ranked.map((supervisor, index) => ({
        ...supervisor,
        rank: index + 1,
        tier: getTier(index)
      }))

      return NextResponse.json({ leaderboard })
    }

    // Get workload distribution
    if (type === 'workload') {
      const supervisors = await getAllSupervisorsMetrics(days)

      const workloadData = supervisors.map(supervisor => ({
        supervisor_id: supervisor.supervisor_id,
        supervisor_name: supervisor.supervisor_name,
        assigned_locations: supervisor.locations_assigned,
        visits_this_period: supervisor.total_visits_completed,
        workload_level: calculateWorkload(supervisor.locations_assigned, supervisor.total_visits_completed),
        utilization_rate: supervisor.locations_assigned > 0
          ? Math.round((supervisor.locations_visited_this_month / supervisor.locations_assigned) * 100)
          : 0
      }))

      // Calculate balance score
      const avgWorkload = workloadData.reduce((sum, w) => sum + w.workload_level, 0) / workloadData.length
      const balanceScore = calculateWorkloadBalance(workloadData.map(w => w.workload_level))

      return NextResponse.json({
        workload_distribution: workloadData,
        average_workload: Math.round(avgWorkload),
        balance_score: balanceScore,
        recommendations: generateWorkloadRecommendations(workloadData, avgWorkload)
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error) {
    console.error('Supervisor management GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate workload level (0-100)
 */
function calculateWorkload(locationsAssigned: number, visitsCompleted: number): number {
  // Base score from locations (40%)
  const locationScore = Math.min(100, locationsAssigned * 20)

  // Score from visits (60%)
  const visitScore = Math.min(100, visitsCompleted * 5)

  return Math.round(locationScore * 0.4 + visitScore * 0.6)
}

/**
 * Calculate workload balance (0-100, higher is more balanced)
 */
function calculateWorkloadBalance(workloads: number[]): number {
  if (workloads.length === 0) return 100

  const avg = workloads.reduce((sum, w) => sum + w, 0) / workloads.length
  const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avg, 2), 0) / workloads.length
  const stdDev = Math.sqrt(variance)

  // Lower standard deviation = more balanced
  // Convert to 0-100 scale where 100 = perfect balance
  const balanceScore = Math.max(0, 100 - (stdDev / avg) * 100)

  return Math.round(balanceScore)
}

/**
 * Get performance tier based on rank
 */
function getTier(rank: number): string {
  if (rank === 1) return 'champion'
  if (rank <= 3) return 'gold'
  if (rank <= 5) return 'silver'
  if (rank <= 10) return 'bronze'
  return 'standard'
}

/**
 * Generate workload balancing recommendations
 */
function generateWorkloadRecommendations(workloadData: any[], avgWorkload: number): string[] {
  const recommendations: string[] = []

  // Find overworked supervisors
  const overworked = workloadData.filter(w => w.workload_level > avgWorkload * 1.3)
  if (overworked.length > 0) {
    overworked.forEach(sup => {
      recommendations.push(
        `Consider reassigning 1-2 locations from ${sup.supervisor_name} to balance workload`
      )
    })
  }

  // Find underworked supervisors
  const underworked = workloadData.filter(w => w.workload_level < avgWorkload * 0.7)
  if (underworked.length > 0) {
    underworked.forEach(sup => {
      recommendations.push(
        `${sup.supervisor_name} has capacity for 2-3 more locations`
      )
    })
  }

  // Check utilization rates
  const lowUtilization = workloadData.filter(w => w.utilization_rate < 50)
  if (lowUtilization.length > 0) {
    recommendations.push(
      `${lowUtilization.length} supervisor(s) with low utilization - review visit scheduling`
    )
  }

  if (recommendations.length === 0) {
    recommendations.push('Workload is well balanced across all supervisors')
  }

  return recommendations
}

// ============================================================================
// POST - Update supervisor assignments
// ============================================================================

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { action, supervisorId, locationId } = body

    if (action === 'assign') {
      // Assign location to supervisor
      const { data, error } = await supabase
        .from('supervisor_assignments')
        .insert({
          supervisor_id: supervisorId,
          location_id: locationId,
          assigned_date: new Date().toISOString().split('T')[0],
          assigned_by: user.id
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, assignment: data })
    }

    if (action === 'unassign') {
      // Remove location from supervisor
      const { error } = await supabase
        .from('supervisor_assignments')
        .delete()
        .eq('supervisor_id', supervisorId)
        .eq('location_id', locationId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Supervisor assignment error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
