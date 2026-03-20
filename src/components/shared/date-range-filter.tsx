'use client'

/**
 * Date Range Filter Component
 *
 * Allows filtering by preset date ranges or custom dates
 */

import { useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface DateRangeFilterProps {
  onDateChange: (startDate: string, endDate: string) => void
}

export function DateRangeFilter({ onDateChange }: DateRangeFilterProps) {
  const { t } = useLanguage()
  const [selectedRange, setSelectedRange] = useState<'today' | '7d' | '30d' | '90d' | 'all' | 'custom'>('7d')
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const handleRangeChange = (range: 'today' | '7d' | '30d' | '90d' | 'all' | 'custom') => {
    setSelectedRange(range)

    if (range === 'custom') {
      setShowCustom(true)
      return
    }

    setShowCustom(false)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    switch (range) {
      case 'today':
        // Start and end are both today
        break
      case '7d':
        start.setDate(start.getDate() - 7)
        break
      case '30d':
        start.setDate(start.getDate() - 30)
        break
      case '90d':
        start.setDate(start.getDate() - 90)
        break
      case 'all':
        start.setFullYear(start.getFullYear() - 10) // Show all data
        break
    }

    onDateChange(start.toISOString().split('T')[0], today.toISOString().split('T')[0])
  }

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      onDateChange(customStart, customEnd)
      setShowCustom(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">{t('filterByDate')}:</span>

        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => handleRangeChange('today')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedRange === 'today' && !showCustom
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleRangeChange('7d')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedRange === '7d' && !showCustom
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('last7Days')}
          </button>
          <button
            onClick={() => handleRangeChange('30d')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedRange === '30d' && !showCustom
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('last30Days')}
          </button>
          <button
            onClick={() => handleRangeChange('90d')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedRange === '90d' && !showCustom
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('last90Days')}
          </button>
          <button
            onClick={() => handleRangeChange('all')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedRange === 'all' && !showCustom
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handleRangeChange('custom')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              selectedRange === 'custom' || showCustom
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('customRange')}
          </button>
        </div>

        {showCustom && (
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={applyCustomRange}
              disabled={!customStart || !customEnd}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {t('apply')}
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
