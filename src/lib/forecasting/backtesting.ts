/**
 * Forecasting Backtesting & Accuracy Metrics
 *
 * Provides functions to:
 * - Backtest forecasting algorithms on historical data
 * - Calculate accuracy metrics (MAE, MAPE, RMSE)
 * - Compare different algorithms
 * - Generate accuracy reports
 */

import type { TimeSeriesPoint, ForecastAccuracy, ForecastMethod } from './types'

// ============================================================================
// ACCURACY METRICS
// ============================================================================

/**
 * Calculate Mean Absolute Error (MAE)
 * Average of absolute differences between predicted and actual values
 */
export function calculateMAE(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) return 0

  const sum = actual.reduce((sum, a, i) => sum + Math.abs(a - predicted[i]), 0)
  return sum / actual.length
}

/**
 * Calculate Mean Absolute Percentage Error (MAPE)
 * Average of absolute percentage differences
 */
export function calculateMAPE(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) return 0

  const sum = actual.reduce((sum, a, i) => {
    if (a === 0) return sum // Skip zero values to avoid division by zero
    return sum + Math.abs((a - predicted[i]) / a)
  }, 0)

  return (sum / actual.length) * 100
}

/**
 * Calculate Root Mean Square Error (RMSE)
 * Square root of average squared differences
 */
export function calculateRMSE(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) return 0

  const sum = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0)
  return Math.sqrt(sum / actual.length)
}

/**
 * Calculate R-squared (coefficient of determination)
 * Proportion of variance explained by the model
 */
export function calculateRSquared(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) return 0

  const mean = actual.reduce((sum, a) => sum + a, 0) / actual.length

  const ssTot = actual.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0)
  const ssRes = actual.reduce((sum, a, i) => sum + Math.pow(a - predicted[i], 2), 0)

  if (ssTot === 0) return 0
  return 1 - (ssRes / ssTot)
}

/**
 * Calculate all accuracy metrics
 */
export function calculateAccuracyMetrics(actual: number[], predicted: number[]): ForecastAccuracy {
  return {
    mae: calculateMAE(actual, predicted),
    mape: calculateMAPE(actual, predicted),
    rmse: calculateRMSE(actual, predicted),
    r2: calculateRSquared(actual, predicted)
  }
}

// ============================================================================
// BACKTESTING
// ============================================================================

/**
 * Backtest result
 */
export interface BacktestResult {
  method: ForecastMethod
  testDataPoints: number
  trainingDataPoints: number

  // Accuracy metrics
  accuracy: ForecastAccuracy

  // Forecast vs Actual data
  forecasts: TimeSeriesPoint[]
  actuals: TimeSeriesPoint[]
  errors: ErrorPoint[]

  // Accuracy assessment
  assessment: 'excellent' | 'good' | 'fair' | 'poor'
  recommendation: string
}

/**
 * Error between forecast and actual
 */
export interface ErrorPoint {
  date: string
  actual: number
  predicted: number
  error: number
  absError: number
  pctError: number
}

/**
 * Perform backtesting on historical data
 *
 * Splits data into training and test sets, generates forecast for test period,
 * and calculates accuracy metrics.
 *
 * @param data Full historical time series data
 * @param method Forecasting method to test
 * @param forecastFn Function that generates forecast
 * @param trainRatio Ratio of data to use for training (default: 0.8)
 */
export async function backtest(
  data: TimeSeriesPoint[],
  method: ForecastMethod,
  forecastFn: (trainingData: TimeSeriesPoint[], horizon: number) => Promise<TimeSeriesPoint[]>,
  trainRatio: number = 0.8
): Promise<BacktestResult> {
  if (data.length < 10) {
    throw new Error('Not enough data for backtesting. Need at least 10 data points.')
  }

  // Split data into training and test sets
  const splitIndex = Math.floor(data.length * trainRatio)
  const trainingData = data.slice(0, splitIndex)
  const testData = data.slice(splitIndex)

  // Generate forecast for test period
  const forecast = await forecastFn(trainingData, testData.length)

  // Extract values for metrics calculation
  const actuals = testData.map(d => d.value)
  const predicted = forecast.map(d => d.value)

  // Calculate accuracy metrics
  const accuracy = calculateAccuracyMetrics(actuals, predicted)

  // Create error points
  const errors: ErrorPoint[] = testData.map((d, i) => {
    const pred = forecast[i]?.value || 0
    const err = d.value - pred
    return {
      date: d.date,
      actual: d.value,
      predicted: pred,
      error: err,
      absError: Math.abs(err),
      pctError: d.value !== 0 ? (err / d.value) * 100 : 0
    }
  })

  // Assess accuracy
  const assessment = getAccuracyAssessment(accuracy.mape)
  const recommendation = getRecommendation(assessment, accuracy)

  return {
    method,
    testDataPoints: testData.length,
    trainingDataPoints: trainingData.length,
    accuracy,
    forecasts: forecast,
    actuals: testData,
    errors,
    assessment,
    recommendation
  }
}

