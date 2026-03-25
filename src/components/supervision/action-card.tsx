'use client'

/**
 * Action Card Component
 *
 * Displays a corrective action with status, priority, and deadline tracking
 * Includes photo display and upload functionality
 */

import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, AlertCircle, Calendar, User, Image as ImageIcon, Camera } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PhotoUpload } from '@/components/supervision/photo-upload'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'verified'
export type ActionPriority = 'low' | 'medium' | 'high' | 'critical'

interface ActionCardProps {
  id?: string  // Action ID for photo upload
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
  beforePhotoUrl?: string
  afterPhotoUrl?: string
  onPhotoUploaded?: (url: string, type: 'before' | 'after') => void
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
  const { t, language } = useLanguage()
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before')

  // Normalize status and priority with validation
  const normalizedStatus = useMemo(() => {
    if (!status) return 'pending'
    const s = String(status).toLowerCase().trim()
    const validStatuses = ['pending', 'in_progress', 'completed', 'overdue', 'cancelled', 'verified']
    return validStatuses.includes(s) ? s : 'pending'
  }, [status])

  const normalizedPriority = useMemo(() => {
    if (!priority) return 'medium'
    const p = String(priority).toLowerCase().trim()
    const validPriorities = ['low', 'medium', 'high', 'critical']
    return validPriorities.includes(p) ? p : 'medium'
  }, [priority])

  // Normalize text for lookup (remove extra whitespace, line breaks)
  const normalizeText = (text: string) => {
    return text.replace(/\s+/g, ' ').trim()
  }

  // Map action descriptions to translation keys
  const getDescriptionTranslation = (originalDesc: string) => {
    const normalizedDesc = normalizeText(originalDesc)
    const descMap: Record<string, { en: string; es: string }> = {
      'Implement double cash count procedure and daily reconciliation with responsible signature.': { en: 'Implement double cash count procedure and daily reconciliation with responsible signature.', es: 'Implementar procedimiento de doble conteo de caja y conciliación diaria con firma responsable.' },
      'Implementar procedimiento de doble conteo de caja y conciliación diaria con firma responsable.': { en: 'Implement double cash count procedure and daily reconciliation with responsible signature.', es: 'Implementar procedimiento de doble conteo de caja y conciliación diaria con firma responsable.' },
      'Manager must request written authorization to leave the location. Designate a substitute.': { en: 'Manager must request written authorization to leave the location. Designate a substitute.', es: 'Gerente debe solicitar autorización por escrito para ausentarse del local. Designar suplente.' },
      'Gerente debe solicitar autorización por escrito para ausentarse del local. Designar suplente.': { en: 'Manager must request written authorization to leave the location. Designate a substitute.', es: 'Gerente debe solicitar autorización por escrito para ausentarse del local. Designar suplente.' },
      'Remove expired products, implement weekly expiration date review.': { en: 'Remove expired products, implement weekly expiration date review.', es: 'Retirar productos vencidos, implementar revisión semanal de fechas de vencimiento.' },
      'Retirar productos vencidos, implementar revisión semanal de fechas de vencimiento.': { en: 'Remove expired products, implement weekly expiration date review.', es: 'Retirar productos vencidos, implementar revisión semanal de fechas de vencimiento.' },
      'Create restroom cleaning checklist every 2 hours with signed record.': { en: 'Create restroom cleaning checklist every 2 hours with signed record.', es: 'Crear checklist de limpieza de baños cada 2 horas con registro firmado.' },
      'Crear checklist de limpieza de baños cada 2 horas con registro firmado.': { en: 'Create restroom cleaning checklist every 2 hours with signed record.', es: 'Crear checklist de limpieza de baños cada 2 horas con registro firmado.' },
      'Call refrigeration technician. Record temperature 3 times per day.': { en: 'Call refrigeration technician. Record temperature 3 times per day.', es: 'Llamar técnico de refrigeración. Registrar temperatura 3 veces por día.' },
      'Llamar técnico de refrigeración. Registrar temperatura 3 veces por día.': { en: 'Call refrigeration technician. Record temperature 3 times per day.', es: 'Llamar técnico de refrigeración. Registrar temperatura 3 veces por día.' },
      'Verify all staff have complete uniforms before starting shift.': { en: 'Verify all staff have complete uniforms before starting shift.', es: 'Verificar que todo el personal tenga uniforme completo antes de iniciar turno.' },
      'Verificar que todo el personal tenga uniforme completo antes de iniciar turno.': { en: 'Verify all staff have complete uniforms before starting shift.', es: 'Verificar que todo el personal tenga uniforme completo antes de iniciar turno.' },
      'Train staff on FIFO procedure. Place reminder signs.': { en: 'Train staff on FIFO procedure. Place reminder signs.', es: 'Capacitar al personal sobre procedimiento FIFO. Colocar carteles recordatorios.' },
      'Capacitar al personal sobre procedimiento FIFO. Colocar carteles recordatorios.': { en: 'Train staff on FIFO procedure. Place reminder signs.', es: 'Capacitar al personal sobre procedimiento FIFO. Colocar carteles recordatorios.' },
      'Request small denomination bills from bank daily. Maintain minimum change fund.': { en: 'Request small denomination bills from bank daily. Maintain minimum change fund.', es: 'Solicitar billetes de menor denominación al banco diariamente. Mantaner fondo de cambio mínimo.' },
      'Solicitar billetes de menor denominación al banco diariamente. Mantaner fondo de cambio mínimo.': { en: 'Request small denomination bills from bank daily. Maintain minimum change fund.', es: 'Solicitar billetes de menor denominación al banco diariamente. Mantaner fondo de cambio mínimo.' },
    }
    return descMap[normalizedDesc]?.[language] || originalDesc
  }

