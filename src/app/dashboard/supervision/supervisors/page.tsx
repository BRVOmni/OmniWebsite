'use client'

/**
 * Supervisor Performance Tracking Page
 *
 * Track and analyze supervisor performance metrics.
 * Shows visit completion rates, efficiency, quality scores, and rankings.
 * Integrated with SupervisorDashboard for detailed individual views.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ScoreCard } from '@/components/supervision/score-card'
import { SupervisorDashboard } from '@/components/supervision/supervisor-dashboard'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import {
  Users,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  Award,
  Zap
} from 'lucide-react'

// Data Types
interface SupervisorInfo {
  id: string
  name: string
  email?: string
  is_active: boolean
}

interface VisitData {
  id: string
  visit_date: string
  visit_type: string
  start_time: string
  end_time: string
  duration_minutes: number
  classification: string
  score_total: number
  score_liderazgo: number
  score_orden: number
  score_caja: number
  score_stock: number
  score_limpieza: number
  score_equipos: number
  supervisor_id: string
  location_id: string
}

interface FindingData {
  id: string
  severity: string
  created_at: string
  supervision_visits: {
    supervisor_id: string
  } | null
}

interface ActionData {
  id: string
  status: string
  committed_date: string
  actual_completion_date: string | null
  created_at: string
  corrective_actions: {
    supervisor_id: string
  } | null
}

interface ScheduleData {
  id: string
  planned_date: string
  status: string
  supervisor_id: string
}

interface SupervisorPerformance {
  supervisor: SupervisorInfo
  visitsScheduled: number
  visitsCompleted: number
  visitsMissed: number
  completionRate: number
  onTimeRate: number
  avgDuration: number
  avgScore: number
  categoryScores: Record<string, number>
  findingsPerVisit: number
  criticalFindings: number
  actionsIdentified: number
  actionsCompleted: number
  actionsCompletedOnTime: number
  actionCompletionRate: number
  visitsPerDay: number
  lastVisitDate: string | null
}

export default function SupervisorsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<SupervisorPerformance[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | '180'>('90')
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      await loadPerformanceData(selectedPeriod)
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadPerformanceData = async (days: string) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    // Load supervisors
    const { data: supervisorsData } = await supabase
      .from('supervisors')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (!supervisorsData) return

    // Load visits
    const { data: visitsData } = await supabase
      .from('supervision_visits')
      .select(`
        id,
        visit_date,
        visit_type,
        start_time,
        end_time,
        duration_minutes,
        classification,
        score_total,
        score_liderazgo,
        score_orden,
        score_caja,
        score_stock,
        score_limpieza,
        score_equipos,
        supervisor_id,
        location_id
      `)
      .gte('visit_date', startDate.toISOString().split('T')[0])

    // Load findings
    const { data: findingsData } = await supabase
      .from('operational_findings')
      .select('id, severity, created_at, supervision_visits(supervisor_id)')
      .gte('created_at', startDate.toISOString().split('T')[0])

    // Load actions
    const { data: actionsData } = await supabase
      .from('corrective_actions')
      .select('id, status, committed_date, actual_completion_date, created_at, corrective_actions(supervisor_id)')
      .gte('created_at', startDate.toISOString().split('T')[0])

    // Load schedules
    const { data: schedulesData } = await supabase
      .from('supervision_schedule')
      .select('id, planned_date, status, supervisor_id')
      .gte('planned_date', startDate.toISOString().split('T')[0])

    // Calculate performance for each supervisor
    const performance: SupervisorPerformance[] = (supervisorsData as unknown as SupervisorInfo[]).map(supervisor => {
      const supervisorVisits = (visitsData || []).filter((v: VisitData) => v.supervisor_id === supervisor.id)
      const supervisorSchedules = (schedulesData || []).filter((s: ScheduleData) => s.supervisor_id === supervisor.id)
      const supervisorFindings = (findingsData || []).filter((f: FindingData) => f.supervision_visits?.supervisor_id === supervisor.id)
      const supervisorActions = (actionsData || []).filter((a: ActionData) => a.corrective_actions?.supervisor_id === supervisor.id)

      const visitsScheduled = supervisorSchedules.length
      const visitsCompleted = supervisorVisits.length
      const visitsMissed = supervisorSchedules.filter((s: ScheduleData) => s.status === 'missed').length

      const completionRate = visitsScheduled > 0 ? (visitsCompleted / visitsScheduled) * 100 : 0

      // On-time completion (completed on or before planned date)
      const onTimeCompletions = supervisorVisits.filter(v => {
        const correspondingSchedule = supervisorSchedules.find(s => s.planned_date === v.visit_date)
        return correspondingSchedule && v.visit_date <= correspondingSchedule.planned_date
      }).length

      const onTimeRate = visitsCompleted > 0 ? (onTimeCompletions / visitsCompleted) * 100 : 0

      const avgDuration = supervisorVisits.length > 0
        ? supervisorVisits.reduce((sum, v) => sum + (v.duration_minutes || 0), 0) / supervisorVisits.length
        : 0

      const avgScore = supervisorVisits.length > 0
        ? supervisorVisits.reduce((sum, v) => sum + (v.score_total || 0), 0) / supervisorVisits.length
        : 0

      const categoryScores = {
        liderazgo: supervisorVisits.length > 0 ? supervisorVisits.reduce((sum, v) => sum + (v.score_liderazgo || 0), 0) / supervisorVisits.length : 0,
        orden: supervisorVisits.length > 0 ? supervisorVisits.reduce((sum, v) => sum + (v.score_orden || 0), 0) / supervisorVisits.length : 0,
        caja: supervisorVisits.length > 0 ? supervisorVisits.reduce((sum, v) => sum + (v.score_caja || 0), 0) / supervisorVisits.length : 0,
        stock: supervisorVisits.length > 0 ? supervisorVisits.reduce((sum, v) => sum + (v.score_stock || 0), 0) / supervisorVisits.length : 0,
        limpieza: supervisorVisits.length > 0 ? supervisorVisits.reduce((sum, v) => sum + (v.score_limpieza || 0), 0) / supervisorVisits.length : 0,
        equipos: supervisorVisits.length > 0 ? supervisorVisits.reduce((sum, v) => sum + (v.score_equipos || 0), 0) / supervisorVisits.length : 0,
      }

      const findingsPerVisit = supervisorVisits.length > 0 ? supervisorFindings.length / supervisorVisits.length : 0
      const criticalFindings = supervisorFindings.filter((f: FindingData) => f.severity === 'critical').length

      const actionsCompleted = supervisorActions.filter((a: ActionData) => a.status === 'completed').length
      const actionsCompletedOnTime = supervisorActions.filter((a: ActionData) => {
        return a.status === 'completed' && a.actual_completion_date && a.actual_completion_date <= a.committed_date
      }).length

      const actionCompletionRate = supervisorActions.length > 0 ? (actionsCompleted / supervisorActions.length) * 100 : 0

      const daysPeriod = parseInt(days)
      const visitsPerDay = supervisorVisits.length > 0 ? (supervisorVisits.length / daysPeriod) * 7 : 0

      const lastVisit = supervisorVisits[0]
      const lastVisitDate = lastVisit ? lastVisit.visit_date : null

      return {
        supervisor,
        visitsScheduled,
        visitsCompleted,
        visitsMissed,
        completionRate,
        onTimeRate,
        avgDuration,
        avgScore,
        categoryScores,
        findingsPerVisit,
        criticalFindings,
        actionsIdentified: supervisorActions.length,
        actionsCompleted,
        actionsCompletedOnTime,
        actionCompletionRate,
        visitsPerDay,
        lastVisitDate,
      }
    })

    setPerformanceData(performance)
  }

  // Calculate rankings
  const rankings = useMemo(() => {
    return {
      bestPerformance: [...performanceData].sort((a, b) => b.avgScore - a.avgScore)[0],
      mostEfficient: [...performanceData].sort((a, b) => b.visitsPerDay - a.visitsPerDay)[0],
      highestCompletion: [...performanceData].sort((a, b) => b.completionRate - a.completionRate)[0],
      mostOnTime: [...performanceData].sort((a, b) => b.onTimeRate - a.onTimeRate)[0],
      bestQuality: [...performanceData].sort((a, b) => b.actionCompletionRate - a.actionCompletionRate)[0],
    }
  }, [performanceData])

  // Calculate network averages
  const networkAverages = useMemo(() => {
    if (performanceData.length === 0) return null

    return {
      avgCompletionRate: performanceData.reduce((sum, p) => sum + p.completionRate, 0) / performanceData.length,
      avgScore: performanceData.reduce((sum, p) => sum + p.avgScore, 0) / performanceData.length,
      avgDuration: performanceData.reduce((sum, p) => sum + p.avgDuration, 0) / performanceData.length,
      avgVisitsPerDay: performanceData.reduce((sum, p) => sum + p.visitsPerDay, 0) / performanceData.length,
    }
  }, [performanceData])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      </DashboardLayout>
    )
  }

  // Show individual supervisor dashboard
  if (selectedSupervisorId) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedSupervisorId(null)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('backToList')}
          </Button>
          <SupervisorDashboard
            supervisorId={selectedSupervisorId}
            days={parseInt(selectedPeriod)}
          />
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
            <h1 className="text-2xl font-bold text-gray-900">{t('supervisorPerformance')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('supervisorPerformanceDescription')}</p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            {[
              { value: '30', label: '30 Days' },
              { value: '90', label: '90 Days' },
              { value: '180', label: '180 Days' },
            ].map(period => (
              <button
                key={period.value}
                onClick={() => {
                  setSelectedPeriod(period.value as any)
                  loadPerformanceData(period.value)
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-sm border border-yellow-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">{t('bestPerformance')}</span>
            </div>
            {rankings.bestPerformance && (
              <>
                <div className="text-lg font-bold text-gray-900">{rankings.bestPerformance.supervisor.name}</div>
                <div className="text-sm text-gray-600">{t('avgScore')}: {rankings.bestPerformance.avgScore.toFixed(1)}%</div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{t('mostEfficient')}</span>
            </div>
            {rankings.mostEfficient && (
              <>
                <div className="text-lg font-bold text-gray-900">{rankings.mostEfficient.supervisor.name}</div>
                <div className="text-sm text-gray-600">{rankings.mostEfficient.visitsPerDay.toFixed(1)} {t('visitsPerDay')}</div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">{t('highestCompletion')}</span>
            </div>
            {rankings.highestCompletion && (
              <>
                <div className="text-lg font-bold text-gray-900">{rankings.highestCompletion.supervisor.name}</div>
                <div className="text-sm text-gray-600">{rankings.highestCompletion.completionRate.toFixed(0)}% {t('completionRate')}</div>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">{t('bestQuality')}</span>
            </div>
            {rankings.bestQuality && (
              <>
                <div className="text-lg font-bold text-gray-900">{rankings.bestQuality.supervisor.name}</div>
                <div className="text-sm text-gray-600">{rankings.bestQuality.actionCompletionRate.toFixed(0)}% {t('actionCompletionRate')}</div>
              </>
            )}
          </div>
        </div>

        {/* Network Averages */}
        {networkAverages && (
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('networkAverages')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">{t('visitCompletionRate')}</div>
                <div className="text-xl font-bold text-gray-900">{networkAverages.avgCompletionRate.toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('averageScore')}</div>
                <div className="text-xl font-bold text-gray-900">{networkAverages.avgScore.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('avgVisitDuration')}</div>
                <div className="text-xl font-bold text-gray-900">{networkAverages.avgDuration.toFixed(0)}m</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('visitsPerDay')}</div>
                <div className="text-xl font-bold text-gray-900">{networkAverages.avgVisitsPerDay.toFixed(1)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Supervisor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {performanceData.map(perf => (
            <div
              key={perf.supervisor.id}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-4 border-b flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{perf.supervisor.name}</h3>
                  {perf.supervisor.email && (
                    <p className="text-sm text-gray-500">{perf.supervisor.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <ScoreCard
                    score={perf.avgScore}
                    classification={perf.avgScore >= 90 ? 'excelente' : perf.avgScore >= 70 ? 'bueno' : perf.avgScore >= 50 ? 'regular' : 'critico'}
                    size="sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => setSelectedSupervisorId(perf.supervisor.id)}
                  >
                    {t('viewDetails')}
                  </Button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="p-4 grid grid-cols-2 gap-4">
                {/* Completion */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('visitCompletionRate')}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          perf.completionRate >= 80 ? 'bg-green-500' :
                          perf.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${perf.completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{perf.completionRate.toFixed(0)}%</span>
                  </div>
                </div>

                {/* On-time Rate */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('onTimeRate')}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          perf.onTimeRate >= 80 ? 'bg-green-500' :
                          perf.onTimeRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${perf.onTimeRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{perf.onTimeRate.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Avg Duration */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('avgVisitDuration')}</div>
                  <div className="text-lg font-bold text-gray-900">{perf.avgDuration.toFixed(0)}m</div>
                </div>

                {/* Visits Per Day */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('visitsPerDay')}</div>
                  <div className="text-lg font-bold text-gray-900">{perf.visitsPerDay.toFixed(1)}</div>
                </div>

                {/* Findings */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('findingsPerVisit')}</div>
                  <div className="text-lg font-bold text-gray-900">{perf.findingsPerVisit.toFixed(2)}</div>
                </div>

                {/* Critical Findings */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('criticalFindings')}</div>
                  <div className="text-lg font-bold text-red-600">{perf.criticalFindings}</div>
                </div>

                {/* Actions */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('actionsCompleted')}</div>
                  <div className="text-sm text-gray-900">
                    {perf.actionsCompleted}/{perf.actionsIdentified}
                  </div>
                </div>

                {/* Action Completion */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">{t('onTimeActions')}</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {perf.actionsCompletedOnTime}/{perf.actionsCompleted}
                  </div>
                </div>
              </div>

              {/* Category Scores */}
              <div className="px-4 pb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">{t('categoryBreakdown')}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(perf.categoryScores).map(([cat, score]) => (
                    <div key={cat} className="text-center">
                      <div className="text-xs text-gray-400 truncate">{cat}</div>
                      <div className={`text-sm font-semibold ${
                        score >= 90 ? 'text-green-600' :
                        score >= 70 ? 'text-blue-600' :
                        score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {score > 0 ? score.toFixed(0) : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
                <span>
                  {perf.visitsCompleted} {t('visitsCompleted')} • {perf.visitsMissed} {t('visitsMissed')}
                </span>
                <span>
                  {t('lastVisit')}: {perf.lastVisitDate ? new Date(perf.lastVisitDate).toLocaleDateString() : t('never')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {performanceData.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
            {t('noSupervisorsFound')}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
