/**
 * Supervision Scoring System
 *
 * Calculates scores for supervision visits based on 6 categories:
 * 1. Liderazgo (Leadership) - 15% weight
 * 2. Orden (Order) - 20% weight
 * 3. Caja (Cash Management) - 25% weight
 * 4. Stock (Inventory) - 20% weight
 * 5. Limpieza (Cleanliness) - 10% weight
 * 6. Equipos (Equipment) - 10% weight
 *
 * Final classification: Excellent (90-100), Good (75-89), Fair (60-74), Poor (<60)
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export interface CategoryScore {
  category: 'liderazgo' | 'orden' | 'caja' | 'stock' | 'limpieza' | 'equipos'
  categoryName: string
  categoryNameEs: string
  score: number // 0-100
  weight: number // Percentage weight in total
  compliantItems: number
  totalItems: number
  criticalFindings: number
  observations: string
}

export interface VisitScores {
  visit_id: string
  location_id: string
  visit_date: string
  visit_type: string

  // Individual category scores
  score_liderazgo: number
  score_orden: number
  score_caja: number
  score_stock: number
  score_limpieza: number
  score_equipos: number

  // Overall scores
  score_total: number
  score_operacion: number // Combined liderazgo + orden

  // Classification
  classification: 'excelente' | 'bueno' | 'regular' | 'deficiente'

  // 5 Key Questions
  operations_functioning: boolean
  money_controlled: boolean
  product_managed: boolean
  customer_experience_adequate: boolean
  manager_team_control: boolean

  // Details
  category_scores: CategoryScore[]
  total_findings: number
  critical_findings: number
}

export interface ChecklistResult {
  item_id: string
  category: string
  compliant: boolean
  is_critical: boolean
  notes?: string
  severity?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_WEIGHTS = {
  liderazgo: 0.15,   // 15%
  orden: 0.20,       // 20%
  caja: 0.25,        // 25%
  stock: 0.20,       // 20%
  limpieza: 0.10,    // 10%
  equipos: 0.10      // 10%
}

const CATEGORY_INFO = {
  liderazgo: { name: 'Leadership', nameEs: 'Liderazgo' },
  orden: { name: 'Order', nameEs: 'Orden' },
  caja: { name: 'Cash Management', nameEs: 'Caja' },
  stock: { name: 'Inventory', nameEs: 'Stock' },
  limpieza: { name: 'Cleanliness', nameEs: 'Limpieza' },
  equipos: { name: 'Equipment', nameEs: 'Equipos' }
}

const CLASSIFICATION_THRESHOLDS = {
  excelente: { min: 90, label: 'Excellent', labelEs: 'Excelente' },
  bueno: { min: 75, label: 'Good', labelEs: 'Bueno' },
  regular: { min: 60, label: 'Fair', labelEs: 'Regular' },
  deficiente: { min: 0, label: 'Poor', labelEs: 'Deficiente' }
}

// ============================================================================
// SCORE CALCULATION
// ============================================================================

/**
 * Calculate all scores for a visit based on checklist results
 */
