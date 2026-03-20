/**
 * Progress Stepper Component
 *
 * Displays the 5-step visit process with completion status
 */

import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'
import { Check, Circle, Loader2 } from 'lucide-react'

export type VisitStep = 'observation' | 'operations' | 'cash' | 'product' | 'equipment'

interface StepConfig {
  key: VisitStep
  labelKey: string
  descriptionKey: string
  timeMinutes: number
}

const STEPS: StepConfig[] = [
  { key: 'observation', labelKey: 'step1Label', descriptionKey: 'step1Description', timeMinutes: 2 },
  { key: 'operations', labelKey: 'step2Label', descriptionKey: 'step2Description', timeMinutes: 3 },
  { key: 'cash', labelKey: 'step3Label', descriptionKey: 'step3Description', timeMinutes: 2 },
  { key: 'product', labelKey: 'step4Label', descriptionKey: 'step4Description', timeMinutes: 2 },
  { key: 'equipment', labelKey: 'step5Label', descriptionKey: 'step5Description', timeMinutes: 1 },
]

interface ProgressStepperProps {
  completedSteps: VisitStep[]
  currentStep?: VisitStep
  orientation?: 'horizontal' | 'vertical'
  showTime?: boolean
  showDescriptions?: boolean
  className?: string
}

export function ProgressStepper({
  completedSteps,
  currentStep,
  orientation = 'horizontal',
  showTime = true,
  showDescriptions = false,
  className,
}: ProgressStepperProps) {
  const { t } = useLanguage()

  const currentStepIndex = currentStep ? STEPS.findIndex(s => s.key === currentStep) : -1

  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    const step = STEPS[index]
    if (completedSteps.includes(step.key)) return 'completed'
    if (index === currentStepIndex) return 'current'
    return 'pending'
  }

  const totalMinutes = STEPS.reduce((sum, step) => sum + step.timeMinutes, 0)

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-1', className)}>
        {STEPS.map((step, index) => {
          const status = getStepStatus(index)
          const StepIcon = status === 'completed' ? Check : status === 'current' ? Loader2 : Circle

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0',
                  status === 'completed' && 'border-green-500 bg-green-50',
                  status === 'current' && 'border-blue-500 bg-blue-50',
                  status === 'pending' && 'border-gray-300 bg-gray-50'
                )}>
                  <StepIcon className={cn(
                    'w-4 h-4',
                    status === 'completed' && 'text-green-600',
                    status === 'current' && 'text-blue-600 animate-spin',
                    status === 'pending' && 'text-gray-400'
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      'text-sm font-medium',
                      status === 'completed' && 'text-green-700',
                      status === 'current' && 'text-blue-700',
                      status === 'pending' && 'text-gray-500'
                    )}>
                      {index + 1}. {t(step.labelKey)}
                    </p>
                    {showTime && (
                      <span className="text-xs text-gray-400">
                        {step.timeMinutes}m
                      </span>
                    )}
                  </div>
                  {showDescriptions && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t(step.descriptionKey)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>{t('visitProgress')}</span>
          <span>
            {completedSteps.length} / {STEPS.length} {t('stepsCompleted')}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / STEPS.length) * 100}%` }}
          />
        </div>
        {showTime && (
          <p className="text-xs text-gray-500 mt-1">
            {t('estimatedTime')}: ~{totalMinutes} {t('minutes')}
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const status = getStepStatus(index)
          const StepIcon = status === 'completed' ? Check : status === 'current' ? Loader2 : Circle

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2',
                  status === 'completed' && 'border-green-500 bg-green-50',
                  status === 'current' && 'border-blue-500 bg-blue-50',
                  status === 'pending' && 'border-gray-300 bg-gray-50'
                )}>
                  <StepIcon className={cn(
                    'w-5 h-5',
                    status === 'completed' && 'text-green-600',
                    status === 'current' && 'text-blue-600 animate-spin',
                    status === 'pending' && 'text-gray-400'
                  )} />
                </div>
                <div className="text-center">
                  <p className={cn(
                    'text-xs font-medium',
                    status === 'completed' && 'text-green-700',
                    status === 'current' && 'text-blue-700 font-semibold',
                    status === 'pending' && 'text-gray-500'
                  )}>
                    {t(step.labelKey)}
                  </p>
                  {showTime && (
                    <p className="text-xs text-gray-400">{step.timeMinutes}m</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-20px]',
                  status === 'completed' || (index < currentStepIndex) ? 'bg-green-500' : 'bg-gray-300'
                )} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
