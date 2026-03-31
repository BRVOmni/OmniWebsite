'use client'

/**
 * Mobile Visit Entry Form
 *
 * Mobile-optimized form for completing supervision visits.
 * Features 5-step process, 21 checklist items, 5 key questions,
 * findings entry, and immediate actions.
 */

import { useEffect, useState, useMemo, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProgressStepper } from '@/components/supervision/progress-stepper'
import { ChecklistItem } from '@/components/supervision/checklist-item'
import { PhotoUploader } from '@/components/supervision/photo-uploader'
import { VisitTypeBadge } from '@/components/supervision/visit-type-badge'
import {
  MapPin,
  User,
  Calendar,
  Clock,
  Save,
  X,
  Check,
  AlertTriangle,
  Camera,
  Plus,
  ChevronRight
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
}

interface CategoryInfo {
  id: string
  name: string
  name_es: string
  display_order: number
}

interface ChecklistItemInfo {
  id: string
  category_id: string
  name: string
  name_es: string
  description: string
  display_order: number
  is_critical: boolean
}

type Step = 'observation' | 'operations' | 'cash' | 'product' | 'equipment' | 'review'

interface ChecklistResult {
  item_id: string
  compliant: boolean | null
  notes: string
  is_critical?: boolean
}

interface Finding {
  severity: string
  finding_type: string
  title: string
  description: string
  category: string
  requires_photo: boolean
  photos: string[]
}

interface ImmediateAction {
  description: string
  responsible_person: string
  deadline: string
  priority: string
}

