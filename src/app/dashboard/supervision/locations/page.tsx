'use client'

/**
 * Location Supervision Views
 *
 * Location-focused supervision analytics and management.
 * Shows supervision metrics, visit history, findings, and actions per location.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ScoreCard } from '@/components/supervision/score-card'
import { VisitTypeBadge } from '@/components/supervision/visit-type-badge'
import {
  MapPin,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock
} from 'lucide-react'

// Data Types
interface LocationInfo {
  id: string
  name: string
  cities?: {
    name: string
  } | null
  brands?: {
    name: string
  } | null
}

interface VisitData {
  id: string
  visit_date: string
  visit_type: string
  classification: string
  score_total: number
  location_id: string
}

interface FindingData {
  id: string
  severity: string
  created_at: string
  supervision_visits: {
    location_id: string
  } | null
}

interface ActionData {
  id: string
  status: string
  priority: string
  committed_date: string
  is_overdue: boolean
  location_id: string
}

interface LocationSupervisionData {
  location: LocationInfo
  lastVisitDate: string | null
  daysSinceLastVisit: number | null
  totalVisits: number
  avgScore: number
  classification: string
  openFindings: number
  criticalFindings: number
  overdueActions: number
  riskLevel: string
  visitComplianceRate: number
}

export default function SupervisionLocationsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState<LocationSupervisionData[]>([])
  const [allLocations, setAllLocations] = useState<LocationInfo[]>([])

  // Filters
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [classificationFilter, setClassificationFilter] = useState<string>('all')
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
        loadLocationSupervisionData(),
        loadAllLocations(),
      ])
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadLocationSupervisionData = async () => {
    // Get all locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('id, name, cities(name), brands(name)')
      .eq('is_active', true)
      .order('name')

    if (!locationsData) return

    // Get visits for each location
    const { data: visitsData } = await supabase
      .from('supervision_visits')
      .select('id, visit_date, visit_type, classification, score_total, location_id')
      .order('visit_date', { ascending: false })

    // Get findings
    const { data: findingsData } = await supabase
      .from('operational_findings')
      .select('id, severity, created_at, supervision_visits(location_id)')
      .order('created_at', { ascending: false })

    // Get actions
    const { data: actionsData } = await supabase
      .from('corrective_actions')
      .select('id, status, priority, committed_date, is_overdue, location_id')
      .in('status', ['pending', 'in_progress'])

    // Combine data for each location
    const locationData: LocationSupervisionData[] = (locationsData as unknown as LocationInfo[]).map(location => {
      const locationVisits = (visitsData || []).filter(v => v.location_id === location.id)
      const locationFindings = (findingsData || []).filter(f => f.supervision_visits?.location_id === location.id)
      const locationActions = (actionsData || []).filter(a => a.location_id === location.id)

      const lastVisit = locationVisits[0]
      const lastVisitDate = lastVisit?.visit_date || null
      const daysSinceLastVisit = lastVisitDate
        ? Math.floor((Date.now() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
        : null

      const avgScore = locationVisits.length > 0
        ? locationVisits.reduce((sum, v) => sum + (v.score_total || 0), 0) / locationVisits.length
        : 0

      const classification = avgScore >= 90 ? 'excelente' : avgScore >= 70 ? 'bueno' : avgScore >= 50 ? 'regular' : 'critico'

      const openFindings = locationFindings.length
      const criticalFindings = locationFindings.filter(f => f.severity === 'critical').length
      const overdueActions = locationActions.filter(a => a.is_overdue).length

      // Calculate risk level
      let riskLevel = 'low'
      if (criticalFindings > 0 || overdueActions > 2 || (avgScore > 0 && avgScore < 50)) {
        riskLevel = 'critical'
      } else if (overdueActions > 0 || avgScore < 70) {
        riskLevel = 'high'
      } else if (openFindings > 2 || daysSinceLastVisit > 14) {
        riskLevel = 'medium'
      }

      // Visit compliance (simplified - should check against standards)
      const visitComplianceRate = locationVisits.length > 0 ? 100 : 0

      return {
        location,
        lastVisitDate,
        daysSinceLastVisit,
        totalVisits: locationVisits.length,
        avgScore,
        classification,
        openFindings,
        criticalFindings,
        overdueActions,
        riskLevel,
        visitComplianceRate,
      }
    })

    setLocations(locationData)
  }

  const loadAllLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name, cities(name)')
      .eq('is_active', true)
      .order('name')

    setAllLocations(data as unknown as LocationInfo[] || [])
  }

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      if (cityFilter !== 'all' && loc.location.cities?.name !== cityFilter) return false
      if (brandFilter !== 'all' && loc.location.brands?.name !== brandFilter) return false
      if (riskFilter !== 'all' && loc.riskLevel !== riskFilter) return false
      if (classificationFilter !== 'all' && loc.classification !== classificationFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return loc.location.name.toLowerCase().includes(query)
      }
      return true
    })
  }, [locations, cityFilter, brandFilter, riskFilter, classificationFilter, searchQuery])

  // Get unique cities
  const cities = useMemo(() => {
    const citySet = new Set(allLocations.map(l => l.cities?.name).filter(Boolean))
    return Array.from(citySet).sort()
  }, [allLocations])

  // Get unique brands
  const brands = useMemo(() => {
    const brandSet = new Set(allLocations.map(l => l.brands?.name).filter(Boolean))
    return Array.from(brandSet).sort()
  }, [allLocations])

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalLocations: locations.length,
      criticalRisk: locations.filter(l => l.riskLevel === 'critical').length,
      highRisk: locations.filter(l => l.riskLevel === 'high').length,
      overdueActions: locations.reduce((sum, l) => sum + l.overdueActions, 0),
      openFindings: locations.reduce((sum, l) => sum + l.openFindings, 0),
      avgNetworkScore: locations.length > 0
        ? locations.reduce((sum, l) => sum + l.avgScore, 0) / locations.length
        : 0,
    }
  }, [locations])

  const clearFilters = () => {
    setCityFilter('all')
    setBrandFilter('all')
    setRiskFilter('all')
    setClassificationFilter('all')
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
            <h1 className="text-2xl font-bold text-gray-900">{t('locationSupervision')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('locationSupervisionDescription')}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1">{t('totalLocations')}</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalLocations}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <div className="text-sm text-red-600 mb-1">{t('criticalRisk')}</div>
            <div className="text-2xl font-bold text-red-700">{stats.criticalRisk}</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-4">
            <div className="text-sm text-orange-600 mb-1">{t('highRisk')}</div>
            <div className="text-2xl font-bold text-orange-700">{stats.highRisk}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
            <div className="text-sm text-blue-600 mb-1">{t('openFindings')}</div>
            <div className="text-2xl font-bold text-blue-700">{stats.openFindings}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
            <div className="text-sm text-yellow-600 mb-1">{t('overdueActions')}</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.overdueActions}</div>
          </div>
          <ScoreCard
            score={stats.avgNetworkScore}
            size="sm"
          />
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchLocations')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* City */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allCities')}</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Brand */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allBrands')}</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            {/* Risk Level */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allRiskLevels')}</option>
              <option value="low">{t('riskLevelLow')}</option>
              <option value="medium">{t('riskLevelMedium')}</option>
              <option value="high">{t('riskLevelHigh')}</option>
              <option value="critical">{t('riskLevelCritical')}</option>
            </select>

            {/* Classification */}
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allClassifications')}</option>
              <option value="excelente">{t('classificationExcelente')}</option>
              <option value="bueno">{t('classificationBueno')}</option>
              <option value="regular">{t('classificationRegular')}</option>
              <option value="critico">{t('classificationCritico')}</option>
            </select>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map(locData => (
            <div
              key={locData.location.id}
              onClick={() => router.push(`/dashboard/supervision/locations/${locData.location.id}`)}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md cursor-pointer transition-all"
            >
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{locData.location.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {locData.location.cities?.name}
                      {locData.location.brands?.name && ` • ${locData.location.brands.name}`}
                    </p>
                  </div>
                  <RiskBadge level={locData.riskLevel} />
                </div>
              </div>

              {/* Metrics */}
              <div className="p-4 space-y-3">
                {/* Score */}
                <ScoreCard
                  score={locData.avgScore}
                  classification={locData.classification}
                  size="sm"
                />

                {/* Visit Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('lastVisit')}:</span>
                  <span className={locData.daysSinceLastVisit > 7 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                    {locData.lastVisitDate ? new Date(locData.lastVisitDate).toLocaleDateString() : t('never')}
                  </span>
                </div>

                {locData.daysSinceLastVisit !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{t('daysSinceLastVisit')}:</span>
                    <span className={locData.daysSinceLastVisit > 7 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {locData.daysSinceLastVisit} {t('days')}
                    </span>
                  </div>
                )}

                {/* Issues */}
                <div className="flex items-center gap-3 text-sm">
                  {locData.openFindings > 0 && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      {locData.openFindings} {t('open')}
                    </span>
                  )}
                  {locData.overdueActions > 0 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <Clock className="w-4 h-4" />
                      {locData.overdueActions} {t('overdue')}
                    </span>
                  )}
                </div>

                {/* Trend */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('totalVisits')}:</span>
                  <span className="font-medium text-gray-900">{locData.totalVisits}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
                <span>{t('clickToViewDetails')}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
            {t('noLocationsFound')}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

// Risk Badge Component
function RiskBadge({ level }: { level: string }) {
  const config = {
    low: { label: 'Low', class: 'bg-green-100 text-green-700' },
    medium: { label: 'Medium', class: 'bg-yellow-100 text-yellow-700' },
    high: { label: 'High', class: 'bg-orange-100 text-orange-700' },
    critical: { label: 'Critical', class: 'bg-red-100 text-red-700' },
  }

  const { label, class: className } = config[level as keyof typeof config] || config.low

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
