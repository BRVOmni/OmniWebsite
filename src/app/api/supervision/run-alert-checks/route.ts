/**
 * API Route: Run Supervision Alert Checks
 *
 * POST /api/supervision/run-alert-checks
 *
 * Triggers periodic supervision alert checks:
 * - Overdue visits
 * - Overdue corrective actions
 *
 * This should be called periodically (e.g., via cron job or external scheduler)
 * to ensure alerts are generated for supervision issues.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runSupervisionAlertChecks } from '@/lib/utils/supervision-alerts'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission (admin or manager only)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = profile?.role

    if (userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Manager access required' },
        { status: 403 }
      )
    }

    // Run the alert checks
    const result = await runSupervisionAlertChecks()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Supervision alert checks completed',
        data: {
          visit_alerts_created: result.visit_alerts_created,
          action_alerts_created: result.action_alerts_created,
          total_alerts: result.visit_alerts_created + result.action_alerts_created,
          errors: result.errors
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Alert checks completed with errors',
        data: {
          visit_alerts_created: result.visit_alerts_created,
          action_alerts_created: result.action_alerts_created,
          errors: result.errors
        }
      }, { status: 207 }) // Multi-status
    }
  } catch (error) {
    console.error('Error running supervision alert checks:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check recent supervision alerts
    const { data: recentAlerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('type', 'supervision')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Count by related entity type
    const byType = recentAlerts?.reduce((acc: Record<string, number>, alert) => {
      const entityType = alert.related_entity_type || 'unknown'
      acc[entityType] = (acc[entityType] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      success: true,
      data: {
        last_24_hours: recentAlerts?.length || 0,
        by_entity_type: byType,
        recent_alerts: recentAlerts?.slice(0, 10) || []
      }
    })
  } catch (error) {
    console.error('Error checking supervision alert status:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
