/**
 * Simple Moving Average (SMA) and Weighted Moving Average (WMA)
 *
 * These are the simplest forecasting methods, perfect for:
 * - Stable data without clear trends
 * - Quick initial forecasts
 * - Junior developers learning forecasting
 *
 * SIMPLE MOVING AVERAGE (SMA)
 * Formula: SMA = (sum of last N values) / N
 *
 * Example with 3-period SMA:
 * - Data: [100, 110, 120, 130, 140]
 * - SMA(3) at period 3: (100 + 110 + 120) / 3 = 110
 * - SMA(3) at period 4: (110 + 120 + 130) / 3 = 120
 * - SMA(3) forecast for period 6: (120 + 130 + 140) / 3 = 130
 *
 * WEIGHTED MOVING AVERAGE (WMA)
 * Formula: WMA = sum(value[i] × weight[i]) / sum(weights)
 *
 * Example with 3-period WMA and weights [0.1, 0.3, 0.6]:
 * - More recent data gets higher weight
 * - Data: [100, 110, 120, 130, 140]
 * - WMA at period 3: (100×0.1 + 110×0.3 + 120×0.6) / 1.0 = 115
 * - WMA forecast for period 6: (120×0.1 + 130×0.3 + 140×0.6) / 1.0 = 135
 *
 * When to use:
 * - SMA: When all data points are equally important
 * - WMA: When recent data is more important (faster response to changes)
 */

import type {
  ForecastResult,
  ForecastRequest,
  TimeSeriesPoint,
  ForecastPoint,
  ForecastAccuracy
} from '../types'
import { getForecastDays, addDays } from '../types'

// ============================================================================
// SIMPLE MOVING AVERAGE
// ============================================================================

/**
 * Generate forecast using Simple Moving Average
 *
 * @param data - Historical time series data
 * @param request - Forecast request parameters
 * @returns Forecast result with confidence intervals
 */
export function simpleMovingAverage(
  data: TimeSeriesPoint[],
  request: ForecastRequest
): ForecastResult {
  const window = request.window || 7 // Default: 7-day moving average
  const forecastDays = getForecastDays(request.horizon)
  const confidence = request.confidence || 0.95

  // Validate we have enough data
  if (data.length < window) {
    throw new Error(
      `Not enough data for ${window}-period moving average. ` +
      `Need at least ${window} data points, got ${data.length}.`
    )
  }

  // Calculate moving averages for historical period
  const movingAverages: number[] = []
  const errors: number[] = []

  for (let i = window - 1; i < data.length; i++) {
    // Calculate average of last 'window' points
    let sum = 0
    for (let j = 0; j < window; j++) {
      sum += data[i - j].value
    }
    const avg = sum / window
    movingAverages[i] = avg

    // Track error for confidence intervals
    if (i >= window) {
      errors.push(Math.abs(data[i].value - movingAverages[i - 1]))
    }
  }

  // Calculate standard deviation of errors
  const stdError = calculateStandardDeviation(errors)
  const marginOfError = getZScore(confidence) * stdError

  // Generate future forecasts
  const lastDataPoint = data[data.length - 1]
  const lastSMA = movingAverages[movingAverages.length - 1]

  const forecast: ForecastPoint[] = []
  for (let i = 1; i <= forecastDays; i++) {
    const date = addDays(lastDataPoint.date, i)
    const value = lastSMA // SMA is flat after last known value

    forecast.push({
      date,
      value,
      lowerBound: value - marginOfError,
      upperBound: value + marginOfError
    })
  }

  // Calculate accuracy metrics
  const accuracy = calculateAccuracy(data, movingAverages)

  return {
    horizon: request.horizon,
    method: request.method,
    dimension: request.dimension,
    dimensionId: request.dimensionId,
    historicalData: data,
    forecast,
    accuracy,
    generatedAt: new Date().toISOString(),
    dataPointsUsed: data.length,
    confidence
  }
}

