/**
 * Supervision Metrics Calculation System
 *
 * Comprehensive analytics for the supervision module including:
 * - Supervisor performance metrics
 * - Location performance metrics
 * - Finding patterns and recurrence analysis
 * - Action completion rates and tracking
 * - Heat maps and trend analysis
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// TYPES
// ============================================================================

export interface SupervisorMetrics {
  supervisor_id: string
  supervisor_name: string
  total_visits_scheduled: number
  total_visits_completed: number
  completion_rate: number
  average_score: number
  average_operation_score: number
  total_findings: number
  critical_findings: number
  total_actions_created: number
  actions_completed: number
  actions_overdue: number
  locations_assigned: number
  locations_visited_this_month: number
  days_since_last_visit: number | null
  compliance_rate: number
  performance_trend: 'improving' | 'stable' | 'declining'
  ranking: number
}

export interface LocationMetrics {
  location_id: string
  location_name: string
  city: string
  total_visits: number
  days_since_last_visit: number
  average_score: number
  average_operation_score: number
  last_classification: string
  total_findings: number
  critical_findings_count: number
  recurring_issues_count: number
  open_actions: number
  overdue_actions: number
  compliance_level: 'excellent' | 'good' | 'fair' | 'critical'
  visit_frequency_score: number
  performance_trend: 'improving' | 'stable' | 'declining'
  health_status: 'healthy' | 'attention' | 'critical'
}

export interface FindingPatterns {
  category: string
  finding_type: string
  total_count: number
  critical_count: number
  high_count: number
  recurrence_count: number
  most_affected_locations: {
    location_id: string
    location_name: string
    count: number
  }[]
  trend: 'increasing' | 'stable' | 'decreasing'
  last_30_days: number
  last_90_days: number
}

export interface ActionCompletionMetrics {
  total_actions: number
  completed_actions: number
  pending_actions: number
  in_progress_actions: number
  overdue_actions: number
  completion_rate: number
  average_completion_days: number
  by_priority: {
    priority: string
    total: number
    completed: number
    overdue: number
  }[]
  by_location: {
    location_id: string
    location_name: string
    overdue: number
    pending: number
  }[]
}

export interface HeatMapData {
  location_id: string
  location_name: string
  city: string
  lat: number | null
  lng: number | null
  last_visit_date: string | null
  days_since_last_visit: number
  average_score: number
  critical_findings: number
  overdue_actions: number
  health_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
}

// ============================================================================
// SUPERVISOR METRICS
// ============================================================================

/**
 * Calculate comprehensive performance metrics for a supervisor
 */
