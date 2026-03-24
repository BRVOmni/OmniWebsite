/**
 * Supervision Database Queries
 *
 * Centralized, reusable query functions for the supervision module.
 * All functions are typed, optimized, and include proper error handling.
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// TYPES
// ============================================================================

export interface VisitDetails {
  id: string
  visit_date: string
  visit_shift: string
  visit_type: string
  classification: string | null
  score_total: number | null
  score_operacion: number | null
  status: string
  locations: {
    id: string
    name: string
    cities: {
      name: string
    }
  }
  supervisors: {
    id: string
    name: string
  }
}

export interface FindingDetails {
  id: string
  created_at: string
  severity: string
  finding_type: string
  category: string
  title: string
  description: string | null
  is_recurring: boolean
  recurrence_count: number
  requires_photo: boolean
  photo_url: string | null
  supervision_visits: {
    id: string
    visit_date: string
    locations: {
      id: string
      name: string
      cities: {
        name: string
      }
    }
  }
}

export interface ActionDetails {
  id: string
  created_at: string
  description: string
  responsible_person: string | null
  priority: string
  committed_date: string | null
  actual_completion_date: string | null
  status: string
  is_overdue: boolean
  days_overdue: number
  verified: boolean
  locations: {
    id: string
    name: string
  }
  supervision_visits: {
    visit_date: string
  }
}

export interface ScheduleDetails {
  id: string
  planned_date: string
  planned_shift: string
  visit_type: string
  priority: string
  status: string
  locations: {
    id: string
    name: string
    cities: {
      name: string
    }
  }
  supervisors: {
    id: string
    name: string
  }
}

export interface LocationSummary {
  id: string
  name: string
  city: string
  total_visits: number
  last_visit_date: string | null
  average_score: number | null
  open_findings: number
  open_actions: number
}

export interface SupervisorSummary {
  id: string
  name: string
  total_visits: number
  completed_visits: number
  average_score: number | null
  assigned_locations: number
}

// ============================================================================
// SUPERVISION KPIs
// ============================================================================

/**
 * Get all supervision dashboard KPIs in a single query
 */
export async function getSupervisionKPIs(days: number = 30) {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [visitsResult, findingsResult, actionsResult] = await Promise.all([
    supabase
      .from('supervision_visits')
      .select('id, status, score_total')
      .gte('visit_date', startDate.toISOString().split('T')[0]),
    supabase
      .from('operational_findings')
      .select('id, severity, created_at')
      .gte('created_at', startDate.toISOString()),
    supabase
      .from('corrective_actions')
      .select('id, status, is_overdue')
      .gte('created_at', startDate.toISOString())
  ])

  const visits = visitsResult.data || []
  const findings = findingsResult.data || []
  const actions = actionsResult.data || []

  return {
    total_visits: visits.length,
    completed_visits: visits.filter(v => v.status === 'completed').length,
    average_score: visits
      .filter(v => v.status === 'completed' && v.score_total)
      .reduce((sum, v, _, arr) => sum + (v.score_total || 0) / arr.length, 0),
    total_findings: findings.length,
    critical_findings: findings.filter(f => f.severity === 'critical').length,
    open_actions: actions.filter(a => a.status !== 'completed').length,
    overdue_actions: actions.filter(a => a.is_overdue).length
  }
}

// ============================================================================
// VISIT QUERIES
// ============================================================================

/**
 * Get visits with filters
 */
export async function getVisits(filters: {
  locationId?: string
  supervisorId?: string
  startDate?: string
  endDate?: string
  status?: string
  classification?: string
  limit?: number
} = {}): Promise<VisitDetails[]> {
  const supabase = createClient()

  let query = supabase
    .from('supervision_visits')
    .select(`
      id,
      visit_date,
      visit_shift,
      visit_type,
      classification,
      score_total,
      score_operacion,
      status,
      locations(id, name, cities(name)),
      supervisors(id, name)
    `)
    .order('visit_date', { ascending: false })

  if (filters.locationId) query = query.eq('location_id', filters.locationId)
  if (filters.supervisorId) query = query.eq('supervisor_id', filters.supervisorId)
  if (filters.startDate) query = query.gte('visit_date', filters.startDate)
  if (filters.endDate) query = query.lte('visit_date', filters.endDate)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.classification) query = query.eq('classification', filters.classification)
  if (filters.limit) query = query.limit(filters.limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching visits:', error)
    return []
  }

  return data || []
}

