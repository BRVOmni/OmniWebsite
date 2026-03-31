/**
 * Supervision Alerts Integration
 *
 * Handles integration between supervision module and alerts system.
 * Creates alerts for critical supervision events.
 */

import { createClient } from '@/lib/supabase/client'

// Type definitions for Supabase query results
interface VisitWithLocation {
  location_id: string
  locations: {
    brand_id?: string
    name?: string
  } | null
}

interface OverdueVisit {
  id: string
  location_id: string
  scheduled_date: string
  scheduled_shift: string
  supervisors: { name?: string } | null
  locations: { name?: string } | null
}

interface CorrectiveAction {
  id: string
  location_id: string
  description: string
  deadline: string
  priority: string
  responsible_person?: string
}

export interface AlertData {
  location_id: string
  brand_id?: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  related_entity_type?: string
  related_entity_id?: string
  related_date?: string
}

/**
 * Create an alert in the alerts system
 */
export async function createAlert(alert: AlertData): Promise<{ success: boolean; alert_id?: string; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        location_id: alert.location_id,
        brand_id: alert.brand_id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        related_entity_type: alert.related_entity_type,
        related_entity_id: alert.related_entity_id,
        related_date: alert.related_date,
        status: 'active'
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, alert_id: data.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Create alert for critical finding
 */
export async function createCriticalFindingAlert(finding: {
  id: string
  visit_id: string
  title?: string
  description?: string
  severity: string
  category?: string
}): Promise<{ success: boolean; alert_id?: string; error?: string }> {
  const supabase = createClient()

  // Get visit and location info
  const { data: visit } = await supabase
    .from('supervision_visits')
    .select('location_id, locations(brand_id)')
    .eq('id', finding.visit_id)
    .single()

  if (!visit) {
    return { success: false, error: 'Visit not found' }
  }

  const location_id = visit.location_id
  const brand_id = (visit as VisitWithLocation).locations?.brand_id

  const severity = finding.severity === 'critical' ? 'critical' : 'high'

  const title = finding.severity === 'critical'
    ? `⚠️ CRITICAL: ${finding.title || 'Operational Finding'}`
    : `🔴 High Priority: ${finding.title || 'Operational Finding'}`

  const description = [
    'Critical operational finding detected during supervision visit.',
    finding.title ? `\n\nTitle: ${finding.title}` : '',
    finding.description ? `\n\nDescription: ${finding.description}` : '',
    finding.category ? `\n\nCategory: ${finding.category}` : ''
  ].filter(Boolean).join('')

  return createAlert({
    location_id,
    brand_id,
    type: 'supervision',
    severity,
    title,
    description,
    related_entity_type: 'operational_finding',
    related_entity_id: finding.id
  })
}

/**
 * Create alert for overdue visit
 */
export async function createOverdueVisitAlert(schedule: {
  id: string
  location_id: string
  scheduled_date: string
  scheduled_shift: string
  supervisor_name?: string
  location_name?: string
}): Promise<{ success: boolean; alert_id?: string; error?: string }> {
  const supabase = createClient()

  // Get brand_id
  const { data: location } = await supabase
    .from('locations')
    .select('brand_id')
    .eq('id', schedule.location_id)
    .single()

  const daysOverdue = Math.floor(
    (new Date().getTime() - new Date(schedule.scheduled_date).getTime()) / (1000 * 60 * 60 * 24)
  )

  const severity = daysOverdue >= 7 ? 'critical' : daysOverdue >= 3 ? 'high' : 'medium'

  const description = [
    `Scheduled supervision visit is overdue by ${daysOverdue} days.`,
    schedule.location_name ? `\n\n${schedule.location_name}` : '',
    `\n\nScheduled for: ${schedule.scheduled_date} (${schedule.scheduled_shift})`,
    schedule.supervisor_name ? `\n\nSupervisor: ${schedule.supervisor_name}` : ''
  ].filter(Boolean).join('')

  return createAlert({
    location_id: schedule.location_id,
    brand_id: location?.brand_id,
    type: 'supervision',
    severity,
    title: `Overdue Supervision Visit (${daysOverdue} days)`,
    description,
    related_entity_type: 'supervision_schedule',
    related_entity_id: schedule.id,
    related_date: schedule.scheduled_date
  })
}

/**
 * Create alert for overdue corrective action
 */
export async function createOverdueActionAlert(action: {
  id: string
  location_id: string
  description: string
  deadline: string
  priority: string
  responsible_person?: string
}): Promise<{ success: boolean; alert_id?: string; error?: string }> {
  const supabase = createClient()

  // Get brand_id
  const { data: location } = await supabase
    .from('locations')
    .select('brand_id')
    .eq('id', action.location_id)
    .single()

  const daysOverdue = Math.floor(
    (new Date().getTime() - new Date(action.deadline).getTime()) / (1000 * 60 * 60 * 24)
  )

  const severity =
    action.priority === 'critical' || daysOverdue >= 7 ? 'critical' :
    action.priority === 'high' || daysOverdue >= 3 ? 'high' : 'medium'

  const description = [
    `Corrective action is overdue by ${daysOverdue} days.`,
    `\n\n${action.description}`,
    `\n\nPriority: ${action.priority}`,
    action.responsible_person ? `\n\nResponsible: ${action.responsible_person}` : '',
    `\n\nDeadline: ${action.deadline}`
  ].filter(Boolean).join('')

  return createAlert({
    location_id: action.location_id,
    brand_id: location?.brand_id,
    type: 'supervision',
    severity,
    title: `Overdue Corrective Action (${daysOverdue} days)`,
    description,
    related_entity_type: 'corrective_action',
    related_entity_id: action.id,
    related_date: action.deadline
  })
}

/**
 * Create alert for recurring issue (3rd occurrence in 90 days)
 */
export async function createRecurringIssueAlert(finding: {
  id: string
  visit_id: string
  category?: string
  recurrence_count: number
}): Promise<{ success: boolean; alert_id?: string; error?: string }> {
  const supabase = createClient()

  // Get visit and location info
  const { data: visit } = await supabase
    .from('supervision_visits')
    .select('location_id, locations(name, brand_id)')
    .eq('id', finding.visit_id)
    .single()

  if (!visit) {
    return { success: false, error: 'Visit not found' }
  }

  const location_id = visit.location_id
  const location_name = (visit as VisitWithLocation).locations?.name
  const brand_id = (visit as VisitWithLocation).locations?.brand_id

  const description = [
    `A critical operational issue has recurred for the ${finding.recurrence_count} time in the last 90 days.`,
    finding.category ? `\n\nCategory: ${finding.category}` : '',
    location_name ? `\n\nLocation: ${location_name}` : '',
    '\n\nThis indicates a systemic problem requiring immediate intervention.'
  ].filter(Boolean).join('')

  return createAlert({
    location_id,
    brand_id,
    type: 'supervision',
    severity: 'critical',
    title: '🔄 Recurring Critical Issue Detected',
    description,
    related_entity_type: 'operational_finding',
    related_entity_id: finding.id
  })
}

/**
 * Run periodic supervision alert checks
 * Checks for overdue visits and overdue corrective actions
 */
export async function runSupervisionAlertChecks(): Promise<{
  success: boolean
  visit_alerts_created: number
  action_alerts_created: number
  errors: string[]
}> {
  const supabase = createClient()
  const errors: string[] = []
  let visitAlertsCreated = 0
  let actionAlertsCreated = 0

  try {
    // Check for overdue visits
    const { data: overdueVisits, error: visitsError } = await supabase
      .from('supervision_schedule')
      .select(`
        id,
        location_id,
        scheduled_date,
        scheduled_shift,
        supervisors(name),
        locations(name)
      `)
      .eq('status', 'pending')
      .lt('scheduled_date', new Date().toISOString().split('T')[0])

    if (!visitsError && overdueVisits) {
      for (const visit of overdueVisits) {
        // Check if alert already exists
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('related_entity_type', 'supervision_schedule')
          .eq('related_entity_id', visit.id)
          .eq('status', 'active')
          .single()

        if (!existingAlert) {
          const result = await createOverdueVisitAlert({
            id: visit.id,
            location_id: visit.location_id,
            scheduled_date: visit.scheduled_date,
            scheduled_shift: visit.scheduled_shift,
            supervisor_name: (visit.supervisors as any)?.name,
            location_name: (visit.locations as any)?.name
          })

          if (result.success) {
            visitAlertsCreated++
          } else {
            errors.push(`Failed to create alert for visit ${visit.id}: ${result.error}`)
          }
        }
      }
    }

    // Check for overdue actions
    const { data: overdueActions, error: actionsError } = await supabase
      .from('corrective_actions')
      .select('id, location_id, description, deadline, priority, responsible_person')
      .in('status', ['pending', 'in_progress'])
      .lt('deadline', new Date().toISOString().split('T')[0])

    if (!actionsError && overdueActions) {
      for (const action of overdueActions) {
        // Check if alert already exists
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('related_entity_type', 'corrective_action')
          .eq('related_entity_id', action.id)
          .eq('status', 'active')
          .single()

        if (!existingAlert) {
          const result = await createOverdueActionAlert({
            id: action.id,
            location_id: action.location_id,
            description: action.description,
            deadline: action.deadline,
            priority: action.priority,
            responsible_person: action.responsible_person
          })

          if (result.success) {
            actionAlertsCreated++
          } else {
            errors.push(`Failed to create alert for action ${action.id}: ${result.error}`)
          }
        }
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error')
  }

  return {
    success: errors.length === 0,
    visit_alerts_created: visitAlertsCreated,
    action_alerts_created: actionAlertsCreated,
    errors
  }
}

/**
 * Navigate from alert to supervision entity
 */
export function getSupervisionAlertNavigation(alert: {
  related_entity_type?: string
  related_entity_id?: string
}): { path: string } | null {
  if (!alert.related_entity_type || !alert.related_entity_id) {
    return null
  }

  switch (alert.related_entity_type) {
    case 'operational_finding':
      // Navigate to visit details for this finding
      return { path: `/dashboard/supervision/findings` }

    case 'supervision_schedule':
      // Navigate to schedule page
      return { path: `/dashboard/supervision/schedule` }

    case 'corrective_action':
      // Navigate to actions page
      return { path: `/dashboard/supervision/actions` }

    default:
      return null
  }
}
