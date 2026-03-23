/**
 * Forecast Chart Component
 *
 * Displays forecast data with confidence intervals using Recharts.
 * Extends the existing sales-chart.tsx pattern.
 *
 * Features:
 * - Historical data shown as solid line
 * - Forecast shown as dashed line
 * - Confidence intervals shown as shaded area
 * - Hover tooltips with detailed information
 * - Responsive design
 */

'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import type { ForecastResult } from '@/lib/forecasting/types'

interface ForecastChartProps {
  forecast?: ForecastResult
  data?: Array<{ date: string; amount: number; upper?: number; lower?: number }>
  showForecast?: boolean
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  currency?: string
}

interface ChartDataPoint {
  date: string
  actual: number | null
  forecast: number | null
  lowerBound: number | null
  upperBound: number | null
  type: 'historical' | 'forecast'
}

export function ForecastChart({
  forecast,
  data: dataProp,
  showForecast: showForecastProp = true,
  height = 300,
  showLegend = true,
  showGrid = true,
  currency = '₲'
}: ForecastChartProps) {
  // Combine historical and forecast data for chart
  const chartData = useMemo(() => {
    // If forecast object is provided, use it
    if (forecast?.historicalData && forecast?.forecast) {
      const historical: ChartDataPoint[] = forecast.historicalData.map((d) => ({
        date: d.date,
        actual: d.value,
        forecast: null,
        lowerBound: null,
        upperBound: null,
        type: 'historical' as const
      }))

      const forecastData: ChartDataPoint[] = forecast.forecast.map((d) => ({
        date: d.date,
        actual: null,
        forecast: d.value,
        lowerBound: d.lowerBound,
        upperBound: d.upperBound,
        type: 'forecast' as const
      }))

      return [...historical, ...forecastData]
    }

    // If simple data array is provided
    if (dataProp) {
      return dataProp.map((d, i) => ({
        date: d.date,
        actual: showForecastProp ? null : d.amount,
        forecast: showForecastProp ? d.amount : null,
        lowerBound: d.lower ?? null,
        upperBound: d.upper ?? null,
        type: (showForecastProp ? 'forecast' : 'historical') as const
      }))
    }

    return []
  }, [forecast, dataProp, showForecastProp])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null
    }

    const data = payload[0].payload
    const isForecast = data.type === 'forecast'

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          {new Date(data.date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>

        {isForecast ? (
          <div>
            <p className="text-xs text-gray-500 mb-1">Forecast</p>
            <p className="text-sm font-medium text-blue-600">
              {currency}{Math.round(data.forecast || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              95% CI: {currency}{Math.round(data.lowerBound || 0).toLocaleString()} - {currency}{Math.round(data.upperBound || 0).toLocaleString()}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 mb-1">Actual</p>
            <p className="text-sm font-medium text-green-600">
              {currency}{Math.round(data.actual || 0).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Format Y-axis labels
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toFixed(0)
  }

  // Format X-axis labels (show fewer dates)
  const formatXAxis = (dateStr: string, index: number) => {
    const date = new Date(dateStr)
    // Show only first day of each month, or every 30th point
    if (date.getDate() === 1 || index % 30 === 0) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return ''
  }

  // Don't render if no data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}

          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />

          <YAxis
            tickFormatter={formatYAxis}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />

          <Tooltip content={<CustomTooltip />} />

          {showLegend && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
              formatter={(value) => (
                <span className="text-sm text-gray-700">{value}</span>
              )}
            />
          )}

          {/* Confidence interval band (for forecast data only) */}
          <Area
            dataKey="upperBound"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.15}
            isAnimationActive={false}
          />
          <Area
            dataKey="lowerBound"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            isAnimationActive={false}
          />

          {/* Historical data line (solid, green) */}
          <Line
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />

          {/* Forecast data line (dashed, blue) */}
          <Line
            dataKey="forecast"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
