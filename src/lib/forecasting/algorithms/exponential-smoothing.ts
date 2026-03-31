/**
 * Exponential Smoothing Algorithms
 *
 * These algorithms handle trends and seasonality in time series data.
 * Perfect for business data with patterns!
 *
 * SIMPLE EXPONENTIAL SMOOTHING (SES)
 * Formula: F(t+1) = α × Y(t) + (1-α) × F(t)
 *
 * Where:
 * - F(t+1) = Forecast for next period
 * - Y(t) = Actual value at time t
 * - F(t) = Forecast for time t
 * - α = Smoothing factor (0-1)
 *
 * Example with α=0.3:
 * - Data: [100, 110, 120]
 * - F(1) = 100 (initialization)
 * - F(2) = 0.3×110 + 0.7×100 = 103
 * - F(3) = 0.3×120 + 0.7×103 = 108.1
 * - F(4) = 0.3×? + 0.7×108.1 (forecast)
 *
 * When α is HIGH (close to 1): Fast response, more volatile
 * When α is LOW (close to 0): Slow response, smoother
 *
 * DOUBLE EXPONENTIAL SMOOTHING (HOLT'S METHOD)
 * Adds trend component to handle data with linear trends
 *
 * TRIPLE EXPONENTIAL SMOOTHING (HOLT-WINTERS)
 * Adds seasonal component to handle trends + seasonality
 * This is the industry standard for business forecasting!
 *
 * Holt-Winters Formulas:
 * - Level: L(t) = α × (Y(t) - S(t-p)) + (1-α) × (L(t-1) + T(t-1))
 * - Trend: T(t) = β × (L(t) - L(t-1)) + (1-β) × T(t-1)
 * - Seasonality: S(t) = γ × (Y(t) - L(t)) + (1-γ) × S(t-p)
 * - Forecast: F(t+m) = L(t) + m × T(t) + S(t-p+m)
 *
 * Where p = seasonal period (7=weekly, 12=monthly)
 */

import type {
  ForecastResult,
  ForecastRequest,
  TimeSeriesPoint,
  ForecastPoint,
  ForecastAccuracy,
  SeasonalComponents
} from '../types'
import { getForecastDays, addDays } from '../types'

// ============================================================================
// SIMPLE EXPONENTIAL SMOOTHING (SES)
// ============================================================================

/**
 * Generate forecast using Simple Exponential Smoothing
 *
 * Best for: Data without clear trend or seasonality
 *
 * @param data - Historical time series data
 * @param request - Forecast request parameters
 * @returns Forecast result with confidence intervals
 */
