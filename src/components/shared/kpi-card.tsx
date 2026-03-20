/**
 * KPI Card Component
 *
 * Reusable card for displaying Key Performance Indicators
 */

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  status?: 'success' | 'warning' | 'danger' | 'neutral'
  tooltip?: string
  className?: string
  prefix?: string
  suffix?: string
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  status = 'neutral',
  tooltip,
  className,
  prefix = '',
  suffix = '',
}: KPICardProps) {
  const statusColors = {
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
    neutral: 'bg-white border-gray-200 text-gray-700',
  }

  const statusIcons = {
    success: '🟢',
    warning: '🟡',
    danger: '🔴',
    neutral: '',
  }

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow',
        statusColors[status],
        className
      )}
    >
      {/* Tooltip */}
      {tooltip && (
        <div className="group absolute top-2 right-2">
          <div className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-help">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {tooltip}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {status !== 'neutral' && (
            <span className="text-xs">{statusIcons[status]}</span>
          )}
        </div>
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {prefix}{typeof value === 'number' ? Math.round(value).toLocaleString() : value}{suffix}
      </p>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  )
}
