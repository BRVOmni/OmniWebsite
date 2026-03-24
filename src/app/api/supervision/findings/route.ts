/**
 * API Route: Operational Findings
 *
 * Handles creating and managing operational findings from supervision visits.
 * Includes severity tracking, recurrence detection, and alert generation.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createCriticalFindingAlert, createRecurringIssueAlert } from '@/lib/utils/supervision-alerts'

// ============================================================================
// GET - List findings
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
    const findingId = searchParams.get('id')
    const visitId = searchParams.get('visitId')
    const locationId = searchParams.get('locationId')
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')
    const isRecurring = searchParams.get('isRecurring')
    const limit = parseInt(searchParams.get('limit') || '100')

    // If getting specific finding
    if (findingId) {
      const { data: finding, error } = await supabase
        .from('operational_findings')
        .select(`
          *,
          supervision_visits(id, visit_date, locations(id, name, cities(name))),
          checklist_items(id, name, name_es, category_id)
        `)
        .eq('id', findingId)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      return NextResponse.json(finding)
    }

    // List findings with filters
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
        corrective_action_required,
        visit_id,
        supervision_visits(
          id,
          visit_date,
          visit_type,
          locations(id, name, cities(name))
        )
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
    if (severity) {
      query = query.eq('severity', severity)
    }
    if (category) {
      query = query.eq('category', category)
    }
    if (isRecurring === 'true') {
      query = query.eq('is_recurring', true)
    }

    const { data: findings, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ findings })

  } catch (error) {
    console.error('Findings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create operational finding
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
    if (!body.visit_id) {
      return NextResponse.json({ error: 'visit_id is required' }, { status: 400 })
    }
    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // Get visit info to get location_id
    const { data: visit } = await supabase
      .from('supervision_visits')
      .select('location_id, locations(brand_id)')
      .eq('id', body.visit_id)
      .single()

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    // Check for recurrence (has this issue been seen before in this location?)
    let isRecurring = false
    let recurrenceCount = 0
    let previousOccurrences: string[] = []

    if (body.category || body.finding_type) {
      const { data: previousFindings } = await supabase
        .from('operational_findings')
        .select('id, created_at')
        .eq('category', body.category || '')
        .in('finding_type', [body.finding_type, body.finding_type || ''])
        .neq('visit_id', body.visit_id)

      if (previousFindings && previousFindings.length > 0) {
        // Check if any are within last 90 days
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const recentFindings = previousFindings.filter((f: any) => {
          return new Date(f.created_at) > ninetyDaysAgo
        })

        recurrenceCount = recentFindings.length

        if (recurrenceCount >= 2) {
          isRecurring = true
          previousOccurrences = recentFindings.map((f: any) => f.created_at)
        }
      }
    }

    // Create finding
    const { data: finding, error } = await supabase
      .from('operational_findings')
      .insert({
        visit_id: body.visit_id,
        checklist_item_id: body.checklist_item_id,
        category: body.category,
        severity: body.severity || 'medium',
        title: body.title,
        description: body.description,
        finding_type: body.finding_type,
        requires_photo: body.requires_photo || false,
        photo_url: body.photo_url,
        additional_photos: body.additional_photos || [],
        is_recurring: isRecurring,
        recurrence_count: recurrenceCount,
        previous_occurrence_dates: previousOccurrences,
        corrective_action_required: body.corrective_action_required !== false,
        immediate_action_taken: body.immediate_action_taken,
        affects_operations: body.affects_operations,
        affects_money: body.affects_money,
        affects_product: body.affects_product,
        affects_customer_experience: body.affects_customer_experience,
        affects_manager_control: body.affects_manager_control
      })
      .select('id, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create alert for critical findings
    if (body.severity === 'critical' || body.severity === 'high') {
      await createCriticalFindingAlert({
        id: finding.id,
        visit_id: body.visit_id,
        title: body.title,
        description: body.description,
        severity: body.severity,
        category: body.category
      })
    }

    // Create alert for recurring issues (3rd occurrence)
    if (isRecurring && recurrenceCount >= 2) {
      await createRecurringIssueAlert({
        id: finding.id,
        visit_id: body.visit_id,
        category: body.category,
        recurrence_count: recurrenceCount + 1
      })
    }

    return NextResponse.json({
      success: true,
      finding: {
        ...finding,
        is_recurring: isRecurring,
        recurrence_count: recurrenceCount
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Finding creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update operational finding
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
    const { findingId } = body

    if (!findingId) {
      return NextResponse.json({ error: 'Finding ID is required' }, { status: 400 })
    }

    // Get existing finding
    const { data: existing } = await supabase
      .from('operational_findings')
      .select('*')
      .eq('id', findingId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Updatable fields
    const allowedFields = [
      'severity',
      'title',
      'description',
      'category',
      'finding_type',
      'requires_photo',
      'photo_url',
      'additional_photos',
      'immediate_action_taken',
      'corrective_action_required'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Perform update
    const { data: updated, error } = await supabase
      .from('operational_findings')
      .update(updateData)
      .eq('id', findingId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      finding: updated
    })

  } catch (error) {
    console.error('Finding update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete finding (only if not linked to corrective action)
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
    const findingId = searchParams.get('id')

    if (!findingId) {
      return NextResponse.json({ error: 'Finding ID is required' }, { status: 400 })
    }

    // Check if finding has linked corrective actions
    const { data: actions } = await supabase
      .from('corrective_actions')
      .select('id')
      .eq('finding_id', findingId)
      .limit(1)

    if (actions && actions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete finding with linked corrective actions' },
        { status: 403 }
      )
    }

    // Delete finding
    const { error } = await supabase
      .from('operational_findings')
      .delete()
      .eq('id', findingId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Finding deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
