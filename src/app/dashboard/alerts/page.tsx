'use client'

/**
 * Alerts Module
 *
 * Centralized alert management dashboard
 * Alert severity tracking, history, and metrics
 */

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'
import { AlertTriangle, CheckCircle, Clock, TrendingUp, AlertOctagon, AlertCircle } from 'lucide-react'
import { KPICard } from '@/components/shared/kpi-card'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface Alert {
  id: string
  location_id: string
  brand_id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  status: 'active' | 'resolved'
  related_entity_type?: string
  related_entity_id?: string
  acknowledged_at?: string
  resolved_at?: string
  created_at: string
  locations?: {
    name: string
    city?: string
  }
  brands?: {
    name: string
    color?: string
  }
}

interface AlertsPageFilters {
  severity?: string
  type?: string
  location?: string
  status?: string
}

export default function AlertsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filters, setFilters] = useState<AlertsPageFilters>({})

  // Load alerts data
  const loadAlertsData = async (startDate?: string, endDate?: string) => {
    console.log('Loading alerts data...')

    const start = startDate || new Date().toISOString().split('T')[0]
    const end = endDate || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end + 'T23:59:59')
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Fetch location and brand data separately
      const alertsData = data as any[]

      // Get unique location IDs and brand IDs
      const locationIds = [...new Set(alertsData.map(a => a.location_id).filter(Boolean))]
      const brandIds = [...new Set(alertsData.map(a => a.brand_id).filter(Boolean))]

      // Fetch locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('id, name, city')
        .in('id', locationIds)

      // Fetch brands
      const { data: brandsData } = await supabase
        .from('brands')
        .select('id, name, color')
        .in('id', brandIds)

      // Create lookup maps
      const locationMap = new Map(locationsData?.map(l => [l.id, l]) || [])
      const brandMap = new Map(brandsData?.map(b => [b.id, b]) || [])

      // Enrich alerts with location and brand data
      const enrichedAlerts = alertsData.map(alert => ({
        ...alert,
        locations: locationMap.get(alert.location_id),
        brands: brandMap.get(alert.brand_id)
      }))

      setAlerts(enrichedAlerts as Alert[])
      console.log('Alerts loaded:', enrichedAlerts.length, 'alerts')
    } else {
      console.error('Error loading alerts:', error)
      setAlerts([])
    }
  }

  const handleDateChange = async (startDate: string, endDate: string) => {
    await loadAlertsData(startDate, endDate)
  }

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Load initial data (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const today = new Date()

      await loadAlertsData(sevenDaysAgo.toISOString().split('T')[0], today.toISOString().split('T')[0])
      setLoading(false)
    }

    initAuth()
  }, [router, supabase])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalAlerts = alerts.length
    const activeAlerts = alerts.filter(a => a.status === 'active').length
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length
    const resolvedToday = alerts.filter(a => {
      if (!a.resolved_at) return false
      const resolvedDate = new Date(a.resolved_at).toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]
      return resolvedDate === today
    }).length

    return {
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      resolvedToday
    }
  }, [alerts])

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filters.severity && alert.severity !== filters.severity) return false
      if (filters.type && alert.type !== filters.type) return false
      if (filters.location && alert.locations?.name !== filters.location) return false
      if (filters.status && alert.status !== filters.status) return false
      return true
    })
  }, [alerts, filters])

  // Alert breakdown by type
  const alertsByType = useMemo(() => {
    const breakdown: Record<string, number> = {}
    alerts.forEach(alert => {
      breakdown[alert.type] = (breakdown[alert.type] || 0) + 1
    })
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1])
  }, [alerts])

  // Alert breakdown by severity
  const alertsBySeverity = useMemo(() => {
    const breakdown: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
    alerts.filter(a => a.status === 'active').forEach(alert => {
      breakdown[alert.severity] = (breakdown[alert.severity] || 0) + 1
    })
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1])
  }, [alerts])

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const locations = [...new Set(alerts.map(a => a.locations?.name).filter(Boolean))]
    const types = [...new Set(alerts.map(a => a.type))]
    return { locations, types }
  }, [alerts])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return t('severityCritical')
      case 'high': return t('severityHigh')
      case 'medium': return t('severityMedium')
      case 'low': return t('severityLow')
      default: return severity
    }
  }

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'cash': return t('alertTypeCash')
      case 'profitability': return t('alertTypeProfitability')
      case 'supervision': return t('alertTypeSupervision')
      case 'merchandise': return t('alertTypeMerchandise')
      case 'sales': return t('alertTypeSales')
      default: return type
    }
  }

  const getAlertTitle = (title: string) => {
    switch (title) {
      case 'Cash Shortage Detected': return t('alertTitleCashShortage')
      case 'High Food Cost Alert': return t('alertTitleHighFoodCost')
      case 'Supervision Visit Required': return t('alertTitleSupervisionVisit')
      case 'Stock Shortage Warning': return t('alertTitleStockShortage')
      case 'Sales Drop Alert': return t('alertTitleSalesDrop')
      default: return title
    }
  }

  const getAlertDescription = (description: string) => {
    switch (description) {
      case 'Cash shortage detected in daily closing': return t('alertDescCashShortage')
      case 'Food cost above 35% threshold': return t('alertDescHighFoodCost')
      case 'No supervision visit in 10 days': return t('alertDescSupervisionVisit')
      case 'Critical stock shortage: Burgers': return t('alertDescStockShortage')
      case 'Sales dropped 15% vs last week': return t('alertDescSalesDrop')
      default: return description
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertOctagon
      case 'high': return AlertTriangle
      case 'medium': return AlertCircle
      case 'low': return CheckCircle
      default: return AlertTriangle
    }
  }

  const getStatusBadge = (alert: Alert) => {
    if (alert.status === 'resolved') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {t('statusResolved')}
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        {t('statusActive')}
      </span>
    )
  }

  const getSupervisionNavigationPath = (alert: Alert): string | null => {
    if (alert.type !== 'supervision' || !alert.related_entity_type) {
      return null
    }

    switch (alert.related_entity_type) {
      case 'operational_finding':
        return '/dashboard/supervision/findings'
      case 'supervision_schedule':
        return '/dashboard/supervision/schedule'
      case 'corrective_action':
        return '/dashboard/supervision/actions'
      default:
        return null
    }
  }

  if (loading) {
    return (
      <DashboardLayout titleKey="alertsManagement" subtitleKey="loading">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loadingAlerts')}...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      titleKey="alertsManagement"
      subtitleKey="alertsSubtitle"
    >
      <div className="max-w-7xl mx-auto">
          {/* Date Filter */}
          <div className="mb-6">
            <DateRangeFilter onDateChange={handleDateChange} />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title={t('totalAlerts')}
              value={kpis.totalAlerts}
              icon={AlertTriangle}
              tooltip={t('totalAlertsTooltip')}
            />
            <KPICard
              title={t('activeAlerts')}
              value={kpis.activeAlerts}
              icon={AlertOctagon}
              tooltip={t('activeAlertsTooltip')}
              status={kpis.activeAlerts > 0 ? 'danger' : 'success'}
            />
            <KPICard
              title={t('criticalAlerts')}
              value={kpis.criticalAlerts}
              icon={AlertOctagon}
              tooltip={t('criticalAlertsTooltip')}
              status={kpis.criticalAlerts > 0 ? 'danger' : 'success'}
            />
            <KPICard
              title={t('resolvedToday')}
              value={kpis.resolvedToday}
              icon={CheckCircle}
              tooltip={t('resolvedTodayTooltip')}
              status="success"
            />
          </div>

          {/* Alert Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* By Type */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gray-400" />
                {t('alertsByType')}
              </h3>
              <div className="space-y-3">
                {alertsByType.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{getAlertTypeLabel(type)}</span>
                    <span className="text-sm font-semibold text-blue-700">{count}</span>
                  </div>
                ))}
                {alertsByType.length === 0 && (
                  <p className="text-center text-gray-500 py-4">{t('noAlertsInPeriod')}</p>
                )}
              </div>
            </div>

            {/* By Severity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                {t('alertsBySeverity')}
              </h3>
              <div className="space-y-3">
                {alertsBySeverity.map(([severity, count]) => {
                  const Icon = getSeverityIcon(severity)
                  const colors = getSeverityColor(severity)
                  return (
                    <div key={severity} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${colors.split(' ')[0]}`} />
                        <span className="font-medium text-gray-700">{getSeverityLabel(severity)}</span>
                      </div>
                      <span className={`text-sm font-semibold ${colors.split(' ')[0]}`}>{count}</span>
                    </div>
                  )
                })}
                {alertsBySeverity.length === 0 && (
                  <p className="text-center text-gray-500 py-4">{t('noActiveAlerts')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.severity || ''}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value || undefined })}
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('allSeverities')}</option>
                <option value="critical">{t('severityCritical')}</option>
                <option value="high">{t('severityHigh')}</option>
                <option value="medium">{t('severityMedium')}</option>
                <option value="low">{t('severityLow')}</option>
              </select>

              <select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('allTypes')}</option>
                {filterOptions.types.map(type => (
                  <option key={type} value={type}>{getAlertTypeLabel(type)}</option>
                ))}
              </select>

              <select
                value={filters.location || ''}
                onChange={(e) => setFilters({ ...filters, location: e.target.value || undefined })}
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('allLocations')}</option>
                {filterOptions.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('allStatuses')}</option>
                <option value="active">{t('statusActive')}</option>
                <option value="resolved">{t('statusResolved')}</option>
              </select>

              {(filters.severity || filters.type || filters.location || filters.status) && (
                <button
                  onClick={() => setFilters({})}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>
          </div>

          {/* Alerts Table */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('alertHistory')} {filteredAlerts.length !== alerts.length && `(${filteredAlerts.length} of ${alerts.length})`}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tableSeverity')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tableType')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tableTitle')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tableLocation')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tableStatus')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tableCreated')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAlerts.map((alert) => {
                    const SeverityIcon = getSeverityIcon(alert.severity)
                    const colors = getSeverityColor(alert.severity)
                    const supervisionPath = getSupervisionNavigationPath(alert)
                    return (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${colors}`}>
                            <SeverityIcon className="w-3 h-3" />
                            {getSeverityLabel(alert.severity)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getAlertTypeLabel(alert.type)}</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{getAlertTitle(alert.title)}</div>
                            <div className="text-sm text-gray-500 mt-1">{getAlertDescription(alert.description)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {alert.locations?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(alert)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {supervisionPath ? (
                            <button
                              onClick={() => router.push(supervisionPath)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {t('view')}
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredAlerts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>{t('noAlertsFound')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </DashboardLayout>
  )
}
