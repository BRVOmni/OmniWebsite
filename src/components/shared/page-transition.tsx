'use client'

/**
 * Page Transition Component
 *
 * Wraps page content with smooth fade-in and slide-up animations
 */

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Staggered Children Animation Wrapper
 *
 * Animates children with staggered delays for a cascading effect
 */
interface StaggeredChildrenProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number // Delay between each child in ms
  startDelay?: number // Initial delay before first animation in ms
}

export function StaggeredChildren({
  children,
  className,
  staggerDelay = 100,
  startDelay = 0,
}: StaggeredChildrenProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), startDelay)
    return () => clearTimeout(timer)
  }, [startDelay])

  const childArray = Array.isArray(children) ? children : [children]

  return (
    <div className={className}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-500 ease-out',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4',
          )}
          style={{
            transitionDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

/**
 * Loading Skeleton Component
 *
 * Animated placeholder for content that's loading
 */
export function Skeleton({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'card' | 'text' | 'circular'
}) {
  const variantStyles = {
    default: 'rounded',
    card: 'rounded-xl',
    text: 'rounded-sm h-4',
    circular: 'rounded-full',
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
        'animate-shimmer',
        'bg-[length:200%_100%]',
        variantStyles[variant],
        className
      )}
    />
  )
}

/**
 * KPI Card Skeleton
 *
 * Loading state for KPI cards
 */
export function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-8 w-32" variant="text" />
        </div>
        <Skeleton className="h-10 w-10" variant="circular" />
      </div>
      <Skeleton className="h-3 w-20" variant="text" />
    </div>
  )
}

/**
 * Chart Skeleton
 *
 * Loading state for chart components
 */
export function ChartSkeleton({
  height = 'h-64',
}: {
  height?: string
}) {
  return (
    <div className={cn('bg-white rounded-xl border p-6', height)}>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32 mb-6" variant="text" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Table Skeleton
 *
 * Loading state for table components
 */
export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex gap-4">
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" variant="text" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex gap-4">
              {[...Array(cols)].map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" variant="text" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
