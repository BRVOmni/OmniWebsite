'use client'

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
  onClick,
  className,
}: FindingCardProps) {
  const { t, language } = useLanguage()

  // Normalize severity - handle undefined, null, or unexpected values
  const normalizedSeverity = severity ? String(severity).toLowerCase().trim() as FindingSeverity : 'medium'

  // Map finding titles to translation keys
  const getTitleTranslation = (originalTitle: string) => {
    const titleMap: Record<string, { en: string; es: string }> = {
      'Significant cash difference': { en: 'Significant cash difference', es: 'Caja con diferencia significativa' },
      'Caja con diferencia significativa': { en: 'Significant cash difference', es: 'Caja con diferencia significativa' },
      'Expired products on sale': { en: 'Expired products on sale', es: 'Productos vencidos en venta' },
      'Productos vencidos en venta': { en: 'Expired products on sale', es: 'Productos vencidos en venta' },
      'Restrooms not properly cleaned': { en: 'Restrooms not properly cleaned', es: 'Baños sin limpieza adecuada' },
      'Baños sin limpieza adecuada': { en: 'Restrooms not properly cleaned', es: 'Baños sin limpieza adecuada' },
      'Refrigeration chamber temperature too high': { en: 'Refrigeration chamber temperature too high', es: 'Cámara de refrigeración con temperatura alta' },
      'Cámara de refrigeración con temperatura alta': { en: 'Refrigeration chamber temperature too high', es: 'Cámara de refrigeración con temperatura alta' },
      'Staff without complete uniforms': { en: 'Staff without complete uniforms', es: 'Personal sin uniforme completo' },
      'Personal sin uniforme completo': { en: 'Staff without complete uniforms', es: 'Personal sin uniforme completo' },
      'Dining area disorganized': { en: 'Dining area disorganized', es: 'Área de comedor desordenada' },
      'Área de comedor desordenada': { en: 'Dining area disorganized', es: 'Área de comedor desordenada' },
      'FIFO not properly applied': { en: 'FIFO not properly applied', es: 'FIFO no aplicado correctamente' },
      'FIFO no aplicado correctamente': { en: 'FIFO not properly applied', es: 'FIFO no aplicado correctamente' },
      'Missing small denomination bills': { en: 'Missing small denomination bills', es: 'Faltante de billetes de menor denominación' },
      'Faltante de billetes de menor denominación': { en: 'Missing small denomination bills', es: 'Faltante de billetes de menor denominación' },
      'Kitchen floor with grease residue': { en: 'Kitchen floor with grease residue', es: 'Piso de cocina con residuos de grasa' },
      'Piso de cocina con residuos de grasa': { en: 'Kitchen floor with grease residue', es: 'Piso de cocina con residuos de grasa' },
      'Manager not present during shift': { en: 'Manager not present during shift', es: 'Gerente no presente en turno' },
      'Gerente no presente en turno': { en: 'Manager not present during shift', es: 'Gerente no presente en turno' },
    }
    return titleMap[originalTitle]?.[language] || originalTitle
  }

  // Map finding descriptions to translation keys
  const getDescriptionTranslation = (originalDesc: string) => {
    const descMap: Record<string, { en: string; es: string }> = {
      'A difference of 500,000 Gs. was found in the cash count without documented justification.': { en: 'A difference of 500,000 Gs. was found in the cash count without documented justification.', es: 'Se encontró una diferencia de 500.000 Gs. en el conteo de caja sin justificación documentada.' },
      'Se encontró una diferencia de 500.000 Gs. en el conteo de caja sin justificación documentada.': { en: 'A difference of 500,000 Gs. was found in the cash count without documented justification.', es: 'Se encontró una diferencia de 500.000 Gs. en el conteo de caja sin justificación documentada.' },
      '3 products with expired dates found in the sales area.': { en: '3 products with expired dates found in the sales area.', es: 'Se encontraron 3 productos con fecha de vencimiento superada en el área de venta.' },
      'Se encontraron 3 productos con fecha de vencimiento superada en el área de venta.': { en: '3 products with expired dates found in the sales area.', es: 'Se encontraron 3 productos con fecha de vencimiento superada en el área de venta.' },
      'Restrooms lack proper cleaning and toilet paper during the morning shift.': { en: 'Restrooms lack proper cleaning and toilet paper during the morning shift.', es: 'Los baños presentan falta de limpieza y papel higiénico en el turno de la mañana.' },
      'Los baños presentan falta de limpieza y papel higiénico en el turno de la mañana.': { en: 'Restrooms lack proper cleaning and toilet paper during the morning shift.', es: 'Los baños presentan falta de limpieza y papel higiénico en el turno de la mañana.' },
      'The refrigeration chamber registered 6°C when it should be 4°C or less.': { en: 'The refrigeration chamber registered 6°C when it should be 4°C or less.', es: 'La cámara de refrigeración registró 6°C cuando debería estar a 4°C o menos.' },
      'La cámara de refrigeración registró 6°C cuando debería estar a 4°C o menos.': { en: 'The refrigeration chamber registered 6°C when it should be 4°C or less.', es: 'La cámara de refrigeración registró 6°C cuando debería estar a 4°C o menos.' },
      '3 employees without complete uniforms and without visible identification.': { en: '3 employees without complete uniforms and without visible identification.', es: '3 empleados sin uniforme completo y sin identificación visible.' },
      '3 empleados sin uniforme completo y sin identificación visible.': { en: '3 employees without complete uniforms and without visible identification.', es: '3 empleados sin uniforme completo y sin identificación visible.' },
      'Tables not organized and dirty after the lunch peak.': { en: 'Tables not organized and dirty after the lunch peak.', es: 'Mesas no organizadas y sucias después del pico del almuerzo.' },
      'Mesas no organizadas y sucias después del pico del almuerzo.': { en: 'Tables not organized and dirty after the lunch peak.', es: 'Mesas no organizadas y sucias después del pico del almuerzo.' },
      'New products placed in front of older products.': { en: 'New products placed in front of older products.', es: 'Productos nuevos colocados adelante de productos más antiguos.' },
      'Productos nuevos colocados adelante de productos más antiguos.': { en: 'New products placed in front of older products.', es: 'Productos nuevos colocados adelante de productos más antiguos.' },
      'Cash register without small denomination bills to give correct change.': { en: 'Cash register without small denomination bills to give correct change.', es: 'Caja sin billetes de menor denominación para dar cambio correcto.' },
      'Caja sin billetes de menor denominación para dar cambio correcto.': { en: 'Cash register without small denomination bills to give correct change.', es: 'Caja sin billetes de menor denominación para dar cambio correcto.' },
      'Kitchen area with grease residue on the floor behind the fryers.': { en: 'Kitchen area with grease residue on the floor behind the fryers.', es: 'Área de cocina con residuos de grasa en el piso detrás de los freidores.' },
      'Área de cocina con residuos de grasa en el piso detrás de los freidores.': { en: 'Kitchen area with grease residue on the floor behind the fryers.', es: 'Área de cocina con residuos de grasa en el piso detrás de los freidores.' },
      'Location manager not present during the morning shift without authorization.': { en: 'Location manager not present during the morning shift without authorization.', es: 'Gerente de local no presente durante el turno de la mañana sin autorización.' },
      'Gerente de local no presente durante el turno de la mañana sin autorización.': { en: 'Location manager not present during the morning shift without authorization.', es: 'Gerente de local no presente durante el turno de la mañana sin autorización.' },
    }
    return descMap[originalDesc]?.[language] || originalDesc
  }

  // Map Spanish categories from database to translation keys
  const getCategoryTranslation = (cat: string) => {
    const categoryMap: Record<string, string> = {
      'Liderazgo': 'categoryLeadership',
      'Orden': 'categoryOrder',
      'Caja': 'categoryCash',
      'Stock': 'categoryStock',
      'Limpieza': 'categoryCleanliness',
      'Equipos': 'categoryEquipment',
      'Leadership': 'categoryLeadership',
      'Order': 'categoryOrder',
      'Cash Management': 'categoryCash',
      'Inventory': 'categoryStock',
      'Cleanliness': 'categoryCleanliness',
      'Equipment': 'categoryEquipment',
    }
    const key = categoryMap[cat] || cat
    return t(key as any)
  }

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

  const config = severityConfig[normalizedSeverity] || severityConfig.medium
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
            <h4 className="font-semibold text-gray-900 truncate">{getTitleTranslation(title)}</h4>
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
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{getDescriptionTranslation(description)}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            {category && (
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">{t('category')}:</span> {getCategoryTranslation(category)}
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
          </div>
        </div>
      </div>
    </div>
  )
}
