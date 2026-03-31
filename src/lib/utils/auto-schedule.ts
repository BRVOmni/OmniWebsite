/**
 * Auto-Scheduling System for Supervision Visits
 *
 * Automatically generates supervision visit schedules based on:
 * - Location visit frequency requirements
 * - Supervisor capacity and availability
 * - Geographic optimization
 * - Visit type distribution (rapid, full audit, surprise)
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export interface ScheduleVisit {
  location_id: string
  supervisor_id: string
  planned_date: string
  planned_shift: string
  visit_type: 'rapida' | 'completa' | 'sorpresa'
  priority?: 'critical' | 'high' | 'normal' | 'low'
  status?: 'pending' | 'in_progress' | 'completed' | 'missed' | 'cancelled'
}

export interface LocationInfo {
  id: string
  name: string
  city: string
  brand_id: string
  latitude?: number
  longitude?: number
  supervision_priority?: 'critical' | 'high' | 'regular' | 'low'
  required_rapid_visits_per_week?: number
  required_full_audit_per_month?: number
  required_surprise_visits_per_month?: number
}

export interface SupervisorInfo {
  id: string
  name: string
  email: string
  assigned_locations?: string[]
  max_visits_per_day?: number
  preferred_shifts?: string[]
  preferred_days?: number[]
}

export interface SchedulingRule {
  id?: string
  visit_type: 'rapida' | 'completa' | 'sorpresa'
  frequency_per_month: number
  priority: 'low' | 'medium' | 'high'
  rapid_visits_per_week?: number
  full_audit_per_month?: number
  surprise_visits_per_month?: number
  max_visits_per_day?: number
  max_visits_per_week?: number
  high_priority_locations?: string[]
}

export interface SchedulingResult {
  success: boolean
  visits_created: number
  visits_skipped: number
  errors: string[]
  warnings: string[]
  visits_created_details?: Array<{
    id: string
    location: string
    supervisor: string
    date: string
    shift: string
    type: string
  }>
}

interface ExistingVisit {
  id: string
  location_id: string
  supervisor_id: string
  scheduled_date: string
  shift: string
  visit_type: string
}

/**
 * Default scheduling rules
 */
const DEFAULT_RULES: SchedulingRule[] = [
  {
    visit_type: 'rapida',
    frequency_per_month: 8, // 2x per week
    priority: 'medium'
  },
  {
    visit_type: 'completa',
    frequency_per_month: 2, // 2x per month (twice monthly full audit required)
    priority: 'high'
  },
  {
    visit_type: 'sorpresa',
    frequency_per_month: 1, // 1x per month
    priority: 'high'
  }
]

/**
 * Get all locations with supervision enabled
 */
async function getLocations(): Promise<LocationInfo[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('locations')
    .select(`
      id,
      name,
      city,
      brand_id,
      latitude,
      longitude,
      supervision_priority,
      required_rapid_visits_per_week,
      required_full_audit_per_month,
      required_surprise_visits_per_month
    `)
    .eq('is_active', true)
    .order('supervision_priority', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all active supervisors
 */
async function getSupervisors(): Promise<SupervisorInfo[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('supervisors')
    .select(`
      id,
      name,
      email,
      assigned_location_ids,
      preferred_shifts,
      preferred_days
    `)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return (data || []).map((s: any) => ({
    ...s,
    assigned_locations: s.assigned_location_ids || [],
    max_visits_per_day: 8 // Default max
  }))
}

/**
 * Get existing scheduled visits for a date range
 */
async function getExistingVisits(startDate: string, endDate: string): Promise<ExistingVisit[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('supervision_schedule')
    .select('id, location_id, supervisor_id, planned_date, planned_shift, visit_type')
    .gte('planned_date', startDate)
    .lte('planned_date', endDate)
    .eq('status', 'pending')

  if (error) throw error
  return (data || []).map((v: any) => ({
    ...v,
    scheduled_date: v.planned_date,
    shift: v.planned_shift
  })) as ExistingVisit[]
}

/**
 * Check if a date is a business day (Monday-Saturday)
 */
function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 6 // 1 = Monday, 6 = Saturday
}

/**
 * Get all business days in a month
 */
function getBusinessDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)

  while (date.getMonth() === month) {
    if (isBusinessDay(date)) {
      days.push(new Date(date))
    }
    date.setDate(date.getDate() + 1)
  }

  return days
}

/**
 * Calculate distance between two locations (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Assign supervisor to location based on:
 * 1. Assigned locations (if specified)
 * 2. Geographic proximity
 * 3. Workload balancing
 */
