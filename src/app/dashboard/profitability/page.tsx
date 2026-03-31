'use client'

/**
 * Profitability Module
 *
 * Financial analysis showing profitability by location/brand,
 * food cost analysis, gross margin tracking, and cash flow comparison.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { KPICard } from '@/components/shared/kpi-card'
import { DollarSign, ShoppingCart, Wallet, TrendingUp, Percent, AlertCircle } from 'lucide-react'

interface SalesData {
  id: string
  date: string
  net_amount: number
  locations: { name: string }
  brands: { name: string }
}

interface PurchaseData {
  id: string
  date: string
  net_amount: number
  locations: { name: string }
}

interface PaymentData {
  id: string
  date: string
  amount: number
  locations: { name: string }
}

interface CashClosingData {
  id: string
  date: string
  petty_cash_rendered: number
  locations: { name: string }
}

export default function ProfitabilityPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [allSales, setAllSales] = useState<SalesData[]>([])
  const [allPurchases, setAllPurchases] = useState<PurchaseData[]>([])
  const [allPayments, setAllPayments] = useState<PaymentData[]>([])
  const [allCashClosings, setAllCashClosings] = useState<CashClosingData[]>([])

  // Check auth and load data
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
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const today = new Date()

    const start = startDate || sevenDaysAgo.toISOString().split('T')[0]
    const end = endDate || today.toISOString().split('T')[0]

    await Promise.all([
      loadSalesData(start, end),
      loadPurchasesData(start, end),
      loadPaymentsData(start, end),
      loadCashClosingsData(start, end),
    ])
  }

  const loadSalesData = async (startDate: string, endDate: string) => {
    const query = supabase
      .from('sales')
      .select('id, date, net_amount, locations(name), brands(name)')
      .eq('status', 'completed')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllSales(queryResult.data as unknown as SalesData[])
    }
  }

  const loadPurchasesData = async (startDate: string, endDate: string) => {
    const query = supabase
      .from('purchases')
      .select('id, date, net_amount, locations(name)')
      .eq('status', 'received')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllPurchases(queryResult.data as unknown as PurchaseData[])
    }
  }

  const loadPaymentsData = async (startDate: string, endDate: string) => {
    const query = supabase
      .from('payments')
      .select('id, date, amount, locations(name)')
      .not('status', 'eq', 'cancelled')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllPayments(queryResult.data as unknown as PaymentData[])
    }
  }

  const loadCashClosingsData = async (startDate: string, endDate: string) => {
    const query = supabase
      .from('cash_closings')
      .select('id, date, petty_cash_rendered, locations(name)')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllCashClosings(queryResult.data as unknown as CashClosingData[])
    }
  }

  const handleDateChange = async (startDate: string, endDate: string) => {
    await loadAllData(startDate, endDate)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Calculate KPIs
  const netSales = allSales.reduce((sum, sale) => sum + sale.net_amount, 0)
  const purchases = allPurchases.reduce((sum, purchase) => sum + purchase.net_amount, 0)
  const payments = allPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const pettyCashExpenses = allCashClosings.reduce((sum, closing) => sum + (closing.petty_cash_rendered || 0), 0)

  const foodCostPercent = netSales > 0 ? (purchases / netSales) * 100 : 0
  const grossMargin = netSales - purchases
  const grossMarginPercent = netSales > 0 ? (grossMargin / netSales) * 100 : 0
  const estimatedProfitability = grossMargin - pettyCashExpenses

  // Calculate profitability by location
  const profitabilityByLocation = useMemo(() => {
    const locationData: Record<string, { sales: number; purchases: number; pettyCash: number }> = {}

    allSales.forEach((sale) => {
      const location = (sale.locations as { name?: string })?.name || 'Unknown'
      if (!locationData[location]) {
        locationData[location] = { sales: 0, purchases: 0, pettyCash: 0 }
      }
      locationData[location].sales += sale.net_amount
    })

    allPurchases.forEach((purchase) => {
      const location = (purchase.locations as { name?: string })?.name || 'Unknown'
      if (!locationData[location]) {
        locationData[location] = { sales: 0, purchases: 0, pettyCash: 0 }
      }
      locationData[location].purchases += purchase.net_amount
    })

    allCashClosings.forEach((closing) => {
      const location = (closing.locations as { name?: string })?.name || 'Unknown'
      if (!locationData[location]) {
        locationData[location] = { sales: 0, purchases: 0, pettyCash: 0 }
      }
      locationData[location].pettyCash += closing.petty_cash_rendered || 0
    })

    return Object.entries(locationData).map(([location, data]) => {
      const margin = data.sales - data.purchases
      const profitability = margin - data.pettyCash
      const marginPercent = data.sales > 0 ? (margin / data.sales) * 100 : 0

      return {
        location,
        sales: data.sales,
        purchases: data.purchases,
        margin,
        profitability,
        marginPercent,
      }
    }).sort((a, b) => b.profitability - a.profitability)
  }, [allSales, allPurchases, allCashClosings])

  // Calculate profitability by brand
  const profitabilityByBrand = useMemo(() => {
    const brandData: Record<string, { sales: number; purchases: number }> = {}

    allSales.forEach((sale) => {
      const brand = (sale.brands as { name?: string })?.name || 'Unknown'
      if (!brandData[brand]) {
        brandData[brand] = { sales: 0, purchases: 0 }
      }
      brandData[brand].sales += sale.net_amount
    })

    // Note: Purchases don't have brand info in current schema, so we'll distribute by sales ratio
    const totalSales = Object.values(brandData).reduce((sum, data) => sum + data.sales, 0)
    const totalPurchases = purchases

    Object.keys(brandData).forEach((brand) => {
      const salesRatio = brandData[brand].sales / totalSales
      brandData[brand].purchases = totalPurchases * salesRatio
    })

    return Object.entries(brandData).map(([brand, data]) => {
      const margin = data.sales - data.purchases
      const marginPercent = data.sales > 0 ? (margin / data.sales) * 100 : 0

      return {
        brand,
        sales: data.sales,
        purchases: data.purchases,
        margin,
        marginPercent,
      }
    }).sort((a, b) => b.margin - a.margin)
  }, [allSales, purchases])

  // Get status for KPI cards
  const getFoodCostStatus = (): 'success' | 'warning' | 'danger' => {
    if (foodCostPercent < 30) return 'success'
    if (foodCostPercent < 40) return 'warning'
    return 'danger'
  }

  const getMarginStatus = (): 'success' | 'warning' | 'danger' => {
    if (grossMarginPercent >= 70) return 'success'
    if (grossMarginPercent >= 50) return 'warning'
    return 'danger'
  }

  if (loading) {
    return (
      <DashboardLayout title={t('profitability')} subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profitability data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      titleKey="profitability"
      subtitleKey="profitability"
    >
      <div className="max-w-7xl mx-auto">
          {/* Date Filter */}
          <div className="mb-8">
            <DateRangeFilter onDateChange={handleDateChange} />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title={t('netSales')}
              value={netSales}
              icon={DollarSign}
              prefix="₲"
              tooltip={t('netSalesTooltip')}
            />
            <KPICard
              title={t('purchases')}
              value={purchases}
              icon={ShoppingCart}
              prefix="₲"
              tooltip={t('purchasesTooltip')}
            />
            <KPICard
              title={t('foodCostPercent')}
              value={foodCostPercent}
              icon={Percent}
              suffix="%"
              status={getFoodCostStatus()}
              tooltip={t('foodCostPercentTooltip')}
            />
            <KPICard
              title={t('grossMargin')}
              value={grossMargin}
              icon={TrendingUp}
              prefix="₲"
              status={getMarginStatus()}
              tooltip={t('grossMarginTooltip')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title={t('grossMarginPercent')}
              value={grossMarginPercent}
              icon={Percent}
              suffix="%"
              status={getMarginStatus()}
              tooltip={t('grossMarginPercentTooltip')}
            />
            <KPICard
              title={t('pettyCashExpenses')}
              value={pettyCashExpenses}
              icon={Wallet}
              prefix="₲"
              tooltip={t('pettyCashExpensesTooltip')}
            />
            <KPICard
              title={t('estimatedProfitability')}
              value={estimatedProfitability}
              icon={DollarSign}
              prefix="₲"
              status={estimatedProfitability >= 0 ? 'success' : 'danger'}
              tooltip={t('estimatedProfitabilityTooltip')}
            />
            <KPICard
              title={t('totalPayments')}
              value={payments}
              icon={Wallet}
              prefix="₲"
              tooltip={t('totalPaymentsTooltip')}
            />
          </div>

          {/* Profitability by Location */}
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('profitabilityByLocation')}</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('location')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('sales')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('purchases')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('grossMargin')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('margin')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('profitability')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitabilityByLocation.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          {t('noDataAvailable')}
                        </td>
                      </tr>
                    ) : (
                      profitabilityByLocation.map((item) => (
                        <tr key={item.location} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.location}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₲{Math.round(item.sales).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">₲{Math.round(item.purchases).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₲{Math.round(item.margin).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                              item.marginPercent >= 70 ? 'bg-green-100 text-green-700' :
                              item.marginPercent >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {item.marginPercent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            <span className={item.profitability >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ₲{Math.round(item.profitability).toLocaleString()}
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

          {/* Profitability by Brand */}
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('profitabilityByBrand')}</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('brand')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('sales')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('purchases')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('grossMargin')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('margin')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitabilityByBrand.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          {t('noDataAvailable')}
                        </td>
                      </tr>
                    ) : (
                      profitabilityByBrand.map((item) => (
                        <tr key={item.brand} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.brand}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₲{Math.round(item.sales).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">₲{Math.round(item.purchases).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₲{Math.round(item.margin).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                              item.marginPercent >= 70 ? 'bg-green-100 text-green-700' :
                              item.marginPercent >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {item.marginPercent.toFixed(1)}%
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

          {/* Sales vs Purchases vs Payments */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('salesVsPurchasesVsPayments')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('sales')}</p>
                <p className="text-2xl font-bold text-blue-600">₲{Math.round(netSales).toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('purchases')}</p>
                <p className="text-2xl font-bold text-red-600">₲{Math.round(purchases).toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('payments')}</p>
                <p className="text-2xl font-bold text-purple-600">₲{Math.round(payments).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t('netCashFlow')}:</span>{' '}
                <span className={`font-bold ${netSales - purchases - payments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₲{Math.round(netSales - purchases - payments).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </div>
    </DashboardLayout>
  )
}
