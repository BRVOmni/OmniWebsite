'use client'

/**
 * Corrective Actions Management Page
 *
 * View and manage corrective actions from supervision findings.
 * Track status, deadlines, responsible parties, and verification.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ActionCard } from '@/components/supervision/action-card'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Search,
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

interface ActionData {
  id: string
  description: string
  responsible_person: string
  priority: string
  committed_date: string
  actual_completion_date?: string | null
  completed_at?: string | null  // Transformed from actual_completion_date
  status: string
  is_overdue: boolean
  days_overdue: number
  before_photo_url?: string | null
  after_photo_url?: string | null
  before_photos?: string[] | null  // Transformed from before_photo_url
  after_photos?: string[] | null  // Transformed from after_photo_url
  location_id: string
  locations: LocationInfo
  created_at: string
  deadline?: string
}

export default function ActionsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [actions, setActions] = useState<ActionData[]>([])
  const [locations, setLocations] = useState<LocationInfo[]>([])

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [overdueFilter, setOverdueFilter] = useState<string>('all')
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
        loadActions(),
        loadLocations(),
      ])
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadActions = async () => {
    const { data, error } = await supabase
      .from('corrective_actions')
      .select(`
        id,
        description,
        responsible_person,
        priority,
        committed_date,
        actual_completion_date,
        status,
        is_overdue,
        days_overdue,
        before_photo_url,
        after_photo_url,
        location_id,
        created_at,
        locations (
          id,
          name,
          cities (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading corrective actions:', error)
      setActions([])
      return
    }

    // Transform data to match expected format
    const transformedData = (data || []).map((action: any) => ({
      ...action,
      completed_at: action.actual_completion_date,
      before_photos: action.before_photo_url ? [action.before_photo_url] : null,
      after_photos: action.after_photo_url ? [action.after_photo_url] : null,
    }))

    setActions(transformedData as ActionData[])
  }

  const loadLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name, cities(name)')
      .eq('is_active', true)
      .order('name')

    setLocations(data as unknown as LocationInfo[] || [])
  }

  // Filter actions - only include valid actions
  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      // Skip invalid actions (missing required fields)
      if (!action.description || !action.status || !action.id) return false

      // Status filter
      if (statusFilter !== 'all' && action.status !== statusFilter) return false

      // Priority filter
      if (priorityFilter !== 'all' && action.priority !== priorityFilter) return false

      // Location filter
      if (locationFilter !== 'all' && action.location_id !== locationFilter) return false

      // Overdue filter
      if (overdueFilter === 'overdue' && !action.is_overdue) return false
      if (overdueFilter === 'onTime' && action.is_overdue) return false

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const locationName = action.locations?.name || ''
        const responsiblePerson = action.responsible_person || ''
        return (
          action.description.toLowerCase().includes(query) ||
          responsiblePerson.toLowerCase().includes(query) ||
          locationName.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [actions, statusFilter, priorityFilter, locationFilter, overdueFilter, searchQuery])

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: actions.length,
      open: actions.filter(a => a.status === 'pending').length,
      inProgress: actions.filter(a => a.status === 'in_progress').length,
      overdue: actions.filter(a => a.is_overdue).length,
      completed: actions.filter(a => a.status === 'completed').length,
      highPriority: actions.filter(a => a.priority === 'high' || a.priority === 'critical').length,
    }
  }, [actions])

  const clearFilters = () => {
    setStatusFilter('all')
    setPriorityFilter('all')
    setLocationFilter('all')
    setOverdueFilter('all')
    setSearchQuery('')
  }

  // Update action status
  const updateActionStatus = async (actionId: string, newStatus: string) => {
    const { error } = await supabase
      .from('corrective_actions')
      .update({
        status: newStatus,
        actual_completion_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', actionId)

    if (!error) {
      await loadActions()
    }
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
            <h1 className="text-2xl font-bold text-gray-900">{t('correctiveActions')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('manageActionsDescription')}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadActions}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('refresh')}
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-500 mb-1">{t('totalActions')}</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
            <div className="text-sm text-blue-600 mb-1">{t('actionStatusPending')}</div>
            <div className="text-2xl font-bold text-blue-700">{stats.open}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4">
            <div className="text-sm text-yellow-600 mb-1">{t('actionStatusInProgress')}</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.inProgress}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <div className="text-sm text-red-600 mb-1">{t('actionStatusOverdue')}</div>
            <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
            <div className="text-sm text-green-600 mb-1">{t('actionStatusCompleted')}</div>
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 p-4">
            <div className="text-sm text-orange-600 mb-1">{t('highPriority')}</div>
            <div className="text-2xl font-bold text-orange-700">{stats.highPriority}</div>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchActions')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="pending">{t('actionStatusPending')}</option>
              <option value="in_progress">{t('actionStatusInProgress')}</option>
              <option value="completed">{t('actionStatusCompleted')}</option>
              <option value="overdue">{t('actionStatusOverdue')}</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allPriorities')}</option>
              <option value="critical">{t('priorityCritical')}</option>
              <option value="high">{t('priorityHigh')}</option>
              <option value="medium">{t('priorityMedium')}</option>
              <option value="low">{t('priorityLow')}</option>
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

            {/* Overdue */}
            <select
              value={overdueFilter}
              onChange={(e) => setOverdueFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allActions')}</option>
              <option value="overdue">{t('overdueActions')}</option>
              <option value="onTime">{t('onTimeActions')}</option>
            </select>
          </div>
        </div>

        {/* Actions List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {t('correctiveActions')} ({filteredActions.length})
            </h3>
          </div>

          <div className="divide-y">
            {filteredActions.length > 0 ? (
              filteredActions
                .filter(action => action.description && action.status) // Only render valid actions
                .map(action => (
                <div
                  key={action.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <ActionCard
                    description={action.description || ''}
                    status={(action.status || 'pending') as any}
                    priority={(action.priority || 'medium') as any}
                    responsiblePerson={action.responsible_person}
                    committedDate={action.committed_date}
                    actualCompletionDate={action.actual_completion_date || action.completed_at || undefined}
                    isOverdue={action.is_overdue}
                    daysOverdue={action.days_overdue}
                    hasBeforePhoto={Boolean(action.before_photo_url || (action.before_photos && action.before_photos.length > 0))}
                    hasAfterPhoto={Boolean(action.after_photo_url || (action.after_photos && action.after_photos.length > 0))}
                    onClick={() => router.push(`/dashboard/supervision/actions/${action.id}`)}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {action.locations?.name || 'N/A'} • {new Date(action.created_at || '').toLocaleDateString()}
                    </span>
                    {action.status !== 'completed' && action.status !== 'verified' && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateActionStatus(action.id, 'completed')
                          }}
                          className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          {t('markComplete')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {t('noActionsFound')}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