function assignSupervisor(
  location: LocationInfo,
  supervisors: SupervisorInfo[],
  currentAssignments: Map<string, number>,
  existingVisits: ExistingVisit[]
): SupervisorInfo | null {
  // Filter supervisors who are assigned to this location
  const assignedSupervisors = supervisors.filter(sup =>
    sup.assigned_locations && sup.assigned_locations.includes(location.id)
  )

  if (assignedSupervisors.length > 0) {
    // Pick the one with the least workload
    return assignedSupervisors.reduce((min, sup) =>
      (currentAssignments.get(sup.id) || 0) < (currentAssignments.get(min.id) || 0)
        ? sup
        : min
    )
  }

  // If no specific assignment, balance workload across all supervisors
  const availableSupervisors = supervisors.filter(sup => {
    const maxVisits = sup.max_visits_per_day || 4
    return (currentAssignments.get(sup.id) || 0) < maxVisits
  })

  if (availableSupervisors.length === 0) {
    return null
  }

  // Pick the supervisor with the least workload
  return availableSupervisors.reduce((min, sup) =>
    (currentAssignments.get(sup.id) || 0) < (currentAssignments.get(min.id) || 0)
      ? sup
      : min
  )
}

/**
 * Optimize visit order for a supervisor on a given day
 * to minimize travel distance
 */
function optimizeVisitOrder(
  visits: ScheduleVisit[],
  locations: Map<string, LocationInfo>
): ScheduleVisit[] {
  if (visits.length <= 1) return visits

  const optimized: ScheduleVisit[] = []
  const remaining = [...visits]
  let current = remaining.shift()!

  optimized.push(current)

  while (remaining.length > 0) {
    const currentLocation = locations.get(current.location_id)
    if (!currentLocation) {
      optimized.push(remaining.shift()!)
      continue
    }

    // Find the closest remaining location
    let closestIndex = 0
    let closestDistance = Infinity

    remaining.forEach((visit, index) => {
      const visitLocation = locations.get(visit.location_id)
      if (
        visitLocation &&
        currentLocation.latitude &&
        currentLocation.longitude &&
        visitLocation.latitude &&
        visitLocation.longitude
      ) {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          visitLocation.latitude,
          visitLocation.longitude
        )
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      }
    })

    current = remaining.splice(closestIndex, 1)[0]
    optimized.push(current)
  }

  return optimized
}

/**
 * Generate schedule for a month
 */
