'use client'

/**
 * Operational Supervision Dashboard
 *
 * Main dashboard for the Operational Supervision Module.
 * Shows visit schedules, completions, findings, corrective actions,
 * supervisor performance, and network-wide supervision metrics.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { KPICard } from '@/components/shared/kpi-card'
import { ScoreCard } from '@/components/supervision/score-card'
import { VisitStatusBadge } from '@/components/supervision/visit-status-badge'
import { VisitTypeBadge } from '@/components/supervision/visit-type-badge'
import { FindingCard } from '@/components/supervision/finding-card'
import { ActionCard } from '@/components/supervision/action-card'
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Filter,
  BarChart3,
  PieChart
} from 'lucide-react'

// Data Types
interface LocationInfo {
  id: string
  name: string
  cities?: {
    name: string
  } | null
}

interface SupervisorInfo {
  id: string
  name: string
  email?: string
}

interface ScheduleData {
  id: string
  planned_date: string
  status: string
  visit_type: string
  location_id: string
  supervisor_id: string
  locations: LocationInfo
  supervisors: SupervisorInfo
}

interface VisitData {
  id: string
  visit_date: string
  visit_type: string
  visit_shift: string
  classification: string
  score_total: number
  score_operacion: number
  score_caja: number
  score_stock: number
  score_limpieza: number
  score_equipos: number
  location_id: string
  supervisor_id: string
  locations: LocationInfo
  supervisors: SupervisorInfo
}

interface FindingData {
  id: string
  severity: string
  finding_type: string
  title: string
  description: string
  category: string
  is_recurring: boolean
  recurrence_count: number
  created_at: string
  visit_id: string
  supervision_visits: {
    location_id: string
    locations: LocationInfo
  } | null
}

interface ActionData {
  id: string
  description: string
  status: string
  priority: string
  committed_date: string
  is_overdue: boolean
  days_overdue: number
  location_id: string
  locations: LocationInfo
}

export default function SupervisionPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  // State
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [allSchedules, setAllSchedules] = useState<ScheduleData[]>([])
  const [allVisits, setAllVisits] = useState<VisitData[]>([])
  const [allFindings, setAllFindings] = useState<FindingData[]>([])
  const [allActions, setAllActions] = useState<ActionData[]>([])
  const [allLocations, setAllLocations] = useState<LocationInfo[]>([])
  const [allSupervisors, setAllSupervisors] = useState<SupervisorInfo[]>([])

  // Filters
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)
      await loadAllData()
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadAllData = async (startDate?: string, endDate?: string) => {
    await Promise.all([
      loadScheduleData(startDate, endDate),
      loadVisitsData(startDate, endDate),
      loadFindingsData(startDate, endDate),
      loadActionsData(startDate, endDate),
      loadLocationsData(),
      loadSupervisorsData(),
    ])
  }

  const loadScheduleData = async (startDate?: string, endDate?: string) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const start = startDate || thirtyDaysAgo.toISOString().split('T')[0]

    const { data } = await supabase
      .from('supervision_schedule')
      .select(`
        id,
        planned_date,
        status,
        visit_type,
        location_id,
        supervisor_id,
        locations (
          id,
          name,
          cities (
            name
          )
        ),
        supervisors (
          id,
          name,
          email
        )
      `)
      .gte('planned_date', start)
      .order('planned_date', { ascending: true })

    setAllSchedules(data as unknown as ScheduleData[] || [])
  }

  const loadVisitsData = async (startDate?: string, endDate?: string) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const start = startDate || thirtyDaysAgo.toISOString().split('T')[0]

    const { data } = await supabase
      .from('supervision_visits')
      .select(`
        id,
        visit_date,
        visit_type,
        visit_shift,
        classification,
        score_total,
        score_operacion,
        score_caja,
        score_stock,
        score_limpieza,
        score_equipos,
        location_id,
        supervisor_id,
        locations (
          id,
          name,
          cities (
            name
          )
        ),
        supervisors (
          id,
          name,
          email
        )
      `)
      .gte('visit_date', start)
      .order('visit_date', { ascending: false })

    setAllVisits(data as unknown as VisitData[] || [])
  }

  const loadFindingsData = async (startDate?: string, endDate?: string) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const start = startDate || thirtyDaysAgo.toISOString().split('T')[0]

    const { data } = await supabase
      .from('operational_findings')
      .select(`
        id,
        severity,
        finding_type,
        title,
        description,
        category,
        is_recurring,
        recurrence_count,
        created_at,
        visit_id,
        supervision_visits (
          location_id,
          locations (
            id,
            name,
            cities (
              name
            )
          )
        )
      `)
      .gte('created_at', start)
      .order('created_at', { ascending: false })

    setAllFindings(data as unknown as FindingData[] || [])
  }

  const loadActionsData = async (startDate?: string, endDate?: string) => {
    const { data } = await supabase
      .from('corrective_actions')
      .select(`
        id,
        description,
        status,
        priority,
        committed_date,
        is_overdue,
        days_overdue,
        location_id,
        locations (
          id,
          name,
          cities (
            name
          )
        )
      `)
      .in('status', ['pending', 'in_progress'])
      .order('committed_date', { ascending: true })

    setAllActions(data as unknown as ActionData[] || [])
  }

  const loadLocationsData = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name, cities(name)')
      .eq('is_active', true)
      .order('name')

    setAllLocations(data as unknown as LocationInfo[] || [])
  }

  const loadSupervisorsData = async () => {
    const { data } = await supabase
      .from('supervisors')
      .select('id, name, email')
      .eq('is_active', true)
      .order('name')

    setAllSupervisors(data as unknown as SupervisorInfo[] || [])
  }

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    let schedules = allSchedules
    let visits = allVisits
    let findings = allFindings
    let actions = allActions

    if (selectedSupervisor !== 'all') {
      schedules = schedules.filter(s => s.supervisor_id === selectedSupervisor)
      visits = visits.filter(v => v.supervisor_id === selectedSupervisor)
    }

    if (selectedLocation !== 'all') {
      schedules = schedules.filter(s => s.location_id === selectedLocation)
      visits = visits.filter(v => v.location_id === selectedLocation)
      findings = findings.filter(f =>
        f.supervision_visits?.location_id === selectedLocation
      )
      actions = actions.filter(a => a.location_id === selectedLocation)
    }

    return { schedules, visits, findings, actions }
  }, [allSchedules, allVisits, allFindings, allActions, selectedSupervisor, selectedLocation])

  // Calculate KPIs
  const kpiData = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const thisMonthSchedules = filteredData.schedules.filter(s =>
      new Date(s.planned_date) >= startOfMonth
    )
    const thisMonthVisits = filteredData.visits.filter(v =>
      new Date(v.visit_date) >= startOfMonth
    )

    const scheduledVisits = thisMonthSchedules.length
    const completedVisits = thisMonthVisits.length
    const overdueVisits = thisMonthSchedules.filter(s =>
      s.status === 'pending' && new Date(s.planned_date) < now
    ).length

    const visitCompletionRate = scheduledVisits > 0
      ? Math.round((completedVisits / scheduledVisits) * 100)
      : 0

    const criticalFindings = filteredData.findings.filter(f =>
      f.severity === 'critical'
    ).length

    const openActions = filteredData.actions.length
    const overdueActions = filteredData.actions.filter(a => a.is_overdue).length

    const avgNetworkScore = thisMonthVisits.length > 0
      ? thisMonthVisits.reduce((sum, v) => sum + (v.score_total || 0), 0) / thisMonthVisits.length
      : 0

    return {
      scheduledVisits,
      completedVisits,
      overdueVisits,
      visitCompletionRate,
      criticalFindings,
      openActions,
      overdueActions,
      avgNetworkScore,
    }
  }, [filteredData])

  // Calculate score distribution
  const scoreDistribution = useMemo(() => {
    const visits = filteredData.visits.filter(v => v.score_total !== null)
    const distribution = {
      excelente: 0,
      bueno: 0,
      regular: 0,
      critico: 0,
    }

    visits.forEach(v => {
      if (v.classification === 'excelente') distribution.excelente++
      else if (v.classification === 'bueno') distribution.bueno++
      else if (v.classification === 'regular') distribution.regular++
      else distribution.critico++
    })

    return distribution
  }, [filteredData])

  // Calculate findings by type and severity
  const findingsByType = useMemo(() => {
    const byType: Record<string, number> = {}
    filteredData.findings.forEach(f => {
      byType[f.finding_type] = (byType[f.finding_type] || 0) + 1
    })
    return byType
  }, [filteredData])

  const findingsBySeverity = useMemo(() => {
    const bySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    }
    filteredData.findings.forEach(f => {
      bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1
    })
    return bySeverity
  }, [filteredData])

  // Supervisor performance
  const supervisorPerformance = useMemo(() => {
    const performance: Record<string, {
      name: string
      scheduled: number
      completed: number
      avgScore: number
    }> = {}

    filteredData.schedules.forEach(s => {
      if (!performance[s.supervisor_id]) {
        performance[s.supervisor_id] = {
          name: s.supervisors.name,
          scheduled: 0,
          completed: 0,
          avgScore: 0,
        }
      }
      performance[s.supervisor_id].scheduled++
    })

    filteredData.visits.forEach(v => {
      if (performance[v.supervisor_id]) {
        performance[v.supervisor_id].completed++
        if (v.score_total) {
          const current = performance[v.supervisor_id].avgScore
          const count = performance[v.supervisor_id].completed
          performance[v.supervisor_id].avgScore = (current * (count - 1) + v.score_total) / count
        }
      }
    })

    return Object.values(performance)
  }, [filteredData])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('supervisionAnalytics')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('supervisionSubtitle')}</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allSupervisors')}</option>
              {allSupervisors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allLocations')}</option>
              {allLocations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <DateRangeFilter
              onDateChange={(start, end) => loadAllData(start, end)}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title={t('scheduledVisits')}
            value={kpiData.scheduledVisits}
            icon={Calendar}
            tooltip={t('scheduledVisitsTooltip')}
            status={kpiData.overdueVisits > 0 ? 'warning' : 'neutral'}
          />

          <KPICard
            title={t('completedVisits')}
            value={kpiData.completedVisits}
            icon={CheckCircle2}
            tooltip={t('completedVisitsTooltip')}
            status={kpiData.visitCompletionRate >= 80 ? 'success' : kpiData.visitCompletionRate >= 50 ? 'warning' : 'danger'}
          />

          <KPICard
            title={t('overdueVisits')}
            value={kpiData.overdueVisits}
            icon={Clock}
            tooltip={t('overdueVisitsTooltip')}
            status={kpiData.overdueVisits > 0 ? 'danger' : 'success'}
          />

          <KPICard
            title={t('visitCompletionRate')}
            value={`${kpiData.visitCompletionRate}%`}
            icon={TrendingUp}
            tooltip={t('visitCompletionRateTooltip')}
            status={kpiData.visitCompletionRate >= 80 ? 'success' : kpiData.visitCompletionRate >= 50 ? 'warning' : 'danger'}
          />

          <KPICard
            title={t('criticalFindings')}
            value={kpiData.criticalFindings}
            icon={AlertTriangle}
            tooltip={t('criticalFindingsTooltip')}
            status={kpiData.criticalFindings > 0 ? 'danger' : 'success'}
          />

          <KPICard
            title={t('openCorrectiveActions')}
            value={kpiData.openActions}
            icon={ClipboardCheck}
            tooltip={t('openCorrectiveActionsTooltip')}
            status={kpiData.overdueActions > 0 ? 'warning' : 'neutral'}
          />

          <KPICard
            title={t('overdueActions')}
            value={kpiData.overdueActions}
            icon={AlertCircle}
            tooltip={t('overdueActionsTooltip')}
            status={kpiData.overdueActions > 0 ? 'danger' : 'success'}
          />

          <ScoreCard
            score={kpiData.avgNetworkScore}
            label={t('averageNetworkScore')}
            size="md"
          />
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('scoreDistribution')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{scoreDistribution.excelente}</div>
              <div className="text-sm text-gray-500 mt-1">{t('classificationExcelente')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{scoreDistribution.bueno}</div>
              <div className="text-sm text-gray-500 mt-1">{t('classificationBueno')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{scoreDistribution.regular}</div>
              <div className="text-sm text-gray-500 mt-1">{t('classificationRegular')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{scoreDistribution.critico}</div>
              <div className="text-sm text-gray-500 mt-1">{t('classificationCritico')}</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Findings */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('recentFindings')}</h3>
              <button
                onClick={() => router.push('/dashboard/supervision/findings')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('viewAll')} →
              </button>
            </div>
            <div className="space-y-3">
              {filteredData.findings.slice(0, 5).map(finding => (
                <FindingCard
                  key={finding.id}
                  title={finding.title}
                  description={finding.description}
                  severity={finding.severity as any}
                  type={finding.finding_type as any}
                  category={finding.category}
                  location={finding.supervision_visits?.locations?.name}
                  date={finding.created_at}
                  isRecurring={finding.is_recurring}
                  recurrenceCount={finding.recurrence_count}
                  photoCount={0}
                  onClick={() => router.push(`/dashboard/supervision/findings`)}
                />
              ))}
              {filteredData.findings.length === 0 && (
                <div className="text-center text-gray-500 py-8">{t('noFindings')}</div>
              )}
            </div>
          </div>

          {/* Overdue/Priority Actions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('priorityActions')}</h3>
              <button
                onClick={() => router.push('/dashboard/supervision/actions')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('viewAll')} →
              </button>
            </div>
            <div className="space-y-3">
              {filteredData.actions
                .filter(a => a.is_overdue || a.priority === 'critical' || a.priority === 'high')
                .slice(0, 5)
                .map(action => (
                  <ActionCard
                    key={action.id}
                    description={action.description}
                    status={action.status as any}
                    priority={action.priority as any}
                    responsiblePerson={undefined}
                    committedDate={action.committed_date}
                    isOverdue={action.is_overdue}
                    daysOverdue={action.days_overdue}
                    onClick={() => router.push(`/dashboard/supervision/actions`)}
                  />
                ))}
              {filteredData.actions.filter(a => a.is_overdue || a.priority === 'critical' || a.priority === 'high').length === 0 && (
                <div className="text-center text-gray-500 py-8">{t('noPriorityActions')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Supervisor Performance */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('supervisorPerformance')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('supervisor')}</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">{t('scheduledVisits')}</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">{t('completedVisits')}</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">{t('averageScore')}</th>
                </tr>
              </thead>
              <tbody>
                {supervisorPerformance.map(sp => (
                  <tr key={sp.name} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{sp.name}</td>
                    <td className="py-3 px-4 text-sm text-center text-gray-600">{sp.scheduled}</td>
                    <td className="py-3 px-4 text-sm text-center text-gray-600">{sp.completed}</td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className={`font-semibold ${
                        sp.avgScore >= 90 ? 'text-green-600' :
                        sp.avgScore >= 70 ? 'text-blue-600' :
                        sp.avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {sp.avgScore > 0 ? sp.avgScore.toFixed(1) : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
