'use client'

/**
 * Staffing Forecasting Page
 *
 * Staffing optimization based on hourly sales patterns and forecasting
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'
import { ForecastChart } from '@/components/forecasting/forecast-chart'
import { ForecastSelector } from '@/components/forecasting/forecast-selector'
import { KPICard } from '@/components/shared/kpi-card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Download, Users, Clock, TrendingUp, DollarSign } from 'lucide-react'
import type { ForecastResult, ForecastRequest } from '@/lib/forecasting/types'
import { exportStaffingForecast } from '@/lib/utils/forecast-export'

interface HourlyPattern {
  hour: number
  avg_sales: number
  avg_transactions: number
  recommended_staff: number
}

export default function StaffingForecastingPage() {
  const { t } = useLanguage()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [hourlyPatterns, setHourlyPatterns] = useState<HourlyPattern[]>([])
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [summary, setSummary] = useState<{
    peak_hour: number
    peak_sales: number
    total_staff_needed: number
    total_transactions: number
  } | null>(null)

  useEffect(() => {
    loadStaffingForecast()
  }, [])

  const loadStaffingForecast = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/forecasting/staffing')
      if (!response.ok) {
        throw new Error('Failed to load staffing forecast')
      }
      const data = await response.json()

      // Convert API response to HourlyPattern format
      const patterns: HourlyPattern[] = data.patterns.map((p: any) => ({
        hour: p.hour,
        avg_sales: p.expected_sales,
        avg_transactions: p.expected_transactions,
        recommended_staff: p.recommended_staff
      }))

      setHourlyPatterns(patterns)
      setSummary(data.summary)
    } catch (error) {
      console.error('Failed to load staffing forecast:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleForecast = async (params: ForecastRequest) => {
    setGenerating(true)
    try {
      // Regenerate forecast with new parameters
      const queryParams = new URLSearchParams({
        horizon: params.horizon
      })

      const response = await fetch(`/api/forecasting/staffing?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to generate staffing forecast')
      }

      const data = await response.json()

      // Convert API response to HourlyPattern format
      const patterns: HourlyPattern[] = data.patterns.map((p: any) => ({
        hour: p.hour,
        avg_sales: p.expected_sales,
        avg_transactions: p.expected_transactions,
        recommended_staff: p.recommended_staff
      }))

      setHourlyPatterns(patterns)
      setSummary(data.summary)

      // Create forecast data for chart
      const forecastData = patterns.map(p => ({
        date: p.time_label,
        amount: p.expected_sales
      }))

      setForecast({
        algorithm: params.method,
        horizon: params.horizon,
        data: forecastData.map(d => d.amount),
        upperBound: forecastData.map(d => d.amount * 1.1),
        lowerBound: forecastData.map(d => d.amount * 0.9),
        metrics: { mae: 0, mse: 0, rmse: 0, mape: 0 }
      })
    } catch (error) {
      console.error('Staffing forecast failed:', error)
      alert('Failed to generate staffing forecast')
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = async () => {
    if (!summary || hourlyPatterns.length === 0) {
      alert('No data to export')
      return
    }

    try {
      await exportStaffingForecast(
        {
          date: new Date().toISOString().split('T')[0],
          patterns: hourlyPatterns.map(h => ({
            hour: h.hour,
            time_label: `${h.hour}:00`,
            expected_sales: h.avg_sales,
            expected_transactions: h.avg_transactions,
            recommended_staff: h.recommended_staff,
            busy_period: h.hour >= 10 && h.hour <= 14 // Simple heuristic
          })),
          summary: summary!
        },
        {
          language: (t('staffingForecasting') === 'Pronósticos de Personal' || t('staffingForecasting') === 'Pronóstico de Personal') ? 'es' : 'en'
        }
      )
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export forecast')
    }
  }

  // Calculate derived values from API data
  const peakHours = hourlyPatterns
    .sort((a, b) => b.avg_sales - a.avg_sales)
    .slice(0, 3)

  const totalStaffNeeded = summary?.total_staff_needed ||
    hourlyPatterns.reduce((sum, h) => sum + h.recommended_staff, 0)

  const chartData = hourlyPatterns.map(h => ({
    date: `${h.hour}:00`,
    amount: h.avg_sales
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header & Export */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('staffingForecasting') || 'Staffing Forecasting'}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('staffingForecastingDescription') || 'Optimize staff scheduling based on sales patterns and forecasting'}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={hourlyPatterns.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            title={t('exportExcel') || 'Export to Excel'}
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{t('exportExcel') || 'Export'}</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title={t('totalStaffNeeded') || 'Total Staff Needed'}
            value={totalStaffNeeded}
            icon={Users}
          />
          <KPICard
            title={t('peakHour') || 'Peak Hour'}
            value={peakHours[0] ? `${peakHours[0].hour}:00` : 'N/A'}
            icon={Clock}
          />
          <KPICard
            title={t('peakSales') || 'Peak Hour Sales'}
            value={peakHours[0]?.avg_sales || 0}
            icon={DollarSign}
            prefix="₲"
          />
          <KPICard
            title={t('avgTransactionsPerHour') || 'Avg Transactions/Hour'}
            value={hourlyPatterns.length > 0
              ? (hourlyPatterns.reduce((s, h) => s + h.avg_transactions, 0) / hourlyPatterns.length).toFixed(0)
              : 0}
            icon={TrendingUp}
          />
        </div>

        {/* Forecast Selector */}
        <ForecastSelector
          onForecast={handleForecast}
          loading={generating}
          dimensions={[
            { value: 'all', label: 'All Locations' },
            { value: 'location', label: 'By Location' }
          ]}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Sales Pattern */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('hourlySalesPattern') || 'Hourly Sales Pattern'}
            </h2>
            <ForecastChart
              data={chartData}
              showForecast={false}
              height={300}
            />
          </div>

          {/* Recommended Staffing */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('recommendedStaffing') || 'Recommended Staffing'}
            </h2>
            <div className="space-y-3">
              {hourlyPatterns.map(h => (
                <div key={h.hour} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{`${h.hour}:00`}</div>
                    <div className="text-sm text-gray-500">
                      ₲{(h.avg_sales / 1000).toFixed(0)}K avg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{h.recommended_staff} staff</div>
                    <div className="text-sm text-gray-500">
                      {(h.avg_transactions / h.recommended_staff).toFixed(0)} tx/staff
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('peakHours') || 'Peak Hours (11AM - 2PM)'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {peakHours.map((h, i) => (
              <div key={h.hour} className="p-4 border rounded-lg">
                <div className="text-sm text-gray-500 mb-1">
                  {t('rank') || 'Rank'} #{i + 1}
                </div>
                <div className="text-xl font-bold text-gray-900">{`${h.hour}:00`}</div>
                <div className="text-sm text-gray-600">
                  ₲{(h.avg_sales / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-blue-600 mt-2">
                  {h.recommended_staff} {t('staff') || 'staff'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
