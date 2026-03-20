'use client'

/**
 * Sidebar Navigation Component
 *
 * Main navigation for all dashboard modules
 */

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Wallet,
  MapPin,
  Package,
  AlertTriangle,
  Building2,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Settings,
  Users as UsersIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  id: string
  labelKey: string // Translation key instead of label
  icon: any
  path: string
  color: string
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      id: 'executive',
      labelKey: 'executiveSummary',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'text-blue-600'
    },
    {
      id: 'sales',
      labelKey: 'salesAnalytics',
      icon: TrendingUp,
      path: '/dashboard/sales',
      color: 'text-green-600'
    },
    {
      id: 'profitability',
      labelKey: 'profitability',
      icon: DollarSign,
      path: '/dashboard/profitability',
      color: 'text-emerald-600'
    },
    {
      id: 'cash',
      labelKey: 'cashAndClosing',
      icon: Wallet,
      path: '/dashboard/cash-closing',
      color: 'text-purple-600'
    },
    {
      id: 'locations',
      labelKey: 'locations',
      icon: MapPin,
      path: '/dashboard/locations',
      color: 'text-orange-600'
    },
    {
      id: 'products',
      labelKey: 'products',
      icon: Package,
      path: '/dashboard/products',
      color: 'text-pink-600'
    },
    {
      id: 'brands',
      labelKey: 'brands',
      icon: Building2,
      path: '/dashboard/brands',
      color: 'text-teal-600'
    },
    {
      id: 'supervision',
      labelKey: 'supervision',
      icon: ClipboardCheck,
      path: '/dashboard/supervision',
      color: 'text-orange-600'
    },
    {
      id: 'alerts',
      labelKey: 'alerts',
      icon: AlertTriangle,
      path: '/dashboard/alerts',
      color: 'text-red-600'
    },
    {
      id: 'users',
      labelKey: 'users',
      icon: UsersIcon,
      path: '/dashboard/users',
      color: 'text-gray-600'
    },
    {
      id: 'settings',
      labelKey: 'settings',
      icon: Settings,
      path: '/dashboard/settings',
      color: 'text-gray-600'
    }
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
    setMobileOpen(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r z-50
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('dashboard')}</h1>
              <p className="text-xs text-gray-500">{t('foodServiceChain')}</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden lg:block"
            title={collapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                    title={collapsed ? t(item.labelKey) : undefined}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : item.color}`} />
                    {!collapsed && (
                      <span className="font-medium text-sm truncate">{t(item.labelKey)}</span>
                    )}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          {!collapsed && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">{t('loggedInAs')}</p>
              <p className="text-sm font-medium text-gray-900 truncate">{t('adminUser')}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={collapsed ? t('signOut') : undefined}
          >
            <span className="text-gray-500">→</span>
            {!collapsed && <span>{t('signOut')}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title={t('openMenu')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  )
}