export async function calculateSupervisorMetrics(
  supervisorId: string,
  days: number = 90
): Promise<SupervisorMetrics | null> {
  const supabase = createClient()

  // Get supervisor info
  const { data: supervisor } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('id', supervisorId)
    .single()

  if (!supervisor) return null

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get all visits (scheduled and completed)
  const { data: visits } = await supabase
    .from('supervision_visits')
    .select('id, visit_date, status, score_total, score_operacion, location_id')
    .eq('supervisor_id', supervisorId)
    .gte('visit_date', startDate.toISOString().split('T')[0])

  // Get findings from these visits
  const visitIds = visits?.map(v => v.id) || []
  const { data: findings } = await supabase
    .from('operational_findings')
    .select('id, severity')
    .in('visit_id', visitIds)

  // Get actions linked to findings
  const findingIds = findings?.map(f => f.id) || []
  const { data: actions } = await supabase
    .from('corrective_actions')
    .select('id, status, is_overdue, committed_date')
    .in('finding_id', findingIds)

  // Get assigned locations
  const { data: assignments } = await supabase
    .from('supervisor_assignments')
    .select('location_id')
    .eq('supervisor_id', supervisorId)

  // Calculate metrics
  const totalVisitsScheduled = visits?.length || 0
  const totalVisitsCompleted = visits?.filter(v => v.status === 'completed').length || 0
  const completionRate = totalVisitsScheduled > 0
    ? Math.round((totalVisitsCompleted / totalVisitsScheduled) * 100)
    : 0

  const completedVisits = visits?.filter(v => v.status === 'completed' && v.score_total) || []
  const averageScore = completedVisits.length > 0
    ? Math.round(completedVisits.reduce((sum, v) => sum + (v.score_total || 0), 0) / completedVisits.length)
    : 0

  const averageOperationScore = completedVisits.length > 0
    ? Math.round(completedVisits.reduce((sum, v) => sum + (v.score_operacion || 0), 0) / completedVisits.length)
    : 0

  const totalFindings = findings?.length || 0
  const criticalFindings = findings?.filter(f => f.severity === 'critical').length || 0

  const totalActionsCreated = actions?.length || 0
  const actionsCompleted = actions?.filter(a => a.status === 'completed').length || 0
  const actionsOverdue = actions?.filter(a => a.is_overdue).length || 0

  const locationsAssigned = assignments?.length || 0

  // Locations visited this month
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const locationsVisitedThisMonth = new Set(
    visits
      ?.filter(v => new Date(v.visit_date) >= thisMonth)
      .map(v => v.location_id)
  ).size

  // Days since last visit
  const sortedVisits = visits
    ?.filter(v => v.status === 'completed')
    .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())

  const daysSinceLastVisit = sortedVisits && sortedVisits.length > 0
    ? Math.floor((Date.now() - new Date(sortedVisits[0].visit_date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Compliance rate (visits completed on schedule)
  const scheduledVisits = await supabase
    .from('supervision_schedule')
    .select('planned_date, completed_visit_id')
    .eq('supervisor_id', supervisorId)
    .gte('planned_date', startDate.toISOString().split('T')[0])

  const onTimeCompletions = scheduledVisits.data?.filter(s => s.completed_visit_id).length || 0
  const complianceRate = scheduledVisits.data && scheduledVisits.data.length > 0
    ? Math.round((onTimeCompletions / scheduledVisits.data.length) * 100)
    : 100

  // Performance trend (compare recent vs older visits)
  const midPoint = Math.floor(completedVisits.length / 2)
  const recentAvg = midPoint > 0
    ? completedVisits.slice(0, midPoint).reduce((sum, v) => sum + (v.score_total || 0), 0) / midPoint
    : averageScore
  const olderAvg = midPoint > 0 && completedVisits.length > midPoint
    ? completedVisits.slice(midPoint).reduce((sum, v) => sum + (v.score_total || 0), 0) / (completedVisits.length - midPoint)
    : averageScore

  let performanceTrend: 'improving' | 'stable' | 'declining' = 'stable'
  if (recentAvg - olderAvg > 5) performanceTrend = 'improving'
  else if (olderAvg - recentAvg > 5) performanceTrend = 'declining'

  return {
    supervisor_id: supervisorId,
    supervisor_name: supervisor.full_name,
    total_visits_scheduled: totalVisitsScheduled,
    total_visits_completed: totalVisitsCompleted,
    completion_rate: completionRate,
    average_score: averageScore,
    average_operation_score: averageOperationScore,
    total_findings: totalFindings,
    critical_findings: criticalFindings,
    total_actions_created: totalActionsCreated,
    actions_completed: actionsCompleted,
    actions_overdue: actionsOverdue,
    locations_assigned: locationsAssigned,
    locations_visited_this_month: locationsVisitedThisMonth,
    days_since_last_visit: daysSinceLastVisit,
    compliance_rate: complianceRate,
    performance_trend: performanceTrend,
    ranking: 0 // To be calculated when getting all supervisors
  }
}

/**
 * Get metrics for all supervisors with ranking
 */
export async function getAllSupervisorsMetrics(days: number = 90): Promise<SupervisorMetrics[]> {
  const supabase = createClient()

  const { data: supervisors } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'supervisor')

  if (!supervisors || supervisors.length === 0) return []

  const metrics = await Promise.all(
    supervisors.map(async ({ id }) => {
      const metrics = await calculateSupervisorMetrics(id, days)
      return metrics
    })
  )

  const validMetrics = metrics.filter((m): m is SupervisorMetrics => m !== null)

  // Calculate rankings based on weighted score
  const ranked = validMetrics.map(m => ({
    ...m,
    ranking: 0
  }))

  ranked.sort((a, b) => {
    const scoreA = a.average_score * 0.4 + a.completion_rate * 0.3 + a.compliance_rate * 0.3
    const scoreB = b.average_score * 0.4 + b.completion_rate * 0.3 + b.compliance_rate * 0.3
    return scoreB - scoreA
  })

  ranked.forEach((m, index) => {
    m.ranking = index + 1
  })

  return ranked
}

// ============================================================================
// LOCATION METRICS
// ============================================================================

/**
 * Calculate comprehensive metrics for a location
 */
export async function calculateLocationMetrics(
  locationId: string,
  days: number = 90
): Promise<LocationMetrics | null> {
  const supabase = createClient()

  // Get location info
  const { data: location } = await supabase
    .from('locations')
    .select('id, name, cities(name)')
    .eq('id', locationId)
    .single()

  if (!location) return null

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get visits
  const { data: visits } = await supabase
    .from('supervision_visits')
    .select('id, visit_date, status, score_total, score_operacion, classification')
    .eq('location_id', locationId)
    .gte('visit_date', startDate.toISOString().split('T')[0])
    .order('visit_date', { ascending: false })

  // Get findings
  const visitIds = visits?.map(v => v.id) || []
  const { data: findings } = await supabase
    .from('operational_findings')
    .select('id, severity, is_recurring, category')
    .in('visit_id', visitIds)

  // Get actions
  const findingIds = findings?.map(f => f.id) || []
  const { data: actions } = await supabase
    .from('corrective_actions')
    .select('id, status, is_overdue')
    .in('finding_id', findingIds)

  // Calculate metrics
  const totalVisits = visits?.length || 0
  const lastVisit = visits?.[0]
  const daysSinceLastVisit = lastVisit
    ? Math.floor((Date.now() - new Date(lastVisit.visit_date).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  const completedVisits = visits?.filter(v => v.status === 'completed' && v.score_total) || []
  const averageScore = completedVisits.length > 0
    ? Math.round(completedVisits.reduce((sum, v) => sum + (v.score_total || 0), 0) / completedVisits.length)
    : 0

  const averageOperationScore = completedVisits.length > 0
    ? Math.round(completedVisits.reduce((sum, v) => sum + (v.score_operacion || 0), 0) / completedVisits.length)
    : 0

  const lastClassification = lastVisit?.classification || 'none'

  const totalFindings = findings?.length || 0
  const criticalFindingsCount = findings?.filter(f => f.severity === 'critical').length || 0
  const recurringIssuesCount = findings?.filter(f => f.is_recurring).length || 0

  const openActions = actions?.filter(a => a.status !== 'completed').length || 0
  const overdueActions = actions?.filter(a => a.is_overdue).length || 0

  // Compliance level
  let compliance_level: 'excellent' | 'good' | 'fair' | 'critical' = 'critical'
  if (averageScore >= 90 && overdueActions === 0) compliance_level = 'excellent'
  else if (averageScore >= 75 && overdueActions <= 1) compliance_level = 'good'
  else if (averageScore >= 60) compliance_level = 'fair'

  // Visit frequency score (how well they're being visited)
  const expectedVisits = Math.floor(days / 30) // 1 visit per month expected
  const visitFrequencyScore = expectedVisits > 0
    ? Math.min(100, Math.round((totalVisits / expectedVisits) * 100))
    : 0

  // Performance trend
  const midPoint = Math.floor(completedVisits.length / 2)
  const recentAvg = midPoint > 0
    ? completedVisits.slice(0, midPoint).reduce((sum, v) => sum + (v.score_total || 0), 0) / midPoint
    : averageScore
  const olderAvg = midPoint > 0 && completedVisits.length > midPoint
    ? completedVisits.slice(midPoint).reduce((sum, v) => sum + (v.score_total || 0), 0) / (completedVisits.length - midPoint)
    : averageScore

  let performance_trend: 'improving' | 'stable' | 'declining' = 'stable'
  if (recentAvg - olderAvg > 5) performance_trend = 'improving'
  else if (olderAvg - recentAvg > 5) performance_trend = 'declining'

  // Health status
  let health_status: 'healthy' | 'attention' | 'critical' = 'critical'
  if (averageScore >= 80 && overdueActions === 0 && daysSinceLastVisit < 45) health_status = 'healthy'
  else if (averageScore >= 60 && overdueActions <= 2) health_status = 'attention'

  return {
    location_id: locationId,
    location_name: location.name,
    city: (location.cities as any)?.name || 'Unknown',
    total_visits: totalVisits,
    days_since_last_visit: daysSinceLastVisit,
    average_score: averageScore,
    average_operation_score: averageOperationScore,
    last_classification: lastClassification,
    total_findings: totalFindings,
    critical_findings_count: criticalFindingsCount,
    recurring_issues_count: recurringIssuesCount,
    open_actions: openActions,
    overdue_actions: overdueActions,
    compliance_level,
    visit_frequency_score: visitFrequencyScore,
    performance_trend,
    health_status
  }
}

/**
 * Get metrics for all locations
 */
export async function getAllLocationsMetrics(days: number = 90): Promise<LocationMetrics[]> {
  const supabase = createClient()

  const { data: locations } = await supabase
    .from('locations')
    .select('id')
    .eq('is_active', true)

  if (!locations || locations.length === 0) return []

  const metrics = await Promise.all(
    locations.map(async ({ id }) => {
      return await calculateLocationMetrics(id, days)
    })
  )

  return metrics.filter((m): m is LocationMetrics => m !== null)
}

// ============================================================================
// FINDING PATTERNS
// ============================================================================

/**
 * Analyze finding patterns across locations and time
 */
export async function analyzeFindingPatterns(days: number = 90): Promise<FindingPatterns[]> {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: findings } = await supabase
    .from('operational_findings')
    .select(`
      id,
      category,
      finding_type,
      severity,
      is_recurring,
      supervision_visits(
        location_id,
        locations(id, name)
      )
    `)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (!findings || findings.length === 0) return []

  // Group by category and finding type
  const patterns: Record<string, FindingPatterns> = {}

  findings.forEach((finding: any) => {
    const key = `${finding.category}-${finding.finding_type}`

    if (!patterns[key]) {
      patterns[key] = {
        category: finding.category,
        finding_type: finding.finding_type,
        total_count: 0,
        critical_count: 0,
        high_count: 0,
        recurrence_count: 0,
        most_affected_locations: [],
        trend: 'stable',
        last_30_days: 0,
        last_90_days: 0
      }
    }

    patterns[key].total_count++
    if (finding.severity === 'critical') patterns[key].critical_count++
    if (finding.severity === 'high') patterns[key].high_count++
    if (finding.is_recurring) patterns[key].recurrence_count++

    // Track affected locations
    const locationId = finding.supervision_visits?.location_id
    const locationName = finding.supervision_visits?.locations?.name

    if (locationId) {
      const existingLocation = patterns[key].most_affected_locations.find(l => l.location_id === locationId)
      if (existingLocation) {
        existingLocation.count++
      } else {
        patterns[key].most_affected_locations.push({
          location_id: locationId,
          location_name: locationName || 'Unknown',
          count: 1
        })
      }
    }
  })

  // Sort locations by count and keep top 5
  Object.values(patterns).forEach(pattern => {
    pattern.most_affected_locations.sort((a, b) => b.count - a.count)
    pattern.most_affected_locations = pattern.most_affected_locations.slice(0, 5)

    // Calculate trend (last 30 vs 30-90 days ago)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recent = findings.filter((f: any) => {
      const catType = `${f.category}-${f.finding_type}`
      return catType === `${pattern.category}-${pattern.finding_type}` &&
             new Date(f.created_at) >= thirtyDaysAgo
    }).length

    const older = findings.filter((f: any) => {
      const catType = `${f.category}-${f.finding_type}`
      const created = new Date(f.created_at)
      return catType === `${pattern.category}-${pattern.finding_type}` &&
             created >= startDate &&
             created < thirtyDaysAgo
    }).length

    pattern.last_30_days = recent
    pattern.last_90_days = recent + older

    if (recent > older * 1.5) pattern.trend = 'increasing'
    else if (older > recent * 1.5) pattern.trend = 'decreasing'
  })

  return Object.values(patterns).sort((a, b) => b.total_count - a.total_count)
}

