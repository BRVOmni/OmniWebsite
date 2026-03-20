'use client'

/**
 * Products Module
 *
 * Commercial insights module showing product performance,
 * rankings, and analytics.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { KPICard } from '@/components/shared/kpi-card'
import { Package, TrendingUp, TrendingDown, DollarSign, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react'

interface SaleItem {
  products_summary: {
    name: string
    quantity: number
  }[]
}

interface SalesData {
  id: string
  date: string
  net_amount: number
  total_amount: number
  items_count: number
  products_summary: SaleItem['products_summary']
  locations: {
    name: string
  }
  brands: {
    name: string
  }
}

interface ProductData {
  name: string
  totalSales: number
  totalRevenue: number
  totalQuantity: number
  averagePrice: number
  locations: Set<string>
  brands: Set<string>
  salesCount: number
}

interface ProductAlertData {
  name: string
  type: string
  severity: string
}

export default function ProductsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [allSales, setAllSales] = useState<SalesData[]>([])
  const [productAlerts, setProductAlerts] = useState<ProductAlertData[]>([])

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
      loadProductAlerts(),
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
      .select('id, date, net_amount, total_amount, items_count, products_summary, locations(name), brands(name)')
      .eq('status', 'completed')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      setAllSales(queryResult.data as SalesData[])
    }
  }

  const loadProductAlerts = async () => {
    const query = supabase
      .from('alerts')
      .select('type, description')
      .eq('type', 'merchandise')
      .eq('status', 'active')
      .limit(20)

    const queryResult = await query
    if (!queryResult.error && queryResult.data) {
      const alerts = queryResult.data.map((alert: any) => ({
        name: alert.description?.split(':')[0]?.trim() || 'Product Issue',
        type: alert.type,
        severity: 'high',
      }))
      setProductAlerts(alerts)
    }
  }

  const handleDateChange = async (startDate: string, endDate: string) => {
    await loadAllData(startDate, endDate)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Aggregate product data
  const productData = useMemo(() => {
    const products: Record<string, ProductData> = {}

    allSales.forEach((sale) => {
      if (sale.products_summary && Array.isArray(sale.products_summary)) {
        sale.products_summary.forEach((item) => {
          const productName = item.name || 'Unknown Product'
          if (!products[productName]) {
            products[productName] = {
              name: productName,
              totalSales: 0,
              totalRevenue: 0,
              totalQuantity: 0,
              averagePrice: 0,
              locations: new Set(),
              brands: new Set(),
              salesCount: 0,
            }
          }

          products[productName].totalSales += 1
          products[productName].totalRevenue += sale.net_amount
          products[productName].totalQuantity += item.quantity || 1
          products[productName].salesCount += 1

          if (sale.locations) {
            products[productName].locations.add(sale.locations.name)
          }
          if (sale.brands) {
            products[productName].brands.add(sale.brands.name)
          }
        })
      }
    })

    // Calculate average price
    Object.values(products).forEach((product) => {
      product.averagePrice = product.totalQuantity > 0 ? product.totalRevenue / product.totalQuantity : 0
    })

    return Object.values(products)
  }, [allSales])

  // Get rankings
  const bestSellingProducts = useMemo(() => {
    return [...productData].sort((a, b) => b.totalSales - a.totalSales).slice(0, 20)
  }, [productData])

  const leastSellingProducts = useMemo(() => {
    return [...productData]
      .filter(p => p.totalSales >= 5) // Only include products with at least 5 sales
      .sort((a, b) => a.totalSales - b.totalSales)
      .slice(0, 10)
  }, [productData])

  const highestBillingProducts = useMemo(() => {
    return [...productData].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 20)
  }, [productData])

  const highestVolumeProducts = useMemo(() => {
    return [...productData].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 20)
  }, [productData])

  // Calculate KPIs
  const totalProducts = productData.length
  const totalProductSales = productData.reduce((sum, p) => sum + p.totalSales, 0)
  const totalProductRevenue = productData.reduce((sum, p) => sum + p.totalRevenue, 0)
  const activeProductAlerts = productAlerts.length

  if (loading) {
    return (
      <DashboardLayout titleKey="loading" subtitleKey="loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product analytics...</p>
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
              title={t('totalProducts')}
              value={totalProducts}
              icon={Package}
              tooltip={t('totalProductsTooltip')}
            />
            <KPICard
              title={t('totalProductSales')}
              value={totalProductSales}
              icon={TrendingUp}
              tooltip={t('totalProductSalesTooltip')}
            />
            <KPICard
              title={t('productRevenue')}
              value={totalProductRevenue}
              icon={DollarSign}
              prefix="₲"
              tooltip={t('productRevenueTooltip')}
            />
            <KPICard
              title={t('productAlerts')}
              value={activeProductAlerts}
              icon={AlertCircle}
              status={activeProductAlerts > 0 ? 'problem' : 'good'}
              tooltip={t('productAlertsTooltip')}
            />
          </div>

          {/* Best Selling Products */}
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{t('bestSellingProducts')}</h2>
                <span className="text-sm text-gray-500">Top 20</span>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('product')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('sales')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('revenue')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('quantity')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('avgPrice')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestSellingProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          {t('noProductData')}
                        </td>
                      </tr>
                    ) : (
                      bestSellingProducts.map((product, index) => (
                        <tr key={product.name} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{product.totalSales}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₲{Math.round(product.totalRevenue).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{product.totalQuantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">₲{Math.round(product.averagePrice).toLocaleString()}</td>
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
            {/* Least Selling Products */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('leastSellingProducts')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('product')}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('sales')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leastSellingProducts.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                            {t('noProductData')}
                          </td>
                        </tr>
                      ) : (
                        leastSellingProducts.map((product) => (
                          <tr key={product.name} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">{product.totalSales}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Highest Billing Products */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('highestBillingProducts')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('product')}</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('revenue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highestBillingProducts.slice(0, 10).length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                            {t('noProductData')}
                          </td>
                        </tr>
                      ) : (
                        highestBillingProducts.slice(0, 10).map((product) => (
                          <tr key={product.name} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">₲{Math.round(product.totalRevenue).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Highest Volume Products */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">{t('highestVolumeProducts')}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('product')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('quantity')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('sales')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('revenue')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highestVolumeProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          {t('noProductData')}
                        </td>
                      </tr>
                    ) : (
                      highestVolumeProducts.map((product, index) => (
                        <tr key={product.name} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{product.totalQuantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{product.totalSales}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₲{Math.round(product.totalRevenue).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Product Alerts */}
          {productAlerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('productAlertsTitle')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productAlerts.map((alert, index) => (
                    <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-900">{alert.name}</span>
                      </div>
                      <p className="text-xs text-red-700">Stock shortage - requires attention</p>
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
