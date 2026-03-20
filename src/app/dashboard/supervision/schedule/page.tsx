'use client'

/**
 * Visit Schedule Module
 *
 * View and manage scheduled supervision visits.
 * Includes calendar view, list view, and filtering capabilities.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { VisitStatusBadge } from '@/components/supervision/visit-status-badge'
import { VisitTypeBadge } from '@/components/supervision/visit-type-badge'
import {
  generateSchedule,
  previewNextMonthSchedule
} from '@/lib/utils/auto-schedule'
import {
  Calendar,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Wand2,
  Loader2,
  CheckCircle,
  X,
  XCircle
} from 'lucide-react'

// Data Types
interface LocationInfo {
  id: string
  name: string
  cities?: {
    name: string
  } | null
}

interface SupervisorInfo {
  id: string
  name: string
  email?: string
}

interface ScheduleData {
  id: string
  planned_date: string
  planned_shift: string
  status: string
  visit_type: string
  priority: string
  estimated_duration_minutes: number
  location_id: string
  supervisor_id: string
  locations: LocationInfo
  supervisors: SupervisorInfo
}

type ViewMode = 'calendar' | 'list'

export default function SchedulePage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<ScheduleData[]>([])
  const [locations, setLocations] = useState<LocationInfo[]>([])
  const [supervisors, setSupervisors] = useState<SupervisorInfo[]>([])

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Auto-generation state
  const [showAutoGenModal, setShowAutoGenModal] = useState(false)
  const [autoGenLoading, setAutoGenLoading] = useState(false)
  const [autoGenResult, setAutoGenResult] = useState<{
    success: boolean
    visits_created: number
    visits_skipped: number
    errors: string[]
    warnings: string[]
  } | null>(null)
  const [previewMonth, setPreviewMonth] = useState<{
    year: number
    month: number
    monthName: string
    estimatedVisits: number
  } | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      await Promise.all([
        loadScheduleData(),
        loadLocationsData(),
        loadSupervisorsData(),
      ])
      setLoading(false)
    }

    init()
  }, [router, supabase])

  const loadScheduleData = async () => {
    const { data } = await supabase
      .from('supervision_schedule')
      .select(`
        id,
        planned_date,
        planned_shift,
        status,
        visit_type,
        priority,
        estimated_duration_minutes,
        location_id,
        supervisor_id,
        locations (
          id,
          name,
          cities (
            name
          )
        ),
        supervisors (
          id,
          name,
          email
        )
      `)
      .gte('planned_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0])
      .order('planned_date', { ascending: true })

    setSchedules(data as unknown as ScheduleData[] || [])
  }

  const loadLocationsData = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name, cities(name)')
      .eq('is_active', true)
      .order('name')

    setLocations(data as unknown as LocationInfo[] || [])
  }

  const loadSupervisorsData = async () => {
    const { data } = await supabase
      .from('supervisors')
      .select('id, name, email')
      .eq('is_active', true)
      .order('name')

    setSupervisors(data as unknown as SupervisorInfo[] || [])
  }

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      if (selectedSupervisor !== 'all' && s.supervisor_id !== selectedSupervisor) return false
      if (selectedLocation !== 'all' && s.location_id !== selectedLocation) return false
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false
      return true
    })
  }, [schedules, selectedSupervisor, selectedLocation, selectedStatus])

  // Group schedules by date for calendar view
  const schedulesByDate = useMemo(() => {
    const byDate: Record<string, ScheduleData[]> = {}
    filteredSchedules.forEach(s => {
      const date = s.planned_date
      if (!byDate[date]) byDate[date] = []
      byDate[date].push(s)
    })
    return byDate
  }, [filteredSchedules])

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    return { daysInMonth, startDayOfWeek, year, month }
  }

  const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  // Handle auto-generate button click
  const handleAutoGenerateClick = async () => {
    setAutoGenLoading(true)
    try {
      const preview = await previewNextMonthSchedule()
      setPreviewMonth(preview)
      setShowAutoGenModal(true)
    } catch (error) {
      console.error('Error loading preview:', error)
    } finally {
      setAutoGenLoading(false)
    }
  }

  // Handle confirm auto-generate
  const handleConfirmAutoGenerate = async () => {
    if (!previewMonth) return

    setAutoGenLoading(true)
    setAutoGenResult(null)

    try {
      const result = await generateSchedule(
        previewMonth.year,
        previewMonth.month,
        undefined,
        {
          skipExisting: true,
          balanceWorkload: true,
          optimizeRoutes: true
        }
      )

      setAutoGenResult(result)

      if (result.success) {
        // Reload schedule data
        await loadScheduleData()

        // Auto-close modal after 2 seconds on success
        setTimeout(() => {
          setShowAutoGenModal(false)
          setAutoGenResult(null)
        }, 2000)
      }
    } catch (error) {
      setAutoGenResult({
        success: false,
        visits_created: 0,
        visits_skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      })
    } finally {
      setAutoGenLoading(false)
    }
  }

  // Handle close modal
  const handleCloseModal = () => {
    setShowAutoGenModal(false)
    setAutoGenResult(null)
    setPreviewMonth(null)
  }

  // Get upcoming visits
  const upcomingVisits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return filteredSchedules
      .filter(s => s.planned_date >= today && s.status === 'pending')
      .sort((a, b) => a.planned_date.localeCompare(b.planned_date))
      .slice(0, 10)
  }, [filteredSchedules])

  // Get overdue visits
  const overdueVisits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return filteredSchedules
      .filter(s => s.planned_date < today && s.status === 'pending')
      .sort((a, b) => a.planned_date.localeCompare(b.planned_date))
  }, [filteredSchedules])

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
            <h1 className="text-2xl font-bold text-gray-900">{t('schedule')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('manageScheduledVisits')}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoGenerateClick}
              disabled={autoGenLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {autoGenLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {t('autoGenerate')}
            </button>
            <button
              onClick={() => router.push('/dashboard/supervision/schedule/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('newScheduledVisit')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{t('filters')}:</span>
            </div>

            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allSupervisors')}</option>
              {supervisors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allLocations')}</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="pending">{t('visitStatusPending')}</option>
              <option value="completed">{t('visitStatusCompleted')}</option>
              <option value="missed">{t('visitStatusMissed')}</option>
            </select>

            <div className="ml-auto flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-white shadow' : ''}`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Overdue Visits Alert */}
        {overdueVisits.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">{t('overdueVisits')}: {overdueVisits.length}</h3>
                <p className="text-sm text-red-700 mt-1">{t('overdueVisitsWarning')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells before first day */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const daySchedules = schedulesByDate[dateStr] || []
                const isToday = dateStr === new Date().toISOString().split('T')[0]
                const isPast = dateStr < new Date().toISOString().split('T')[0]

                return (
                  <div
                    key={day}
                    className={`aspect-square border border-gray-100 rounded-lg p-1 ${
                      isToday ? 'bg-blue-50 border-blue-200' : ''
                    } ${isPast ? 'bg-gray-50' : ''}`}
                  >
                    <div className="text-xs font-medium text-gray-700 mb-1">{day}</div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 2).map(s => (
                        <div
                          key={s.id}
                          onClick={() => router.push(`/dashboard/supervision/new-visit?schedule=${s.id}`)}
                          className={`text-xs p-1 rounded cursor-pointer truncate ${
                            s.status === 'completed' ? 'bg-green-100 text-green-700' :
                            s.status === 'missed' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {s.locations.name}
                        </div>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{daySchedules.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border">
            {/* Upcoming Visits */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('upcomingVisits')}</h3>
              <div className="space-y-3">
                {upcomingVisits.length > 0 ? upcomingVisits.map(schedule => (
                  <div
                    key={schedule.id}
                    onClick={() => router.push(`/dashboard/supervision/new-visit?schedule=${schedule.id}`)}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{schedule.locations.name}</h4>
                        <VisitTypeBadge type={schedule.visit_type as any} />
                        <VisitStatusBadge status={schedule.status as any} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(schedule.planned_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {schedule.supervisors.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {schedule.planned_shift || 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {schedule.locations.cities?.name || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{t('estimatedTime')}</div>
                      <div className="font-semibold text-gray-900">{schedule.estimated_duration_minutes}m</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 py-8">{t('noUpcomingVisits')}</div>
                )}
              </div>
            </div>

            {/* All Scheduled Visits */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('allScheduledVisits')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('date')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('location')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('supervisor')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('visitType')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('status')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t('priority')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map(schedule => (
                      <tr
                        key={schedule.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/dashboard/supervision/new-visit?schedule=${schedule.id}`)}
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(schedule.planned_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {schedule.locations.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {schedule.supervisors.name}
                        </td>
                        <td className="py-3 px-4">
                          <VisitTypeBadge type={schedule.visit_type as any} />
                        </td>
                        <td className="py-3 px-4">
                          <VisitStatusBadge status={schedule.status as any} />
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            schedule.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            schedule.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            schedule.priority === 'low' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {schedule.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto-Generate Modal */}
      {showAutoGenModal && previewMonth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('autoGenerateSchedule')}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {!autoGenResult ? (
              <>
                {/* Preview */}
                <div className="space-y-4 mb-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">
                        {previewMonth.monthName} {previewMonth.year}
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">
                      {t('estimatedVisits')}: <span className="font-semibold">{previewMonth.estimatedVisits}</span>
                    </p>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">{t('autoGenerateInfo')}</p>
                    <ul className="space-y-1 text-xs">
                      <li>• {t('rapida')}: 2x/week per location</li>
                      <li>• {t('completa')}: 2x/month per location</li>
                      <li>• {t('sorpresa')}: 1x/month per location</li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    disabled={autoGenLoading}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleConfirmAutoGenerate}
                    disabled={autoGenLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {autoGenLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        {t('generate')}
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Result */}
                <div className={`mb-6 ${autoGenResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} rounded-lg p-4`}>
                  <div className="flex items-start gap-3">
                    {autoGenResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${autoGenResult.success ? 'text-green-900' : 'text-red-900'}`}>
                        {autoGenResult.success ? t('scheduleGenerated') : t('generationFailed')}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className={autoGenResult.success ? 'text-green-700' : 'text-red-700'}>
                          {t('visitsCreated')}: {autoGenResult.visits_created}
                        </p>
                        {autoGenResult.visits_skipped > 0 && (
                          <p className="text-yellow-700">
                            {t('visitsSkipped')}: {autoGenResult.visits_skipped}
                          </p>
                        )}
                        {autoGenResult.warnings.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-yellow-800">{t('warnings')}:</p>
                            {autoGenResult.warnings.map((warning, i) => (
                              <p key={i} className="text-xs text-yellow-700">• {warning}</p>
                            ))}
                          </div>
                        )}
                        {autoGenResult.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-red-800">{t('errors')}:</p>
                            {autoGenResult.errors.map((error, i) => (
                              <p key={i} className="text-xs text-red-700">• {error}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={handleCloseModal}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('close')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
