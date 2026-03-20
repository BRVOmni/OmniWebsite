'use client'

/**
 * Rankings Table Component
 *
 * Table showing location or brand rankings
 */

import { Trophy } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface RankingsTableProps {
  title: string
  data: Array<{
    id: string
    name: string
    totalSales: number
    status?: 'success' | 'warning' | 'danger'
    color?: string
  }>
}

export function RankingsTable({ title, data }: RankingsTableProps) {
  const { t } = useLanguage()

  const statusIcons = {
    success: '🟢',
    warning: '🟡',
    danger: '🔴',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-2">
        {data.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No data available</p>
        ) : (
          data.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${
                  index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-orange-600' : 'text-gray-400'
                }`}>
                  #{index + 1}
                </span>
                {item.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <span className="font-medium text-gray-900">{item.name}</span>
                {item.status && (
                  <span className="text-sm">{statusIcons[item.status]}</span>
                )}
              </div>
              <span className="font-semibold text-gray-900">
                ₲{item.totalSales.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