export async function calculateVisitScores(
  visitId: string,
  checklistResults: ChecklistResult[],
  findings: Array<{
    category?: string
    severity?: string
    title?: string
  }> = []
): Promise<VisitScores> {
  // Group checklist results by category
  const categoryResults = new Map<string, ChecklistResult[]>()
  checklistResults.forEach(result => {
    if (!categoryResults.has(result.category)) {
      categoryResults.set(result.category, [])
    }
    categoryResults.get(result.category)!.push(result)
  })

  // Calculate scores for each category
  const categoryScores: CategoryScore[] = []

  for (const [category, results] of categoryResults.entries()) {
    const score = calculateCategoryScore(results, findings)
    categoryScores.push(score)
  }

  // Ensure all 6 categories have scores (default to 0 if no items)
  const allCategories: Array<'liderazgo' | 'orden' | 'caja' | 'stock' | 'limpieza' | 'equipos'> =
    ['liderazgo', 'orden', 'caja', 'stock', 'limpieza', 'equipos']

  for (const category of allCategories) {
    if (!categoryScores.find(s => s.category === category)) {
      categoryScores.push({
        category,
        categoryName: CATEGORY_INFO[category].name,
        categoryNameEs: CATEGORY_INFO[category].nameEs,
        score: 0,
        weight: CATEGORY_WEIGHTS[category] * 100,
        compliantItems: 0,
        totalItems: 0,
        criticalFindings: 0,
        observations: 'No items evaluated'
      })
    }
  }

  // Calculate weighted total score
  const score_total = calculateWeightedTotal(categoryScores)

  // Calculate operation score (liderazgo + orden)
  const liderazgoScore = categoryScores.find(s => s.category === 'liderazgo')?.score || 0
  const ordenScore = categoryScores.find(s => s.category === 'orden')?.score || 0
  const score_operacion = (liderazgoScore + ordenScore) / 2

  // Determine classification
  const classification = determineClassification(score_total)

  // Calculate 5 key questions
  const fiveKeyQuestions = calculateFiveKeyQuestions(categoryScores, findings)

  // Count findings
  const criticalFindings = findings.filter(f => f.severity === 'critical' || f.severity === 'high').length

  return {
    visit_id: visitId,
    location_id: '', // Will be filled by caller
    visit_date: '',
    visit_type: '',
    score_liderazgo: categoryScores.find(s => s.category === 'liderazgo')?.score || 0,
    score_orden: categoryScores.find(s => s.category === 'orden')?.score || 0,
    score_caja: categoryScores.find(s => s.category === 'caja')?.score || 0,
    score_stock: categoryScores.find(s => s.category === 'stock')?.score || 0,
    score_limpieza: categoryScores.find(s => s.category === 'limpieza')?.score || 0,
    score_equipos: categoryScores.find(s => s.category === 'equipos')?.score || 0,
    score_total: Math.round(score_total),
    score_operacion: Math.round(score_operacion),
    classification,
    operations_functioning: fiveKeyQuestions.operations_functioning,
    money_controlled: fiveKeyQuestions.money_controlled,
    product_managed: fiveKeyQuestions.product_managed,
    customer_experience_adequate: fiveKeyQuestions.customer_experience_adequate,
    manager_team_control: fiveKeyQuestions.manager_team_control,
    category_scores: categoryScores,
    total_findings: findings.length,
    critical_findings: criticalFindings
  }
}

/**
 * Calculate score for a single category
 */
function calculateCategoryScore(
  results: ChecklistResult[],
  findings: Array<{ category?: string; severity?: string }>
): CategoryScore {
  const category = results[0]?.category || 'general'
  const compliantCount = results.filter(r => r.compliant).length
  const totalCount = results.length

  // Base score from compliance percentage
  const compliancePercentage = totalCount > 0 ? (compliantCount / totalCount) * 100 : 0

  // Find category-specific findings
  const categoryFindings = findings.filter(f => f.category === category)
  const criticalFindings = categoryFindings.filter(f => f.severity === 'critical' || f.severity === 'high').length

  // Deduct points for critical findings (10 points each)
  const criticalDeduction = criticalFindings * 10

  // Calculate final score
  let score = Math.max(0, compliancePercentage - criticalDeduction)

  // Non-compliant critical items have a bigger impact
  const nonCompliantCritical = results.filter(r => !r.compliant && r.is_critical).length
  if (nonCompliantCritical > 0) {
    score = Math.max(0, score - (nonCompliantCritical * 15))
  }

  // Round to nearest integer
  score = Math.round(score)

  // Generate observations
  const observations = generateCategoryObservations(results, categoryFindings)

  return {
    category: category as any,
    categoryName: CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]?.name || category,
    categoryNameEs: CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]?.nameEs || category,
    score,
    weight: CATEGORY_WEIGHTS[category as keyof typeof CATEGORY_WEIGHTS] * 100,
    compliantItems: compliantCount,
    totalItems: totalCount,
    criticalFindings,
    observations
  }
}

/**
 * Calculate weighted total score
 */
function calculateWeightedTotal(categoryScores: CategoryScore[]): number {
  let totalScore = 0

  for (const categoryScore of categoryScores) {
    const weight = CATEGORY_WEIGHTS[categoryScore.category as keyof typeof CATEGORY_WEIGHTS] || 0
    totalScore += categoryScore.score * weight
  }

  return Math.round(totalScore)
}

/**
 * Determine classification based on total score
 */
