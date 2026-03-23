/**
 * Forecast Selector Component
 *
 * Allows users to select forecast parameters:
 * - Forecast horizon (short/medium/long term)
 * - Forecast method
 * - Dimension (location/brand/channel)
 * - Confidence level
 *
 * This component provides an easy-to-use interface for generating forecasts.
 */

'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { algorithmInfo } from '@/lib/forecasting/algorithms'
import type { ForecastRequest, ForecastHorizon, ForecastMethod, ForecastDimension } from '@/lib/forecasting/types'

interface ForecastSelectorProps {
  onForecast: (params: ForecastRequest) => void
  loading?: boolean
  availableLocations?: Array<{ id: string; name: string }>
  availableBrands?: Array<{ id: string; name: string }>
  availableChannels?: Array<{ id: string; name: string }>
}

export function ForecastSelector({
  onForecast,
  loading = false,
  availableLocations = [],
  availableBrands = [],
  availableChannels = []
}: ForecastSelectorProps) {
  const { t } = useLanguage()

  // Forecast parameters
  const [horizon, setHorizon] = useState<ForecastHorizon>('medium')
  const [method, setMethod] = useState<ForecastMethod>('triple-exponential-smoothing')
  const [dimension, setDimension] = useState<ForecastDimension>('location')
  const [dimensionId, setDimensionId] = useState<string>('')
  const [confidence, setConfidence] = useState(0.95)

  // Get algorithm info
  const algoInfo = algorithmInfo[method]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {t('forecastParameters') || 'Forecast Parameters'}
        </h3>
        <p className="text-sm text-gray-500">
          {t('forecastParametersDescription') || 'Configure your forecast parameters'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Forecast Horizon */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('forecastHorizon') || 'Forecast Horizon'}
          </label>
          <select
            value={horizon}
            onChange={(e) => setHorizon(e.target.value as ForecastHorizon)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="short">
              {t('shortTerm') || 'Short Term (1-2 weeks)'}
            </option>
            <option value="medium">
              {t('mediumTerm') || 'Medium Term (1-3 months)'}
            </option>
            <option value="long">
              {t('longTerm') || 'Long Term (6-12 months)'}
            </option>
          </select>
        </div>

        {/* Forecast Method */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('forecastMethod') || 'Forecast Method'}
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as ForecastMethod)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="simple-moving-average">
              Simple Moving Average
            </option>
            <option value="weighted-moving-average">
              Weighted Moving Average
            </option>
            <option value="exponential-smoothing">
              Exponential Smoothing
            </option>
            <option value="double-exponential-smoothing">
              Double Exp. Smoothing (Trend)
            </option>
            <option value="triple-exponential-smoothing">
              Triple Exp. Smoothing (Trend + Seasonal)
            </option>
          </select>
          {algoInfo && (
            <p className="text-xs text-gray-500 mt-1">
              {algoInfo.description.en}
            </p>
          )}
        </div>

        {/* Dimension */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('forecastDimension') || 'Forecast By'}
          </label>
          <select
            value={dimension}
            onChange={(e) => setDimension(e.target.value as ForecastDimension)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="location">Location</option>
            <option value="brand">Brand</option>
            <option value="channel">Sales Channel</option>
          </select>
        </div>

        {/* Confidence Level */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('confidenceInterval') || 'Confidence Interval'}
          </label>
          <select
            value={confidence.toString()}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="0.90">90%</option>
            <option value="0.95">95%</option>
            <option value="0.98">98%</option>
            <option value="0.99">99%</option>
          </select>
        </div>
      </div>

      {/* Dimension-specific selector */}
      {(dimension === 'location' && availableLocations.length > 0) ||
       (dimension === 'brand' && availableBrands.length > 0) ||
       (dimension === 'channel' && availableChannels.length > 0) ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('selectSpecific') || `Select ${dimension}`}
          </label>
          <select
            value={dimensionId}
            onChange={(e) => setDimensionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option value="">
              {t('all') || `All ${dimension}s`}
            </option>
            {dimension === 'location' &&
              availableLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            {dimension === 'brand' &&
              availableBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            {dimension === 'channel' &&
              availableChannels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
          </select>
        </div>
      ) : null}

      {/* Algorithm capabilities */}
      {algoInfo && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span>Trend:</span>
            <span className={algoInfo.handlesTrend ? 'text-green-600' : 'text-gray-400'}>
              {algoInfo.handlesTrend ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Seasonality:</span>
            <span className={algoInfo.handlesSeasonality ? 'text-green-600' : 'text-gray-400'}>
              {algoInfo.handlesSeasonality ? '✓' : '✗'}
            </span>
          </div>
          <div>
            Min data: <span className="font-medium">{algoInfo.minDataPoints}</span> points
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            onForecast({
              horizon,
              method,
              dimension,
              dimensionId: dimensionId || undefined,
              confidence: confidence ?? 0.95
            })
          }
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </span>
          ) : (
            t('generateForecast') || 'Generate Forecast'
          )}
        </button>
      </div>
    </div>
  )
}
