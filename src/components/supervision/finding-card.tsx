/**
 * Finding Card Component
 *
 * Displays an operational finding with severity indicator
 */

import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'
import { AlertTriangle, AlertCircle, AlertOctagon, Info } from 'lucide-react'

export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical'
export type FindingType = 'caja_diferencias' | 'stock_vencidos' | 'equipos_falla' | 'limpieza_deficiente' | 'personal_ausente'

interface FindingCardProps {
  title: string
  description?: string
  severity: FindingSeverity
  type?: FindingType
  category?: string
  location?: string
  date?: string | Date
  isRecurring?: boolean
  recurrenceCount?: number
  photoCount?: number
  onClick?: () => void
  className?: string
}

export function FindingCard({
  title,
  description,
  severity,
  type,
  category,
  location,
  date,
  isRecurring = false,
  recurrenceCount = 0,
  photoCount = 0,
  onClick,
  className,
}: FindingCardProps) {
  const { t } = useLanguage()

  const severityConfig: Record<FindingSeverity, { icon: typeof AlertTriangle; bgClass: string; textClass: string; borderClass: string; label: string }> = {
    low: {
      icon: Info,
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      borderClass: 'border-l-4 border-blue-500',
      label: t('severityLow'),
    },
    medium: {
      icon: AlertTriangle,
      bgClass: 'bg-yellow-50',
      textClass: 'text-yellow-700',
      borderClass: 'border-l-4 border-yellow-500',
      label: t('severityMedium'),
    },
    high: {
      icon: AlertCircle,
      bgClass: 'bg-orange-50',
      textClass: 'text-orange-700',
      borderClass: 'border-l-4 border-orange-500',
      label: t('severityHigh'),
    },
    critical: {
      icon: AlertOctagon,
      bgClass: 'bg-red-50',
      textClass: 'text-red-700',
      borderClass: 'border-l-4 border-red-500',
      label: t('severityCritical'),
    },
  }

  const config = severityConfig[severity]
  const Icon = config.icon

  const formatDate = (dateInput: string | Date) => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return d.toLocaleDateString()
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer',
        config.borderClass,
        onClick && 'hover:border-gray-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', config.bgClass)}>
          <Icon className={cn('w-5 h-5', config.textClass)} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title and badges */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-gray-900 truncate">{title}</h4>
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.bgClass, config.textClass)}>
              {config.label}
            </span>
            {isRecurring && recurrenceCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                🔁 {t('recurring')} ({recurrenceCount})
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{description}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            {category && (
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">{t('category')}:</span> {category}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">{t('location')}:</span> {location}
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">{t('date')}:</span> {formatDate(date)}
              </span>
            )}
            {photoCount > 0 && (
              <span className="inline-flex items-center gap-1">
                📷 {photoCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
