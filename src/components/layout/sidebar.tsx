'use client'

/**
 * Sidebar Navigation Component - Enhanced with Micro-interactions
 *
 * Main navigation with smooth animations, hover effects, and active state indicators
 */

import { useState, useEffect } from 'react'
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
  Users as UsersIcon,
  Bell,
  BarChart3,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  labelKey: string // Translation key instead of label
  icon: any
  path: string
  color: string
  badge?: number // Optional notification badge
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Fetch active alerts count for badge
  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('id', { count: 'exact' })
        .eq('status', 'active')

      setAlertCount(data?.length || 0)
    }

    fetchAlerts()

    // Subscribe to alerts changes
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        () => fetchAlerts()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const navItems: NavItem[] = [
    {
      id: 'executive',
      labelKey: 'executiveSummary',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'text-blue-600',
    },
    {
      id: 'sales',
      labelKey: 'salesAnalytics',
      icon: TrendingUp,
      path: '/dashboard/sales',
      color: 'text-green-600',
    },
    {
      id: 'profitability',
      labelKey: 'profitability',
      icon: DollarSign,
      path: '/dashboard/profitability',
      color: 'text-emerald-600',
    },
    {
      id: 'cash',
      labelKey: 'cashAndClosing',
      icon: Wallet,
      path: '/dashboard/cash-closing',
      color: 'text-purple-600',
    },
    {
      id: 'locations',
      labelKey: 'locations',
      icon: MapPin,
      path: '/dashboard/locations',
      color: 'text-orange-600',
    },
    {
      id: 'products',
      labelKey: 'products',
      icon: Package,
      path: '/dashboard/products',
      color: 'text-pink-600',
    },
    {
      id: 'brands',
      labelKey: 'brands',
      icon: Building2,
      path: '/dashboard/brands',
      color: 'text-teal-600',
    },
    {
      id: 'supervision',
      labelKey: 'supervision',
      icon: ClipboardCheck,
      path: '/dashboard/supervision',
      color: 'text-orange-600',
    },
    {
      id: 'forecasting',
      labelKey: 'forecasting',
      icon: BarChart3,
      path: '/dashboard/forecasting',
      color: 'text-indigo-600',
    },
    {
      id: 'alerts',
      labelKey: 'alerts',
      icon: AlertTriangle,
      path: '/dashboard/alerts',
      color: 'text-red-600',
      badge: alertCount > 0 ? alertCount : undefined,
    },
    {
      id: 'users',
      labelKey: 'users',
      icon: UsersIcon,
      path: '/dashboard/users',
      color: 'text-gray-600',
    },
    {
      id: 'settings',
      labelKey: 'settings',
      icon: Settings,
      path: '/dashboard/settings',
      color: 'text-gray-600',
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
      {/* Mobile backdrop with blur */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white/95 backdrop-blur-lg border-r z-50
          transition-all duration-300 ease-in-out shadow-xl
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b bg-gradient-to-r from-white to-gray-50">
          {!collapsed && (
            <div className="flex items-center gap-3 animate-scale-in">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Grupo Omniprise"
                  className="w-8 h-8 object-contain transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Grupo Omniprise</h1>
                <p className="text-xs text-gray-500">{t('foodServiceChain')}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="relative mx-auto">
              <img
                src="/logo.png"
                alt="Grupo Omniprise"
                className="w-8 h-8 object-contain transition-transform duration-300 hover:scale-110"
              />
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse-glow" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-2 hover:bg-gray-100 rounded-lg transition-all duration-300',
              'hidden lg:block hover:scale-110 active:scale-95',
              'hover:shadow-md'
            )}
            title={collapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600 transition-transform duration-300" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 transition-transform duration-300" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 lg:hidden hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <ul className="space-y-1 px-3">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
              const isHovered = hoveredItem === item.id

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.path)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'transition-all duration-200 relative overflow-hidden',
                      'group',
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                        : 'hover:bg-gray-100 text-gray-700',
                      'hover:shadow-md'
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                    title={collapsed ? t(item.labelKey) : undefined}
                  >
                    {/* Hover glow effect */}
                    {isHovered && !isActive && (
                      <div className={cn(
                        'absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent',
                        'animate-shimmer bg-[length:200%_100%]',
                      )} />
                    )}

                    {/* Active indicator with glow */}
                    {isActive && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full shadow-lg shadow-blue-400/50" />
                    )}

                    {/* Icon container with animation */}
                    <div className={cn(
                      'relative flex-shrink-0 transition-all duration-300',
                      isActive || isHovered ? 'scale-110' : 'scale-100',
                    )}>
                      <Icon className={cn(
                        'w-5 h-5 transition-colors duration-300',
                        isActive ? 'text-blue-600' : item.color,
                        isHovered && !isActive && 'scale-110',
                      )} />

                      {/* Icon glow on hover */}
                      {(isActive || isHovered) && (
                        <div className={cn(
                          'absolute inset-0 blur-md opacity-50 rounded-full',
                          isActive ? 'bg-blue-400' : 'bg-gray-400',
                        )} />
                      )}
                    </div>

                    {/* Label with animation */}
                    {!collapsed && (
                      <span className={cn(
                        'font-medium text-sm truncate transition-all duration-300',
                        isActive || isHovered ? 'translate-x-1' : 'translate-x-0',
                      )}>
                        {t(item.labelKey)}
                      </span>
                    )}

                    {/* Badge with pulse animation */}
                    {!collapsed && item.badge && (
                      <span className={cn(
                        'ml-auto flex items-center justify-center',
                        'min-w-5 h-5 px-1.5 text-xs font-bold rounded-full',
                        'bg-red-500 text-white shadow-md',
                        'animate-pulse-glow',
                      )}>
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed badge indicator */}
                    {collapsed && item.badge && (
                      <span className={cn(
                        'absolute top-1 right-1',
                        'w-2.5 h-2.5 bg-red-500 rounded-full',
                        'animate-pulse-glow border-2 border-white',
                      )} />
                    )}

                    {/* Active state dot */}
                    {isActive && !collapsed && !item.badge && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-white">
          {!collapsed && (
            <div className="mb-3 animate-fade-in">
              <p className="text-xs text-gray-500 mb-1">{t('loggedInAs')}</p>
              <p className="text-sm font-medium text-gray-900 truncate">{t('adminUser')}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2',
              'text-sm text-gray-700 hover:bg-red-50 hover:text-red-700',
              'rounded-lg transition-all duration-300',
              'hover:shadow-md hover:scale-[1.02]',
              'active:scale-[0.98]',
            )}
            title={collapsed ? t('signOut') : undefined}
          >
            <span className="text-gray-500 transition-colors duration-300 group-hover:text-red-600">→</span>
            {!collapsed && (
              <span className="font-medium">{t('signOut')}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile menu button with enhanced animation */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          'lg:hidden fixed bottom-4 right-4 z-50',
          'p-4 bg-gradient-to-br from-blue-600 to-blue-700',
          'text-white rounded-full shadow-xl',
          'hover:shadow-2xl hover:scale-110',
          'active:scale-95',
          'transition-all duration-300',
          'animate-bounce-slight',
        )}
        title={t('openMenu')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-md animate-pulse" />
      </button>
    </>
  )
}