/**
 * Get a single visit by ID with full details
 */
export async function getVisitById(visitId: string): Promise<VisitDetails | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('supervision_visits')
    .select(`
      id,
      visit_date,
      visit_shift,
      visit_type,
      classification,
      score_total,
      score_operacion,
      status,
      locations(id, name, cities(name)),
      supervisors(id, name),
      visit_checklist_results(
        id,
        compliant,
        notes,
        checklist_items(id, name, name_es, category_id, is_critical)
      ),
      operational_findings(
        id,
        severity,
        finding_type,
        category,
        title,
        description,
        is_recurring,
        recurrence_count,
        photo_url
      ),
      locations(
        id,
        name,
        cities(name)
      )
    `)
    .eq('id', visitId)
    .single()

  if (error || !data) {
    console.error('Error fetching visit:', error)
    return null
  }

  return data
}

/**
 * Get location supervision history
 */
export async function getLocationSupervisionHistory(
  locationId: string,
  limit: number = 10
): Promise<VisitDetails[]> {
  return getVisits({ locationId, limit })
}

// ============================================================================
// FINDING QUERIES
// ============================================================================

/**
 * Get findings with filters
 */
export async function getFindings(filters: {
  locationId?: string
  visitId?: string
  severity?: string
  category?: string
  isRecurring?: boolean
  limit?: number
} = {}): Promise<FindingDetails[]> {
  const supabase = createClient()

  let query = supabase
    .from('operational_findings')
    .select(`
      id,
      created_at,
      severity,
      finding_type,
      category,
      title,
      description,
      is_recurring,
      recurrence_count,
      requires_photo,
      photo_url,
      supervision_visits(
        id,
        visit_date,
        locations(id, name, cities(name))
      )
    `)
    .order('created_at', { ascending: false })

  if (filters.locationId) {
    query = query.eq('location_id', filters.locationId)
  }
  if (filters.visitId) query = query.eq('visit_id', filters.visitId)
  if (filters.severity) query = query.eq('severity', filters.severity)
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.isRecurring) query = query.eq('is_recurring', true)
  if (filters.limit) query = query.limit(filters.limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching findings:', error)
    return []
  }

  return data || []
}

/**
 * Get findings grouped by category
 */
export async function getFindingsByCategory(locationId?: string): Promise<Record<string, number>> {
  const findings = await getFindings({ locationId })

  const grouped: Record<string, number> = {}

  findings.forEach(finding => {
    const category = finding.category || 'uncategorized'
    grouped[category] = (grouped[category] || 0) + 1
  })

  return grouped
}

// ============================================================================
// ACTION QUERIES
// ============================================================================

/**
 * Get actions with filters
 */
export async function getActions(filters: {
  locationId?: string
  visitId?: string
  status?: string
  priority?: string
  isOverdue?: boolean
  limit?: number
} = {}): Promise<ActionDetails[]> {
  const supabase = createClient()

  let query = supabase
    .from('corrective_actions')
    .select(`
      id,
      created_at,
      description,
      responsible_person,
      priority,
      committed_date,
      actual_completion_date,
      status,
      is_overdue,
      days_overdue,
      verified,
      locations(id, name),
      supervision_visits(visit_date)
    `)
    .order('created_at', { ascending: false })

  if (filters.locationId) query = query.eq('location_id', filters.locationId)
  if (filters.visitId) query = query.eq('visit_id', filters.visitId)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.priority) query = query.eq('priority', filters.priority)
  if (filters.isOverdue) query = query.eq('is_overdue', true)
  if (filters.limit) query = query.limit(filters.limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching actions:', error)
    return []
  }

  return data || []
}

/**
 * Get pending and overdue actions
 */
export async function getPendingActions(locationId?: string): Promise<{
  pending: ActionDetails[]
  overdue: ActionDetails[]
}> {
  const [pending, overdue] = await Promise.all([
    getActions({ locationId, status: 'pending' }),
    getActions({ locationId, isOverdue: true })
  ])

  return { pending, overdue }
}

// ============================================================================
// SCHEDULE QUERIES
// ============================================================================

/**
 * Get scheduled visits with filters
 */
