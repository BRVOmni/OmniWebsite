'use client'

/**
 * Location Detail Page
 *
 * Comprehensive view of a single location with
 * all metrics, charts, and comparisons.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { LanguageToggle } from '@/components/shared/language-toggle'
import { KPICard } from '@/components/shared/kpi-card'
import { SalesChart } from '@/components/shared/sales-chart'
import { MapPin, Phone, Mail, Building2, TrendingUp, DollarSign, AlertCircle, ArrowLeft } from 'lucide-react'

interface LocationInfo {
  id: string
  name: string
  address: string
  phone: string
  email: string
  opens_at: string
  closes_at: string
  cities: {
    name: string
    countries: {
      name: string
    }
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
  total_amount: number
}

interface CashClosingData {
  id: string
  date: string
  total_difference: number
  closing_status: string
}

interface AlertData {
  id: string
  severity: string
  type: string
  title: string
  description: string
  created_at: string
  status: string
}

export default function LocationDetailPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [sales, setSales] = useState<SalesData[]>([])
  const [cashClosings, setCashClosings] = useState<CashClosingData[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])

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
      await loadLocationData(params.id as string)
      setLoading(false)
    }

    init()
  }, [router, supabase, params.id])

  const loadLocationData = async (locationId: string) => {
    // Load location info
    const { data: locationData } = await supabase
      .from('locations')
      .select('id, name, address, phone, email, opens_at, closes_at, cities(name, countries(name)), brands(name, color)')
      .eq('id', locationId)
      .single()

    if (locationData) {
      setLocation(locationData as LocationInfo)
    }

    // Load sales data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const today = new Date()

    const { data: salesData } = await supabase
      .from('sales')
      .select('id, date, net_amount, total_amount')
      .eq('location_id', locationId)
      .eq('status', 'completed')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .lte('date', today.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (salesData) {
      setSales(salesData as SalesData[])
    }

    // Load cash closings (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: cashData } = await supabase
      .from('cash_closings')
      .select('id, date, total_difference, closing_status')
      .eq('location_id', locationId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .lte('date', today.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (cashData) {
      setCashClosings(cashData as CashClosingData[])
    }

    // Load alerts
    const { data: alertsData } = await supabase
      .from('alerts')
      .select('id, severity, type, title, description, created_at, status')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (alertsData) {
      setAlerts(alertsData as AlertData[])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + s.net_amount, 0)
    const ordersCount = sales.length
    const averageTicket = ordersCount > 0 ? totalSales / ordersCount : 0

    const totalCashDiff = cashClosings.reduce((sum, c) => sum + c.total_difference, 0)
    const closingIssues = cashClosings.filter(c => c.closing_status !== 'closed_correctly').length

    const activeAlerts = alerts.filter(a => a.status === 'active').length
    const criticalAlerts = alerts.filter(a => a.status === 'active' && a.severity === 'critical').length

    return {
      totalSales,
      ordersCount,
      averageTicket,
      totalCashDiff,
      closingIssues,
      activeAlerts,
      criticalAlerts,
    }
  }, [sales, cashClosings, alerts])

  // Prepare chart data
  const chartData = useMemo(() => {
    const salesByDate: Record<string, number> = {}
    sales.forEach((sale) => {
      if (!salesByDate[sale.date]) {
        salesByDate[sale.date] = 0
      }
      salesByDate[sale.date] += sale.net_amount
    })

    return Object.entries(salesByDate)
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: amount,
      }))
      .slice(-30)
  }, [sales])

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">{t('critical')}</span>
      case 'high':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">{t('high')}</span>
      case 'medium':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">{t('medium')}</span>
      case 'low':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">{t('low')}</span>
      default:
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">{severity}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading location details...</p>
        </div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('locationNotFound')}</p>
          <button
            onClick={() => router.push('/dashboard/locations')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('backToLocations')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/dashboard/locations')}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('backToLocations')}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{location.name}</h1>
              <p className="text-sm text-gray-600">
                {location.cities?.name}, {location.cities?.countries?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {t('role')}: <span className="font-medium capitalize">{profile?.role || 'User'}</span>
              </div>
              <LanguageToggle />
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                ← {t('backToSummary')}
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Location Info */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t('address')}</p>
                  <p className="text-sm font-medium text-gray-900">{location.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t('phone')}</p>
                  <p className="text-sm font-medium text-gray-900">{location.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t('email')}</p>
                  <p className="text-sm font-medium text-gray-900">{location.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t('brand')}</p>
                  <p
                    className="text-sm font-medium"
                    style={{ color: location.brands?.color }}
                  >
                    {location.brands?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title={t('netSales')}
              value={metrics.totalSales}
              icon={DollarSign}
              prefix="₲"
              tooltip={t('netSalesTooltip')}
            />
            <KPICard
              title={t('orders')}
              value={metrics.ordersCount}
              icon={TrendingUp}
              tooltip={t('ordersTooltip')}
            />
            <KPICard
              title={t('averageTicket')}
              value={metrics.averageTicket}
              icon={DollarSign}
              prefix="₲"
              tooltip={t('averageTicketTooltip')}
            />
            <KPICard
              title={t('activeAlerts')}
              value={metrics.activeAlerts}
              icon={AlertCircle}
              status={metrics.criticalAlerts > 0 ? 'problem' : metrics.activeAlerts > 0 ? 'attention' : 'good'}
              tooltip={t('activeAlertsTooltip')}
            />
          </div>

          {/* Sales Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('salesTrend')}</h2>
            <SalesChart data={chartData} />
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recentAlerts')}</h2>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityBadge(alert.severity)}
                        <span className="text-sm font-medium text-gray-900">{alert.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleDateString()}</p>
                    </div>
                    {alert.status === 'active' && (
                      <span className="text-xs text-red-600 font-medium">{t('open')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
