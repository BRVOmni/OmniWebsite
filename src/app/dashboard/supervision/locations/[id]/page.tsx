'use client'

/**
 * Location Supervision Detail Page
 *
 * Detailed view of a single location's supervision performance.
 * Shows visit history, score trends, findings, actions, and metrics.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ScoreCard } from '@/components/supervision/score-card'
import { FindingCard } from '@/components/supervision/finding-card'
import { ActionCard } from '@/components/supervision/action-card'
import { VisitTypeBadge } from '@/components/supervision/visit-type-badge'
import {
  MapPin,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User
} from 'lucide-react'

// Data Types
interface LocationInfo {
  id: string
  name: string
  address: string
  phone: string
  cities?: {
    name: string
  } | null
  brands?: {
    name: string
  } | null
}

interface VisitData {
  id: string
  visit_date: string
  visit_type: string
  visit_shift: string
  classification: string
  score_total: number
  score_liderazgo: number
  score_orden: number
  score_caja: number
  score_stock: number
  score_limpieza: number
  score_equipos: number
  supervisor_id: string
  supervisors: {
    name: string
  } | null
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
  photo_url: string
  created_at: string
}

interface ActionData {
  id: string
  description: string
  status: string
  priority: string
  committed_date: string
  is_overdue: boolean
  days_overdue: number
  responsible_person: string
  created_at: string
}

export default function LocationDetailPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const locationId = params.id as string

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [visits, setVisits] = useState<VisitData[]>([])
  const [findings, setFindings] = useState<FindingData[]>([])
  const [actions, setActions] = useState<ActionData[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      await Promise.all([
        loadLocation(),
        loadVisits(),
        loadFindings(),
        loadActions(),
      ])
      setLoading(false)
    }

    init()
  }, [locationId, router, supabase])

  const loadLocation = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name, address, phone, cities(name), brands(name)')
      .eq('id', locationId)
      .single()

    setLocation(data as unknown as LocationInfo)
  }

  const loadVisits = async () => {
    const { data } = await supabase
      .from('supervision_visits')
      .select(`
        id,
        visit_date,
        visit_type,
        visit_shift,
        classification,
        score_total,
        score_liderazgo,
        score_orden,
        score_caja,
        score_stock,
        score_limpieza,
        score_equipos,
        supervisor_id,
        supervisors (
          name
        )
      `)
      .eq('location_id', locationId)
      .order('visit_date', { ascending: false })
      .limit(20)

    setVisits(data as unknown as VisitData[] || [])
  }

  const loadFindings = async () => {
    const { data } = await supabase
      .from('operational_findings')
      .select('*')
      .eq('supervision_visits.location_id', locationId)
      .order('created_at', { ascending: false })
      .limit(20)

    setFindings(data as unknown as FindingData[] || [])
  }

  const loadActions = async () => {
    const { data } = await supabase
      .from('corrective_actions')
      .select('*')
      .eq('location_id', locationId)
      .in('status', ['pending', 'in_progress'])
      .order('committed_date', { ascending: true })

    setActions(data as unknown as ActionData[] || [])
  }

  // Calculate metrics
  const metrics = useMemo(() => {
    const lastVisit = visits[0]
    const daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - new Date(lastVisit.visit_date).getTime()) / (1000 * 60 * 60 * 24))
      : null

    const avgScore = visits.length > 0
      ? visits.reduce((sum, v) => sum + (v.score_total || 0), 0) / visits.length
      : 0

    const categoryScores = {
      liderazgo: visits.length > 0 ? visits.reduce((sum, v) => sum + (v.score_liderazgo || 0), 0) / visits.length : 0,
      orden: visits.length > 0 ? visits.reduce((sum, v) => sum + (v.score_orden || 0), 0) / visits.length : 0,
      caja: visits.length > 0 ? visits.reduce((sum, v) => sum + (v.score_caja || 0), 0) / visits.length : 0,
      stock: visits.length > 0 ? visits.reduce((sum, v) => sum + (v.score_stock || 0), 0) / visits.length : 0,
      limpieza: visits.length > 0 ? visits.reduce((sum, v) => sum + (v.score_limpieza || 0), 0) / visits.length : 0,
      equipos: visits.length > 0 ? visits.reduce((sum, v) => sum + (v.score_equipos || 0), 0) / visits.length : 0,
    }

    const criticalFindings = findings.filter(f => f.severity === 'critical').length
    const highFindings = findings.filter(f => f.severity === 'high').length
    const overdueActions = actions.filter(a => a.is_overdue).length

    // Score trend (last 5 visits)
    const recentScores = visits.slice(0, 5).map(v => v.score_total || 0).reverse()
    const scoreTrend = recentScores.length >= 2
      ? recentScores[recentScores.length - 1] > recentScores[0] ? 'improving' : 'declining'
      : 'stable'

    return {
      lastVisit,
      daysSinceLastVisit,
      avgScore,
      categoryScores,
      criticalFindings,
      highFindings,
      overdueActions,
      recentScores,
      scoreTrend,
      totalVisits: visits.length,
    }
  }, [visits, findings, actions])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!location) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">{t('locationNotFound')}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            {t('backToLocations')}
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{location.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {location.cities?.name}
              </span>
              {location.brands?.name && (
                <span>• {location.brands.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard
            score={metrics.avgScore}
            label={t('averageScore')}
          />
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1">{t('lastVisit')}</div>
            <div className="font-semibold text-gray-900">
              {metrics.lastVisit ? new Date(metrics.lastVisit.visit_date).toLocaleDateString() : t('never')}
            </div>
            {metrics.daysSinceLastVisit !== null && (
              <div className={`text-xs mt-1 ${metrics.daysSinceLastVisit > 7 ? 'text-red-600' : 'text-gray-500'}`}>
                {metrics.daysSinceLastVisit} {t('days')} {t('ago')}
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1">{t('totalVisits')}</div>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalVisits}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1">{t('scoreTrend')}</div>
            <div className="flex items-center gap-2">
              {metrics.scoreTrend === 'improving' ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : metrics.scoreTrend === 'declining' ? (
                <TrendingDown className="w-5 h-5 text-red-600" />
              ) : (
                <div className="w-5 h-5 bg-gray-300 rounded-full" />
              )}
              <span className={`font-semibold ${
                metrics.scoreTrend === 'improving' ? 'text-green-600' :
                metrics.scoreTrend === 'declining' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {t(metrics.scoreTrend)}
              </span>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('scoreByCategory')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(metrics.categoryScores).map(([cat, score]) => (
              <div key={cat} className="text-center">
                <div className="text-sm text-gray-500 mb-1">{cat}</div>
                <div className={`text-2xl font-bold ${
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Visits */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">{t('recentVisits')}</h3>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {visits.slice(0, 10).map(visit => (
                <div key={visit.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </span>
                        <VisitTypeBadge type={visit.visit_type as any} />
                      </div>
                      <div className="text-sm text-gray-500">
                        {visit.supervisors?.name} • {visit.visit_shift}
                      </div>
                    </div>
                    <ScoreCard
                      score={visit.score_total || 0}
                      classification={visit.classification}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
              {visits.length === 0 && (
                <div className="p-8 text-center text-gray-500">{t('noVisits')}</div>
              )}
            </div>
          </div>

          {/* Active Findings */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">{t('activeFindings')}</h3>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {findings.slice(0, 5).map(finding => (
                <FindingCard
                  key={finding.id}
                  title={finding.title}
                  description={finding.description}
                  severity={finding.severity as any}
                  type={finding.finding_type as any}
                  category={finding.category}
                  date={finding.created_at}
                  isRecurring={finding.is_recurring}
                  recurrenceCount={finding.recurrence_count}
                  photoCount={finding.photo_url ? 1 : 0}
                  onClick={() => {}}
                  className="cursor-default"
                />
              ))}
              {findings.length === 0 && (
                <div className="text-center text-gray-500 py-8">{t('noFindings')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Corrective Actions */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">{t('correctiveActions')}</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actions.slice(0, 6).map(action => (
                <ActionCard
                  key={action.id}
                  description={action.description}
                  status={action.status as any}
                  priority={action.priority as any}
                  responsiblePerson={action.responsible_person}
                  committedDate={action.committed_date}
                  isOverdue={action.is_overdue}
                  daysOverdue={action.days_overdue}
                  onClick={() => {}}
                  className="cursor-default"
                />
              ))}
              {actions.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  {t('noActions')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
