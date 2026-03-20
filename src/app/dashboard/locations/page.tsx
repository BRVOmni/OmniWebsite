'use client'

/**
 * Locations Module
 *
 * Complete location overview with rankings, metrics,
 * and drill-down to individual location details.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { KPICard } from '@/components/shared/kpi-card'
import { MapPin, TrendingUp, DollarSign, AlertCircle, Eye } from 'lucide-react'

interface LocationData {
  id: string
  name: string
  address: string
  cities: {
    name: string
  }
  brands: {
    name: string
    color: string
  }
}

interface SalesData {
  id: string
  date: string
  net_amount: number
  location_id: string
}

interface CashClosingData {
  id: string
  date: string
  total_difference: number
  petty_cash_rendered: number
  location_id: string
  closing_status: string
}

interface AlertData {
  id: string
  location_id: string
  severity: string
  status: string
}

export default function LocationsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [allLocations, setAllLocations] = useState<LocationData[]>([])
  const [allSales, setAllSales] = useState<SalesData[]>([])
  const [allCashClosings, setAllCashClosings] = useState<CashClosingData[]>([])
  const [allAlerts, setAllAlerts] = useState<AlertData[]>([])

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
      loadLocations(),
      loadSalesData(startDate, endDate),
      loadCashClosingData(startDate, endDate),
      loadAlertsData(),
    ])
  }

  const loadLocations = async () => {
    const query = supabase
      .from('locations')
      .select('id, name, address, cities(name), brands(name, color)')
      .order('name')

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllLocations(queryResult.data as LocationData[])
    }
  }

  const loadSalesData = async (startDate?: string, endDate?: string) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const today = new Date()

    const start = startDate || sevenDaysAgo.toISOString().split('T')[0]
    const end = endDate || today.toISOString().split('T')[0]

    const query = supabase
      .from('sales')
      .select('id, date, net_amount, location_id')
      .eq('status', 'completed')
      .gte('date', start)
      .lte('date', end)

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllSales(queryResult.data as SalesData[])
    }
  }

  const loadCashClosingData = async (startDate?: string, endDate?: string) => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const today = new Date()

    const start = startDate || sevenDaysAgo.toISOString().split('T')[0]
    const end = endDate || today.toISOString().split('T')[0]

    const query = supabase
      .from('cash_closings')
      .select('id, date, total_difference, petty_cash_rendered, location_id, closing_status')
      .gte('date', start)
      .lte('date', end)

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllCashClosings(queryResult.data as CashClosingData[])
    }
  }

  const loadAlertsData = async () => {
    const query = supabase
      .from('alerts')
      .select('id, location_id, severity, status')
      .eq('status', 'active')

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllAlerts(queryResult.data as AlertData[])
    }
  }

  const handleDateChange = async (startDate: string, endDate: string) => {
    await loadAllData(startDate, endDate)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleLocationClick = (locationId: string) => {
    router.push(`/dashboard/locations/${locationId}`)
  }

  // Calculate location metrics
  const locationsWithMetrics = useMemo(() => {
    return allLocations.map((location) => {
      const locationSales = allSales.filter(s => s.location_id === location.id)
      const totalSales = locationSales.reduce((sum, s) => sum + s.net_amount, 0)
      const ordersCount = locationSales.length
      const averageTicket = ordersCount > 0 ? totalSales / ordersCount : 0

      const locationCashClosings = allCashClosings.filter(c => c.location_id === location.id)
      const totalCashDiff = locationCashClosings.reduce((sum, c) => sum + c.total_difference, 0)
      const pettyCash = locationCashClosings.reduce((sum, c) => sum + (c.petty_cash_rendered || 0), 0)
      const closingIssues = locationCashClosings.filter(c => c.closing_status !== 'closed_correctly').length

      const locationAlerts = allAlerts.filter(a => a.location_id === location.id && a.status === 'active')
      const criticalAlerts = locationAlerts.filter(a => a.severity === 'critical').length
      const activeAlerts = locationAlerts.length

      return {
        ...location,
        totalSales,
        ordersCount,
        averageTicket,
        totalCashDiff,
        pettyCash,
        closingIssues,
        activeAlerts,
        criticalAlerts,
      }
    }).sort((a, b) => b.totalSales - a.totalSales)
  }, [allLocations, allSales, allCashClosings, allAlerts])

  // Calculate network KPIs
  const totalLocations = allLocations.length
  const totalNetworkSales = locationsWithMetrics.reduce((sum, loc) => sum + loc.totalSales, 0)
  const totalNetworkAlerts = locationsWithMetrics.reduce((sum, loc) => sum + loc.activeAlerts, 0)
  const locationsWithIssues = locationsWithMetrics.filter(loc => loc.closingIssues > 0 || loc.criticalAlerts > 0).length

  const getHealthStatus = (location: typeof locationsWithMetrics[0]): 'good' | 'attention' | 'problem' => {
    if (location.criticalAlerts > 0 || location.closingIssues > 2) return 'problem'
    if (location.closingIssues > 0 || location.activeAlerts > 0) return 'attention'
    return 'good'
  }

  if (loading) {
    return (
      <DashboardLayout titleKey="loading" subtitleKey="loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading locations...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Date Filter */}
          <div className="mb-8">
            <DateRangeFilter onDateChange={handleDateChange} />
          </div>

          {/* Network KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <KPICard
              title={t('totalLocations')}
              value={totalLocations}
              icon={MapPin}
              tooltip={t('totalLocationsTooltip')}
            />
            <KPICard
              title={t('networkSales')}
              value={totalNetworkSales}
              icon={DollarSign}
              prefix="₲"
              tooltip={t('networkSalesTooltip')}
            />
            <KPICard
              title={t('activeAlerts')}
              value={totalNetworkAlerts}
              icon={AlertCircle}
              status={totalNetworkAlerts > 0 ? 'problem' : 'good'}
              tooltip={t('activeAlertsTooltip')}
            />
            <KPICard
              title={t('locationsWithIssues')}
              value={locationsWithIssues}
              icon={AlertCircle}
              status={locationsWithIssues > 0 ? 'attention' : 'good'}
              tooltip={t('locationsWithIssuesTooltip')}
            />
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locationsWithMetrics.map((location, index) => {
              const healthStatus = getHealthStatus(location)
              const rank = index + 1

              return (
                <div
                  key={location.id}
                  onClick={() => handleLocationClick(location.id)}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Header with rank and brand */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                          rank === 2 ? 'bg-gray-100 text-gray-700' :
                          rank === 3 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {rank}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        healthStatus === 'good' ? 'bg-green-100 text-green-700' :
                        healthStatus === 'attention' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {healthStatus === 'good' ? t('healthy') : healthStatus === 'attention' ? t('attention') : t('critical')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{location.cities?.name}</span>
                      <span>•</span>
                      <span
                        className="font-medium"
                        style={{ color: location.brands?.color }}
                      >
                        {location.brands?.name}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('sales')}</span>
                      <span className="text-sm font-semibold text-gray-900">₲{Math.round(location.totalSales).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('orders')}</span>
                      <span className="text-sm font-semibold text-gray-900">{location.ordersCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('averageTicket')}</span>
                      <span className="text-sm font-semibold text-gray-900">₲{Math.round(location.averageTicket).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('cashDifference')}</span>
                      <span className={`text-sm font-semibold ${
                        location.totalCashDiff !== 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {location.totalCashDiff !== 0 ? `₲${Math.round(location.totalCashDiff).toLocaleString()}` : t('none')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('alerts')}</span>
                      <span className="text-sm font-semibold text-gray-900">{location.activeAlerts}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t('clickToViewDetails')}</span>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
