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
import { Users, Clock, TrendingUp, DollarSign } from 'lucide-react'
import type { ForecastResult, ForecastRequest } from '@/lib/forecasting/types'

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

  useEffect(() => {
    loadHourlyPatterns()
  }, [])

  const loadHourlyPatterns = async () => {
    setLoading(true)
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data } = await supabase
        .from('mv_hourly_sales_patterns')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('hour', { ascending: true })

      if (data) {
        const aggregated = aggregateByHour(data)
        setHourlyPatterns(aggregated)
      }
    } catch (error) {
      console.error('Failed to load hourly patterns:', error)
    } finally {
      setLoading(false)
    }
  }

  const aggregateByHour = (data: any[]): HourlyPattern[] => {
    const byHour: Record<number, HourlyPattern> = {}

    data.forEach(row => {
      const hour = row.hour
      if (!byHour[hour]) {
        byHour[hour] = {
          hour,
          avg_sales: 0,
          avg_transactions: 0,
          recommended_staff: 0
        }
      }
      byHour[hour].avg_sales += Number(row.avg_sales || 0)
      byHour[hour].avg_transactions += Number(row.avg_transactions || 0)
    })

    const count = data.length / 24 // Average over days
    return Object.values(byHour).map(h => ({
      ...h,
      avg_sales: h.avg_sales / Math.max(1, count),
      avg_transactions: h.avg_transactions / Math.max(1, count),
      recommended_staff: calculateRecommendedStaff(h.avg_sales / Math.max(1, count))
    }))
  }

  const calculateRecommendedStaff = (avgSales: number): number => {
    // Rule of thumb: 1 staff per ₲500,000 in hourly sales
    // Minimum 1 staff, maximum based on peak capacity
    const staffNeeded = Math.ceil(avgSales / 500000)
    return Math.max(1, Math.min(10, staffNeeded))
  }

  const handleForecast = async (params: ForecastRequest) => {
    setGenerating(true)
    try {
      // Generate staffing forecast based on hourly patterns
      const forecastData = hourlyPatterns.map(pattern => {
        const growthFactor = 1.05 // Assume 5% growth
        return {
          date: `${pattern.hour}:00`,
          value: pattern.avg_sales * growthFactor,
          upper: pattern.avg_sales * growthFactor * 1.1,
          lower: pattern.avg_sales * growthFactor * 0.9
        }
      })

      setForecast({
        algorithm: params.method,
        horizon: params.horizon,
        data: forecastData.map(d => d.value),
        upperBound: forecastData.map(d => d.upper),
        lowerBound: forecastData.map(d => d.lower),
        metrics: { mae: 0, mse: 0, rmse: 0, mape: 0 }
      })
    } catch (error) {
      console.error('Staffing forecast failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  const peakHours = hourlyPatterns
    .filter(h => h.hour >= 10 && h.hour <= 14) // Lunch peak
    .sort((a, b) => b.avg_sales - a.avg_sales)
    .slice(0, 3)

  const totalStaffNeeded = hourlyPatterns.reduce((sum, h) => sum + h.recommended_staff, 0)

  const chartData = hourlyPatterns.map(h => ({
    date: `${h.hour}:00`,
    amount: h.avg_sales
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('staffingForecasting') || 'Staffing Forecasting'}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('staffingForecastingDescription') || 'Optimize staff scheduling based on sales patterns and forecasting'}
          </p>
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
