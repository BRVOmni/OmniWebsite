/**
 * API Route: Supervision Schedule
 *
 * Handles managing scheduled supervision visits.
 * Includes CRUD operations and auto-scheduling.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateSchedule, checkVisitCompliance, previewNextMonthSchedule } from '@/lib/utils/auto-schedule'

// ============================================================================
// GET - List schedule or get schedule details
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
    const scheduleId = searchParams.get('id')
    const locationId = searchParams.get('locationId')
    const supervisorId = searchParams.get('supervisorId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    const visitType = searchParams.get('visitType')

    // If getting specific schedule
    if (scheduleId) {
      const { data: schedule, error } = await supabase
        .from('supervision_schedule')
        .select(`
          *,
          locations(id, name, cities(name)),
          supervisors(id, name, email)
        `)
        .eq('id', scheduleId)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      return NextResponse.json(schedule)
    }

    // List schedules with filters
    let query = supabase
      .from('supervision_schedule')
      .select(`
        id,
        planned_date,
        planned_shift,
        visit_type,
        priority,
        status,
        estimated_duration_minutes,
        locations(id, name, cities(name)),
        supervisors(id, name)
      `)
      .order('planned_date', { ascending: true })

    // Apply filters
    if (locationId) {
      query = query.eq('location_id', locationId)
    }
    if (supervisorId) {
      query = query.eq('supervisor_id', supervisorId)
    }
    if (startDate) {
      query = query.gte('planned_date', startDate)
    }
    if (endDate) {
      query = query.lte('planned_date', endDate)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (visitType) {
      query = query.eq('visit_type', visitType)
    }

    const { data: schedules, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ schedules })

  } catch (error) {
    console.error('Schedule GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create scheduled visit or auto-generate schedule
// ============================================================================

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if this is an auto-schedule request
    if (body.action === 'auto-generate') {
      return await handleAutoGenerate(body)
    }

    // Validate required fields for single schedule
    const required = ['location_id', 'supervisor_id', 'planned_date', 'visit_type']
    const missing = required.filter(field => !body[field])
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // Check for conflicts (same location, same date, same visit type)
    const { data: existing } = await supabase
      .from('supervision_schedule')
      .select('id')
      .eq('location_id', body.location_id)
      .eq('planned_date', body.planned_date)
      .eq('visit_type', body.visit_type)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A visit of this type is already scheduled for this location on this date' },
        { status: 409 }
      )
    }

    // Create scheduled visit
    const { data: schedule, error } = await supabase
      .from('supervision_schedule')
      .insert({
        location_id: body.location_id,
        supervisor_id: body.supervisor_id,
        planned_date: body.planned_date,
        planned_shift: body.planned_shift || 'mañana',
        visit_type: body.visit_type,
        visit_subtype: body.visit_subtype,
        priority: body.priority || 'normal',
        estimated_duration_minutes: body.estimated_duration_minutes || 10,
        status: 'pending'
      })
      .select('id, locations(name), supervisors(name)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      schedule
    }, { status: 201 })

  } catch (error) {
    console.error('Schedule creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle auto-schedule generation
 */
async function handleAutoGenerate(body: any) {
  const supabase = createClient()

  const { startDate, endDate, ruleId, supervisorId, locationId } = body

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'startDate and endDate are required for auto-scheduling' },
      { status: 400 }
    )
  }

  // Generate schedule using the utility function
  const result = await generateSchedule(
    new Date(startDate).getFullYear(),
    new Date(startDate).getMonth(),
    [],
    {
      skipExisting: true,
      balanceWorkload: true,
      optimizeRoutes: true
    }
  )

  if (result.success) {
    return NextResponse.json({
      success: true,
      visits_created: result.visits_created,
      visits_skipped: result.visits_skipped,
      warnings: result.warnings,
      visits_created_details: result.visits_created_details
    })
  } else {
    return NextResponse.json({
      success: false,
      error: 'Failed to generate schedule',
      errors: result.errors,
      warnings: result.warnings
    }, { status: 500 })
  }
}

// ============================================================================
// PUT - Update scheduled visit
// ============================================================================

export async function PUT(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scheduleId } = body

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    // Get existing schedule
    const { data: existing } = await supabase
      .from('supervision_schedule')
      .select('*')
      .eq('id', scheduleId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // Don't allow modification of completed visits
    if (existing.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot modify a completed schedule' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Updatable fields
    const allowedFields = [
      'supervisor_id',
      'planned_date',
      'planned_shift',
      'visit_type',
      'visit_subtype',
      'priority',
      'estimated_duration_minutes',
      'status'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Handle status changes
    if (body.status === 'completed') {
      updateData.completed_visit_id = body.completed_visit_id
    } else if (body.status === 'missed') {
      updateData.missed_reason = body.missed_reason
    }

    // Perform update
    const { data: updated, error } = await supabase
      .from('supervision_schedule')
      .update(updateData)
      .eq('id', scheduleId)
      .select('id, locations(name), supervisors(name), status, planned_date')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      schedule: updated
    })

  } catch (error) {
    console.error('Schedule update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Cancel scheduled visit
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scheduleId = searchParams.get('id')

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 })
    }

    // Check if schedule exists
    const { data: existing } = await supabase
      .from('supervision_schedule')
      .select('id, status, completed_visit_id')
      .eq('id', scheduleId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // Don't allow deletion of completed schedules
    if (existing.status === 'completed' || existing.completed_visit_id) {
      return NextResponse.json(
        { error: 'Cannot cancel a completed schedule' },
        { status: 403 }
      )
    }

    // Delete schedule
    const { error } = await supabase
      .from('supervision_schedule')
      .delete()
      .eq('id', scheduleId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Schedule deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