export async function generateSchedule(
  year: number,
  month: number,
  rules: SchedulingRule[] = DEFAULT_RULES,
  options: {
    skipExisting?: boolean
    balanceWorkload?: boolean
    optimizeRoutes?: boolean
  } = {}
): Promise<SchedulingResult> {
  const {
    skipExisting = true,
    balanceWorkload = true,
    optimizeRoutes = true
  } = options

  const errors: string[] = []
  const warnings: string[] = []
  let visitsCreated = 0
  let visitsSkipped = 0

  try {
    // Get data
    const locations = await getLocations()
    const supervisors = await getSupervisors()

    if (locations.length === 0) {
      return {
        success: false,
        visits_created: 0,
        visits_skipped: 0,
        errors: ['No locations found'],
        warnings
      }
    }

    if (supervisors.length === 0) {
      return {
        success: false,
        visits_created: 0,
        visits_skipped: 0,
        errors: ['No supervisors found'],
        warnings
      }
    }

    // Get business days for the month
    const businessDays = getBusinessDays(year, month)

    if (businessDays.length === 0) {
      return {
        success: false,
        visits_created: 0,
        visits_skipped: 0,
        errors: ['No business days found for this month'],
        warnings
      }
    }

    // Get existing visits
    const startDate = new Date(year, month, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
    const existingVisits = await getExistingVisits(startDate, endDate)

    // Create a map of existing visits by location and date
    const existingVisitsMap = new Map<string, ExistingVisit[]>()
    existingVisits.forEach(visit => {
      const key = `${visit.location_id}-${(visit as any).planned_date || visit.scheduled_date}`
      if (!existingVisitsMap.has(key)) {
        existingVisitsMap.set(key, [])
      }
      existingVisitsMap.get(key)!.push(visit)
    })

    // Generate visits for each location and rule
    const visitsToCreate: ScheduleVisit[] = []
    const locationMap = new Map(locations.map(l => [l.id, l]))

    for (const rule of rules) {
      const visitsPerLocation = Math.ceil(
        (rule.frequency_per_month / businessDays.length) * businessDays.length
      )

      for (const location of locations) {
        let scheduledCount = 0

        for (const day of businessDays) {
          if (scheduledCount >= visitsPerLocation) break

          const dateStr = day.toISOString().split('T')[0]
          const existingKey = `${location.id}-${dateStr}`

          // Skip if visit already exists and skipExisting is true
          if (skipExisting && existingVisitsMap.has(existingKey)) {
            visitsSkipped++
            continue
          }

          // Assign supervisor
          const supervisor = assignSupervisor(location, supervisors, new Map(), existingVisits)
          if (!supervisor) {
            warnings.push(`No supervisor available for ${location.name} on ${dateStr}`)
            continue
          }

          // Assign shift (alternate morning/afternoon)
          const shift: 'morning' | 'afternoon' = scheduledCount % 2 === 0 ? 'morning' : 'afternoon'

          visitsToCreate.push({
            location_id: location.id,
            supervisor_id: supervisor.id,
            planned_date: dateStr,
            planned_shift: shift,
            visit_type: rule.visit_type,
            priority: rule.priority === 'high' ? 'high' : rule.priority === 'medium' ? 'normal' : rule.priority,
            status: 'pending'
          })

          scheduledCount++
        }
      }
    }

    // Optimize routes by supervisor and day
    if (optimizeRoutes) {
      const visitsBySupervisorDay = new Map<string, ScheduleVisit[]>()

      visitsToCreate.forEach(visit => {
        const key = `${visit.supervisor_id}-${visit.planned_date}`
        if (!visitsBySupervisorDay.has(key)) {
          visitsBySupervisorDay.set(key, [])
        }
        visitsBySupervisorDay.get(key)!.push(visit)
      })

      // Optimize each group
      const optimizedVisits: ScheduleVisit[] = []
      for (const [, visits] of visitsBySupervisorDay) {
        const optimized = optimizeVisitOrder(visits, locationMap)
        optimizedVisits.push(...optimized)
      }

      // Replace with optimized visits
      visitsToCreate.length = 0
      visitsToCreate.push(...optimizedVisits)
    }

    // Insert visits into database
    const supabase = createClient()
    const createdVisits: Array<{
      id: string
      location: string
      supervisor: string
      date: string
      shift: string
      type: string
    }> = []

    for (const visit of visitsToCreate) {
      const { data, error } = await supabase
        .from('supervision_schedule')
        .insert({
          location_id: visit.location_id,
          supervisor_id: visit.supervisor_id,
          planned_date: visit.planned_date,
          planned_shift: visit.planned_shift,
          visit_type: visit.visit_type,
          priority: visit.priority || 'normal',
          status: visit.status || 'pending',
          is_auto_scheduled: true
        })
        .select('id, locations(name), supervisors(name)')
        .single()

      if (error) {
        errors.push(`Failed to create visit for location ${visit.location_id}: ${error.message}`)
      } else {
        visitsCreated++
        if (data) {
          createdVisits.push({
            id: data.id,
            location: (data as any).locations?.name || 'Unknown',
            supervisor: (data as any).supervisors?.name || 'Unknown',
            date: visit.planned_date,
            shift: visit.planned_shift,
            type: visit.visit_type
          })
        }
      }
    }

    return {
      success: errors.length === 0,
      visits_created: visitsCreated,
      visits_skipped: visitsSkipped,
      errors,
      warnings,
      visits_created_details: createdVisits
    }
  } catch (error) {
    return {
      success: false,
      visits_created: 0,
      visits_skipped: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings
    }
  }
}

/**
 * Get next month's schedule preview
 */
export async function previewNextMonthSchedule(): Promise<{
  year: number
  month: number
  monthName: string
  estimatedVisits: number
  visitsByType: {
    rapida: number
    completa: number
    sorpresa: number
  }
  coverage: number
}> {
  const today = new Date()
  let nextMonth = today.getMonth() + 1
  let nextYear = today.getFullYear()

  if (nextMonth > 11) {
    nextMonth = 0
    nextYear++
  }

  const businessDays = getBusinessDays(nextYear, nextMonth)
  const locations = await getLocations()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Calculate visits based on location requirements
  let rapidVisits = 0
  let fullAudits = 0
  let surpriseVisits = 0

  locations.forEach(loc => {
    rapidVisits += (loc.required_rapid_visits_per_week || 2) * 4 // 4 weeks per month
    fullAudits += loc.required_full_audit_per_month || 1
    surpriseVisits += loc.required_surprise_visits_per_month || 1
  })

  const estimatedVisits = rapidVisits + fullAudits + surpriseVisits
  const coverage = locations.length > 0 ? 100 : 0

  return {
    year: nextYear,
    month: nextMonth,
    monthName: monthNames[nextMonth],
    estimatedVisits,
    visitsByType: {
      rapida: rapidVisits,
      completa: fullAudits,
      sorpresa: surpriseVisits
    },
    coverage
  }
}

/**
 * Check visit compliance with frequency requirements
 */
export async function checkVisitCompliance(locationId?: string): Promise<{
  compliantLocations: string[]
  nonCompliantLocations: Array<{
    id: string
    name: string
    issues: string[]
  }>
}> {
  const supabase = createClient()

  const compliant: string[] = []
  const nonCompliant: Array<{
    id: string
    name: string
    issues: string[]
  }> = []

  let locationQuery = supabase
    .from('locations')
    .select('id, name, required_rapid_visits_per_week, required_full_audit_per_month, required_surprise_visits_per_month')
    .eq('is_active', true)

  if (locationId) {
    locationQuery = locationQuery.eq('id', locationId)
  }

  const { data: locations } = await locationQuery

  if (!locations) return { compliantLocations: compliant, nonCompliantLocations: nonCompliant }

  for (const location of locations as any[]) {
    const issues: string[] = []

    // Check rapid visits (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: rapidVisits } = await supabase
      .from('supervision_visits')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', location.id)
      .eq('visit_type', 'rapida')
      .gte('visit_date', sevenDaysAgo.toISOString().split('T')[0])

    if ((rapidVisits || 0) < (location.required_rapid_visits_per_week || 2)) {
      issues.push(`${(location.required_rapid_visits_per_week || 2) - (rapidVisits || 0)} rapid visits missing this week`)
    }

    // Check full audits (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: fullAudits } = await supabase
      .from('supervision_visits')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', location.id)
      .eq('visit_type', 'completa')
      .gte('visit_date', thirtyDaysAgo.toISOString().split('T')[0])

    if ((fullAudits || 0) < (location.required_full_audit_per_month || 1)) {
      issues.push(`${(location.required_full_audit_per_month || 1) - (fullAudits || 0)} full audits missing this month`)
    }

    // Check surprise visits (last 30 days)
    const { count: surpriseVisits } = await supabase
      .from('supervision_visits')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', location.id)
      .eq('visit_type', 'sorpresa')
      .gte('visit_date', thirtyDaysAgo.toISOString().split('T')[0])

    if ((surpriseVisits || 0) < (location.required_surprise_visits_per_month || 1)) {
      issues.push(`${(location.required_surprise_visits_per_month || 1) - (surpriseVisits || 0)} surprise visits missing this month`)
    }

    if (issues.length === 0) {
      compliant.push(location.id)
    } else {
      nonCompliant.push({
        id: location.id,
        name: location.name,
        issues
      })
    }
  }

  return { compliantLocations: compliant, nonCompliantLocations: nonCompliant }
}

/**
 * Suggest reschedule options for a visit
 */
export async function suggestReschedule(
  visitId: string
): Promise<Array<{
  date: string
  shift: string
  supervisor: string
  reason: string
}>> {
  const supabase = createClient()

  // Get the visit
  const { data: visit } = await supabase
    .from('supervision_schedule')
    .select('*, locations(name), supervisors(name)')
    .eq('id', visitId)
    .single()

  if (!visit) return []

  const suggestions: Array<{
    date: string
    shift: string
    supervisor: string
    reason: string
  }> = []

  // Check next 7 days for available slots
  for (let i = 1; i <= 7; i++) {
    const date = new Date(visit.planned_date)
    date.setDate(date.getDate() + i)

    // Skip weekends
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    const dateStr = date.toISOString().split('T')[0]

    // Check if supervisor is available
    const { data: existing } = await supabase
      .from('supervision_schedule')
      .select('id')
      .eq('supervisor_id', visit.supervisor_id)
      .eq('planned_date', dateStr)
      .eq('status', 'pending')

    const supervisorCapacity = (existing?.length || 0) < 8

    // Check if location is available
    const { data: locationExisting } = await supabase
      .from('supervision_schedule')
      .select('id')
      .eq('location_id', visit.location_id)
      .eq('planned_date', dateStr)
      .eq('visit_type', visit.visit_type)

    const locationAvailable = (locationExisting?.length || 0) === 0

    if (supervisorCapacity && locationAvailable) {
      suggestions.push({
        date: dateStr,
        shift: visit.planned_shift,
        supervisor: (visit as any).supervisors?.name || 'Assigned Supervisor',
        reason: 'Supervisor and location available'
      })
    }
  }

  return suggestions.slice(0, 3) // Return top 3 suggestions
}