/**
 * Compare multiple forecasting methods
 */
export async function compareMethods(
  data: TimeSeriesPoint[],
  methods: Array<{
    name: ForecastMethod
    forecastFn: (trainingData: TimeSeriesPoint[], horizon: number) => Promise<TimeSeriesPoint[]>
  }>,
  trainRatio: number = 0.8
): Promise<BacktestResult[]> {
  const results = await Promise.all(
    methods.map(async ({ name, forecastFn }) => {
      try {
        return await backtest(data, name, forecastFn, trainRatio)
      } catch (error) {
        console.error(`Backtesting failed for ${name}:`, error)
        return null
      }
    })
  )

  // Filter out failed results and sort by MAPE (lower is better)
  return results
    .filter((r): r is BacktestResult => r !== null)
    .sort((a, b) => a.accuracy.mape - b.accuracy.mape)
}

/**
 * Get accuracy assessment based on MAPE
 */
function getAccuracyAssessment(mape: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (mape < 10) return 'excellent'
  if (mape < 20) return 'good'
  if (mape < 30) return 'fair'
  return 'poor'
}

/**
 * Get recommendation based on accuracy assessment
 */
function getRecommendation(
  assessment: string,
  accuracy: ForecastAccuracy
): string {
  const mape = accuracy.mape.toFixed(1)
  const mae = accuracy.mae.toFixed(0)
  const rmse = accuracy.rmse.toFixed(0)

  switch (assessment) {
    case 'excellent':
      return `Excellent forecast accuracy (MAPE: ${mape}%). This model is highly reliable for predictions.`
    case 'good':
      return `Good forecast accuracy (MAPE: ${mape}%). This model provides reliable predictions with acceptable error margins.`
    case 'fair':
      return `Fair forecast accuracy (MAPE: ${mape}%). Consider using additional features or trying different algorithms. MAE: ${mae}, RMSE: ${rmse}`
    case 'poor':
      return `Poor forecast accuracy (MAPE: ${mape}%). This model is not reliable for predictions. Try a different algorithm or check your data quality.`
    default:
      return 'Unable to assess forecast accuracy.'
  }
}

/**
 * Calculate confidence interval for forecast
 * Uses standard deviation of historical errors
 */
export function calculateConfidenceInterval(
  forecast: number[],
  historicalErrors: number[],
  confidence: number = 0.95
): { lower: number[]; upper: number[] } {
  // Calculate standard deviation of errors
  const meanError = historicalErrors.reduce((sum, e) => sum + e, 0) / historicalErrors.length
  const variance = historicalErrors.reduce((sum, e) => sum + Math.pow(e - meanError, 2), 0) / historicalErrors.length
  const stdDev = Math.sqrt(variance)

  // Z-score for confidence level (approximate)
  const zScore = confidence === 0.90 ? 1.645 : confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.96

  const margin = zScore * stdDev

  return {
    lower: forecast.map(f => Math.max(0, f - margin)),
    upper: forecast.map(f => f + margin)
  }
}

/**
 * Forecast accuracy summary for display
 */
export interface AccuracySummary {
  method: ForecastMethod
  mape: number
  mae: number
  rmse: number
  assessment: string
  recommendation: string
}

/**
 * Format accuracy summary for UI display
 */
export function formatAccuracySummary(backtest: BacktestResult): AccuracySummary {
  return {
    method: backtest.method,
    mape: backtest.accuracy.mape,
    mae: backtest.accuracy.mae,
    rmse: backtest.accuracy.rmse,
    assessment: backtest.assessment,
    recommendation: backtest.recommendation
  }
}
