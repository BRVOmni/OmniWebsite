'use client'

/**
 * Objective Card Component
 *
 * Shows monthly sales target/objective with progress percentage
 * Extrapolates monthly target based on date range
 */

import { Target, TrendingUp, Calendar } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface ObjectiveCardProps {
  current: number
  monthlyTarget: number
  daysInRange: number
  period: string
  tooltip?: string
}

export function ObjectiveCard({ current, monthlyTarget, daysInRange, period, tooltip }: ObjectiveCardProps) {
  const { t } = useLanguage()

  // Calculate targets based on date range
  const daysInMonth = 30
  const monthlyFraction = daysInRange / daysInMonth
  const rangeTarget = Math.round(monthlyTarget * monthlyFraction)

  // Calculate percentages
  const rangePercentage = (current / rangeTarget) * 100  // Progress against range target
  const monthlyPercentage = (current / monthlyTarget) * 100  // Progress against monthly target
  const remaining = rangeTarget - current
  const isComplete = current >= rangeTarget
  const isOverAchieved = monthlyPercentage > 100

  // Daily average needed to hit monthly target
  const dailyTargetNeeded = Math.round(monthlyTarget / daysInMonth)
  const currentDailyAvg = Math.round(current / daysInRange)

  const getStatusColor = () => {
    if (isOverAchieved) return 'text-purple-600' // 🎉 Bonus time!
    if (isComplete) return 'text-green-600'
    if (rangePercentage >= 80) return 'text-blue-600'
    if (rangePercentage >= 50) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getProgressColor = () => {
    if (isOverAchieved) return 'bg-gradient-to-r from-purple-500 to-pink-500' // 🎉 Bonus celebration!
    if (isComplete) return 'bg-green-500'
    if (rangePercentage >= 80) return 'bg-blue-500'
    if (rangePercentage >= 50) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const getProgressBarWidth = () => {
    if (current >= rangeTarget) return 100

    // Project where we should be based on daily average
    const expectedProgress = (currentDailyAvg / dailyTargetNeeded) * 100
    return Math.min(expectedProgress, 100)
  }

  // Format range target nicely (e.g., "0.23 of 1 month")
  const formatRangeTarget = () => {
    if (daysInRange >= 28 && daysInRange <= 31) {
      return `1 ${t('month')}`
    }
    if (daysInRange < 1) {
      const dayText = daysInRange === 1 ? t('day') : t('days')
      return `${daysInRange} ${dayText}`
    }
    const months = (daysInRange / daysInMonth).toFixed(1)
    const monthText = months === '1' ? t('month') : t('months')
    return `${months} ${monthText}`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 relative">
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">{t('monthlySalesObjective')}</h3>
        </div>
        <span className="text-xs text-gray-500 bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{period}</span>
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${getStatusColor()}`}>
            {Math.round(monthlyPercentage)}%
          </span>
          <span className="text-sm text-gray-500">{t('achieved')}</span>
        </div>

        {/* Target Breakdown */}
        <div className="mt-3 p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('monthlyTarget')}:
            </span>
            <span className="font-bold text-gray-900">₲{monthlyTarget.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {t('rangeTarget')} ({formatRangeTarget()}):
            </span>
            <span className="font-semibold text-blue-700">₲{rangeTarget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>{t('progress')}</span>
          <span>{Math.round(getProgressBarWidth())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`}
            style={{ width: `${getProgressBarWidth()}%` }}
          />
        </div>
      </div>

      {/* Current vs Target */}
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-gray-600">{t('currentSales')}:</span>
        <span className="font-semibold text-gray-900">₲{current.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        {isOverAchieved ? (
          <div className="flex items-center gap-2 text-purple-600 font-bold animate-pulse">
            <span>🎉</span>
            <span>{t('bonusTime')} {Math.round(monthlyPercentage - 100)}{t('bonusTimeEnd')}</span>
          </div>
        ) : isComplete ? (
          <div className="flex items-center gap-1 text-green-600 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('targetAchieved')}</span>
          </div>
        ) : (
          <div className="text-gray-600">
            <span>{t('remaining')}:</span>
            <span className="ml-1 font-semibold text-orange-600">₲{remaining.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Daily Average Indicator */}
      {daysInRange > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>
              {t('dailyAvg')}: <span className="font-medium text-gray-700">₲{currentDailyAvg.toLocaleString()}</span> / {t('needed')}: <span className="font-medium text-gray-700">₲{dailyTargetNeeded.toLocaleString()}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
