'use client'

/**
 * Payment Method Breakdown Chart Component
 *
 * Bar chart showing sales distribution by payment method
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useLanguage } from '@/lib/language-context'

interface PaymentData {
  method: string
  sales: number
  orders: number
}

interface PaymentBreakdownProps {
  data: PaymentData[]
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export function PaymentBreakdown({ data }: PaymentBreakdownProps) {
  const { t } = useLanguage()

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.sales, 0)

  // Prepare chart data
  const chartData = data.map(item => ({
    name: item.method,
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
        <h3 className="text-lg font-semibold text-gray-900">{t('paymentBreakdown')}</h3>
        <p className="text-sm text-gray-500">{t('salesByPaymentMethod')}</p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] text-gray-400">
          {t('noDataAvailable')}
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `₲${Math.round(value / 1000)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
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
