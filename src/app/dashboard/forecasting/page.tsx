/**
 * Forecasting Dashboard - Main Hub
 *
 * Overview page with navigation to specialized forecasting modules:
 * - Sales Forecasting
 * - Staffing Forecasting
 * - Inventory/Demand Forecasting
 * - Seasonal Trend Analysis
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ForecastSelector } from '@/components/forecasting/forecast-selector'
import { ForecastChart } from '@/components/forecasting/forecast-chart'
import type { ForecastRequest, ForecastResult, ForecastDimension } from '@/lib/forecasting/types'
import { TrendingUp, Users, Package, Calendar, BarChart3, Activity, Target, Clock } from 'lucide-react'

export default function ForecastingPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [forecast, setForecast] = useState<ForecastResult | null>(null)

  // Available dimensions for the selector
  const [availableLocations, setAvailableLocations] = useState<Array<{ id: string; name: string }>>([])
  const [availableBrands, setAvailableBrands] = useState<Array<{ id: string; name: string }>>([])
  const [availableChannels, setAvailableChannels] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      // Load dimensions
      await loadDimensions()
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadDimensions = async () => {
    // Load locations
    const { data: locations } = await supabase
      .from('locations')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (locations) {
      setAvailableLocations(locations)
    }

    // Load brands
    const { data: brands } = await supabase
      .from('brands')
      .select('id, name')
      .eq('active', true)
      .order('name')

    if (brands) {
      setAvailableBrands(brands)
    }

    // Load channels
    const { data: channels } = await supabase
      .from('sales_channels')
      .select('id, name')
      .eq('active', true)
      .order('sort_order')

    if (channels) {
      setAvailableChannels(channels)
    }
  }

  const handleForecast = async (params: ForecastRequest) => {
    setGenerating(true)

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        horizon: params.horizon,
        method: params.method,
        dimension: params.dimension,
        confidence: params.confidence.toString()
      })

      if (params.dimensionId) {
        queryParams.append('dimensionId', params.dimensionId)
      }

      // Call forecasting API
      const response = await fetch(`/api/forecasting/sales?${queryParams.toString()}`)
      const result = await response.json()

      if (response.ok) {
        setForecast(result)
      } else {
        console.error('Forecast error:', result)
        alert(result.error || 'Failed to generate forecast')
      }
    } catch (error) {
      console.error('Forecast error:', error)
      alert('Failed to generate forecast')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout titleKey="forecasting" subtitleKey="loading">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout titleKey="forecasting" subtitleKey="forecastingOverview">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Quick forecast selector */}
        <ForecastSelector
          onForecast={handleForecast}
          loading={generating}
          availableLocations={availableLocations}
          availableBrands={availableBrands}
          availableChannels={availableChannels}
        />

        {/* Forecast result */}
        {forecast && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('forecastResult') || 'Forecast Result'}
              </h3>
              <p className="text-sm text-gray-500">
                {t('forecastResultDescription') || 'Forecast based on historical data'}
              </p>
            </div>

            {/* Forecast chart */}
            <div>
              <ForecastChart forecast={forecast} height={350} />
            </div>

            {/* Accuracy metrics */}
            {forecast.accuracy && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {t('meanAbsoluteError') || 'Mean Absolute Error'}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Math.round(forecast.accuracy.mae).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {t('meanAbsolutePercentageError') || 'MAPE'}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {forecast.accuracy.mape.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {t('rootMeanSquareError') || 'RMSE'}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Math.round(forecast.accuracy.rmse).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Forecast info */}
            <div className="text-sm text-gray-500">
              <p>
                {t('generatedAt') || 'Generated at'}:{' '}
                {new Date(forecast.generatedAt).toLocaleString()}
              </p>
              <p>
                {t('dataPointsUsed') || 'Data points used'}:{' '}
                {forecast.dataPointsUsed}
              </p>
              <p>
                {t('confidenceLevel') || 'Confidence level'}:{' '}
                {(forecast.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        )}

        {/* Navigation to specialized forecasting modules */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('specializedForecasts') || 'Specialized Forecasts'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sales Forecasting */}
            <button
              onClick={() => router.push('/dashboard/forecasting/sales')}
              className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-blue-500 hover:shadow-md transition-all"
            >
              <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">
                {t('salesForecasting') || 'Sales Forecasting'}
              </h4>
              <p className="text-sm text-gray-500">
                {t('salesForecastingDescription') || 'Predict future revenue'}
              </p>
            </button>

            {/* Staffing Forecasting */}
            <button
              onClick={() => router.push('/dashboard/forecasting/staffing')}
              className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-green-500 hover:shadow-md transition-all"
            >
              <Users className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">
                {t('staffingForecasting') || 'Staffing Forecasting'}
              </h4>
              <p className="text-sm text-gray-500">
                {t('staffingForecastingDescription') || 'Optimize staff schedules'}
              </p>
            </button>

            {/* Inventory Forecasting */}
            <button
              onClick={() => router.push('/dashboard/forecasting/inventory')}
              className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-purple-500 hover:shadow-md transition-all"
            >
              <Package className="w-8 h-8 text-purple-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">
                {t('inventoryForecasting') || 'Inventory Forecasting'}
              </h4>
              <p className="text-sm text-gray-500">
                {t('inventoryForecastingDescription') || 'Prevent stockouts'}
              </p>
            </button>

            {/* Seasonal Analysis */}
            <button
              onClick={() => router.push('/dashboard/forecasting/seasonal')}
              className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-orange-500 hover:shadow-md transition-all"
            >
              <Calendar className="w-8 h-8 text-orange-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-1">
                {t('seasonalAnalysis') || 'Seasonal Analysis'}
              </h4>
              <p className="text-sm text-gray-500">
                {t('seasonalAnalysisDescription') || 'Understand seasonal patterns'}
              </p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
