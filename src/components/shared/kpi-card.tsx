'use client'

/**
 * KPI Card Component - Enhanced with Animations
 *
 * Reusable card for displaying Key Performance Indicators with smooth animations
 */

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  status?: 'success' | 'warning' | 'danger' | 'neutral'
  tooltip?: string
  className?: string
  prefix?: string
  suffix?: string
  delay?: number // Stagger animation delay in ms
}

// Animated number counter component
function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 1000,
}: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    const startValue = 0
    const endValue = value

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (endValue - startValue) * easeOutQuart

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{Math.round(displayValue).toLocaleString()}{suffix}
    </span>
  )
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  status = 'neutral',
  tooltip,
  className,
  prefix = '',
  suffix = '',
  delay = 0,
}: KPICardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^\d.-]/g, '')) || 0
  const isAnimated = typeof value === 'number' || (typeof value === 'string' && !isNaN(numericValue))

  const statusColors = {
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-700',
    warning: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 text-yellow-700',
    danger: 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 text-red-700',
    neutral: 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 text-slate-700',
  }

  const statusIcons = {
    success: '🟢',
    warning: '🟡',
    danger: '🔴',
    neutral: '',
  }

  const statusGlow = {
    success: 'shadow-green-200/50',
    warning: 'shadow-yellow-200/50',
    danger: 'shadow-red-200/50',
    neutral: 'shadow-slate-200/50',
  }

  return (
    <div
      className={cn(
        'relative group rounded-xl border p-6',
        'transition-all duration-300 ease-out',
        'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1',
        'animate-fade-in',
        statusColors[status],
        statusGlow[status],
        isHovered && 'shadow-2xl',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip */}
      {tooltip && (
        <div className="group/tooltip absolute top-3 right-3 z-10">
          <div className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-help transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute right-0 top-7 w-64 p-3 bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-1 group-hover/tooltip:translate-y-0">
            {tooltip}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
            {title}
            {status !== 'neutral' && (
              <span className="inline-flex animate-bounce-slight">{statusIcons[status]}</span>
            )}
          </p>
        </div>
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg transition-all duration-300',
            'bg-white/50 backdrop-blur-sm',
            'group-hover:bg-white group-hover:scale-110',
          )}>
            <Icon className={cn(
              'w-5 h-5 transition-colors duration-300',
              status === 'success' && 'text-green-600 group-hover:text-green-700',
              status === 'warning' && 'text-yellow-600 group-hover:text-yellow-700',
              status === 'danger' && 'text-red-600 group-hover:text-red-700',
              status === 'neutral' && 'text-gray-500 group-hover:text-gray-600',
            )} />
          </div>
        )}
      </div>

      {/* Value with animation */}
      <p className="text-3xl font-bold text-gray-900 mb-3 tabular-nums">
        {isAnimated ? (
          <AnimatedNumber value={numericValue} prefix={prefix} suffix={suffix} />
        ) : (
          <>{prefix}{value}{suffix}</>
        )}
      </p>

      {/* Trend with animation */}
      {trend && (
        <div className={cn(
          'flex items-center gap-1.5 text-sm font-medium transition-all duration-300',
          'opacity-0 translate-y-2 animate-fade-in',
        )}
        style={{ animationDelay: `${delay + 200}ms`, animationFillMode: 'forwards' }}>
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
            trend.isPositive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          )}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}

      {/* Subtle border accent on hover */}
      <div className={cn(
        'absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent transition-all duration-300',
        status === 'success' && 'text-green-400',
        status === 'warning' && 'text-yellow-400',
        status === 'danger' && 'text-red-400',
        status === 'neutral' && 'text-gray-300',
        isHovered ? 'w-full' : 'w-0',
      )} />
    </div>
  )
}
