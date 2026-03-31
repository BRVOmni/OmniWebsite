'use client'

/**
 * Sales Chart Component - Enhanced with Animations
 *
 * Animated line chart showing sales trend over time
 */

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useLanguage } from '@/lib/language-context'
import { Skeleton } from './page-transition'

interface SalesChartProps {
  data: Array<{ date: string; amount: number }>
}

export function SalesChart({ data }: SalesChartProps) {
  const { t } = useLanguage()
  const [isLoaded, setIsLoaded] = useState(false)
  const [animatedData, setAnimatedData] = useState<Array<{ date: string; amount: number }>>([])

  // Format data for chart
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: item.amount,
  }))

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.amount, 0)

  // Animate chart entry
  useEffect(() => {
    setIsLoaded(false)
    setAnimatedData([])

    const timer = setTimeout(() => {
      setIsLoaded(true)
      // Animate data points progressively
      chartData.forEach((item, index) => {
        setTimeout(() => {
          setAnimatedData(prev => [...prev, item])
        }, index * 50)
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [data])

  // Loading skeleton
  if (!isLoaded || animatedData.length === 0) {
    return <ChartSkeleton />
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 animate-scale-in hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('salesTrend')}</h3>
          <p className="text-sm text-gray-500">{t('selectedPeriod')}</p>
        </div>
        <div className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-700">Total: ₲{Math.round(total / 1000000)}M</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={animatedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="opacity-50" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₲${Math.round(value / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.95)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              padding: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
            formatter={(value: any) => [`₲${Math.round(value).toLocaleString()}`, 'Sales']}
            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
            itemStyle={{ padding: '4px 0' }}
            cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{
              fill: '#3b82f6',
              strokeWidth: 2,
              r: 4,
              className: 'transition-all duration-300 hover:r-6',
            }}
            activeDot={{
              r: 8,
              stroke: '#3b82f6',
              strokeWidth: 3,
              fill: '#fff',
            }}
            animationDuration={1500}
            animationBegin={0}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary stats below chart */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">{t('averageSales')}</p>
          <p className="text-lg font-semibold text-gray-900">
            ₲{Math.round(total / chartData.length / 1000)}k
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">{t('peakDay')}</p>
          <p className="text-lg font-semibold text-gray-900">
            {chartData.length > 0 ? chartData.reduce((max, item) =>
              item.amount > max.amount ? item : max, chartData[0]).date : '-'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">{t('dataPoints')}</p>
          <p className="text-lg font-semibold text-gray-900">{chartData.length}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Chart Skeleton Component
 */
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" variant="text" />
          <Skeleton className="h-4 w-24" variant="text" />
        </div>
        <Skeleton className="h-8 w-24" variant="default" />
      </div>
      <div className="h-[250px] flex items-end justify-around gap-2 px-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton
              className="w-full"
              style={{ height: `${40 + Math.random() * 60}%` }}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-3 w-16 mx-auto" variant="text" />
            <Skeleton className="h-5 w-12 mx-auto" variant="text" />
          </div>
        ))}
      </div>
    </div>
  )
}