// ============================================================================
// WEIGHTED MOVING AVERAGE
// ============================================================================

/**
 * Generate forecast using Weighted Moving Average
 *
 * @param data - Historical time series data
 * @param request - Forecast request parameters
 * @returns Forecast result with confidence intervals
 */
export function weightedMovingAverage(
  data: TimeSeriesPoint[],
  request: ForecastRequest
): ForecastResult {
  const window = request.window || 7
  const forecastDays = getForecastDays(request.horizon)
  const confidence = request.confidence || 0.95

  // Default weights: more recent = higher weight
  // Linear weights: [1, 2, 3, ..., N]
  const weights = generateLinearWeights(window)

  if (data.length < window) {
    throw new Error(
      `Not enough data for ${window}-period weighted moving average. ` +
      `Need at least ${window} data points, got ${data.length}.`
    )
  }

  // Calculate weighted moving averages
  const weightedAverages: number[] = []
  const errors: number[] = []

  for (let i = window - 1; i < data.length; i++) {
    let weightedSum = 0
    let weightSum = 0

    for (let j = 0; j < window; j++) {
      const value = data[i - j].value
      const weight = weights[window - 1 - j] // Most recent gets highest weight
      weightedSum += value * weight
      weightSum += weight
    }

    const avg = weightedSum / weightSum
    weightedAverages[i] = avg

    // Track error for confidence intervals
    if (i >= window) {
      errors.push(Math.abs(data[i].value - weightedAverages[i - 1]))
    }
  }

  // Calculate standard deviation
  const stdError = calculateStandardDeviation(errors)
  const marginOfError = getZScore(confidence) * stdError

  // Generate future forecasts
  const lastDataPoint = data[data.length - 1]
  const lastWMA = weightedAverages[weightedAverages.length - 1]

  const forecast: ForecastPoint[] = []
  for (let i = 1; i <= forecastDays; i++) {
    const date = addDays(lastDataPoint.date, i)
    const value = lastWMA

    forecast.push({
      date,
      value,
      lowerBound: value - marginOfError,
      upperBound: value + marginOfError
    })
  }

  const accuracy = calculateAccuracy(data, weightedAverages)

  return {
    horizon: request.horizon,
    method: request.method,
    dimension: request.dimension,
    dimensionId: request.dimensionId,
    historicalData: data,
    forecast,
    accuracy,
    generatedAt: new Date().toISOString(),
    dataPointsUsed: data.length,
    confidence
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate linear weights for WMA
 * Example: window=3 → [1, 2, 3]
 */
function generateLinearWeights(window: number): number[] {
  return Array.from({ length: window }, (_, i) => i + 1)
}

/**
 * Calculate standard deviation of an array of numbers
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length

  return Math.sqrt(variance)
}

/**
 * Get z-score for a given confidence level
 * 95% confidence → 1.96
 * 90% confidence → 1.645
 * 99% confidence → 2.576
 */
function getZScore(confidence: number): number {
  const scores: Record<number, number> = {
    0.90: 1.645,
    0.95: 1.96,
    0.98: 2.326,
    0.99: 2.576
  }
  return scores[confidence] || 1.96
}

/**
 * Calculate forecast accuracy metrics
 */
function calculateAccuracy(
  data: TimeSeriesPoint[],
  forecasts: number[]
): ForecastAccuracy {
  const errors: number[] = []
  const pctErrors: number[] = []

  // Compare forecast vs actual (skip initial window period)
  for (let i = forecasts.length - 1; i < data.length; i++) {
    const actual = data[i].value
    const predicted = forecasts[i - 1] || forecasts[forecasts.length - 1]
    const error = actual - predicted

    errors.push(Math.abs(error))
    pctErrors.push(Math.abs(error / actual))
  }

  const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length
  const mape = (pctErrors.reduce((sum, e) => sum + e, 0) / pctErrors.length) * 100
  const rmse = Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / errors.length)

  return { mae, mape, rmse }
}
