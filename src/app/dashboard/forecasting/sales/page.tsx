'use client'

/**
 * Sales Forecasting Page
 *
 * Detailed sales forecasting with historical data analysis and future predictions
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'
import { ForecastChart } from '@/components/forecasting/forecast-chart'
import { ForecastSelector } from '@/components/forecasting/forecast-selector'
import { KPICard } from '@/components/shared/kpi-card'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Download, TrendingUp, DollarSign, ShoppingBag, Target } from 'lucide-react'
import type { ForecastResult, ForecastRequest } from '@/lib/forecasting/types'
import { exportSalesForecast } from '@/lib/utils/forecast-export'

interface SalesForecastData {
  total: number
  predicted: number
  growth_rate: number
  confidence: number
}

export default function SalesForecastingPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [salesData, setSalesData] = useState<any[]>([])
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [kpis, setKpis] = useState<SalesForecastData | null>(null)
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

  useEffect(() => {
    loadSalesData()
  }, [dateRange])

  const loadSalesData = async () => {
    setLoading(true)
    try {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      const today = new Date()

      const { data } = await supabase
        .from('sales')
        .select('date, total_amount, net_amount')
        .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (data) {
        setSalesData(data)
        calculateKPIs(data)
      }
    } catch (error) {
      console.error('Failed to load sales data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateKPIs = (data: any[]) => {
    if (data.length === 0) return

    const total = data.reduce((sum, sale) => sum + Number(sale.net_amount), 0)
    const recent30 = data.slice(-30)
    const previous30 = data.slice(-60, -30)

    const recentTotal = recent30.reduce((sum, sale) => sum + Number(sale.net_amount), 0)
    const previousTotal = previous30.reduce((sum, sale) => sum + Number(sale.net_amount), 0)
    const growthRate = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0

    setKpis({
      total,
      predicted: recentTotal * (1 + growthRate / 100),
      growth_rate: growthRate,
      confidence: 0.85
    })
  }

  const handleForecast = async (params: ForecastRequest) => {
    setGenerating(true)
    try {
      const queryParams = new URLSearchParams({
        horizon: params.horizon,
        method: params.method,
        dimension: params.dimension,
        confidence: (params.confidence ?? 0.95).toString()
      })

      if (params.dimensionId) {
        queryParams.append('dimensionId', params.dimensionId)
      }

      const response = await fetch(`/api/forecasting/sales?${queryParams.toString()}`)
      const result = await response.json()

      if (result.forecast) {
        setForecast(result.forecast)
      }
    } catch (error) {
      console.error('Forecast failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = async () => {
    if (!forecast || !kpis) {
      alert('Please generate a forecast before exporting')
      return
    }

    try {
      await exportSalesForecast(
        {
          forecast,
          historicalData: salesData.map(sale => ({
            date: sale.date,
            value: Number(sale.net_amount)
          })),
          kpis: {
            totalSales: kpis.total,
            predictedSales: kpis.predicted,
            growthRate: kpis.growth_rate,
            confidence: kpis.confidence
          }
        },
        {
          language: (t('salesForecasting') === 'Pronósticos de Ventas' || t('salesForecasting') === 'Pronóstico de Ventas') ? 'es' : 'en',
          includeAccuracy: true
        }
      )
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export forecast')
    }
  }

  const historicalData = salesData.map(sale => ({
    date: new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: Number(sale.net_amount)
  }))

  const forecastData = forecast ? forecast.data.map((point, index) => ({
    date: point.date,
    amount: point.value,
    upper: forecast.upperBound?.[index],
    lower: forecast.lowerBound?.[index]
  })) : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('salesForecasting') || 'Sales Forecasting'}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('salesForecastingDescription') || 'Predict future sales with advanced forecasting algorithms'}
          </p>
        </div>

        {/* Date Range Filter & Export */}
        <div className="flex gap-4">
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onRangeChange={setDateRange}
          />
          <button
            onClick={handleExport}
            disabled={!forecast || !kpis}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed whitespace-nowrap"
            title={t('exportExcel') || 'Export to Excel'}
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{t('exportExcel') || 'Export Excel'}</span>
          </button>
        </div>

        {/* KPIs */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title={t('totalSales') || 'Total Sales'}
              value={kpis.total}
              icon={DollarSign}
              prefix="₲"
            />
            <KPICard
              title={t('predictedSales') || 'Predicted Sales'}
              value={kpis.predicted}
              icon={Target}
              prefix="₲"
            />
            <KPICard
              title={t('growthRate') || 'Growth Rate'}
              value={`${kpis.growth_rate.toFixed(1)}%`}
              icon={TrendingUp}
              status={kpis.growth_rate > 0 ? 'success' : 'danger'}
            />
            <KPICard
              title={t('confidence') || 'Confidence'}
              value={`${(kpis.confidence * 100).toFixed(0)}%`}
              icon={ShoppingBag}
            />
          </div>
        )}

        {/* Forecast Selector */}
        <ForecastSelector
          onForecast={handleForecast}
          loading={generating}
          dimensions={[
            { value: 'all', label: 'All Sales' },
            { value: 'location', label: 'By Location' },
            { value: 'brand', label: 'By Brand' },
            { value: 'channel', label: 'By Channel' }
          ]}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historical Sales */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('historicalSales') || 'Historical Sales'}
            </h2>
            <ForecastChart
              data={historicalData}
              showForecast={false}
              height={300}
            />
          </div>

          {/* Sales Forecast */}
          {forecast && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('salesForecast') || 'Sales Forecast'}
              </h2>
              <ForecastChart
                data={forecastData}
                showForecast={true}
                height={300}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
