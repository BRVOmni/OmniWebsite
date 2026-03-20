'use client'

/**
 * Dashboard Page - Executive Summary
 *
 * Main dashboard showing KPIs and metrics for the corporate food service chain
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { KPICard } from '@/components/shared/kpi-card'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { SalesChart } from '@/components/shared/sales-chart'
import { RankingsTable } from '@/components/shared/rankings-table'
import { AlertsPanel } from '@/components/shared/alerts-panel'
import { ObjectiveCard } from '@/components/shared/objective-card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DollarSign, ShoppingBag, Receipt, TrendingUp, AlertTriangle, CreditCard, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface KPI {
  netSales: number
  orders: number
  averageTicket: number
  foodCostPercent: number
  estimatedProfitability: number
  centralizedPayments: number
  totalCashDifference: number
  activeAlerts: number
}

interface TrendData {
  date: string
  amount: number
}

interface Ranking {
  id: string
  name: string
  totalSales: number
  status?: 'success' | 'warning' | 'danger'
  color?: string
}

interface Alert {
  id: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  location?: string
  created_at: string
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [kpis, setKpis] = useState<KPI | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [locationRankings, setLocationRankings] = useState<Ranking[]>([])
  const [brandRankings, setBrandRankings] = useState<Ranking[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{
    days: number
    label: string
  }>({ days: 7, label: 'Last 7 days' })
  const router = useRouter()
  const supabase = createClient()

  const loadData = async (startDate?: string, endDate?: string) => {
    console.log('Loading dashboard data...', { startDate, endDate })

    try {
      // Get KPIs directly from database
      console.log('Fetching KPIs...')
      const start = startDate || new Date().toISOString().split('T')[0]
      const end = endDate || new Date().toISOString().split('T')[0]

      // Fetch all necessary data in parallel
      const [salesResult, purchasesResult, cashClosingsResult, paymentsResult] = await Promise.all([
        supabase
          .from('sales')
          .select('total_amount, net_amount, items_count')
          .eq('status', 'completed')
          .gte('date', start)
          .lte('date', end),
        supabase
          .from('purchases')
          .select('net_amount')
          .gte('date', start)
          .lte('date', end),
        supabase
          .from('cash_closings')
          .select('cash_difference, bancard_difference, upay_difference')
          .gte('date', start)
          .lte('date', end),
        supabase
          .from('payments')
          .select('id')
          .gte('date', start)
          .lte('date', end)
      ])

      // Calculate KPIs from real data
      const sales = salesResult.data || []
      const purchases = purchasesResult.data || []
      const cashClosings = cashClosingsResult.data || []
      const payments = paymentsResult.data || []

      const netSales = sales.reduce((sum, sale) => sum + Number(sale.net_amount), 0)
      const orders = sales.length
      const averageTicket = orders > 0 ? netSales / orders : 0

      // Calculate food cost percentage
      const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.net_amount), 0)
      const foodCostPercent = netSales > 0 ? Math.round((totalPurchases / netSales) * 100 * 10) / 10 : 0

      // Calculate total cash difference (all payment methods)
      const totalCashDifference = cashClosings.reduce((sum, c) =>
        sum + (c.cash_difference || 0) + (c.bancard_difference || 0) + (c.upay_difference || 0), 0
      )

      // Count centralized payments
      const centralizedPayments = payments.length

      // Calculate estimated profitability
      const pettyCashExpenses = cashClosings.reduce((sum, c) => sum + (c.petty_cash_rendered || 0), 0)
      const estimatedProfitability = netSales - totalPurchases - pettyCashExpenses

      setKpis({
        netSales,
        orders,
        averageTicket,
        foodCostPercent,
        estimatedProfitability,
        centralizedPayments,
        totalCashDifference,
        activeAlerts: 0, // Will be updated after alerts load
      })
      console.log('KPIs loaded:', { netSales, orders, averageTicket, foodCostPercent, totalCashDifference, centralizedPayments })

      // Get trend data (using selected date range)
      console.log('Fetching trend...')
      const { data: trendData, error: trendError } = await supabase
        .from('sales')
        .select('date, net_amount')
        .eq('status', 'completed')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true })

      if (!trendError && trendData) {
        const trend = trendData.reduce((acc, sale) => {
          const date = sale.date
          if (!acc[date]) {
            acc[date] = { date, amount: 0 }
          }
          acc[date].amount += Number(sale.net_amount)
          return acc
        }, {} as Record<string, { date: string; amount: number }>)
        setTrendData(Object.values(trend))
        console.log('Trend loaded:', Object.values(trend).length, 'points')
      }

      // Get location rankings
      console.log('Fetching rankings...')
      const { data: locationSales, error: locError } = await supabase
        .from('sales')
        .select('location_id, locations(name), net_amount')
        .eq('status', 'completed')
        .gte('date', start)
        .lte('date', end)

      if (!locError && locationSales) {
        const locRankings = locationSales.reduce((acc, sale) => {
          const locId = sale.location_id || 'unknown'
          const locName = (sale.locations as any)?.name || 'Unknown'
          if (!acc[locId]) {
            acc[locId] = { id: locId, name: locName, totalSales: 0 }
          }
          acc[locId].totalSales += Number(sale.net_amount)
          return acc
        }, {} as Record<string, { id: string; name: string; totalSales: number }>)
        setLocationRankings(Object.values(locRankings).sort((a, b) => b.totalSales - a.totalSales))
        console.log('Location rankings loaded:', Object.values(locRankings).length, 'locations')
      }

      // Get brand rankings
      const { data: brandSales, error: brandError } = await supabase
        .from('sales')
        .select('brand_id, brands(name, color), net_amount')
        .eq('status', 'completed')
        .gte('date', start)
        .lte('date', end)

      if (!brandError && brandSales) {
        const brandRankings = brandSales.reduce((acc, sale) => {
          const brandId = sale.brand_id || 'unknown'
          const brand = (sale.brands as any)?.name || 'Unknown'
          const color = (sale.brands as any)?.color || '#000000'
          if (!acc[brandId]) {
            acc[brandId] = { id: brandId, name: brand, color, totalSales: 0 }
          }
          acc[brandId].totalSales += Number(sale.net_amount)
          return acc
        }, {} as Record<string, { id: string; name: string; color: string; totalSales: number }>)

        const brands = Object.values(brandRankings).sort((a, b) => b.totalSales - a.totalSales)
        const maxSales = brands[0]?.totalSales || 1
        const brandsWithStatus = brands.map((brand) => ({
          ...brand,
          status: brand.totalSales >= maxSales * 0.8 ? 'success' : brand.totalSales >= maxSales * 0.5 ? 'warning' : 'danger',
        }))
        setBrandRankings(brandsWithStatus)
        console.log('Brand rankings loaded:', brandsWithStatus.length, 'brands')
      }

      // Get alerts
      console.log('Fetching alerts...')
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!alertsError && alertsData) {
        setAlerts(alertsData)
        // Update KPIs with actual alert count
        setKpis(prev => ({ ...prev, activeAlerts: alertsData.length }))
        console.log('Alerts loaded:', alertsData.length, 'alerts')
      } else if (alertsError) {
        console.log('No alerts table yet, setting empty array')
        setAlerts([])
        setKpis(prev => ({ ...prev, activeAlerts: 0 }))
      }

      console.log('Dashboard data loaded successfully')
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Get user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)

      // Load initial data (last 7 days for sample data)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const today = new Date()

      // Set initial date range (7 days)
      setDateRange({ days: 7, label: t('last7Days') })

      await loadData(sevenDaysAgo.toISOString().split('T')[0], today.toISOString().split('T')[0])

      setLoading(false)
    }

    initAuth()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDateChange = async (startDate: string, endDate: string) => {
    // Calculate days in range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Set label based on range
    let label = 'Custom range'
    if (daysDiff === 1) {
      label = t('today')
    } else if (daysDiff <= 7) {
      label = t('last7Days')
    } else if (daysDiff <= 30) {
      label = t('last30Days')
    } else if (daysDiff <= 90) {
      label = t('last90Days')
    }

    setDateRange({ days: daysDiff, label })

    await loadData(startDate, endDate)
  }

  if (loading) {
    return (
      <DashboardLayout title={t('executiveSummary')} subtitle={t('welcomeBack') + ', ' + (profile?.full_name || user?.email || 'Loading...')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={t('executiveSummary')}
      subtitle={t('welcomeBack') + ', ' + (profile?.full_name || user?.email || 'User')}
    >
      <div className="max-w-7xl mx-auto">
          {/* Date Filter & Objective */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <DateRangeFilter onDateChange={handleDateChange} />
            </div>
            <ObjectiveCard
              current={kpis?.netSales || 0}
              monthlyTarget={30000000}
              daysInRange={dateRange.days}
              period={dateRange.label}
              tooltip="Monthly sales target (₲30M) extrapolated to the selected date range. Progress updates automatically based on completed orders."
            />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title={t('netSales')}
              value={kpis?.netSales || 0}
              icon={DollarSign}
              prefix="₲"
              tooltip={t('netSalesTooltip')}
            />
            <KPICard
              title={t('orders')}
              value={kpis?.orders || 0}
              icon={ShoppingBag}
              tooltip={t('ordersTooltip')}
            />
            <KPICard
              title={t('averageTicket')}
              value={kpis?.averageTicket || 0}
              icon={Receipt}
              prefix="₲"
              tooltip={t('averageTicketTooltip')}
            />
            <KPICard
              title={t('foodCostPercent')}
              value={`${kpis?.foodCostPercent || 0}%`}
              icon={TrendingUp}
              status={kpis && kpis.foodCostPercent < 30 ? 'success' : kpis?.foodCostPercent < 35 ? 'warning' : 'danger'}
              tooltip={t('foodCostPercentTooltip')}
            />
            <KPICard
              title={t('estimatedProfitability')}
              value={kpis?.estimatedProfitability || 0}
              icon={TrendingUp}
              prefix="₲"
              tooltip={t('estimatedProfitabilityTooltip')}
            />
            <KPICard
              title={t('activeAlerts')}
              value={kpis?.activeAlerts || 0}
              icon={AlertTriangle}
              status={kpis && kpis.activeAlerts > 0 ? 'danger' : 'success'}
              tooltip={t('activeAlertsTooltip')}
            />
            <KPICard
              title={t('cashDifference')}
              value={kpis?.totalCashDifference || 0}
              icon={CreditCard}
              status={kpis && kpis.totalCashDifference < 0 ? 'danger' : kpis?.totalCashDifference > 0 ? 'warning' : 'success'}
              prefix="₲"
              tooltip={t('cashDifferenceTooltip')}
            />
            <KPICard
              title={t('centralizedPayments')}
              value={kpis?.centralizedPayments || 0}
              icon={CheckCircle}
              tooltip={t('centralizedPaymentsTooltip')}
            />
          </div>

          {/* Charts and Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SalesChart data={trendData} />
            <AlertsPanel alerts={alerts} />
          </div>

          {/* Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RankingsTable title={t('locationRankings')} data={locationRankings} />
            <RankingsTable title={t('brandRankings')} data={brandRankings} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">{t('locationsActive')}</h3>
              <p className="text-4xl font-bold">{locationRankings.length}</p>
              <p className="text-blue-100 text-sm mt-1">{t('acrossNetwork')}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">{t('brandsOperating')}</h3>
              <p className="text-4xl font-bold">{brandRankings.length}</p>
              <p className="text-purple-100 text-sm mt-1">{t('acrossPortfolio')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">{t('totalSales')}</h3>
              <p className="text-4xl font-bold">₲{Math.round((kpis?.netSales || 0) / 1000000)}M</p>
              <p className="text-green-100 text-sm mt-1">{t('selectedPeriodLower')}</p>
            </div>
          </div>
        </div>
    </DashboardLayout>
  )
}
