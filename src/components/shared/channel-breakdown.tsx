'use client'

/**
 * Channel Breakdown Chart Component - Enhanced with Animations
 *
 * Animated pie chart showing sales distribution by channel
 */

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useLanguage } from '@/lib/language-context'
import { Skeleton } from './page-transition'
import { cn } from '@/lib/utils'

interface ChannelData {
  channel: string
  sales: number
  orders: number
}

interface ChannelBreakdownProps {
  data: ChannelData[]
}

const COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
]

export function ChannelBreakdown({ data }: ChannelBreakdownProps) {
  const { t } = useLanguage()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.sales, 0)

  // Prepare chart data
  const chartData = data.map(item => ({
    name: item.channel,
    value: item.sales,
    percentage: total > 0 ? Math.round((item.sales / total) * 100) : 0,
  }))

  // Animate entry
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [data])

  // Custom tooltip with better styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-xl border border-gray-700">
          <p className="font-semibold text-base mb-1">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">
              {t('sales')}: <span className="font-medium text-white">₲{Math.round(data.value).toLocaleString()}</span>
            </p>
            <p className="text-gray-300">
              {t('share')}: <span className="font-medium text-white">{data.percentage}%</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Loading skeleton
  if (!isLoaded) {
    return <ChartSkeleton />
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{t('channelBreakdown')}</h3>
        <p className="text-sm text-gray-500">{t('salesByChannel')}</p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] text-gray-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>{t('noDataAvailable')}</p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                animationDuration={1000}
                animationBegin={200}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke={hoveredIndex === index ? '#fff' : 'none'}
                    strokeWidth={hoveredIndex === index ? 3 : 0}
                    className={cn(
                      'transition-all duration-300',
                      hoveredIndex === null ? 'hover:opacity-100' : '',
                      hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40' : ''
                    )}
                    style={{
                      transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend with details and animations */}
          <div className="mt-6 space-y-2">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className={cn(
                  'flex items-center justify-between text-sm p-2 rounded-lg',
                  'transition-all duration-300',
                  'hover:bg-gray-50',
                  hoveredIndex === index ? 'bg-gray-50 scale-[1.02]' : '',
                  hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40' : ''
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full shadow-sm transition-transform duration-300',
                      hoveredIndex === index ? 'scale-125' : ''
                    )}
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">₲{Math.round(item.value).toLocaleString()}</span>
                  <span className={cn(
                    'font-bold px-2 py-0.5 rounded-full text-xs',
                    'bg-gradient-to-r from-blue-50 to-blue-100',
                    'text-blue-700',
                  )}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Chart Skeleton Component
 */
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-6 w-40" variant="text" />
        <Skeleton className="h-4 w-32" variant="text" />
      </div>
      <div className="h-[250px] flex items-center justify-center">
        <div className="relative">
          {/* Circular skeleton */}
          <Skeleton
            className="w-48 h-48 rounded-full"
            variant="default"
          />
          {/* Inner circle */}
          <Skeleton
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full"
            variant="default"
          />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded-full" variant="default" />
              <Skeleton className="h-4 w-24" variant="text" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" variant="text" />
              <Skeleton className="h-5 w-10" variant="default" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
