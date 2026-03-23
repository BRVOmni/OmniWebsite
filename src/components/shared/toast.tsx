'use client'

/**
 * Toast Notification System
 *
 * Beautiful, animated toast notifications for user feedback
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, type, title, message, duration }

    setToasts(prev => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const success = useCallback((title: string, message?: string) => {
    showToast('success', title, message)
  }, [showToast])

  const error = useCallback((title: string, message?: string) => {
    showToast('error', title, message, 8000) // Errors stay longer
  }, [showToast])

  const warning = useCallback((title: string, message?: string) => {
    showToast('warning', title, message)
  }, [showToast])

  const info = useCallback((title: string, message?: string) => {
    showToast('info', title, message)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          index={index}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
  index: number
}

function ToastItem({ toast, onRemove, index }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const interval = 50
      const step = 100 / (toast.duration / interval)
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev <= step) {
            clearInterval(timer)
            return 0
          }
          return prev - step
        })
      }, interval)

      return () => clearInterval(timer)
    }
  }, [toast.duration])

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      progressBar: 'bg-green-500',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-gradient-to-r from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      progressBar: 'bg-red-500',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      progressBar: 'bg-yellow-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-r from-blue-50 to-sky-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      progressBar: 'bg-blue-500',
    },
  }

  const config = typeConfig[toast.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'pointer-events-auto max-w-md w-full',
        'transition-all duration-300 ease-out',
        isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100',
        'animate-slide-in',
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border shadow-lg',
          'transition-all duration-300',
          'hover:shadow-xl hover:scale-[1.02]',
          config.bgColor,
          config.borderColor,
        )}
      >
        {/* Progress bar */}
        {toast.duration && toast.duration > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200/50">
            <div
              className={cn('h-full transition-all duration-75 ease-linear', config.progressBar)}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 p-1 rounded-lg',
            'bg-white/50 backdrop-blur-sm',
            'transition-transform duration-300',
            'hover:scale-110',
          )}>
            <Icon className={cn('w-5 h-5', config.iconColor)} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{toast.title}</p>
            {toast.message && (
              <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleRemove}
            className={cn(
              'flex-shrink-0 p-1 rounded-lg',
              'text-gray-400 hover:text-gray-600',
              'hover:bg-white/50',
              'transition-all duration-200',
              'hover:scale-110',
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle border glow */}
        <div className={cn(
          'absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent',
          'transition-all duration-300 opacity-50',
          config.iconColor,
        )} />
      </div>
    </div>
  )
}

/**
 * Toast with Action Button
 *
 * Extended toast component with optional action button
 */
export interface ToastWithAction extends Toast {
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToastWithAction() {
  const { showToast } = useToast()

  const showActionToast = useCallback((
    type: ToastType,
    title: string,
    action: { label: string; onClick: () => void },
    message?: string,
    duration = 6000
  ) => {
    const id = Math.random().toString(36).substring(2, 9)
    // You can extend this to support action buttons
    showToast(type, title, message, duration)
  }, [showToast])

  return { showActionToast }
}