function determineClassification(score: number): 'excelente' | 'bueno' | 'regular' | 'deficiente' {
  if (score >= CLASSIFICATION_THRESHOLDS.excelente.min) {
    return 'excelente'
  } else if (score >= CLASSIFICATION_THRESHOLDS.bueno.min) {
    return 'bueno'
  } else if (score >= CLASSIFICATION_THRESHOLDS.regular.min) {
    return 'regular'
  } else {
    return 'deficiente'
  }
}

/**
 * Calculate 5 Key Questions based on category scores
 */
function calculateFiveKeyQuestions(
  categoryScores: CategoryScore[],
  findings: Array<{ category?: string; severity?: string }>
): {
  operations_functioning: boolean
  money_controlled: boolean
  product_managed: boolean
  customer_experience_adequate: boolean
  manager_team_control: boolean
} {
  const liderazgoScore = categoryScores.find(s => s.category === 'liderazgo')?.score || 0
  const ordenScore = categoryScores.find(s => s.category === 'orden')?.score || 0
  const cajaScore = categoryScores.find(s => s.category === 'caja')?.score || 0
  const stockScore = categoryScores.find(s => s.category === 'stock')?.score || 0
  const limpiezaScore = categoryScores.find(s => s.category === 'limpieza')?.score || 0

  // Operations functioning: Orden score >= 70
  const operations_functioning = ordenScore >= 70

  // Money controlled: Caja score >= 70 and no critical findings in caja
  const cajaCriticalFindings = findings.filter(f => f.category === 'caja' && (f.severity === 'critical' || f.severity === 'high'))
  const money_controlled = cajaScore >= 70 && cajaCriticalFindings.length === 0

  // Product managed: Stock score >= 70
  const product_managed = stockScore >= 70

  // Customer experience adequate: Limpieza score >= 70
  const customer_experience_adequate = limpiezaScore >= 70

  // Manager team control: Liderazgo score >= 70
  const manager_team_control = liderazgoScore >= 70

  return {
    operations_functioning,
    money_controlled,
    product_managed,
    customer_experience_adequate,
    manager_team_control
  }
}

/**
 * Generate observations for a category
 */
