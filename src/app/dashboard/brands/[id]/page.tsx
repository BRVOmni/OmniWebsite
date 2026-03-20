'use client'

/**
 * Brand Detail Page
 *
 * Comprehensive view of a single brand with
 * all metrics, charts, and analytics.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { LanguageToggle } from '@/components/shared/language-toggle'
import { KPICard } from '@/components/shared/kpi-card'
import { SalesChart } from '@/components/shared/sales-chart'
import { Building2, TrendingUp, DollarSign, AlertCircle, ArrowLeft, Package, MapPin } from 'lucide-react'

interface BrandInfo {
  id: string
  name: string
  description: string
  color: string
  logo_url?: string
  active: boolean
}

interface SalesData {
  id: string
  date: string
  net_amount: number
  total_amount: number
  items_count: number
  products_summary: {
    name: string
    quantity: number
  }[]
  locations: {
    name: string
  }
}

interface PurchaseData {
  id: string
  date: string
  net_amount: number
}

interface CashClosingData {
  id: string
  date: string
  petty_cash_rendered: number
}

interface AlertData {
  id: string
  severity: string
  type: string
  title: string
  description: string
  created_at: string
}

interface ProductData {
  name: string
  totalSales: number
  totalRevenue: number
  totalQuantity: number
}

export default function BrandDetailPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [brand, setBrand] = useState<BrandInfo | null>(null)
  const [sales, setSales] = useState<SalesData[]>([])
  const [purchases, setPurchases] = useState<PurchaseData[]>([])
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
      await loadBrandData(params.id as string)
      setLoading(false)
    }

    init()
  }, [router, supabase, params.id])

  const loadBrandData = async (brandId: string) => {
    // Load brand info
    const { data: brandData } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .single()

    if (brandData) {
      setBrand(brandData as BrandInfo)
    }

    // Load sales data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: salesData } = await supabase
      .from('sales')
      .select('id, date, net_amount, total_amount, items_count, products_summary, locations(name)')
      .eq('brand_id', brandId)
      .eq('status', 'completed')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (salesData) {
      setSales(salesData as unknown as SalesData[])
    }

    // Load purchases data
    const { data: purchasesData } = await supabase
      .from('purchases')
      .select('id, date, net_amount')
      .eq('brand_id', brandId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

    if (purchasesData) {
      setPurchases(purchasesData as PurchaseData[])
    }

    // Load cash closings data
    const { data: closingsData } = await supabase
      .from('cash_closings')
      .select('id, date, petty_cash_rendered')
      .eq('brand_id', brandId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

    if (closingsData) {
      setCashClosings(closingsData as CashClosingData[])
    }

    // Load alerts data
    const { data: alertsData } = await supabase
      .from('alerts')
      .select('id, severity, type, title, description, created_at')
      .eq('brand_id', brandId)
      .eq('status', 'active')
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

  // Aggregate product data
  const productData = useMemo(() => {
    const products: Record<string, ProductData> = {}

    sales.forEach((sale) => {
      if (sale.products_summary && Array.isArray(sale.products_summary)) {
        sale.products_summary.forEach((item) => {
          const productName = item.name || 'Unknown Product'
          if (!products[productName]) {
            products[productName] = {
              name: productName,
              totalSales: 0,
              totalRevenue: 0,
              totalQuantity: 0,
            }
          }

          products[productName].totalSales += 1
          products[productName].totalRevenue += sale.net_amount
          products[productName].totalQuantity += item.quantity || 1
        })
      }
    })

    return Object.values(products)
  }, [sales])

  const topProducts = useMemo(() => {
    return [...productData].sort((a, b) => b.totalSales - a.totalSales).slice(0, 10)
  }, [productData])

  // Calculate KPIs
  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, s) => sum + s.net_amount, 0)
  const totalOrders = sales.length
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const totalPurchases = purchases.reduce((sum, p) => sum + p.net_amount, 0)
  const totalPettyCash = cashClosings.reduce((sum, c) => sum + (c.petty_cash_rendered || 0), 0)

  const foodCostPercent = totalRevenue > 0 ? (totalPurchases / totalRevenue) * 100 : 0
  const grossMargin = totalRevenue - totalPurchases
  const grossMarginPercent = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0
  const estimatedProfitability = grossMargin - totalPettyCash

  // Prepare chart data
  const chartData = useMemo(() => {
    const dailySales = new Map<string, number>()

    sales.forEach((sale) => {
      const date = sale.date
      dailySales.set(date, (dailySales.get(date) || 0) + sale.net_amount)
    })

    return Array.from(dailySales.entries())
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: amount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [sales])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">{t('loading')}</h1>
              <LanguageToggle />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading brand details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => router.push('/dashboard/brands')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('backToLocations')}
              </button>
              <LanguageToggle />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('brandNotFound')}</h2>
            <p className="text-gray-600">{t('noBrandData')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/dashboard/brands')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('backToLocations')}
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Brand Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-start gap-6">
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: brand.color }}
            >
              {brand.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{brand.name}</h1>
              {brand.description && (
                <p className="text-gray-600 mb-4">{brand.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{sales.length > 0 ? new Set(sales.map(s => s.locations?.name)).size : 0} {t('tableLocations').toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{brand.active ? t('healthy') : t('critical')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title={t('orders')}
            value={totalOrders}
            icon={TrendingUp}
            tooltip="Total number of orders for this brand"
          />
          <KPICard
            title={t('tableRevenue')}
            value={totalRevenue}
            icon={DollarSign}
            prefix="₲"
            tooltip="Total revenue generated by this brand"
          />
          <KPICard
            title={t('averageTicket')}
            value={averageTicket}
            icon={DollarSign}
            prefix="₲"
            tooltip="Average order value for this brand"
          />
          <KPICard
            title={t('tableProfit')}
            value={estimatedProfitability}
            icon={DollarSign}
            prefix="₲"
            status={estimatedProfitability >= 0 ? 'success' : 'danger'}
            tooltip="Estimated profitability after costs"
          />
        </div>

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('brandSalesTrend')}</h2>
          {chartData.length > 0 ? (
            <SalesChart data={chartData} />
          ) : (
            <p className="text-center text-gray-500 py-8">{t('noDataAvailable')}</p>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profitability Metrics */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('brandPerformance')}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{t('tableRevenue')}</span>
                <span className="font-semibold text-gray-900">₲{Math.round(totalRevenue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{t('purchases')}</span>
                <span className="font-semibold text-gray-900">₲{Math.round(totalPurchases).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{t('tableFoodCost')}</span>
                <span className={`font-semibold ${
                  foodCostPercent < 30 ? 'text-green-600' :
                  foodCostPercent < 40 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {foodCostPercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{t('tableGrossMargin')}</span>
                <span className={`font-semibold ${
                  grossMarginPercent >= 70 ? 'text-green-600' :
                  grossMarginPercent >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {grossMarginPercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{t('pettyCashExpenses')}</span>
                <span className="font-semibold text-gray-900">₲{Math.round(totalPettyCash).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-900">{t('estimatedProfitability')}</span>
                <span className={`font-bold ${
                  estimatedProfitability >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₲{Math.round(estimatedProfitability).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('topProductsByBrand')}</h2>
            {topProducts.length > 0 ? (
              <div className="space-y-2">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{product.totalSales}</div>
                      <div className="text-xs text-gray-500">₲{Math.round(product.totalRevenue).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">{t('noProductData')}</p>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recentAlerts')}</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-100' :
                    alert.severity === 'high' ? 'bg-orange-50 border-orange-100' :
                    alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                    'bg-blue-50 border-blue-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-600' :
                      alert.severity === 'high' ? 'text-orange-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${
                        alert.severity === 'critical' ? 'text-red-900' :
                        alert.severity === 'high' ? 'text-orange-900' :
                        alert.severity === 'medium' ? 'text-yellow-900' :
                        'text-blue-900'
                      }`}>
                        {alert.title}
                      </h3>
                      <p className={`text-sm mb-2 ${
                        alert.severity === 'critical' ? 'text-red-700' :
                        alert.severity === 'high' ? 'text-orange-700' :
                        alert.severity === 'medium' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {alert.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
