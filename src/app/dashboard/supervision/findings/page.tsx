'use client'

/**
 * Findings Management Page
 *
 * View and manage operational findings from supervision visits.
 * Filter by severity, type, category, location, date.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FindingCard } from '@/components/supervision/finding-card'
import { VisitTypeBadge } from '@/components/supervision/visit-type-badge'
import {
  AlertTriangle,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react'

// Data Types
interface LocationInfo {
  id: string
  name: string
  cities?: {
    name: string
  } | null
}

interface FindingData {
  id: string
  severity: string
  finding_type: string
  title: string
  description: string
  category: string
  category_id: string
  is_recurring: boolean
  recurrence_count: number
  photos: string[]
  status: string
  created_at: string
  visit_id: string
  supervision_visits: {
    visit_date: string
    visit_type: string
    location_id: string
    locations: LocationInfo
  } | null
}

export default function FindingsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [findings, setFindings] = useState<FindingData[]>([])
  const [locations, setLocations] = useState<LocationInfo[]>([])

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all') // active, recurring, resolved
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      await Promise.all([
        loadFindings(),
        loadLocations(),
      ])
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadFindings = async () => {
    const { data } = await supabase
      .from('operational_findings')
      .select(`
        id,
        severity,
        finding_type,
        title,
        description,
        category,
        category_id,
        is_recurring,
        recurrence_count,
        photos,
        status,
        created_at,
        visit_id,
        supervision_visits (
          visit_date,
          visit_type,
          location_id,
          locations (
            id,
            name,
            cities (
              name
            )
          )
        )
      `)
      .order('created_at', { ascending: false })

    setFindings(data as unknown as FindingData[] || [])
  }

  const loadLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name, cities(name)')
      .eq('is_active', true)
      .order('name')

    setLocations(data as unknown as LocationInfo[] || [])
  }

  // Filter findings
  const filteredFindings = useMemo(() => {
    return findings.filter(finding => {
      // Severity filter
      if (severityFilter !== 'all' && finding.severity !== severityFilter) return false

      // Type filter
      if (typeFilter !== 'all' && finding.finding_type !== typeFilter) return false

      // Category filter
      if (categoryFilter !== 'all' && !finding.category?.includes(categoryFilter)) return false

      // Location filter
      if (locationFilter !== 'all' && finding.supervision_visits?.location_id !== locationFilter) return false

      // Status filter
      if (statusFilter === 'recurring' && !finding.is_recurring) return false
      if (statusFilter === 'active' && finding.is_recurring) return false

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          finding.title.toLowerCase().includes(query) ||
          finding.description?.toLowerCase().includes(query) ||
          finding.supervision_visits?.locations?.name.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [findings, severityFilter, typeFilter, categoryFilter, locationFilter, statusFilter, searchQuery])

  // Calculate statistics
  const stats = useMemo(() => {
    // Get all unique finding types
    const findingTypes = [...new Set(findings.map(f => f.finding_type))]
    const byType: Record<string, number> = {}
    findingTypes.forEach(type => {
      byType[type] = findings.filter(f => f.finding_type === type).length
    })

    return {
      total: findings.length,
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      recurring: findings.filter(f => f.is_recurring).length,
      byType,
    }
  }, [findings])

  const clearFilters = () => {
    setSeverityFilter('all')
    setTypeFilter('all')
    setCategoryFilter('all')
    setLocationFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('findings')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('manageFindingsDescription')}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadFindings}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('refresh')}
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1">{t('totalFindings')}</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <div className="text-sm text-red-600 mb-1">{t('severityCritical')}</div>
            <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-4">
            <div className="text-sm text-orange-600 mb-1">{t('severityHigh')}</div>
            <div className="text-2xl font-bold text-orange-700">{stats.high}</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-4">
            <div className="text-sm text-purple-600 mb-1">{t('recurring')}</div>
            <div className="text-2xl font-bold text-purple-700">{stats.recurring}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{t('filters')}</span>
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-blue-600 hover:text-blue-700"
            >
              {t('clearFilters')}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchFindings')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allSeverities')}</option>
              <option value="critical">{t('severityCritical')}</option>
              <option value="high">{t('severityHigh')}</option>
              <option value="medium">{t('severityMedium')}</option>
              <option value="low">{t('severityLow')}</option>
            </select>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allTypes')}</option>
              {[...new Set(findings.map(f => f.finding_type))].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allCategories')}</option>
              <option value="Liderazgo">{t('categoryLeadership')}</option>
              <option value="Orden">{t('categoryOrder')}</option>
              <option value="Caja">{t('categoryCash')}</option>
              <option value="Stock">{t('categoryStock')}</option>
              <option value="Limpieza">{t('categoryCleanliness')}</option>
              <option value="Equipos">{t('categoryEquipment')}</option>
            </select>

            {/* Location */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allLocations')}</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="active">{t('activeFindings')}</option>
              <option value="recurring">{t('recurringFindings')}</option>
            </select>
          </div>
        </div>

        {/* Findings by Type */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.entries(stats.byType).map(([type, count]) => (
            <div
              key={type}
              className={`bg-white rounded-lg shadow-sm border p-3 cursor-pointer hover:shadow-md transition-shadow ${
                typeFilter === type ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
            >
              <div className="text-xs text-gray-500 mb-1 truncate">{type}</div>
              <div className="text-xl font-bold text-gray-900">{count}</div>
            </div>
          ))}
        </div>

        {/* Findings List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {t('findings')} ({filteredFindings.length})
            </h3>
          </div>

          <div className="divide-y">
            {filteredFindings.length > 0 ? (
              filteredFindings.map(finding => (
                <div
                  key={finding.id}
                  onClick={() => router.push(`/dashboard/supervision/visits/${finding.visit_id}`)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <FindingCard
                    title={finding.title}
                    description={finding.description}
                    severity={finding.severity as any}
                    type={finding.finding_type as any}
                    category={finding.category}
                    location={finding.supervision_visits?.locations?.name}
                    date={finding.created_at}
                    isRecurring={finding.is_recurring}
                    recurrenceCount={finding.recurrence_count}
                  />
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>{t('visit')}: {new Date(finding.supervision_visits?.visit_date || '').toLocaleDateString()}</span>
                    <VisitTypeBadge type={finding.supervision_visits?.visit_type as any} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {t('noFindingsFound')}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
