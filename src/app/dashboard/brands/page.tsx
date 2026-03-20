'use client'

/**
 * Brands Module
 *
 * Brand performance analytics and profitability analysis module.
 * Shows brand rankings, profitability metrics, and comprehensive insights.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { KPICard } from '@/components/shared/kpi-card'
import { Building2, TrendingUp, TrendingDown, DollarSign, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react'

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
  brands: {
    id: string
    name: string
    color: string
  } | null
  locations: {
    name: string
  } | null
}

interface PurchaseData {
  id: string
  date: string
  net_amount: number
  brands: {
    id: string
    name: string
  } | null
}

interface CashClosingData {
  id: string
  date: string
  petty_cash_rendered: number
  locations: {
    id: string
    brands: {
      id: string
      name: string
    } | null
  } | null
}

interface AlertData {
  id: string
  severity: string
  type: string
  title: string
  description: string
  brands: {
    id: string
    name: string
  } | null
}

interface BrandData {
  id: string
  name: string
  description: string
  color: string
  totalSales: number
  totalRevenue: number
  totalOrders: number
  averageTicket: number
  locationsCount: number
  totalPurchases: number
  foodCostPercent: number
  grossMargin: number
  grossMarginPercent: number
  pettyCashExpenses: number
  estimatedProfitability: number
  activeAlerts: number
}

export default function BrandsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [allSales, setAllSales] = useState<SalesData[]>([])
  const [allBrands, setAllBrands] = useState<BrandInfo[]>([])
  const [allPurchases, setAllPurchases] = useState<PurchaseData[]>([])
  const [allCashClosings, setAllCashClosings] = useState<CashClosingData[]>([])
  const [brandAlerts, setBrandAlerts] = useState<AlertData[]>([])

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
      loadSalesData(startDate, endDate),
      loadBrandsData(),
      loadPurchasesData(startDate, endDate),
      loadCashClosingsData(startDate, endDate),
      loadBrandAlerts(),
    ])
  }

  const loadSalesData = async (startDate?: string, endDate?: string) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const today = new Date()

    const start = startDate || thirtyDaysAgo.toISOString().split('T')[0]
    const end = endDate || today.toISOString().split('T')[0]

    const query = supabase
      .from('sales')
      .select('id, date, net_amount, total_amount, items_count, brands(id, name, color), locations(name)')
      .eq('status', 'completed')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllSales(queryResult.data as unknown as SalesData[])
    }
  }

  const loadBrandsData = async () => {
    const query = supabase
      .from('brands')
      .select('*')
      .eq('active', true)
      .order('name')

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllBrands(queryResult.data as BrandInfo[])
    }
  }

  const loadPurchasesData = async (startDate?: string, endDate?: string) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const today = new Date()

    const start = startDate || thirtyDaysAgo.toISOString().split('T')[0]
    const end = endDate || today.toISOString().split('T')[0]

    const query = supabase
      .from('purchases')
      .select('id, date, net_amount, brands(id, name)')
      .gte('date', start)
      .lte('date', end)

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllPurchases(queryResult.data as unknown as PurchaseData[])
    }
  }

  const loadCashClosingsData = async (startDate?: string, endDate?: string) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const today = new Date()

    const start = startDate || thirtyDaysAgo.toISOString().split('T')[0]
    const end = endDate || today.toISOString().split('T')[0]

    const query = supabase
      .from('cash_closings')
      .select('id, date, petty_cash_rendered, locations(id, brands(id, name))')
      .gte('date', start)
      .lte('date', end)

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllCashClosings(queryResult.data as unknown as CashClosingData[])
    }
  }

  const loadBrandAlerts = async () => {
    const query = supabase
      .from('alerts')
      .select('id, severity, type, title, description, brands(id, name)')
      .eq('status', 'active')
      .not('brand_id', 'is', null)
      .limit(50)

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setBrandAlerts(queryResult.data as unknown as AlertData[])
    }
  }

  const handleDateChange = async (startDate: string, endDate: string) => {
    await loadAllData(startDate, endDate)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Aggregate brand data
  const brandData = useMemo(() => {
    const brandsMap = new Map<string, BrandData>()

    // Initialize with all brands
    allBrands.forEach((brand) => {
      brandsMap.set(brand.id, {
        id: brand.id,
        name: brand.name,
        description: brand.description || '',
        color: brand.color,
        totalSales: 0,
        totalRevenue: 0,
        totalOrders: 0,
        averageTicket: 0,
        locationsCount: 0,
        totalPurchases: 0,
        foodCostPercent: 0,
        grossMargin: 0,
        grossMarginPercent: 0,
        pettyCashExpenses: 0,
        estimatedProfitability: 0,
        activeAlerts: 0,
      })
    })

    // Aggregate sales data
    const locationsSet = new Map<string, Set<string>>()
    allSales.forEach((sale) => {
      if (sale.brands) {
        const brand = brandsMap.get(sale.brands.id)
        if (brand) {
          brand.totalSales += 1
          brand.totalRevenue += sale.net_amount
          brand.totalOrders += 1

          if (!locationsSet.has(brand.id)) {
            locationsSet.set(brand.id, new Set())
          }
          if (sale.locations) {
            locationsSet.get(brand.id)!.add(sale.locations.name)
          }
        }
      }
    })

    // Aggregate purchases data
    allPurchases.forEach((purchase) => {
      if (purchase.brands) {
        const brand = brandsMap.get(purchase.brands.id)
        if (brand) {
          brand.totalPurchases += purchase.net_amount
        }
      }
    })

    // Aggregate petty cash expenses
    allCashClosings.forEach((closing) => {
      if (closing.locations?.brands) {
        const brand = brandsMap.get(closing.locations.brands.id)
        if (brand) {
          brand.pettyCashExpenses += closing.petty_cash_rendered || 0
        }
      }
    })

    // Calculate metrics
    brandsMap.forEach((brand) => {
      brand.averageTicket = brand.totalOrders > 0 ? brand.totalRevenue / brand.totalOrders : 0
      brand.locationsCount = locationsSet.get(brand.id)?.size || 0

      if (brand.totalRevenue > 0) {
        brand.foodCostPercent = (brand.totalPurchases / brand.totalRevenue) * 100
        brand.grossMargin = brand.totalRevenue - brand.totalPurchases
        brand.grossMarginPercent = (brand.grossMargin / brand.totalRevenue) * 100
        brand.estimatedProfitability = brand.grossMargin - brand.pettyCashExpenses
      }
    })

    // Count alerts by brand
    brandAlerts.forEach((alert) => {
      if (alert.brands) {
        const brand = brandsMap.get(alert.brands.id)
        if (brand) {
          brand.activeAlerts += 1
        }
      }
    })

    return Array.from(brandsMap.values())
  }, [allSales, allBrands, allPurchases, allCashClosings, brandAlerts])

  // Get rankings
  const topBrandsBySales = useMemo(() => {
    return [...brandData].sort((a, b) => b.totalSales - a.totalSales)
  }, [brandData])

  const lowestPerformingBrands = useMemo(() => {
    return [...brandData]
      .filter(b => b.totalSales >= 5) // Only include brands with at least 5 sales
      .sort((a, b) => a.grossMarginPercent - b.grossMarginPercent)
  }, [brandData])

  const highestBillingBrands = useMemo(() => {
    return [...brandData].sort((a, b) => b.totalRevenue - a.totalRevenue)
  }, [brandData])

  const mostProfitableBrands = useMemo(() => {
    return [...brandData]
      .filter(b => b.totalRevenue > 0)
      .sort((a, b) => b.estimatedProfitability - a.estimatedProfitability)
  }, [brandData])

  // Calculate KPIs
  const totalBrands = brandData.length
  const totalBrandSales = brandData.reduce((sum, b) => sum + b.totalSales, 0)
  const totalBrandRevenue = brandData.reduce((sum, b) => sum + b.totalRevenue, 0)
  const totalBrandAlerts = brandData.reduce((sum, b) => sum + b.activeAlerts, 0)

  if (loading) {
    return (
      <DashboardLayout titleKey="loading" subtitleKey="loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brand analytics...</p>
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

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <KPICard
              title={t('totalBrands')}
              value={totalBrands}
              icon={Building2}
              tooltip={t('totalBrandsTooltip')}
            />
            <KPICard
              title={t('brandSales')}
              value={totalBrandSales}
              icon={TrendingUp}
              tooltip={t('brandSalesTooltip')}
            />
            <KPICard
              title={t('brandRevenue')}
              value={totalBrandRevenue}
              icon={DollarSign}
              prefix="₲"
              tooltip={t('brandRevenueTooltip')}
            />
            <KPICard
              title={t('brandAlerts')}
              value={totalBrandAlerts}
              icon={AlertCircle}
              status={totalBrandAlerts > 0 ? 'danger' : 'success'}
              tooltip={t('brandAlertsTooltip')}
            />
          </div>

          {/* Top Brands by Sales */}
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{t('topBrandsBySales')}</h2>
                <span className="text-sm text-gray-500">
                  {t('sales')}: {totalBrandSales}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tableBrand')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableSales')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('revenue')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('orders')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableAvgTicket')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableLocations')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableGrossMargin')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBrandsBySales.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          {t('noBrandData')}
                        </td>
                      </tr>
                    ) : (
                      topBrandsBySales.map((brand, index) => (
                        <tr
                          key={brand.id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                        >
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-teal-50 text-teal-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: brand.color }}
                              ></div>
                              {brand.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{brand.totalSales}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₲{Math.round(brand.totalRevenue).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{brand.totalOrders}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">₲{Math.round(brand.averageTicket).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{brand.locationsCount}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-medium ${
                              brand.grossMarginPercent >= 70 ? 'text-green-600' :
                              brand.grossMarginPercent >= 50 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {brand.grossMarginPercent.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Lowest Performing Brands */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('lowestPerformingBrands')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tableBrand')}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableGrossMargin')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowestPerformingBrands.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                            {t('noBrandData')}
                          </td>
                        </tr>
                      ) : (
                        lowestPerformingBrands.slice(0, 10).map((brand) => (
                          <tr
                            key={brand.id}
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: brand.color }}
                                ></div>
                                {brand.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span className={`font-medium ${
                                brand.grossMarginPercent >= 70 ? 'text-green-600' :
                                brand.grossMarginPercent >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {brand.grossMarginPercent.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Highest Billing Brands */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('highestBillingBrands')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tableBrand')}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableRevenue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highestBillingBrands.slice(0, 10).length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                            {t('noBrandData')}
                          </td>
                        </tr>
                      ) : (
                        highestBillingBrands.slice(0, 10).map((brand) => (
                          <tr
                            key={brand.id}
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: brand.color }}
                                ></div>
                                {brand.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                              ₲{Math.round(brand.totalRevenue).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Most Profitable Brands */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                <h2 className="text-lg font-semibold text-gray-900">{t('mostProfitableBrands')}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tableBrand')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableRevenue')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableFoodCost')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableGrossMargin')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('tableProfit')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mostProfitableBrands.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          {t('noBrandData')}
                        </td>
                      </tr>
                    ) : (
                      mostProfitableBrands.slice(0, 10).map((brand, index) => (
                        <tr
                          key={brand.id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                        >
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-teal-50 text-teal-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: brand.color }}
                              ></div>
                              {brand.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₲{Math.round(brand.totalRevenue).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-medium ${
                              brand.foodCostPercent < 30 ? 'text-green-600' :
                              brand.foodCostPercent < 40 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {brand.foodCostPercent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-medium ${
                              brand.grossMarginPercent >= 70 ? 'text-green-600' :
                              brand.grossMarginPercent >= 50 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {brand.grossMarginPercent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-semibold ${
                              brand.estimatedProfitability >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ₲{Math.round(brand.estimatedProfitability).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Brand Alerts */}
          {brandAlerts.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('recentBrandAlerts')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brandAlerts.slice(0, 6).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'critical' ? 'bg-red-50 border-red-100' :
                        alert.severity === 'high' ? 'bg-orange-50 border-orange-100' :
                        alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                        'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className={`w-4 h-4 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          alert.severity === 'critical' ? 'text-red-900' :
                          alert.severity === 'high' ? 'text-orange-900' :
                          alert.severity === 'medium' ? 'text-yellow-900' :
                          'text-blue-900'
                        }`}>
                          {alert.brands?.name}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        alert.severity === 'critical' ? 'text-red-700' :
                        alert.severity === 'high' ? 'text-orange-700' :
                        alert.severity === 'medium' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {alert.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