// ============================================================================
// ACTION COMPLETION METRICS
// ============================================================================

/**
 * Calculate action completion metrics
 */
export async function calculateActionMetrics(days: number = 90): Promise<ActionCompletionMetrics> {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: actions } = await supabase
    .from('corrective_actions')
    .select('id, status, priority, is_overdue, created_at, actual_completion_date, location_id, locations(name)')
    .gte('created_at', startDate.toISOString())

  if (!actions || actions.length === 0) {
    return {
      total_actions: 0,
      completed_actions: 0,
      pending_actions: 0,
      in_progress_actions: 0,
      overdue_actions: 0,
      completion_rate: 0,
      average_completion_days: 0,
      by_priority: [],
      by_location: []
    }
  }

  const total = actions.length
  const completed = actions.filter(a => a.status === 'completed').length
  const pending = actions.filter(a => a.status === 'pending').length
  const inProgress = actions.filter(a => a.status === 'in_progress').length
  const overdue = actions.filter(a => a.is_overdue).length

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // Average completion days
  const completedActions = actions.filter(a => a.status === 'completed' && a.actual_completion_date)
  const avgCompletionDays = completedActions.length > 0
    ? Math.round(
        completedActions.reduce((sum, a) => {
          const created = new Date(a.created_at)
          const completed = new Date(a.actual_completion_date!)
          return sum + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / completedActions.length
      )
    : 0

  // By priority
  const priorities = ['critical', 'high', 'medium', 'low']
  const byPriority = priorities.map(priority => {
    const priorityActions = actions.filter(a => a.priority === priority)
    return {
      priority,
      total: priorityActions.length,
      completed: priorityActions.filter(a => a.status === 'completed').length,
      overdue: priorityActions.filter(a => a.is_overdue).length
    }
  })

  // By location (top 10 with most overdue)
  const locationMap = new Map<string, { location_id: string; location_name: string; overdue: number; pending: number }>()

  actions.forEach(action => {
    if (!action.location_id) return

    const existing = locationMap.get(action.location_id)
    const locationName = (action.locations as any)?.name || 'Unknown'

    if (existing) {
      if (action.is_overdue) existing.overdue++
      if (action.status === 'pending') existing.pending++
    } else {
      locationMap.set(action.location_id, {
        location_id: action.location_id,
        location_name: locationName,
        overdue: action.is_overdue ? 1 : 0,
        pending: action.status === 'pending' ? 1 : 0
      })
    }
  })

  const byLocation = Array.from(locationMap.values())
    .filter(l => l.overdue > 0 || l.pending > 0)
    .sort((a, b) => b.overdue - a.overdue)
    .slice(0, 10)

  return {
    total_actions: total,
    completed_actions: completed,
    pending_actions: pending,
    in_progress_actions: inProgress,
    overdue_actions: overdue,
    completion_rate: completionRate,
    average_completion_days: avgCompletionDays,
    by_priority: byPriority,
    by_location: byLocation
  }
}

// ============================================================================
// HEAT MAP DATA
// ============================================================================

/**
 * Generate heat map data for all locations
 */
export async function generateHeatMapData(): Promise<HeatMapData[]> {
  const supabase = createClient()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, cities(name), latitude, longitude')
    .eq('is_active', true)

  if (!locations || locations.length === 0) return []

  const heatMapData = await Promise.all(
    locations.map(async (location) => {
      const metrics = await calculateLocationMetrics(location.id, 90)

      if (!metrics) return null

      // Calculate health score (0-100)
      const scoreWeight = 0.4
      const visitWeight = 0.3
      const actionWeight = 0.3

      const normalizedScore = metrics.average_score
      const normalizedVisit = Math.max(0, 100 - metrics.days_since_last_visit)
      const normalizedAction = Math.max(0, 100 - (metrics.overdue_actions * 20))

      const healthScore = Math.round(
        normalizedScore * scoreWeight +
        normalizedVisit * visitWeight +
        normalizedAction * actionWeight
      )

      // Determine risk level
      let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low'
      if (healthScore < 40) risk_level = 'critical'
      else if (healthScore < 60) risk_level = 'high'
      else if (healthScore < 80) risk_level = 'medium'

      return {
        location_id: location.id,
        location_name: location.name,
        city: (location.cities as any)?.name || 'Unknown',
        lat: location.latitude,
        lng: location.longitude,
        last_visit_date: metrics.total_visits > 0
          ? new Date(Date.now() - metrics.days_since_last_visit * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
        days_since_last_visit: metrics.days_since_last_visit,
        average_score: metrics.average_score,
        critical_findings: metrics.critical_findings_count,
        overdue_actions: metrics.overdue_actions,
        health_score: healthScore,
        risk_level
      }
    })
  )

  return heatMapData.filter((h): h is HeatMapData => h !== null)
}

// ============================================================================
// AGGREGATED DASHBOARD METRICS
// ============================================================================

/**
 * Get all supervision KPIs for the main dashboard
 */
export async function getSupervisionDashboardKPIs(days: number = 30) {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Parallel queries for performance
  const [
    visitsResult,
    findingsResult,
    actionsResult,
    supervisorsResult,
    locationsResult
  ] = await Promise.all([
    supabase
      .from('supervision_visits')
      .select('id, status, score_total, visit_date')
      .gte('visit_date', startDate.toISOString().split('T')[0]),
    supabase
      .from('operational_findings')
      .select('id, severity, created_at')
      .gte('created_at', startDate.toISOString()),
    supabase
      .from('corrective_actions')
      .select('id, status, is_overdue')
      .gte('created_at', startDate.toISOString()),
    supabase
      .from('users')
      .select('id')
      .eq('role', 'supervisor'),
    supabase
      .from('locations')
      .select('id')
      .eq('is_active', true)
  ])

  const visits = visitsResult.data || []
  const findings = findingsResult.data || []
  const actions = actionsResult.data || []
  const supervisorCount = supervisorsResult.data?.length || 0
  const locationCount = locationsResult.data?.length || 0

  // Calculate KPIs
  const totalVisits = visits.length
  const completedVisits = visits.filter(v => v.status === 'completed').length
  const visitCompletionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0

  const avgScore = visits
    .filter(v => v.status === 'completed' && v.score_total)
    .reduce((sum, v, _, arr) => sum + (v.score_total || 0) / arr.length, 0)

  const criticalFindings = findings.filter(f => f.severity === 'critical').length
  const totalFindings = findings.length

  const openActions = actions.filter(a => a.status !== 'completed').length
  const overdueActions = actions.filter(a => a.is_overdue).length

  // Locations without visit in X days
  const daysThreshold = 45
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)

  const { data: recentVisits } = await supabase
    .from('supervision_visits')
    .select('location_id, visit_date')
    .gte('visit_date', thresholdDate.toISOString().split('T')[0])

  const visitedLocationIds = new Set(recentVisits?.map(v => v.location_id) || [])
  const locationsWithoutVisit = locationCount - visitedLocationIds.size

  // Compliance score
  const complianceScore = avgScore > 0
    ? Math.round(avgScore * 0.7 + visitCompletionRate * 0.3)
    : 0

  return {
    total_supervisors: supervisorCount,
    total_locations: locationCount,
    total_visits: totalVisits,
    completed_visits: completedVisits,
    visit_completion_rate: visitCompletionRate,
    average_score: Math.round(avgScore),
    total_findings: totalFindings,
    critical_findings: criticalFindings,
    open_actions: openActions,
    overdue_actions: overdueActions,
    locations_without_visit: locationsWithoutVisit,
    compliance_score: complianceScore
  }
}