  // Memoize status config
  const statusConfig = useMemo(() => ({
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
  }), [t])

  // Memoize priority config
  const priorityConfig = useMemo(() => ({
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
  }), [t])

  // Hardcoded defaults (never depend on t)
  const defaultStatusData = {
    icon: Clock,
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-600',
    label: 'Pending',
  }

  const defaultPriorityData = {
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    label: 'Medium',
    borderClass: 'border-l-yellow-400',
  }

  // Get status data with fallback
  const effectiveStatus = (isOverdue && normalizedStatus !== 'completed') ? 'overdue' : normalizedStatus
  const statusData = statusConfig[effectiveStatus as keyof typeof statusConfig] || defaultStatusData
  const priorityData = priorityConfig[normalizedPriority as keyof typeof priorityConfig] || defaultPriorityData
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
        {getDescriptionTranslation(description)}
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

        {(hasBeforePhoto || hasAfterPhoto || beforePhotoUrl || afterPhotoUrl) && (
          <div className="flex items-center gap-2">
            {beforePhotoUrl && (
              <div
                className="w-10 h-10 rounded overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(beforePhotoUrl, '_blank')
                }}
              >
                <img
                  src={beforePhotoUrl}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {beforePhotoUrl && !hasBeforePhoto && (
              <span className="text-xs text-blue-600">📷</span>
            )}
            {afterPhotoUrl && (
              <div
                className="w-10 h-10 rounded overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(afterPhotoUrl, '_blank')
                }}
              >
                <img
                  src={afterPhotoUrl}
                  alt="After"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {afterPhotoUrl && !hasAfterPhoto && (
              <span className="text-xs text-green-600">📷</span>
            )}
            {!beforePhotoUrl && hasBeforePhoto && (
              <span className="text-xs text-blue-600">📷 {t('before')}</span>
            )}
            {!afterPhotoUrl && hasAfterPhoto && (
              <span className="text-xs text-green-600">📷 {t('after')}</span>
            )}
          </div>
        )}
      </div>

      {/* Add Photo Buttons */}
      {id && status !== 'completed' && status !== 'verified' && !onClick && (
        <div className="px-2 pb-2 pt-2 border-t flex gap-2">
          <Dialog
            open={showPhotoDialog && photoType === 'before'}
            onOpenChange={(open) => {
              setShowPhotoDialog(open)
              if (open) setPhotoType('before')
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                <Camera className="w-3 h-3 mr-1" />
                {t('before')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addBeforePhoto')}</DialogTitle>
              </DialogHeader>
              <PhotoUpload
                entityType="action"
                entityId={id}
                photoType="before"
                currentPhoto={beforePhotoUrl}
                onPhotoUploaded={(url) => {
                  onPhotoUploaded?.(url, 'before')
                  setShowPhotoDialog(false)
                }}
              />
            </DialogContent>
          </Dialog>

          {status === 'in_progress' && (
            <Dialog
              open={showPhotoDialog && photoType === 'after'}
              onOpenChange={(open) => {
                setShowPhotoDialog(open)
                if (open) setPhotoType('after')
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                  <Camera className="w-3 h-3 mr-1" />
                  {t('after')}
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addAfterPhoto')}</DialogTitle>
              </DialogHeader>
              <PhotoUpload
                entityType="action"
                entityId={id}
                photoType="after"
                currentPhoto={afterPhotoUrl}
                onPhotoUploaded={(url) => {
                  onPhotoUploaded?.(url, 'after')
                  setShowPhotoDialog(false)
                }}
              />
            </DialogContent>
          </Dialog>
          )}
        </div>
      )}
    </div>
  )
}