function generateCategoryObservations(
  results: ChecklistResult[],
  findings: Array<{ category?: string; severity?: string; title?: string }>
): string {
  const observations: string[] = []

  // Note compliance rate
  const compliantCount = results.filter(r => r.compliant).length
  const totalCount = results.length
  const complianceRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0

  observations.push(`${complianceRate}% compliant (${compliantCount}/${totalCount} items)`)

  // Note non-compliant critical items
  const nonCompliantCritical = results.filter(r => !r.compliant && r.is_critical)
  if (nonCompliantCritical.length > 0) {
    observations.push(`${nonCompliantCritical.length} critical non-compliant items`)
  }

  // Note findings
  if (findings.length > 0) {
    const criticalFindings = findings.filter(f => f.severity === 'critical' || f.severity === 'high')
    if (criticalFindings.length > 0) {
      observations.push(`${criticalFindings.length} critical findings`)
    }
  }

  return observations.join('. ')
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate scores before saving
 */
export function validateScores(scores: VisitScores): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check score ranges
  if (scores.score_liderazgo < 0 || scores.score_liderazgo > 100) {
    errors.push('Leadership score must be between 0 and 100')
  }
  if (scores.score_orden < 0 || scores.score_orden > 100) {
    errors.push('Order score must be between 0 and 100')
  }
  if (scores.score_caja < 0 || scores.score_caja > 100) {
    errors.push('Cash score must be between 0 and 100')
  }
  if (scores.score_stock < 0 || scores.score_stock > 100) {
    errors.push('Stock score must be between 0 and 100')
  }
  if (scores.score_limpieza < 0 || scores.score_limpieza > 100) {
    errors.push('Cleanliness score must be between 0 and 100')
  }
  if (scores.score_equipos < 0 || scores.score_equipos > 100) {
    errors.push('Equipment score must be between 0 and 100')
  }

  // Check total score
  if (scores.score_total < 0 || scores.score_total > 100) {
    errors.push('Total score must be between 0 and 100')
  }

  // Check classification matches score
  const expectedClassification = determineClassification(scores.score_total)
  if (scores.classification !== expectedClassification) {
    errors.push(`Classification should be "${expectedClassification}" for a score of ${scores.score_total}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get classification label
 */
export function getClassificationLabel(
  classification: string,
  language: 'en' | 'es' = 'en'
): string {
  const info = CLASSIFICATION_THRESHOLDS[classification as keyof typeof CLASSIFICATION_THRESHOLDS]
  return language === 'es' ? info.labelEs : info.label
}

/**
 * Get classification color
 */
export function getClassificationColor(classification: string): string {
  switch (classification) {
    case 'excelente':
      return '#22c55e' // Green
    case 'bueno':
      return '#3b82f6' // Blue
    case 'regular':
      return '#f59e0b' // Orange
    case 'deficiente':
      return '#ef4444' // Red
    default:
      return '#6b7280' // Gray
  }
}

/**
 * Get score trend (comparing two scores)
 */
export function getScoreTrend(previousScore: number, currentScore: number): {
  direction: 'up' | 'down' | 'stable'
  change: number
  changePercent: number
} {
  const change = currentScore - previousScore
  const changePercent = previousScore > 0 ? (change / previousScore) * 100 : 0

  let direction: 'up' | 'down' | 'stable' = 'stable'
  if (Math.abs(change) >= 5) {
    direction = change > 0 ? 'up' : 'down'
  }

  return {
    direction,
    change: Math.round(change),
    changePercent: Math.round(changePercent)
  }
}

/**
 * Calculate supervisor performance metrics
 */
export async function calculateSupervisorMetrics(
  supervisorId: string,
  days: number = 30
): Promise<{
  visitsCompleted: number
  averageScore: number
  averageScoreByCategory: Record<string, number>
  classificationDistribution: Record<string, number>
  trend: 'improving' | 'stable' | 'declining'
}> {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get visits in period
  const { data: visits } = await supabase
    .from('supervision_visits')
    .select('score_total, score_liderazgo, score_orden, score_caja, score_stock, score_limpieza, score_equipos, classification, visit_date')
    .eq('supervisor_id', supervisorId)
    .gte('visit_date', startDate.toISOString().split('T')[0])
    .order('visit_date', { ascending: true })

  if (!visits || visits.length === 0) {
    return {
      visitsCompleted: 0,
      averageScore: 0,
      averageScoreByCategory: {},
      classificationDistribution: {},
      trend: 'stable'
    }
  }

  // Calculate average scores
  const avgScore = visits.reduce((sum, v) => sum + (v.score_total || 0), 0) / visits.length

  const avgScoreByCategory: Record<string, number> = {
    liderazgo: visits.reduce((sum, v) => sum + (v.score_liderazgo || 0), 0) / visits.length,
    orden: visits.reduce((sum, v) => sum + (v.score_orden || 0), 0) / visits.length,
    caja: visits.reduce((sum, v) => sum + (v.score_caja || 0), 0) / visits.length,
    stock: visits.reduce((sum, v) => sum + (v.score_stock || 0), 0) / visits.length,
    limpieza: visits.reduce((sum, v) => sum + (v.score_limpieza || 0), 0) / visits.length,
    equipos: visits.reduce((sum, v) => sum + (v.score_equipos || 0), 0) / visits.length
  }

  // Classification distribution
  const classificationDistribution: Record<string, number> = {
    excelente: visits.filter(v => v.classification === 'excelente').length,
    bueno: visits.filter(v => v.classification === 'bueno').length,
    regular: visits.filter(v => v.classification === 'regular').length,
    deficiente: visits.filter(v => v.classification === 'deficiente').length
  }

  // Calculate trend (compare first half with second half)
  const midPoint = Math.floor(visits.length / 2)
  const firstHalf = visits.slice(0, midPoint)
  const secondHalf = visits.slice(midPoint)

  let trend: 'improving' | 'stable' | 'declining' = 'stable'

  if (firstHalf.length > 0 && secondHalf.length > 0) {
    const firstHalfAvg = firstHalf.reduce((sum, v) => sum + (v.score_total || 0), 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, v) => sum + (v.score_total || 0), 0) / secondHalf.length

    if (secondHalfAvg - firstHalfAvg >= 5) {
      trend = 'improving'
    } else if (firstHalfAvg - secondHalfAvg >= 5) {
      trend = 'declining'
    }
  }

  return {
    visitsCompleted: visits.length,
    averageScore: Math.round(avgScore),
    averageScoreByCategory: avgScoreByCategory,
    classificationDistribution,
    trend
  }
}
