'use client'

/**
 * New Scheduled Visit Page
 *
 * Form to create a new scheduled supervision visit.
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Save,
  X,
  AlertCircle
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

export default function NewScheduledVisitPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [locations, setLocations] = useState<LocationInfo[]>([])
  const [supervisors, setSupervisors] = useState<SupervisorInfo[]>([])

  // Form state
  const [formData, setFormData] = useState({
    location_id: '',
    supervisor_id: '',
    planned_date: '',
    planned_shift: 'mañana',
    visit_type: 'rapida',
    priority: 'normal',
    estimated_duration_minutes: 10,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      await Promise.all([
        loadLocationsData(),
        loadSupervisorsData(),
      ])
      setLoading(false)
    }

    init()
  }, [router, supabase])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSubmitting(true)

    // Validate
    const newErrors: Record<string, string> = {}
    if (!formData.location_id) newErrors.location_id = t('required')
    if (!formData.supervisor_id) newErrors.supervisor_id = t('required')
    if (!formData.planned_date) newErrors.planned_date = t('required')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSubmitting(false)
      return
    }

    // Create scheduled visit
    const { error } = await supabase
      .from('supervision_schedule')
      .insert({
        location_id: formData.location_id,
        supervisor_id: formData.supervisor_id,
        planned_date: formData.planned_date,
        planned_shift: formData.planned_shift,
        visit_type: formData.visit_type,
        priority: formData.priority,
        estimated_duration_minutes: formData.estimated_duration_minutes,
        status: 'pending',
      })

    if (error) {
      console.error('Error creating scheduled visit:', error)
      setErrors({ submit: t('errorCreatingSchedule') })
      setSubmitting(false)
      return
    }

    router.push('/dashboard/supervision/schedule')
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('newScheduledVisit')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('createNewScheduledVisit')}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/supervision/schedule')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-700">{errors.submit}</div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('location')} *
              </span>
            </label>
            <select
              value={formData.location_id}
              onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">{t('selectLocation')}</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.cities && `(${l.cities.name})`}
                </option>
              ))}
            </select>
            {errors.location_id && (
              <p className="mt-1 text-sm text-red-600">{errors.location_id}</p>
            )}
          </div>

          {/* Supervisor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('supervisor')} *
              </span>
            </label>
            <select
              value={formData.supervisor_id}
              onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.supervisor_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">{t('selectSupervisor')}</option>
              {supervisors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.supervisor_id && (
              <p className="mt-1 text-sm text-red-600">{errors.supervisor_id}</p>
            )}
          </div>

          {/* Planned Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('plannedDate')} *
              </span>
            </label>
            <input
              type="date"
              value={formData.planned_date}
              onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.planned_date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.planned_date && (
              <p className="mt-1 text-sm text-red-600">{errors.planned_date}</p>
            )}
          </div>

          {/* Shift */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('shift')}
              </span>
            </label>
            <select
              value={formData.planned_shift}
              onChange={(e) => setFormData({ ...formData, planned_shift: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mañana">{t('shiftMorning')}</option>
              <option value="tarde">{t('shiftAfternoon')}</option>
              <option value="noche">{t('shiftEvening')}</option>
            </select>
          </div>

          {/* Visit Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('visitType')} *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'rapida', label: t('visitTypeRapida'), desc: '10 min' },
                { value: 'completa', label: t('visitTypeCompleta'), desc: '30 min' },
                { value: 'sorpresa', label: t('visitTypeSorpresa'), desc: '15 min' },
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, visit_type: type.value })}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    formData.visit_type === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('priority')}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 'low', label: t('priorityLow'), color: 'blue' },
                { value: 'normal', label: t('priorityMedium'), color: 'gray' },
                { value: 'high', label: t('priorityHigh'), color: 'orange' },
                { value: 'urgent', label: t('priorityCritical'), color: 'red' },
              ].map(prio => (
                <button
                  key={prio.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: prio.value })}
                  className={`p-2 border rounded-lg text-center transition-colors text-sm ${
                    formData.priority === prio.value
                      ? `border-${prio.color}-500 bg-${prio.color}-50 text-${prio.color}-700`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {prio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('estimatedDuration')} ({t('minutes')})
            </label>
            <input
              type="number"
              value={formData.estimated_duration_minutes}
              onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
              min="5"
              max="120"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/dashboard/supervision/schedule')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {submitting ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
