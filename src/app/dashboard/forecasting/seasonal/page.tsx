'use client'

/**
 * Seasonal Forecasting Page
 *
 * Seasonal patterns, holiday/weekend analysis, and year-over-year comparisons
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'
import { ForecastChart } from '@/components/forecasting/forecast-chart'
import { ForecastSelector } from '@/components/forecasting/forecast-selector'
import { KPICard } from '@/components/shared/kpi-card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Calendar, Download, TrendingUp, BarChart3, Activity } from 'lucide-react'
import type { ForecastResult, ForecastRequest } from '@/lib/forecasting/types'
import { exportSeasonalAnalysis } from '@/lib/utils/forecast-export'

interface SeasonalData {
  period: string
  actual: number
  seasonal_index: number
  detrended: number
  year_over_year: number
}

export default function SeasonalForecastingPage() {
  const { t } = useLanguage()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [seasonalData, setSeasonalData] = useState<SeasonalData[]>([])
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [trend, setTrend] = useState<{
    direction: string
    strength: number
    description: string
  } | null>(null)

  useEffect(() => {
    loadSeasonalData()
  }, [])

  const loadSeasonalData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/forecasting/seasonal')
      if (!response.ok) {
        throw new Error('Failed to load seasonal data')
      }
      const data = await response.json()

      // Convert API response to SeasonalData format
      const seasonal: SeasonalData[] = data.weekly_pattern.map((p: any) => ({
        period: p.day_name,
        actual: p.avg_sales,
        seasonal_index: p.seasonal_index,
        detrended: Math.round(p.avg_sales / p.seasonal_index),
        year_over_year: 0 // Will be calculated if needed
      }))

      setSeasonalData(seasonal)
      setTrend(data.trend)
    } catch (error) {
      console.error('Failed to load seasonal data:', error)
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

      const response = await fetch(`/api/forecasting/seasonal?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to generate seasonal forecast')
      }

      const data = await response.json()

      // Convert API response to SeasonalData format
      const seasonal: SeasonalData[] = data.weekly_pattern.map((p: any) => ({
        period: p.day_name,
        actual: p.avg_sales,
        seasonal_index: p.seasonal_index,
        detrended: Math.round(p.avg_sales / p.seasonal_index),
        year_over_year: 0
      }))

      setSeasonalData(seasonal)
      setTrend(data.trend)

      // Generate 4-week forecast based on seasonal patterns
      const forecastData = []
      const days: number[] = []
      const upper: number[] = []
      const lower: number[] = []

      for (let week = 0; week < 4; week++) {
        seasonal.forEach((day) => {
          const baseValue = day.actual * (1 + week * 0.02) // 2% growth per week
          forecastData.push({
            date: `Week ${week + 1} ${day.period}`,
            value: baseValue,
            upper: baseValue * 1.1,
            lower: baseValue * 0.9
          })
          days.push(baseValue)
          upper.push(baseValue * 1.1)
          lower.push(baseValue * 0.9)
        })
      }

      setForecast({
        algorithm: params.method,
        horizon: params.horizon,
        data: days,
        upperBound: upper,
        lowerBound: lower,
        metrics: { mae: 0, mse: 0, rmse: 0, mape: 0 }
      })
    } catch (error) {
      console.error('Seasonal forecast failed:', error)
      alert('Failed to generate seasonal forecast')
    } finally {
      setGenerating(false)
    }
  }

  // Calculate derived values from API data
  const peakDay = seasonalData.length > 0 ? seasonalData.reduce((max, d) => d.actual > max.actual ? d : max, seasonalData[0]) : null
  const slowDay = seasonalData.length > 0 ? seasonalData.reduce((min, d) => d.actual < min.actual ? d : min, seasonalData[0]) : null
  const seasonalVariation = peakDay && slowDay ? ((peakDay.actual - slowDay.actual) / slowDay.actual * 100) : 0

  const handleExport = async () => {
    if (!trend || seasonalData.length === 0) {
      alert('No data to export')
      return
    }

    try {
      await exportSeasonalAnalysis(
        {
          weekly_pattern: seasonalData.map(d => ({
            day_name: d.period,
            avg_sales: d.actual,
            seasonal_index: d.seasonal_index
          })),
          trend: trend!,
          summary: {
            peak_day: peakDay?.period || 'N/A',
            trough_day: slowDay?.period || 'N/A',
            seasonal_variation_percent: seasonalVariation
          }
        },
        {
          language: (t('seasonalForecasting') === 'Pronósticos Estacionales' || t('seasonalForecasting') === 'Pronóstico Estacional') ? 'es' : 'en'
        }
      )
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export seasonal analysis')
    }
  }

  const chartData = seasonalData.map(d => ({
    date: d.period,
    amount: d.actual
  }))

  const seasonalIndexData = seasonalData.map(d => ({
    date: d.period,
    amount: d.seasonal_index * 100 // Convert to percentage
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header & Export */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('seasonalForecasting') || 'Seasonal Forecasting'}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('seasonalForecastingDescription') || 'Analyze seasonal patterns and predict future trends'}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={seasonalData.length === 0}
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
            title={t('peakDay') || 'Peak Day'}
            value={peakDay?.period || 'N/A'}
            icon={TrendingUp}
            status="success"
          />
          <KPICard
            title={t('slowDay') || 'Slowest Day'}
            value={slowDay?.period || 'N/A'}
            icon={Activity}
            status="warning"
          />
          <KPICard
            title={t('seasonalVariation') || 'Seasonal Variation'}
            value={`${seasonalVariation.toFixed(0)}%`}
            icon={BarChart3}
          />
          <KPICard
            title={t('avgDailySales') || 'Avg Daily Sales'}
            value={seasonalData.reduce((s, d) => s + d.actual, 0) / seasonalData.length}
            icon={Calendar}
            prefix="₲"
          />
        </div>

        {/* Forecast Selector */}
        <ForecastSelector
          onForecast={handleForecast}
          loading={generating}
          dimensions={[
            { value: 'all', label: 'All Sales' },
            { value: 'location', label: 'By Location' },
            { value: 'brand', label: 'By Brand' }
          ]}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Seasonal Pattern */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('weeklyPattern') || 'Weekly Seasonal Pattern'}
            </h2>
            <ForecastChart
              data={chartData}
              showForecast={false}
              height={300}
            />
          </div>

          {/* Seasonal Indices */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('seasonalIndices') || 'Seasonal Indices'}
            </h2>
            <div className="space-y-3">
              {seasonalData.map(d => (
                <div key={d.period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{d.period}</div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      ₲{(d.actual / 1000).toFixed(0)}K
                    </div>
                    <div className={`font-semibold ${
                      d.seasonal_index > 1 ? 'text-green-600' :
                      d.seasonal_index < 1 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {(d.seasonal_index * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Seasonal Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('seasonalBreakdown') || 'Seasonal Breakdown'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-gray-600 font-medium">{t('day') || 'Day'}</th>
                  <th className="text-right p-3 text-gray-600 font-medium">{t('avgSales') || 'Avg Sales'}</th>
                  <th className="text-right p-3 text-gray-600 font-medium">{t('seasonalIndex') || 'Seasonal Index'}</th>
                  <th className="text-right p-3 text-gray-600 font-medium">{t('detrended') || 'Detrended'}</th>
                  <th className="text-right p-3 text-gray-600 font-medium">{t('yoyChange') || 'YoY Change'}</th>
                </tr>
              </thead>
              <tbody>
                {seasonalData.map(d => (
                  <tr key={d.period} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{d.period}</td>
                    <td className="p-3 text-right">₲{d.actual.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <span className={`font-semibold ${
                        d.seasonal_index > 1.1 ? 'text-green-600' :
                        d.seasonal_index < 0.9 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {d.seasonal_index.toFixed(2)}x
                      </span>
                    </td>
                    <td className="p-3 text-right">₲{d.detrended.toLocaleString()}</td>
                    <td className={`p-3 text-right font-semibold ${
                      d.year_over_year > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {d.year_over_year > 0 ? '+' : ''}{d.year_over_year}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seasonal Forecast */}
        {forecast && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('fourWeekForecast') || '4-Week Seasonal Forecast'}
            </h2>
            <ForecastChart
              data={forecast.data.map((value, index) => ({
                date: [`Week ${Math.floor(index / 7) + 1}`, seasonalData[index % 7].period].join(' '),
                amount: value,
                upper: forecast.upperBound?.[index],
                lower: forecast.lowerBound?.[index]
              }))}
              showForecast={true}
              height={300}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
