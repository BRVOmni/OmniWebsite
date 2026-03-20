'use client'

/**
 * Sales Analytics Module
 *
 * Detailed sales analysis with filters, charts, and export
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { KPICard } from '@/components/shared/kpi-card'
import { ChannelBreakdown } from '@/components/shared/channel-breakdown'
import { PaymentBreakdown } from '@/components/shared/payment-breakdown'
import { DimensionFilters } from '@/components/shared/dimension-filters'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DollarSign, ShoppingBag, Receipt, Download, TrendingUp } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Sale {
  id: string
  date: string
  time: string
  order_number: string
  total_amount: number
  net_amount: number
  items_count: number
  status: string
  channels: { name: string }
  payment_methods: { name: string }
  locations: { name: string }
  brands: { name: string }
}

export default function SalesAnalyticsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [allSales, setAllSales] = useState<Sale[]>([])
  const [filters, setFilters] = useState({
    location: '',
    brand: '',
    channel: '',
    paymentMethod: '',
  })

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
      await loadSalesData()
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadSalesData = async (startDate?: string, endDate?: string) => {
    console.log('Loading sales data...')

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const today = new Date()

    const start = startDate || sevenDaysAgo.toISOString().split('T')[0]
    const end = endDate || today.toISOString().split('T')[0]

    const query = supabase
      .from('sales')
      .select(`
        id,
        date,
        time,
        order_number,
        total_amount,
        net_amount,
        items_count,
        status,
        locations(name),
        brands(name),
        sales_channels(name),
        payment_methods(name)
      `)
      .eq('status', 'completed')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    const queryResult = await query

    if (!queryResult.error && queryResult.data) {
      setAllSales(queryResult.data as Sale[])
      console.log('Sales loaded:', queryResult.data.length, 'records')
    }
  }

  const handleDateChange = async (startDate: string, endDate: string) => {
    await loadSalesData(startDate, endDate)
  }

  const handleExport = () => {
    // Export to Excel with professional formatting
    const rows = sales.map(sale => ({
      [t('date')]: sale.date,
      [t('orderNumber')]: sale.order_number,
      [t('location')]: (sale.locations as { name?: string })?.name || 'N/A',
      [t('brand')]: (sale.brands as { name?: string })?.name || 'N/A',
      [t('channel')]: (sale.channels as { name?: string })?.name || 'N/A',
      [t('payment')]: (sale.payment_methods as { name?: string })?.name || 'N/A',
      [t('total')]: Math.round(sale.total_amount),
      [t('net')]: Math.round(sale.net_amount),
      [t('items')]: sale.items_count,
    }))

    // Create transactions worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows)

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 15 }, // Order Number
      { wch: 25 }, // Location
      { wch: 20 }, // Brand
      { wch: 15 }, // Channel
      { wch: 15 }, // Payment
      { wch: 15 }, // Total
      { wch: 15 }, // Net
      { wch: 8 },  // Items
    ]

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions')

    // Create summary worksheet with KPIs
    const summaryData = [
      [t('salesAnalytics'), '', ''],
      ['', '', ''],
      [t('netSales'), `₲${netSales.toLocaleString()}`, ''],
      [t('orders'), orders.toString(), ''],
      [t('averageTicket'), `₲${Math.round(averageTicket).toLocaleString()}`, ''],
      ['', '', ''],
      ['Export Date', new Date().toLocaleDateString(), ''],
      ['Total Records', sales.length.toString(), ''],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    summarySheet['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Generate and download
    XLSX.writeFile(workbook, `sales-analytics-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  // Filter sales based on selected filters
  const sales = useMemo(() => {
    return allSales.filter((sale) => {
      const locationMatch = !filters.location || (sale.locations as { name?: string })?.name === filters.location
      const brandMatch = !filters.brand || (sale.brands as { name?: string })?.name === filters.brand
      const channelMatch = !filters.channel || (sale.channels as { name?: string })?.name === filters.channel
      const paymentMatch = !filters.paymentMethod || (sale.payment_methods as { name?: string })?.name === filters.paymentMethod

      return locationMatch && brandMatch && channelMatch && paymentMatch
    })
  }, [allSales, filters])

  // Get unique values for dimension filters
  const dimensionOptions = useMemo(() => {
    const locations = new Set<string>()
    const brands = new Set<string>()
    const channels = new Set<string>()
    const paymentMethods = new Set<string>()

    allSales.forEach((sale) => {
      const location = (sale.locations as { name?: string })?.name
      const brand = (sale.brands as { name?: string })?.name
      const channel = (sale.channels as { name?: string })?.name
      const payment = (sale.payment_methods as { name?: string })?.name

      if (location) locations.add(location)
      if (brand) brands.add(brand)
      if (channel) channels.add(channel)
      if (payment) paymentMethods.add(payment)
    })

    return {
      locations: Array.from(locations).sort(),
      brands: Array.from(brands).sort(),
      channels: Array.from(channels).sort(),
      paymentMethods: Array.from(paymentMethods).sort(),
    }
  }, [allSales])

  // Calculate KPIs
  const netSales = sales.reduce((sum, sale) => sum + sale.net_amount, 0)
  const orders = sales.length
  const averageTicket = orders > 0 ? netSales / orders : 0

  // Calculate channel breakdown
  const channelData = useMemo(() => {
    const channels: Record<string, { sales: number; orders: number }> = {}
    sales.forEach((sale) => {
      const channel = (sale.channels as { name?: string })?.name || t('unknown')
      if (!channels[channel]) {
        channels[channel] = { sales: 0, orders: 0 }
      }
      channels[channel].sales += sale.net_amount
      channels[channel].orders += 1
    })
    return Object.entries(channels).map(([channel, data]) => ({
      channel,
      ...data,
    }))
  }, [sales, t])

  // Calculate payment method breakdown
  const paymentData = useMemo(() => {
    const methods: Record<string, { sales: number; orders: number }> = {}
    sales.forEach((sale) => {
      const method = (sale.payment_methods as { name?: string })?.name || t('unknown')
      if (!methods[method]) {
        methods[method] = { sales: 0, orders: 0 }
      }
      methods[method].sales += sale.net_amount
      methods[method].orders += 1
    })
    return Object.entries(methods).map(([method, data]) => ({
      method,
      ...data,
    }))
  }, [sales, t])

  if (loading) {
    return (
      <DashboardLayout title={t('salesAnalytics')} subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sales analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      titleKey="salesAnalytics"
      subtitleKey="salesAnalyticsFeatures"
    >
      <div className="max-w-7xl mx-auto">
          {/* Date Filter & Export */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3">
              <DateRangeFilter onDateChange={handleDateChange} />
            </div>
            <button
              onClick={handleExport}
              disabled={sales.length === 0}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{t('exportExcel')}</span>
            </button>
          </div>

          {/* Dimension Filters */}
          <div className="mb-8">
            <DimensionFilters
              locations={dimensionOptions.locations}
              brands={dimensionOptions.brands}
              channels={dimensionOptions.channels}
              paymentMethods={dimensionOptions.paymentMethods}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <KPICard
              title={t('netSales')}
              value={netSales}
              icon={DollarSign}
              prefix="₲"
              tooltip={t('netSalesTooltip')}
            />
            <KPICard
              title={t('orders')}
              value={orders}
              icon={ShoppingBag}
              tooltip={t('ordersTooltip')}
            />
            <KPICard
              title={t('averageTicket')}
              value={averageTicket}
              icon={Receipt}
              prefix="₲"
              tooltip={t('averageTicketTooltip')}
            />
            <KPICard
              title={t('transactionRate')}
              value={orders > 0 ? Math.round((orders / Math.max(sales.length, 1)) * 100) : 0}
              icon={TrendingUp}
              suffix="%"
              tooltip="Percentage of sales that were completed (not cancelled)"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChannelBreakdown data={channelData} />
            <PaymentBreakdown data={paymentData} />
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('transactionDetails')}</h2>
                <span className="text-sm text-gray-500">
                  {sales.length} {sales.length === 1 ? t('transaction') : t('transactions')}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('orderNumber')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('location')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('brand')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('channel')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('payment')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('total')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('net')}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('items')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                        {t('noSalesData')}
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{sale.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{sale.order_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{(sale.locations as { name?: string })?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{(sale.brands as { name?: string })?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{(sale.channels as { name?: string })?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{(sale.payment_methods as { name?: string })?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">₲{Math.round(sale.total_amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">₲{Math.round(sale.net_amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{sale.items_count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </DashboardLayout>
  )
}