export async function getScheduledVisits(filters: {
  supervisorId?: string
  locationId?: string
  startDate?: string
  endDate?: string
  status?: string
  limit?: number
} = {}): Promise<ScheduleDetails[]> {
  const supabase = createClient()

  let query = supabase
    .from('supervision_schedule')
    .select(`
      id,
      planned_date,
      planned_shift,
      visit_type,
      priority,
      status,
      locations(id, name, cities(name)),
      supervisors(id, name)
    `)
    .order('planned_date', { ascending: true })

  if (filters.supervisorId) query = query.eq('supervisor_id', filters.supervisorId)
  if (filters.locationId) query = query.eq('location_id', filters.locationId)
  if (filters.startDate) query = query.gte('planned_date', filters.startDate)
  if (filters.endDate) query = query.lte('planned_date', filters.endDate)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.limit) query = query.limit(filters.limit)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching scheduled visits:', error)
    return []
  }

  return data || []
}

// ============================================================================
// LOCATION SUMMARY QUERIES
// ============================================================================

/**
 * Get summary of all locations with supervision data
 */
export async function getLocationsSummary(): Promise<LocationSummary[]> {
  const supabase = createClient()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, cities(name)')
    .eq('is_active', true)

  if (!locations) return []

  const summaries = await Promise.all(
    locations.map(async (location) => {
      const [visits, findings, actions] = await Promise.all([
        getVisits({ locationId, limit: 100 }),
        getFindings({ locationId, limit: 100 }),
        getActions({ locationId, status: 'pending', limit: 100 })
      ])

      const completedVisits = visits.filter(v => v.status === 'completed')
      const lastVisit = visits[0]

      return {
        id: location.id,
        name: location.name,
        city: location.cities?.name || 'Unknown',
        total_visits: visits.length,
        last_visit_date: lastVisit?.visit_date || null,
        average_score: completedVisits.length > 0
          ? completedVisits.reduce((sum, v) => sum + (v.score_total || 0), 0) / completedVisits.length
          : null,
        open_findings: findings.filter(f => !f.is_recurring).length,
        open_actions: actions.length
      }
    })
  )

  return summaries
}

// ============================================================================
// SUPERVISOR SUMMARY QUERIES
// ============================================================================

/**
 * Get summary of all supervisors with their performance
 */
export async function getSupervisorsSummary(): Promise<SupervisorSummary[]> {
  const supabase = createClient()

  const { data: supervisors } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'supervisor')

  if (!supervisors) return []

  const summaries = await Promise.all(
    supervisors.map(async (supervisor) => {
      const visits = await getVisits({ supervisorId: supervisor.id, limit: 100 })
      const completedVisits = visits.filter(v => v.status === 'completed')

      const { data: assignments } = await supabase
        .from('supervisor_assignments')
        .select('location_id')
        .eq('supervisor_id', supervisor.id)

      return {
        id: supervisor.id,
        name: supervisor.full_name,
        total_visits: visits.length,
        completed_visits: completedVisits.length,
        average_score: completedVisits.length > 0
          ? completedVisits.reduce((sum, v) => sum + (v.score_total || 0), 0) / completedVisits.length
          : null,
        assigned_locations: assignments?.length || 0
      }
    })
  )

  return summaries
}

// ============================================================================
// UTILITY QUERIES
// ============================================================================

/**
 * Get checklist categories and items for a visit type
 */
export async function getChecklistForVisitType(visitType: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('visit_templates')
    .select(`
      name,
      visit_template_items(
        checklist_items(id, name, name_es, category_id, is_critical)
      )
    `)
    .eq('visit_type', visitType)
    .single()

  if (error || !data) {
    console.error('Error fetching checklist:', error)
    return null
  }

  return data
}

/**
 * Get supervisors with their assigned locations
 */
export async function getSupervisorsWithLocations() {
  const supabase = createClient()

  const { data: supervisors } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'supervisor')

  if (!supervisors) return []

  const withLocations = await Promise.all(
    supervisors.map(async (supervisor) => {
      const { data: assignments } = await supabase
        .from('supervisor_assignments')
        .select(`
          locations(id, name, cities(name))
        `)
        .eq('supervisor_id', supervisor.id)

      return {
        id: supervisor.id,
        name: supervisor.full_name,
        locations: assignments?.map(a => a.locations).filter(Boolean) || []
      }
    })
  )

  return withLocations
}

/**
 * Get locations without recent visits
 */
export async function getLocationsNeedingVisits(daysThreshold: number = 45) {
  const summaries = await getLocationsSummary()

  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)

  return summaries.filter(summary => {
    if (!summary.last_visit_date) return true
    const lastVisit = new Date(summary.last_visit_date)
    return lastVisit < thresholdDate
  })
}
