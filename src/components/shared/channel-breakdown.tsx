'use client'

/**
 * Channel Breakdown Chart Component
 *
 * Pie chart showing sales distribution by channel
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useLanguage } from '@/lib/language-context'

interface ChannelData {
  channel: string
  sales: number
  orders: number
}

interface ChannelBreakdownProps {
  data: ChannelData[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export function ChannelBreakdown({ data }: ChannelBreakdownProps) {
  const { t } = useLanguage()

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.sales, 0)

  // Prepare chart data
  const chartData = data.map(item => ({
    name: item.channel,
    value: item.sales,
    percentage: total > 0 ? Math.round((item.sales / total) * 100) : 0,
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-300">
            {t('sales')}: ₲{Math.round(data.value).toLocaleString()}
          </p>
          <p className="text-sm text-gray-300">
            {t('share')}: {data.percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{t('channelBreakdown')}</h3>
        <p className="text-sm text-gray-500">{t('salesByChannel')}</p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] text-gray-400">
          {t('noDataAvailable')}
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
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend with details */}
          <div className="mt-6 space-y-2">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">₲{Math.round(item.value).toLocaleString()}</span>
                  <span className="font-medium text-gray-900">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
