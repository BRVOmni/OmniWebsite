'use client'

/**
 * Alerts Panel Component
 *
 * Shows active alerts with severity levels
 */

import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { translateAlertText } from '@/lib/alert-translations'

interface Alert {
  id: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  location?: string
  created_at: string
}

interface AlertsPanelProps {
  alerts: Alert[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const { t, language } = useLanguage()

  const severityConfig = {
    low: {
      icon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: t('severityLow'),
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: t('severityMedium'),
    },
    high: {
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      label: t('severityHigh'),
    },
    critical: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: t('severityCritical'),
    },
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">{t('activeAlertsPanel')}</h3>
        </div>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">{t('noAlerts')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">{t('activeAlertsPanel')}</h3>
        </div>
        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity]
          const Icon = config.icon

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {translateAlertText(alert.title, language)}
                    </h4>
                    <span className={`text-xs font-medium ${config.color} ${config.bg} px-2 py-0.5 rounded`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {translateAlertText(alert.message, language)}
                  </p>
                  {alert.location && (
                    <p className="text-xs text-gray-500">📍 {alert.location}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