export function simpleExponentialSmoothing(
  data: TimeSeriesPoint[],
  request: ForecastRequest
): ForecastResult {
  const alpha = request.alpha ?? 0.3 // Default smoothing factor: 0.3
  const forecastDays = getForecastDays(request.horizon)
  const confidence = request.confidence ?? 0.95

  // Initialize with first value
  const forecasts: number[] = [data[0].value]
  const errors: number[] = []

  // Generate forecasts for each historical period
  for (let i = 1; i < data.length; i++) {
    const actual = data[i].value
    const prevForecast = forecasts[i - 1]

    // SES formula: F(t) = α × Y(t-1) + (1-α) × F(t-1)
    const forecast = alpha * actual + (1 - alpha) * prevForecast
    forecasts[i] = forecast

    // Track error for confidence intervals
    errors.push(Math.abs(actual - prevForecast))
  }

  // Calculate standard deviation for confidence intervals
  const stdError = calculateStandardDeviation(errors)
  const marginOfError = getZScore(confidence) * stdError

  // Generate future forecasts
  const lastDataPoint = data[data.length - 1]
  const lastForecast = forecasts[forecasts.length - 1]

  const forecast: ForecastPoint[] = []
  for (let i = 1; i <= forecastDays; i++) {
    const date = addDays(lastDataPoint.date, i)
    const value = lastForecast // SES flatlines after last known value

    forecast.push({
      date,
      value,
      lowerBound: value - marginOfError,
      upperBound: value + marginOfError
    })
  }

  const accuracy = calculateAccuracy(data, forecasts)

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
// DOUBLE EXPONENTIAL SMOOTHING (HOLT'S METHOD)
// ============================================================================

/**
 * Generate forecast using Double Exponential Smoothing
 *
 * Best for: Data with linear trend but no seasonality
 *
 * @param data - Historical time series data
 * @param request - Forecast request parameters
 * @returns Forecast result with confidence intervals
 */
export function doubleExponentialSmoothing(
  data: TimeSeriesPoint[],
  request: ForecastRequest
): ForecastResult {
  const alpha = request.alpha ?? 0.3 // Level smoothing
  const beta = request.beta ?? 0.1 // Trend smoothing
  const forecastDays = getForecastDays(request.horizon)
  const confidence = request.confidence ?? 0.95

  // Initialize: Use first two points to estimate initial level and trend
  let level = data[0].value
  let trend = data[1].value - data[0].value

  const levels: number[] = [level]
  const trends: number[] = [trend]
  const forecasts: number[] = []
  const errors: number[] = []

  // Generate forecasts for each historical period
  for (let i = 1; i < data.length; i++) {
    const actual = data[i].value

    // Holt's formulas:
    // Level: L(t) = α × Y(t) + (1-α) × (L(t-1) + T(t-1))
    const newLevel = alpha * actual + (1 - alpha) * (level + trend)

    // Trend: T(t) = β × (L(t) - L(t-1)) + (1-β) × T(t-1)
    const newTrend = beta * (newLevel - level) + (1 - beta) * trend

    level = newLevel
    trend = newTrend

    levels[i] = level
    trends[i] = trend

    // Forecast: F(t) = L(t-1) + T(t-1)
    const forecast = level + trend
    forecasts[i] = forecast

    // Track error
    errors.push(Math.abs(actual - forecast))
  }

  // Calculate standard deviation
  const stdError = calculateStandardDeviation(errors)
  const marginOfError = getZScore(confidence) * stdError

  // Generate future forecasts with trend
  const lastDataPoint = data[data.length - 1]

  const forecastPoints: ForecastPoint[] = []
  for (let i = 1; i <= forecastDays; i++) {
    const date = addDays(lastDataPoint.date, i)
    const value = level + (i * trend) // Trend continues into future

    forecastPoints.push({
      date,
      value,
      lowerBound: value - marginOfError,
      upperBound: value + marginOfError
    })
  }

  const accuracy = calculateAccuracy(data, forecasts)

  return {
    horizon: request.horizon,
    method: request.method,
    dimension: request.dimension,
    dimensionId: request.dimensionId,
    historicalData: data,
    forecast: forecastPoints,
    accuracy,
    generatedAt: new Date().toISOString(),
    dataPointsUsed: data.length,
    confidence
  }
}

// ============================================================================
// TRIPLE EXPONENTIAL SMOOTHING (HOLT-WINTERS)
// ============================================================================

/**
 * Generate forecast using Triple Exponential Smoothing (Holt-Winters)
 *
 * Best for: Data with trend AND seasonality
 * This is the industry standard for business forecasting!
 *
 * @param data - Historical time series data
 * @param request - Forecast request parameters
 * @returns Forecast result with confidence intervals
 */
export function tripleExponentialSmoothing(
  data: TimeSeriesPoint[],
  request: ForecastRequest
): ForecastResult {
  const alpha = request.alpha ?? 0.3 // Level smoothing
  const beta = request.beta ?? 0.1 // Trend smoothing
  const gamma = request.gamma ?? 0.3 // Seasonal smoothing
  const period = request.period ?? 7 // Seasonal period (7=weekly, 12=monthly)
  const forecastDays = getForecastDays(request.horizon)
  const confidence = request.confidence ?? 0.95

  // Need at least 2 × period data points
  if (data.length < 2 * period) {
    throw new Error(
      `Not enough data for Holt-Winters with period=${period}. ` +
      `Need at least ${2 * period} data points, got ${data.length}.`
    )
  }

  // Initialize components using first season
  const seasons: number[][] = [[]]
  for (let i = 0; i < period; i++) {
    seasons[0][i] = data[i].value
  }

  // Calculate initial level and trend from first two seasons
  const firstSeasonAvg = seasons[0].reduce((a, b) => a + b, 0) / period
  const secondSeasonAvg = data.slice(period, 2 * period)
    .reduce((sum, d) => sum + d.value, 0) / period

  let level = firstSeasonAvg
  let trend = (secondSeasonAvg - firstSeasonAvg) / period

  // Initialize seasonal indices
  const seasonalIndices = seasons[0].map(v => v - firstSeasonAvg)

  const levels: number[] = []
  const trends: number[] = []
  const seasonals: number[][] = [seasonalIndices]
  const forecasts: number[] = []
  const errors: number[] = []

  // Generate forecasts for each historical period
  for (let i = period; i < data.length; i++) {
    const actual = data[i].value
    const seasonalIndex = i % period

    // Holt-Winters formulas:
    // Level: L(t) = α × (Y(t) - S(t-p)) + (1-α) × (L(t-1) + T(t-1))
    const newLevel = alpha * (actual - seasonalIndices[seasonalIndex]) +
      (1 - alpha) * (level + trend)

    // Trend: T(t) = β × (L(t) - L(t-1)) + (1-β) × T(t-1)
    const newTrend = beta * (newLevel - level) + (1 - beta) * trend

    // Seasonality: S(t) = γ × (Y(t) - L(t)) + (1-γ) × S(t-p)
    const newSeasonal = gamma * (actual - newLevel) +
      (1 - gamma) * seasonalIndices[seasonalIndex]

    level = newLevel
    trend = newTrend
    seasonalIndices[seasonalIndex] = newSeasonal

    levels[i] = level
    trends[i] = trend

    // Forecast: F(t) = L(t-1) + T(t-1) + S(t-p)
    const prevSeasonalIndex = (i - 1) % period
    const forecast = level + trend + seasonalIndices[prevSeasonalIndex]
    forecasts[i] = forecast

    errors.push(Math.abs(actual - forecast))
  }

  // Calculate standard deviation
  const stdError = calculateStandardDeviation(errors)
  const marginOfError = getZScore(confidence) * stdError

  // Generate future forecasts
  const lastDataPoint = data[data.length - 1]

  const forecastPoints: ForecastPoint[] = []
  for (let i = 1; i <= forecastDays; i++) {
    const date = addDays(lastDataPoint.date, i)
    const seasonalIndex = (data.length + i - 1) % period

    // Forecast: F(t+m) = L(t) + m × T(t) + S(t-p+m)
    const value = level + (i * trend) + seasonalIndices[seasonalIndex]

    forecastPoints.push({
      date,
      value,
      lowerBound: value - marginOfError,
      upperBound: value + marginOfError
    })
  }

  const accuracy = calculateAccuracy(data, forecasts)

  // Create seasonal components for visualization
  const seasonalComponents: SeasonalComponents = {
    trend: data.map((d, i) => ({
      date: d.date,
      value: levels[i] || d.value
    })),
    seasonal: data.map((d, i) => ({
      date: d.date,
      value: seasonals[Math.floor(i / period)]?.[i % period] || 0
    })),
    residual: data.map((d, i) => ({
      date: d.date,
      value: d.value - (levels[i] || 0) - (seasonals[Math.floor(i / period)]?.[i % period] || 0)
    }))
  }

  return {
    horizon: request.horizon,
    method: request.method,
    dimension: request.dimension,
    dimensionId: request.dimensionId,
    historicalData: data,
    forecast: forecastPoints,
    accuracy,
    seasonality: seasonalComponents,
    generatedAt: new Date().toISOString(),
    dataPointsUsed: data.length,
    confidence
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

  for (let i = 1; i < data.length; i++) {
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
