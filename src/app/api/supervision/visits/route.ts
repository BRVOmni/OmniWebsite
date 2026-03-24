/**
 * API Route: Supervision Visits
 *
 * Handles creating, updating, and retrieving supervision visits.
 * Includes score calculation and 5-step process completion tracking.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateVisitScores, validateScores } from '@/lib/utils/supervision-scoring'

// ============================================================================
// GET - List visits or get visit details
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
    const visitId = searchParams.get('id')
    const locationId = searchParams.get('locationId')
    const supervisorId = searchParams.get('supervisorId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const visitType = searchParams.get('visitType')
    const classification = searchParams.get('classification')
    const limit = parseInt(searchParams.get('limit') || '50')

    // If getting specific visit
    if (visitId) {
      const { data: visit, error } = await supabase
        .from('supervision_visits')
        .select(`
          *,
          locations(id, name, cities(name)),
          supervisors(id, name),
          visit_checklist_results(
            *,
            checklist_items(id, name, name_es, category_id, is_critical)
          ),
          operational_findings(*)
        `)
        .eq('id', visitId)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      return NextResponse.json(visit)
    }

    // List visits with filters
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
        start_time,
        end_time,
        duration_minutes,
        step1_observation_completed,
        step2_operations_completed,
        step3_cash_completed,
        step4_product_completed,
        step5_equipment_completed,
        locations(id, name, cities(name)),
        supervisors(id, name)
      `)
      .order('visit_date', { ascending: false })
      .limit(limit)

    // Apply filters
    if (locationId) {
      query = query.eq('location_id', locationId)
    }
    if (supervisorId) {
      query = query.eq('supervisor_id', supervisorId)
    }
    if (startDate) {
      query = query.gte('visit_date', startDate)
    }
    if (endDate) {
      query = query.lte('visit_date', endDate)
    }
    if (visitType) {
      query = query.eq('visit_type', visitType)
    }
    if (classification) {
      query = query.eq('classification', classification)
    }

    const { data: visits, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ visits })

  } catch (error) {
    console.error('Visits GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create new visit
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
    const required = ['location_id', 'supervisor_id', 'visit_date', 'visit_type']
    const missing = required.filter(field => !body[field])
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if visit already exists for this location on this date
    const { data: existing } = await supabase
      .from('supervision_visits')
      .select('id')
      .eq('location_id', body.location_id)
      .eq('visit_date', body.visit_date)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A visit already exists for this location on this date' },
        { status: 409 }
      )
    }

    // Get checklist items for the visit type template
    const { data: templateItems } = await supabase
      .from('visit_templates')
      .select('name, visit_template_items(checklist_items(id, category_id, name, name_es))')
      .eq('visit_type', body.visit_type)
      .single()

    // Create visit record
    const { data: visit, error: visitError } = await supabase
      .from('supervision_visits')
      .insert({
        location_id: body.location_id,
        supervisor_id: body.supervisor_id,
        visit_date: body.visit_date,
        visit_shift: body.visit_shift || 'mañana',
        visit_type: body.visit_type,
        start_time: body.start_time || new Date().toISOString(),
        manager_name: body.manager_name,
        manager_present: false,
        manager_in_control: false,
        visit_completed: false,
        step1_observation_completed: false,
        step2_operations_completed: false,
        step3_cash_completed: false,
        step4_product_completed: false,
        step5_equipment_completed: false
      })
      .select('id, locations(name), supervisors(name)')
      .single()

    if (visitError) {
      return NextResponse.json({ error: visitError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      visit,
      template_items: templateItems?.visit_template_items || []
    }, { status: 201 })

  } catch (error) {
    console.error('Visit creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update visit
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
    const { visitId } = body

    if (!visitId) {
      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 })
    }

    // Get existing visit
    const { data: existingVisit } = await supabase
      .from('supervision_visits')
      .select('*')
      .eq('id', visitId)
      .single()

    if (!existingVisit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Handle step completion
    if (body.step !== undefined) {
      switch (body.step) {
        case 1:
          updateData.step1_observation_completed = body.completed
          break
        case 2:
          updateData.step2_operations_completed = body.completed
          break
        case 3:
          updateData.step3_cash_completed = body.completed
          break
        case 4:
          updateData.step4_product_completed = body.completed
          break
        case 5:
          updateData.step5_equipment_completed = body.completed
          break
      }
    }

    // Handle visit completion
    if (body.visit_completed !== undefined) {
      updateData.visit_completed = body.visit_completed

      if (body.visit_completed) {
        updateData.end_time = new Date().toISOString()

        // Calculate duration if start time exists
        if (existingVisit.start_time) {
          const startTime = new Date(existingVisit.start_time)
          const endTime = new Date()
          updateData.duration_minutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        }
      }
    }

    // Handle final submission with scores
    if (body.final_submission) {
      // Calculate scores from checklist results
      if (body.checklist_results && body.findings) {
        const scores = await calculateVisitScores(visitId, body.checklist_results, body.findings)

        // Validate scores
        const validation = validateScores(scores)
        if (!validation.valid) {
          return NextResponse.json(
            { error: 'Invalid scores', details: validation.errors },
            { status: 400 }
          )
        }

        updateData.score_liderazgo = scores.score_liderazgo
        updateData.score_orden = scores.score_orden
        updateData.score_caja = scores.score_caja
        updateData.score_stock = scores.score_stock
        updateData.score_limpieza = scores.score_limpieza
        updateData.score_equipos = scores.score_equipos
        updateData.score_total = scores.score_total
        updateData.score_operacion = scores.score_operacion
        updateData.classification = scores.classification
        updateData.operations_functioning = scores.operations_functioning
        updateData.money_controlled = scores.money_controlled
        updateData.product_managed = scores.product_managed
        updateData.customer_experience_adequate = scores.customer_experience_adequate
        updateData.manager_team_control = scores.manager_team_control
        updateData.observations_general = body.observations_general
        updateData.visit_completed = true
        updateData.end_time = new Date().toISOString()

        // Mark all steps as completed
        updateData.step1_observation_completed = true
        updateData.step2_operations_completed = true
        updateData.step3_cash_completed = true
        updateData.step4_product_completed = true
        updateData.step5_equipment_completed = true

        // Calculate duration
        if (existingVisit.start_time) {
          const startTime = new Date(existingVisit.start_time)
          const endTime = new Date()
          updateData.duration_minutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
        }
      }
    }

    // Update manager info if provided
    if (body.manager_name !== undefined) {
      updateData.manager_name = body.manager_name
    }
    if (body.manager_present !== undefined) {
      updateData.manager_present = body.manager_present
    }
    if (body.manager_in_control !== undefined) {
      updateData.manager_in_control = body.manager_in_control
    }

    // Perform update
    const { data: updatedVisit, error } = await supabase
      .from('supervision_visits')
      .update(updateData)
      .eq('id', visitId)
      .select('id, locations(name), supervisors(name), score_total, classification')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      visit: updatedVisit
    })

  } catch (error) {
    console.error('Visit update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Cancel/delete visit
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
    const visitId = searchParams.get('id')

    if (!visitId) {
      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 })
    }

    // Check if visit exists
    const { data: existingVisit } = await supabase
      .from('supervision_visits')
      .select('id, visit_completed')
      .eq('id', visitId)
      .single()

    if (!existingVisit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    // Don't allow deletion of completed visits
    if (existingVisit.visit_completed) {
      return NextResponse.json(
        { error: 'Cannot delete a completed visit' },
        { status: 403 }
      )
    }

    // Delete visit
    const { error } = await supabase
      .from('supervision_visits')
      .delete()
      .eq('id', visitId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Visit deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
