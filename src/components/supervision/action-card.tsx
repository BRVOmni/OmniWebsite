/**
 * Action Card Component
 *
 * Displays a corrective action with status, priority, and deadline tracking
 */

import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, AlertCircle, Calendar, User } from 'lucide-react'

export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'verified'
export type ActionPriority = 'low' | 'medium' | 'high' | 'critical'

interface ActionCardProps {
  description: string
  status: ActionStatus
  priority: ActionPriority
  responsiblePerson?: string
  responsibleRole?: string
  committedDate?: string | Date
  actualCompletionDate?: string | Date
  isOverdue?: boolean
  daysOverdue?: number
  hasBeforePhoto?: boolean
  hasAfterPhoto?: boolean
  onClick?: () => void
  className?: string
}

export function ActionCard({
  description,
  status,
  priority,
  responsiblePerson,
  responsibleRole,
  committedDate,
  actualCompletionDate,
  isOverdue = false,
  daysOverdue = 0,
  hasBeforePhoto = false,
  hasAfterPhoto = false,
  onClick,
  className,
}: ActionCardProps) {
  const { t } = useLanguage()

  const statusConfig: Record<ActionStatus, { icon: typeof CheckCircle2; bgClass: string; textClass: string; label: string }> = {
    pending: {
      icon: Clock,
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-600',
      label: t('actionStatusPending'),
    },
    in_progress: {
      icon: Clock,
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-600',
      label: t('actionStatusInProgress'),
    },
    completed: {
      icon: CheckCircle2,
      bgClass: 'bg-green-50',
      textClass: 'text-green-600',
      label: t('actionStatusCompleted'),
    },
    overdue: {
      icon: AlertCircle,
      bgClass: 'bg-red-50',
      textClass: 'text-red-600',
      label: t('actionStatusOverdue'),
    },
    cancelled: {
      icon: AlertCircle,
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-400',
      label: t('actionStatusCancelled'),
    },
    verified: {
      icon: CheckCircle2,
      bgClass: 'bg-green-50',
      textClass: 'text-green-700',
      label: t('actionStatusVerified'),
    },
  }

  const priorityConfig: Record<ActionPriority, { bgClass: string; textClass: string; label: string; borderClass: string }> = {
    low: {
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      label: t('priorityLow'),
      borderClass: 'border-l-blue-400',
    },
    medium: {
      bgClass: 'bg-yellow-50',
      textClass: 'text-yellow-700',
      label: t('priorityMedium'),
      borderClass: 'border-l-yellow-400',
    },
    high: {
      bgClass: 'bg-orange-50',
      textClass: 'text-orange-700',
      label: t('priorityHigh'),
      borderClass: 'border-l-orange-400',
    },
    critical: {
      bgClass: 'bg-red-50',
      textClass: 'text-red-700',
      label: t('priorityCritical'),
      borderClass: 'border-l-red-400',
    },
  }

  const statusData = statusConfig[isOverdue && status !== 'completed' ? 'overdue' : status]
  const priorityData = priorityConfig[priority]
  const StatusIcon = statusData.icon

  const formatDate = (dateInput: string | Date) => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return d.toLocaleDateString()
  }

  const getDaysUntilDeadline = () => {
    if (!committedDate) return null
    const deadline = typeof committedDate === 'string' ? new Date(committedDate) : committedDate
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntil = getDaysUntilDeadline()

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 p-4 hover:shadow-md transition-shadow cursor-pointer',
        priorityData.borderClass,
        isOverdue && 'bg-red-50/30',
        onClick && 'hover:border-gray-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg', statusData.bgClass)}>
            <StatusIcon className={cn('w-4 h-4', statusData.textClass)} />
          </div>
          <span className={cn('text-xs font-semibold uppercase', statusData.textClass)}>
            {statusData.label}
          </span>
        </div>

        <span className={cn('inline-flex items-center px-2 py-1 rounded text-xs font-semibold', priorityData.bgClass, priorityData.textClass)}>
          {priorityData.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">
        {description}
      </p>

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
        {responsiblePerson && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{responsiblePerson}</span>
            {responsibleRole && (
              <span className="text-gray-400">({responsibleRole})</span>
            )}
          </div>
        )}

        {committedDate && status !== 'completed' && status !== 'verified' && (
          <div className={cn('flex items-center gap-1', daysUntil !== null && daysUntil < 0 && 'text-red-600 font-semibold')}>
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {t('deadline')}: {formatDate(committedDate)}
              {daysUntil !== null && daysUntil < 0 && ` (${t('overdue')}: ${Math.abs(daysUntil)}d)`}
              {daysUntil !== null && daysUntil === 0 && ` (${t('today')})`}
              {daysUntil !== null && daysUntil > 0 && daysUntil <= 3 && ` (${daysUntil}d)`}
            </span>
          </div>
        )}

        {actualCompletionDate && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('completed')}: {formatDate(actualCompletionDate)}</span>
          </div>
        )}

        {(hasBeforePhoto || hasAfterPhoto) && (
          <span className="flex items-center gap-1">
            {hasBeforePhoto && '📷 Before'}
            {hasBeforePhoto && hasAfterPhoto && ' → '}
            {hasAfterPhoto && 'After 📷'}
          </span>
        )}
      </div>
    </div>
  )
}
