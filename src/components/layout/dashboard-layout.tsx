'use client'

/**
 * Dashboard Layout Wrapper - Enhanced with Transitions
 *
 * Provides consistent layout with sidebar and smooth page transitions
 */

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { LanguageToggle } from '@/components/shared/language-toggle'
import { PageTransition } from '@/components/shared/page-transition'
import { useLanguage } from '@/lib/language-context'

interface DashboardLayoutProps {
  children: ReactNode
  titleKey?: string
  subtitleKey?: string
  title?: string
  subtitle?: string
}

export function DashboardLayout({ children, titleKey, subtitleKey, title, subtitle }: DashboardLayoutProps) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="transition-all duration-300">
              {titleKey && <h1 className="text-2xl font-bold text-gray-900 animate-fade-in">{t(titleKey)}</h1>}
              {title && !titleKey && <h1 className="text-2xl font-bold text-gray-900 animate-fade-in">{title}</h1>}
              {subtitleKey && <p className="text-sm text-gray-500 mt-1 animate-fade-in" style={{ animationDelay: '100ms' }}>{t(subtitleKey)}</p>}
              {subtitle && !subtitleKey && <p className="text-sm text-gray-500 mt-1 animate-fade-in" style={{ animationDelay: '100ms' }}>{subtitle}</p>}
            </div>
            <LanguageToggle />
          </div>
        </header>

        {/* Page Content with Transition */}
        <main className="p-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
