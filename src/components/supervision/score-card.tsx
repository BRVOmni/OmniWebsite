/**
 * Score Card Component
 *
 * Displays a supervision score with traffic light classification
 */

import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

export type ScoreClassification = 'excelente' | 'bueno' | 'regular' | 'critico'

interface ScoreCardProps {
  score: number
  classification?: ScoreClassification
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showTrend?: boolean
  previousScore?: number
  className?: string
}

export function ScoreCard({
  score,
  classification,
  label,
  size = 'md',
  showTrend = false,
  previousScore,
  className,
}: ScoreCardProps) {
  const { t } = useLanguage()

  // Auto-classify based on score if not provided
  const autoClassification: ScoreClassification = score >= 90 ? 'excelente' : score >= 70 ? 'bueno' : score >= 50 ? 'regular' : 'critico'
  const finalClassification = classification || autoClassification

  const classificationConfig: Record<ScoreClassification, { label: string; bgClass: string; textClass: string; borderClass: string; icon: string }> = {
    excelente: {
      label: t('classificationExcelente'),
      bgClass: 'bg-green-50',
      textClass: 'text-green-700',
      borderClass: 'border-green-200',
      icon: '🟢',
    },
    bueno: {
      label: t('classificationBueno'),
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-200',
      icon: '🔵',
    },
    regular: {
      label: t('classificationRegular'),
      bgClass: 'bg-yellow-50',
      textClass: 'text-yellow-700',
      borderClass: 'border-yellow-200',
      icon: '🟡',
    },
    critico: {
      label: t('classificationCritico'),
      bgClass: 'bg-red-50',
      textClass: 'text-red-700',
      borderClass: 'border-red-200',
      icon: '🔴',
    },
  }

  const config = classificationConfig[finalClassification]

  // Calculate trend
  const trend = showTrend && previousScore !== undefined ? score - previousScore : undefined

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const scoreSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  return (
    <div
      className={cn(
        'rounded-xl border-2 shadow-sm',
        config.bgClass,
        config.borderClass,
        sizeClasses[size],
        className
      )}
    >
      {label && (
        <p className="text-xs font-medium uppercase tracking-wide text-gray-600 mb-1">
          {label}
        </p>
      )}

      <div className="flex items-center gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1">
          <p className={cn('font-bold', config.textClass, scoreSizeClasses[size])}>
            {score.toFixed(1)}%
          </p>
          <p className={cn('text-xs font-semibold uppercase', config.textClass)}>
            {config.label}
          </p>
        </div>

        {trend !== undefined && (
          <div className={cn(
            'text-sm font-semibold',
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
          )}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  )
}
