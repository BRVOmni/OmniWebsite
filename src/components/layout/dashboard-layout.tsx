'use client'

/**
 * Dashboard Layout Wrapper
 *
 * Provides consistent layout with sidebar for all dashboard pages
 */

import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { LanguageToggle } from '@/components/shared/language-toggle'
import { useLanguage } from '@/lib/language-context'

interface DashboardLayoutProps {
  children: ReactNode
  titleKey?: string
  subtitleKey?: string
}

export function DashboardLayout({ children, titleKey, subtitleKey }: DashboardLayoutProps) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              {titleKey && <h1 className="text-2xl font-bold text-gray-900">{t(titleKey)}</h1>}
              {subtitleKey && <p className="text-sm text-gray-500 mt-1">{t(subtitleKey)}</p>}
            </div>
            <LanguageToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
