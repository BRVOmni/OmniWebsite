/**
 * Visit Type Badge Component
 *
 * Displays the type of supervision visit with appropriate color coding
 */

'use client'

import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

export type VisitType = 'rapida' | 'completa' | 'sorpresa'

interface VisitTypeBadgeProps {
  type?: VisitType
  className?: string
}

export function VisitTypeBadge({ type, className }: VisitTypeBadgeProps) {
  const { t } = useLanguage()

  // Hardcoded defaults - NEVER undefined
  const typeConfig = {
    rapida: {
      label: t('visitTypeRapida'),
      bgClass: 'bg-orange-50',
      textClass: 'text-orange-700',
      icon: '⚡',
    },
    completa: {
      label: t('visitTypeCompleta'),
      bgClass: 'bg-purple-50',
      textClass: 'text-purple-700',
      icon: '📋',
    },
    sorpresa: {
      label: t('visitTypeSorpresa'),
      bgClass: 'bg-pink-50',
      textClass: 'text-pink-700',
      icon: '🎯',
    },
  } as const

  const defaultConfig = {
    label: t('visitTypeCompleta'),
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    icon: '📋',
  }

  const config = typeConfig[type as keyof typeof typeConfig] || defaultConfig

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  )
}
