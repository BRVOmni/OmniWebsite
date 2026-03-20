/**
 * Checklist Item Component
 *
 * Individual checklist item with pass/fail toggle and optional notes
 */

import { useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'
import { Check, X, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react'

interface ChecklistItemProps {
  id: string
  name: string
  nameEs?: string
  description?: string
  compliant?: boolean
  isCritical?: boolean
  notes?: string
  onCompliantChange?: (compliant: boolean) => void
  onNotesChange?: (notes: string) => void
  disabled?: boolean
  showNotes?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ChecklistItem({
  id,
  name,
  nameEs,
  description,
  compliant = undefined,
  isCritical = false,
  notes = '',
  onCompliantChange,
  onNotesChange,
  disabled = false,
  showNotes = true,
  size = 'md',
  className,
}: ChecklistItemProps) {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const [internalNotes, setInternalNotes] = useState(notes)
  const [internalCompliant, setInternalCompliant] = useState<boolean | undefined>(compliant)

  const handleCompliantChange = (value: boolean) => {
    if (disabled) return
    setInternalCompliant(value)
    if (onCompliantChange) {
      onCompliantChange(value)
    }
  }

  const handleNotesChange = (value: string) => {
    setInternalNotes(value)
    if (onNotesChange) {
      onNotesChange(value)
    }
  }

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg',
  }

  const buttonSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const currentCompliant = compliant !== undefined ? compliant : internalCompliant

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 transition-all',
      currentCompliant === true && 'border-green-200 bg-green-50/30',
      currentCompliant === false && 'border-red-200 bg-red-50/30',
      isCritical && 'border-l-4 border-l-orange-500',
      sizeClasses[size],
      className
    )}>
      {/* Main content */}
      <div className="flex items-start gap-3">
        {/* Critical indicator */}
        {isCritical && (
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
        )}

        {/* Item name and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              'font-medium text-gray-900',
              currentCompliant === true && 'text-green-700',
              currentCompliant === false && 'text-red-700'
            )}>
              {name}
              {nameEs && <span className="text-gray-400 font-normal"> / {nameEs}</span>}
            </p>
            {isCritical && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                {t('critical')}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>

        {/* Pass/Fail buttons */}
        {onCompliantChange && !disabled && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCompliantChange(true)}
              className={cn(
                'flex items-center justify-center rounded-full border-2 transition-colors',
                buttonSizeClasses[size],
                currentCompliant === true
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-green-300 text-green-300 hover:border-green-400 hover:bg-green-50'
              )}
              aria-label={t('pass')}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCompliantChange(false)}
              className={cn(
                'flex items-center justify-center rounded-full border-2 transition-colors',
                buttonSizeClasses[size],
                currentCompliant === false
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-red-300 text-red-300 hover:border-red-400 hover:bg-red-50'
              )}
              aria-label={t('fail')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Expand button for notes */}
        {showNotes && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Notes section */}
      {showNotes && expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <label htmlFor={`notes-${id}`} className="block text-xs font-medium text-gray-600 mb-1">
            {t('notes')} {isCritical && <span className="text-orange-600">({t('requiredIfNonCompliant')})</span>}
          </label>
          <textarea
            id={`notes-${id}`}
            value={onNotesChange ? notes : internalNotes}
            onChange={(e) => onNotesChange ? onNotesChange(e.target.value) : handleNotesChange(e.target.value)}
            placeholder={t('addNotesPlaceholder')}
            rows={2}
            disabled={disabled}
            className={cn(
              'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none',
              disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed'
            )}
          />
        </div>
      )}

      {/* Warning if non-compliant and critical with no notes */}
      {isCritical && currentCompliant === false && !internalNotes && (
        <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
          <AlertTriangle className="w-3 h-3" />
          <span>{t('criticalItemRequiresNotes')}</span>
        </div>
      )}
    </div>
  )
}
