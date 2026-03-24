'use client'

/**
 * Supervisor Dashboard Component
 *
 * Displays comprehensive supervisor analytics including:
 * - Performance metrics
 * - Assigned locations with visit history
 * - Upcoming schedule
 * - Leaderboard ranking
 * - Workload distribution
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface SupervisorData {
  supervisor_id: string
  supervisor_name: string
  total_visits_completed: number
  completion_rate: number
  average_score: number
  average_operation_score: number
  total_findings: number
  critical_findings: number
  actions_completed: number
  actions_overdue: number
  locations_assigned: number
  days_since_last_visit: number | null
  compliance_rate: number
  performance_trend: 'improving' | 'stable' | 'declining'
  ranking: number
  assigned_locations: Array<{
    location: {
      id: string
      name: string
      cities: { name: string }
    }
    last_visit_date: string | null
    last_visit_score: number | null
    total_visits: number
  }>
  upcoming_visits: Array<{
    id: string
    planned_date: string
    planned_shift: string
    visit_type: string
    locations: {
      name: string
      cities: { name: string }
    }
  }>
  workload: {
    level: number
    status: 'low' | 'medium' | 'high' | 'optimal'
  }
}

interface SupervisorDashboardProps {
  supervisorId: string
  days?: number
}

export function SupervisorDashboard({ supervisorId, days = 90 }: SupervisorDashboardProps) {
  const t = useTranslations()
  const [data, setData] = useState<SupervisorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSupervisorData()
  }, [supervisorId, days])

  async function loadSupervisorData() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/supervision/supervisors?type=supervisor&supervisorId=${supervisorId}&days=${days}`
      )

      if (!response.ok) {
        throw new Error('Failed to load supervisor data')
      }

      const result = await response.json()
      setData(result.supervisor)
    } catch (err) {
      console.error('Error loading supervisor data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <SupervisorDashboardSkeleton />
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    )
  }

  const trendIcon = {
    improving: <TrendingUp className="h-4 w-4 text-green-500" />,
    stable: <Minus className="h-4 w-4 text-yellow-500" />,
    declining: <TrendingDown className="h-4 w-4 text-red-500" />
  }[data.performance_trend]

  const tierBadge = getTierBadge(data.ranking)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{data.supervisor_name}</h2>
          <p className="text-muted-foreground">{t('supervision.dashboard.supervisorOverview')}</p>
        </div>
        <div className="flex items-center gap-2">
          {tierBadge}
          <Badge variant="outline" className="text-lg">
            #{data.ranking}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('supervision.dashboard.avgScore')}
          value={data.average_score.toString()}
          icon={<Award className="h-4 w-4" />}
          trend={trendIcon}
          color={data.average_score >= 80 ? 'green' : data.average_score >= 60 ? 'yellow' : 'red'}
        />
        <MetricCard
          title={t('supervision.dashboard.completionRate')}
          value={`${data.completion_rate}%`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          color={data.completion_rate >= 80 ? 'green' : data.completion_rate >= 60 ? 'yellow' : 'red'}
        />
        <MetricCard
          title={t('supervision.dashboard.complianceRate')}
          value={`${data.compliance_rate}%`}
          icon={<Users className="h-4 w-4" />}
          color={data.compliance_rate >= 80 ? 'green' : data.compliance_rate >= 60 ? 'yellow' : 'red'}
        />
        <MetricCard
          title={t('supervision.dashboard.workload')}
          value={data.workload.status}
          subtitle={`${data.locations_assigned} ${t('common.locations')}`}
          icon={<MapPin className="h-4 w-4" />}
          color={data.workload.level > 80 ? 'red' : data.workload.level > 50 ? 'yellow' : 'green'}
        />
      </div>

      {/* Findings and Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('supervision.dashboard.findings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('supervision.dashboard.totalFindings')}</span>
              <Badge variant="secondary">{data.total_findings}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('supervision.dashboard.criticalFindings')}</span>
              <Badge variant="destructive">{data.critical_findings}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('supervision.dashboard.actions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('supervision.dashboard.completedActions')}</span>
              <Badge variant="default" className="bg-green-500">{data.actions_completed}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('supervision.dashboard.overdueActions')}</span>
              <Badge variant="destructive">{data.actions_overdue}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Locations */}
      <Card>
        <CardHeader>
          <CardTitle>{t('supervision.dashboard.assignedLocations')}</CardTitle>
          <CardDescription>
            {data.assigned_locations.length} {t('common.locations')} • {t('supervision.dashboard.lastVisitInfo')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.assigned_locations.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <p className="font-medium">{item.location.name}</p>
                  <p className="text-sm text-muted-foreground">{item.location.cities.name}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">{item.last_visit_score || '-'}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.last_visit_date
                      ? new Date(item.last_visit_date).toLocaleDateString()
                      : t('supervision.dashboard.noVisits')
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Schedule */}
      {data.upcoming_visits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('supervision.dashboard.upcomingVisits')}</CardTitle>
            <CardDescription>{t('supervision.dashboard.next7Days')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcoming_visits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{visit.locations.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {visit.locations.cities.name} • {visit.planned_shift} • {visit.visit_type}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {new Date(visit.planned_date).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Metric Card Component
 */
function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  trend?: React.ReactNode
  color: 'green' | 'yellow' | 'red'
}) {
  const colorClasses = {
    green: 'text-green-500 bg-green-50 dark:bg-green-950',
    yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    red: 'text-red-500 bg-red-50 dark:bg-red-950'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          {trend}
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg', colorClasses[color])}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Get tier badge based on ranking
 */
function getTierBadge(rank: number) {
  if (rank === 1) {
    return <Badge className="bg-yellow-500">🏆 Champion</Badge>
  }
  if (rank <= 3) {
    return <Badge className="bg-amber-600">🥇 Gold</Badge>
  }
  if (rank <= 5) {
    return <Badge className="bg-slate-400">🥈 Silver</Badge>
  }
  if (rank <= 10) {
    return <Badge className="bg-orange-700">🥉 Bronze</Badge>
  }
  return null
}

/**
 * Loading Skeleton
 */
function SupervisorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
