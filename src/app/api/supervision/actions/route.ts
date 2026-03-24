/**
 * API Route: Corrective Actions
 *
 * Handles creating and managing corrective actions from supervision findings.
 * Includes status workflow, deadline tracking, verification, and overdue alerts.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createOverdueActionAlert } from '@/lib/utils/supervision-alerts'

// ============================================================================
// GET - List actions
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
    const actionId = searchParams.get('id')
    const visitId = searchParams.get('visitId')
    const locationId = searchParams.get('locationId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const isOverdue = searchParams.get('isOverdue')
    const limit = parseInt(searchParams.get('limit') || '100')

    // If getting specific action
    if (actionId) {
      const { data: action, error } = await supabase
        .from('corrective_actions')
        .select(`
          *,
          locations(id, name, cities(name)),
          supervision_visits(id, visit_date, visit_type),
          operational_findings(id, title, category)
        `)
        .eq('id', actionId)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      return NextResponse.json(action)
    }

    // List actions with filters
    let query = supabase
      .from('corrective_actions')
      .select(`
        id,
        description,
        immediate_action,
        long_term_solution,
        responsible_person,
        responsible_role,
        priority,
        committed_date,
        actual_completion_date,
        status,
        is_overdue,
        days_overdue,
        created_at,
        locations(id, name, cities(name)),
        supervision_visits(visit_date)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (visitId) {
      query = query.eq('visit_id', visitId)
    }
    if (locationId) {
      query = query.eq('location_id', locationId)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (isOverdue === 'true') {
      query = query.eq('is_overdue', true)
    }

    const { data: actions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ actions })

  } catch (error) {
    console.error('Actions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create corrective action
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

    // Validate required fields
    if (!body.description) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }

    // Get location_id if not provided
    let location_id = body.location_id
    if (!location_id && body.visit_id) {
      const { data: visit } = await supabase
        .from('supervision_visits')
        .select('location_id')
        .eq('id', body.visit_id)
        .single()

      if (visit) {
        location_id = visit.location_id
      }
    }

    if (!location_id) {
      return NextResponse.json({ error: 'location_id is required' }, { status: 400 })
    }

    // Check if already overdue
    const isOverdue = body.committed_date && new Date(body.committed_date) < new Date()

    // Create action
    const { data: action, error } = await supabase
      .from('corrective_actions')
      .insert({
        finding_id: body.finding_id,
        visit_id: body.visit_id,
        location_id,
        description: body.description,
        immediate_action: body.immediate_action,
        long_term_solution: body.long_term_solution,
        responsible_person: body.responsible_person,
        responsible_role: body.responsible_role || 'manager',
        priority: body.priority || 'medium',
        committed_date: body.committed_date,
        estimated_completion_hours: body.estimated_completion_hours,
        status: 'pending',
        is_overdue: isOverdue,
        days_overdue: isOverdue ? Math.floor((new Date().getTime() - new Date(body.committed_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        before_photo_url: body.before_photo_url,
        follow_up_required: body.follow_up_required || false,
        follow_up_date: body.follow_up_date
      })
      .select('id, created_at, committed_date, locations(name)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create alert if already overdue
    if (isOverdue) {
      await createOverdueActionAlert({
        id: action.id,
        location_id,
        description: body.description,
        deadline: body.committed_date,
        priority: body.priority || 'medium',
        responsible_person: body.responsible_person
      })
    }

    return NextResponse.json({
      success: true,
      action
    }, { status: 201 })

  } catch (error) {
    console.error('Action creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update corrective action
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
    const { actionId } = body

    if (!actionId) {
      return NextResponse.json({ error: 'Action ID is required' }, { status: 400 })
    }

    // Get existing action
    const { data: existing } = await supabase
      .from('corrective_actions')
      .select('*')
      .eq('id', actionId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Handle status updates
    if (body.status !== undefined) {
      updateData.status = body.status

      if (body.status === 'completed') {
        updateData.actual_completion_date = new Date().toISOString().split('T')[0]
        updateData.is_overdue = false
        updateData.days_overdue = 0
      } else if (body.status === 'in_progress' && existing.status === 'pending') {
        // Mark as in progress
      }

      // Update overdue status if status changed
      if (body.status !== 'completed' && existing.committed_date) {
        const daysSinceCommit = Math.floor((new Date().getTime() - new Date(existing.committed_date).getTime()) / (1000 * 60 * 60 * 24))
        updateData.days_overdue = Math.max(0, daysSinceCommit)
        updateData.is_overdue = daysSinceCommit > 0
      }
    }

    // Updatable fields
    const allowedFields = [
      'description',
      'immediate_action',
      'long_term_solution',
      'responsible_person',
      'responsible_role',
      'priority',
      'committed_date',
      'estimated_completion_hours',
      'before_photo_url',
      'after_photo_url',
      'follow_up_required',
      'follow_up_date',
      'follow_up_notes'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Handle verification
    if (body.verified !== undefined) {
      if (body.verified) {
        updateData.verified_by = user.email
        updateData.verification_date = new Date().toISOString().split('T')[0]
        updateData.verification_notes = body.verification_notes
      }
    }

    // Perform update
    const { data: updated, error } = await supabase
      .from('corrective_actions')
      .update(updateData)
      .eq('id', actionId)
      .select('*, locations(name), supervision_visits(visit_date)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action: updated
    })

  } catch (error) {
    console.error('Action update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete corrective action (only if pending)
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
    const actionId = searchParams.get('id')

    if (!actionId) {
      return NextResponse.json({ error: 'Action ID is required' }, { status: 400 })
    }

    // Check if action exists and can be deleted
    const { data: existing } = await supabase
      .from('corrective_actions')
      .select('id, status')
      .eq('id', actionId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    // Only allow deletion of pending actions
    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot delete an action that is in progress or completed' },
        { status: 403 }
      )
    }

    // Delete action
    const { error } = await supabase
      .from('corrective_actions')
      .delete()
      .eq('id', actionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Action deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// SPECIAL ENDPOINT: Complete action
// ============================================================================

export async function PATCH(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { actionId, action } = body

    if (!actionId || !action) {
      return NextResponse.json({ error: 'actionId and action are required' }, { status: 400 })
    }

    if (action === 'complete') {
      return await completeAction(supabase, actionId, body)
    } else if (action === 'verify') {
      return await verifyAction(supabase, actionId, body, user.email || '')
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Action PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Mark action as completed
 */
async function completeAction(supabase: any, actionId: string, body: any) {
  const { data: action, error } = await supabase
    .from('corrective_actions')
    .update({
      status: 'completed',
      actual_completion_date: new Date().toISOString().split('T')[0],
      is_overdue: false,
      days_overdue: 0,
      after_photo_url: body.after_photo_url
    })
    .eq('id', actionId)
    .select('*, locations(name)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, action })
}

/**
 * Verify completed action
 */
async function verifyAction(supabase: any, actionId: string, body: any, userEmail: string) {
  const { data: action, error } = await supabase
    .from('corrective_actions')
    .update({
      verified_by: userEmail,
      verification_date: new Date().toISOString().split('T')[0],
      verification_notes: body.verification_notes
    })
    .eq('id', actionId)
    .select('*, locations(name)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, action })
}
