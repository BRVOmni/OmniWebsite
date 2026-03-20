/**
 * Visit Status Badge Component
 *
 * Displays the status of a supervision visit with appropriate styling
 */

import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'

export type VisitStatus = 'pending' | 'in_progress' | 'completed' | 'missed' | 'cancelled'

interface VisitStatusBadgeProps {
  status: VisitStatus
  className?: string
}

export function VisitStatusBadge({ status, className }: VisitStatusBadgeProps) {
  const { t } = useLanguage()

  const statusConfig: Record<VisitStatus, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
    pending: {
      label: t('visitStatusPending'),
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      dotClass: 'bg-blue-500',
    },
    in_progress: {
      label: t('visitStatusInProgress'),
      bgClass: 'bg-yellow-50',
      textClass: 'text-yellow-700',
      dotClass: 'bg-yellow-500',
    },
    completed: {
      label: t('visitStatusCompleted'),
      bgClass: 'bg-green-50',
      textClass: 'text-green-700',
      dotClass: 'bg-green-500',
    },
    missed: {
      label: t('visitStatusMissed'),
      bgClass: 'bg-red-50',
      textClass: 'text-red-700',
      dotClass: 'bg-red-500',
    },
    cancelled: {
      label: t('visitStatusCancelled'),
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-700',
      dotClass: 'bg-gray-500',
    },
  }

  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  )
}