function NewVisitForm() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const scheduleId = searchParams.get('schedule')

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)

  // Data
  const [locations, setLocations] = useState<LocationInfo[]>([])
  const [supervisors, setSupervisors] = useState<SupervisorInfo[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [checklistItems, setChecklistItems] = useState<ChecklistItemInfo[]>([])

  // Form state
  const [currentStep, setCurrentStep] = useState<Step>('observation')
  const [visitData, setVisitData] = useState({
    location_id: '',
    supervisor_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_shift: 'mañana',
    visit_type: 'rapida',
    manager_name: '',
    manager_present: null as boolean | null,
    manager_in_control: null as boolean | null,
  })

  // Checklist results
  const [checklistResults, setChecklistResults] = useState<Record<string, ChecklistResult>>({})

  // Findings and actions
  const [findings, setFindings] = useState<Finding[]>([])
  const [immediateActions, setImmediateActions] = useState<ImmediateAction[]>([])

  // Time tracking
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Completed steps
  const [completedSteps, setCompletedSteps] = useState<Step[]>([])

  // Location selection for ad-hoc visits
  const [showLocationSelector, setShowLocationSelector] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      await Promise.all([
        loadLocations(),
        loadSupervisors(),
        loadCategories(),
        loadChecklistItems(),
      ])

      // Load schedule data if provided
      if (scheduleId) {
        await loadScheduleData(scheduleId)
      } else {
        // No scheduled visit - show location selector for ad-hoc/surprise visits
        setShowLocationSelector(true)
      }

      // Start timer
      setStartTime(new Date())
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - (startTime?.getTime() || Date.now())) / 1000 / 60))
      }, 30000)

      setLoading(false)

      return () => clearInterval(timer)
    }

    init()
  }, [])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!loading) {
      const autoSaveTimer = setInterval(() => {
        handleAutoSave()
      }, 30000)

      return () => clearInterval(autoSaveTimer)
    }
  }, [loading, visitData, checklistResults, findings, immediateActions])

  const handleAutoSave = async () => {
    setAutoSaving(true)
    // Save to localStorage as draft
    const draft = {
      visitData,
      checklistResults,
      findings,
      immediateActions,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('visit_draft', JSON.stringify(draft))
    setTimeout(() => setAutoSaving(false), 1000)
  }

  const loadLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name, cities(name)')
      .eq('is_active', true)
      .order('name')

    setLocations(data as unknown as LocationInfo[] || [])
  }

  const loadSupervisors = async () => {
    const { data } = await supabase
      .from('supervisors')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    setSupervisors(data as unknown as SupervisorInfo[] || [])
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from('checklist_categories')
      .select('*')
      .eq('active', true)
      .order('display_order')

    setCategories(data as unknown as CategoryInfo[] || [])
  }

  const loadChecklistItems = async () => {
    const { data } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('active', true)
      .order('display_order')

    setChecklistItems(data as unknown as ChecklistItemInfo[] || [])
  }

  const loadScheduleData = async (scheduleId: string) => {
    const { data } = await supabase
      .from('supervision_schedule')
      .select('*')
      .eq('id', scheduleId)
      .single()

    if (data) {
      setVisitData({
        location_id: data.location_id,
        supervisor_id: data.supervisor_id || '',
        visit_date: data.planned_date,
        visit_shift: data.planned_shift || 'mañana',
        visit_type: data.visit_type,
        manager_name: '',
        manager_present: null,
        manager_in_control: null,
      })
    }
  }

  // Get items for current step
  const stepCategories = useMemo(() => {
    const categoryMap: Record<Step, string[]> = {
      observation: ['Liderazgo', 'Leadership'],
      operations: ['Orden', 'Order'],
      cash: ['Caja', 'Cash Management'],
      product: ['Stock', 'Inventory'],
      equipment: ['Limpieza', 'Cleanliness', 'Equipos', 'Equipment'],
      review: [],
    }
    return categoryMap[currentStep] || []
  }, [currentStep])

  const currentStepItems = useMemo(() => {
    return checklistItems.filter(item =>
      stepCategories.some(cat => item.category_id === cat || item.name_es.includes(cat))
    )
  }, [checklistItems, stepCategories])

  const checklistResultsByCategory = (categoryName: string) => {
    return Object.values(checklistResults).filter(result => {
      const item = checklistItems.find(i => i.id === result.item_id)
      return item?.name_es.includes(categoryName) || item?.name.includes(categoryName)
    })
  }

  // Helper to get current step's items
  const getCurrentStepItems = () => {
    return checklistItems.filter(item =>
      stepCategories.some(cat => item.category_id === cat || item.name_es.includes(cat))
    )
  }

  // Calculate scores (using proper 6-category weighted system)
  const scores = useMemo(() => {
    const categoryScores: Record<string, number> = {}
    const categoryWeights: Record<string, number> = {
      'Liderazgo': 0.15,
      'Orden': 0.20,
      'Caja': 0.25,
      'Stock': 0.20,
      'Limpieza': 0.10,
      'Equipos': 0.10
    }

    let weightedTotal = 0
    let hasAnyItems = false

    categories.forEach(cat => {
      const items = checklistResultsByCategory(cat.name_es)
      if (items.length === 0) {
        categoryScores[cat.name_es] = 0
        return
      }
      hasAnyItems = true

      const compliantCount = items.filter(i => i.compliant === true).length
      const criticalCount = items.filter(i => !i.compliant && i.is_critical).length

      // Base score from compliance percentage
      let score = (compliantCount / items.length) * 100

      // Deduct points for non-compliant critical items (15 points each)
      score -= criticalCount * 15

      categoryScores[cat.name_es] = Math.max(0, Math.round(score))

      // Add to weighted total
      weightedTotal += categoryScores[cat.name_es] * categoryWeights[cat.name_es]
    })

    const avgScore = hasAnyItems ? Math.round(weightedTotal) : 0

    // Calculate operation score (liderazgo + orden)
    const score_operacion = Object.keys(categoryScores).length > 0
      ? Math.round((categoryScores['Liderazgo'] + categoryScores['Orden']) / 2)
      : 0

    return { categoryScores, avgScore, score_operacion }
  }, [checklistResults, categories])

  // Calculate 5 key questions (auto-calculated based on category scores)
  const keyQuestions = useMemo(() => {
    const categoryScores = scores.categoryScores

    // Operations: liderazgo + orden combined score >= 70%
    const operationsScore = (categoryScores['Liderazgo'] || 0 + categoryScores['Orden'] || 0) / 2

    // Money: caja score >= 70
    const moneyScore = categoryScores['Caja'] || 0

    // Product: stock score >= 70
    const productScore = categoryScores['Stock'] || 0

    // Customer experience: limpieza + equipos combined score >= 70%
    const customerScore = (categoryScores['Limpieza'] || 0 + categoryScores['Equipos'] || 0) / 2

    // Manager control: liderazgo >= 70 AND manager marked as in control
    const managerScore = categoryScores['Liderazgo'] || 0
    const managerInControl = visitData.manager_in_control === true

    return {
      operations_functioning: operationsScore >= 70,
      money_controlled: moneyScore >= 70,
      product_managed: productScore >= 70,
      customer_experience_adequate: customerScore >= 70,
      manager_team_control: managerScore >= 70 && managerInControl
    }
  }, [scores.categoryScores, visitData.manager_in_control])

  const handleChecklistChange = (itemId: string, compliant: boolean | null, notes: string) => {
    setChecklistResults(prev => ({
      ...prev,
      [itemId]: { item_id: itemId, compliant, notes }
    }))
  }

  const addFinding = () => {
    setFindings([...findings, {
      severity: 'medium',
      finding_type: 'caja_diferencias',
      title: '',
      description: '',
      category: '',
      requires_photo: false,
      photos: [],
    }])
  }

  const updateFinding = (index: number, field: keyof Finding, value: any) => {
    const updated = [...findings]
    updated[index] = { ...updated[index], [field]: value }
    setFindings(updated)
  }

  const removeFinding = (index: number) => {
    setFindings(findings.filter((_, i) => i !== index))
  }

  const addAction = () => {
    setImmediateActions([...immediateActions, {
      description: '',
      responsible_person: '',
      deadline: '',
      priority: 'medium',
    }])
  }

  const updateAction = (index: number, field: keyof ImmediateAction, value: any) => {
    const updated = [...immediateActions]
    updated[index] = { ...updated[index], [field]: value }
    setImmediateActions(updated)
  }

  const removeAction = (index: number) => {
    setImmediateActions(immediateActions.filter((_, i) => i !== index))
  }

  const goToStep = (step: Step) => {
    // Validate current step before moving on
    const currentStepItems = getCurrentStepItems()

    if (currentStep !== 'review' && currentStepItems.length > 0) {
      // Check if all items in current step have been answered
      const allAnswered = currentStepItems.every(item =>
        checklistResults[item.id]?.compliant !== undefined
      )

      if (!allAnswered) {
        alert('Please complete all checklist items before proceeding to the next step.')
        return
      }
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    setCurrentStep(step)
  }

  const handleLocationSelect = (locationId: string) => {
    setVisitData({
      ...visitData,
      location_id: locationId
    })
    setShowLocationSelector(false)
  }

  const handleSubmit = async (complete: boolean) => {
    setSubmitting(true)

    try {
      // Determine classification based on total score
      const classification =
        scores.avgScore >= 90 ? 'excelente' :
        scores.avgScore >= 75 ? 'bueno' :
        scores.avgScore >= 60 ? 'regular' :
        'deficiente'

      // Create visit record using API for proper scoring
      const response = await fetch('/api/supervision/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: visitData.location_id,
          supervisor_id: visitData.supervisor_id || user?.id,
          visit_date: visitData.visit_date,
          visit_shift: visitData.visit_shift,
          visit_type: visitData.visit_type,
          manager_name: visitData.manager_name,
          manager_present: visitData.manager_present,
          manager_in_control: visitData.manager_in_control,
          start_time: startTime?.toISOString(),
          end_time: complete ? new Date().toISOString() : undefined,
          duration_minutes: elapsedTime,
          step1_observation_completed: completedSteps.includes('observation'),
          step2_operations_completed: completedSteps.includes('operations'),
          step3_cash_completed: completedSteps.includes('cash'),
          step4_product_completed: completedSteps.includes('product'),
          step5_equipment_completed: completedSteps.includes('equipment'),
          visit_completed: complete
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create visit')
      }

      const { visit } = await response.json()

      // Insert checklist results
      const resultsToInsert = Object.values(checklistResults).map(result => ({
        visit_id: visit.id,
        checklist_item_id: result.item_id,
        compliant: result.compliant ?? false,
        notes: result.notes,
      }))

      if (resultsToInsert.length > 0) {
        await supabase.from('visit_checklist_results').insert(resultsToInsert)
      }

      // Insert findings
      for (const finding of findings) {
        if (finding.title && finding.description) {
          await supabase.from('operational_findings').insert({
            visit_id: visit.id,
            severity: finding.severity,
            finding_type: finding.finding_type,
            title: finding.title,
            description: finding.description,
            category: finding.category,
            photo_url: finding.photos[0] || null,
            additional_photos: finding.photos.slice(1),
            corrective_action_required: immediateActions.some(a => a.description),
          })
        }
      }

      // Insert immediate actions
      for (const action of immediateActions) {
        if (action.description && action.responsible_person && action.deadline) {
          await supabase.from('corrective_actions').insert({
            visit_id: visit.id,
            location_id: visitData.location_id,
            description: action.description,
            immediate_action: action.description,
            responsible_person: action.responsible_person,
            responsible_role: 'encargado',
            priority: action.priority,
            committed_date: action.deadline,
            status: 'pending',
          })
        }
      }

      // If final submission, update with scores
      if (complete) {
        await fetch(`/api/supervision/visits?id=${visit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            final_submission: true,
            checklist_results: Object.values(checklistResults).map(r => ({
              item_id: r.item_id,
              category: categories.find(c => c.name_es.includes(r.item_id))?.name_es || 'General',
              compliant: r.compliant ?? false,
              is_critical: checklistItems.find(i => i.id === r.item_id)?.is_critical || false,
              notes: r.notes
            })),
            findings: findings.map(f => ({
              severity: f.severity,
              category: f.category,
              title: f.title,
              description: f.description
            })),
            observations_general: findings.length > 0 ? findings.map(f => `- ${f.title}: ${f.description}`).join('\n') : ''
          })
        })
      }

      // Update schedule if applicable
      if (scheduleId && complete) {
        await supabase
          .from('supervision_schedule')
          .update({ status: 'completed', completed_visit_id: visit.id })
          .eq('id', scheduleId)
      }

      // Clear draft
      localStorage.removeItem('visit_draft')

      router.push('/dashboard/supervision')
    } catch (error) {
      console.error('Error saving visit:', error)
      alert('Error saving visit: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setSubmitting(false)
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

  const stepTitles: Record<Step, string> = {
    observation: t('step1Label'),
    operations: t('step2Label'),
    cash: t('step3Label'),
    product: t('step4Label'),
    equipment: t('step5Label'),
    review: t('review'),
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('newVisit')}</h1>
            <p className="text-sm text-gray-500">{t('completeVisitFor')} {locations.find(l => l.id === visitData.location_id)?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {autoSaving && (
              <span className="text-xs text-gray-500">{t('autoSaving')}</span>
            )}
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Visit Info Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{locations.find(l => l.id === visitData.location_id)?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{new Date(visitData.visit_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{elapsedTime}m</span>
            </div>
            <VisitTypeBadge type={visitData.visit_type as any} />
          </div>
        </div>

        {/* Progress Stepper */}
        <ProgressStepper
          completedSteps={completedSteps as any}
          currentStep={currentStep as any}
          orientation="horizontal"
          showTime={false}
          showDescriptions={false}
        />

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{stepTitles[currentStep]}</h2>

          {/* Review Step */}
          {currentStep === 'review' ? (
            <div className="space-y-6">
              {/* Scores */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t('scores')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">{cat.name_es}</div>
                      <div className="text-xl font-bold text-gray-900">{scores.categoryScores[cat.name_es] || 0}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 Key Questions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t('fiveKeyQuestions')}</h3>
                <div className="space-y-2">
                  {Object.entries(keyQuestions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{t(key)}</span>
                      <span className={`text-lg font-semibold ${value ? 'text-green-600' : 'text-red-600'}`}>
                        {value ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manager Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t('managerInformation')}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('managerName')}</label>
                    <input
                      type="text"
                      value={visitData.manager_name}
                      onChange={(e) => setVisitData({ ...visitData, manager_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder={t('enterManagerName')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('managerPresent')}</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVisitData({ ...visitData, manager_present: true })}
                        className={`px-4 py-2 rounded-lg text-sm ${visitData.manager_present === true ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {t('yes')}
                      </button>
                      <button
                        onClick={() => setVisitData({ ...visitData, manager_present: false })}
                        className={`px-4 py-2 rounded-lg text-sm ${visitData.manager_present === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {t('no')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('managerInControl')}</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVisitData({ ...visitData, manager_in_control: true })}
                        className={`px-4 py-2 rounded-lg text-sm ${visitData.manager_in_control === true ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {t('yes')}
                      </button>
                      <button
                        onClick={() => setVisitData({ ...visitData, manager_in_control: false })}
                        className={`px-4 py-2 rounded-lg text-sm ${visitData.manager_in_control === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {t('no')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">{t('findings')}</h3>
                  <button
                    onClick={addFinding}
                    className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    {t('addFinding')}
                  </button>
                </div>
                <div className="space-y-3">
                  {findings.map((finding, index) => (
                    <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between mb-2">
                        <select
                          value={finding.severity}
                          onChange={(e) => updateFinding(index, 'severity', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="low">{t('severityLow')}</option>
                          <option value="medium">{t('severityMedium')}</option>
                          <option value="high">{t('severityHigh')}</option>
                          <option value="critical">{t('severityCritical')}</option>
                        </select>
                        <button
                          onClick={() => removeFinding(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={finding.title}
                        onChange={(e) => updateFinding(index, 'title', e.target.value)}
                        placeholder={t('findingTitle')}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      />
                      <textarea
                        value={finding.description}
                        onChange={(e) => updateFinding(index, 'description', e.target.value)}
                        placeholder={t('findingDescription')}
                        rows={2}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      />
                      <PhotoUploader
                        photos={finding.photos.map((url, i) => ({ id: `${i}`, url, uploadedAt: new Date() }))}
                        onPhotosChange={(photos) => updateFinding(index, 'photos', photos.map(p => p.url))}
                        maxPhotos={3}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">{t('immediateActions')}</h3>
                  <button
                    onClick={addAction}
                    className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3 h-3" />
                    {t('addAction')}
                  </button>
                </div>
                <div className="space-y-3">
                  {immediateActions.map((action, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <select
                          value={action.priority}
                          onChange={(e) => updateAction(index, 'priority', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="low">{t('priorityLow')}</option>
                          <option value="medium">{t('priorityMedium')}</option>
                          <option value="high">{t('priorityHigh')}</option>
                          <option value="critical">{t('priorityCritical')}</option>
                        </select>
                        <button
                          onClick={() => removeAction(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={action.description}
                        onChange={(e) => updateAction(index, 'description', e.target.value)}
                        placeholder={t('actionDescription')}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      />
                      <input
                        type="text"
                        value={action.responsible_person}
                        onChange={(e) => updateAction(index, 'responsible_person', e.target.value)}
                        placeholder={t('responsiblePerson')}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                      />
                      <input
                        type="date"
                        value={action.deadline}
                        onChange={(e) => updateAction(index, 'deadline', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Checklist Items */
            <div className="space-y-4">
              {currentStepItems.map(item => (
                <ChecklistItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  nameEs={item.name_es}
                  description={item.description}
                  compliant={checklistResults[item.id]?.compliant ?? undefined}
                  notes={checklistResults[item.id]?.notes || ''}
                  isCritical={item.is_critical}
                  onCompliantChange={(compliant) => handleChecklistChange(item.id, compliant, checklistResults[item.id]?.notes || '')}
                  onNotesChange={(notes) => handleChecklistChange(item.id, checklistResults[item.id]?.compliant, notes)}
                  showNotes={true}
                  size="md"
                />
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const steps: Step[] = ['observation', 'operations', 'cash', 'product', 'equipment', 'review']
              const currentIndex = steps.indexOf(currentStep)
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1])
              }
            }}
            disabled={currentStep === 'observation'}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('previous')}
          </button>

          <div className="flex gap-2">
            {currentStep !== 'review' ? (
              <button
                onClick={() => {
                  const steps: Step[] = ['observation', 'operations', 'cash', 'product', 'equipment', 'review']
                  const currentIndex = steps.indexOf(currentStep)
                  setCurrentStep(steps[currentIndex + 1])
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                {t('next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('saveDraft')}
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? t('submitting') : t('completeVisit')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Location Selector Modal (for ad-hoc/surprise visits) */}
      {showLocationSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{t('selectVisitLocation')}</h3>
              <p className="text-sm text-gray-500 mt-1">{t('selectVisitLocationDescription')}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {locations.map(location => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{location.name}</div>
                        <div className="text-sm text-gray-500">{location.cities?.name || 'N/A'}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => router.back()}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

// Default export with Suspense boundary for useSearchParams
export default function NewVisitPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <NewVisitForm />
    </Suspense>
  )
}
