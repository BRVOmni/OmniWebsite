/**
 * Forecasting Types
 *
 * Type definitions for the forecasting module.
 * All forecasting functionality uses these types for consistency.
 */

// ============================================================================
// FORECAST HORIZONS
// ============================================================================

/**
 * Short-term: 1-2 weeks (14 days) - Operational planning
 * Medium-term: 1-3 months (90 days) - Tactical planning
 * Long-term: 6-12 months (365 days) - Strategic planning
 */
export type ForecastHorizon = 'short' | 'medium' | 'long'

/**
 * Get the number of days for each horizon
 */
export function getForecastDays(horizon: ForecastHorizon): number {
  switch (horizon) {
    case 'short':
      return 14 // 2 weeks
    case 'medium':
      return 90 // 3 months
    case 'long':
      return 365 // 1 year
  }
}

// ============================================================================
// FORECAST METHODS
// ============================================================================

/**
 * Available forecasting algorithms
 *
 * Simple methods:
 * - simple-moving-average: Basic average of N periods
 * - weighted-moving-average: Weighted average (recent = more weight)
 *
 * Exponential smoothing methods:
 * - exponential-smoothing: No trend, no seasonality
 * - double-exponential-smoothing: Trend only (Holt's)
 * - triple-exponential-smoothing: Trend + seasonality (Holt-Winters)
 *
 * Regression:
 * - linear-regression: Linear trend line
 */
export type ForecastMethod =
  | 'simple-moving-average'
  | 'weighted-moving-average'
  | 'exponential-smoothing'
  | 'double-exponential-smoothing'
  | 'triple-exponential-smoothing'
  | 'linear-regression'

// ============================================================================
// FORECAST DIMENSIONS
// ============================================================================

/**
 * Dimensions to forecast by
 * - location: Per location forecasts
 * - brand: Per brand forecasts
 * - channel: Per sales channel (walk-in, delivery, etc.)
 * - product: Per product (for inventory)
 */
export type ForecastDimension = 'location' | 'brand' | 'channel' | 'product'

// ============================================================================
// TIME SERIES DATA
// ============================================================================

/**
 * A single point in a time series
 */
export interface TimeSeriesPoint {
  date: string
  value: number
  metadata?: Record<string, unknown>
}

/**
 * Add days to a date string
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

// ============================================================================
// FORECAST RESULT
// ============================================================================

/**
 * Complete forecast result with confidence intervals
 */
export interface ForecastResult {
  // Forecast parameters
  horizon: ForecastHorizon
  method: ForecastMethod
  dimension: ForecastDimension
  dimensionId?: string

  // Historical data used for training
  historicalData: TimeSeriesPoint[]

  // Forecasted values with confidence intervals
  forecast: ForecastPoint[]

  // Accuracy metrics (from backtesting)
  accuracy?: ForecastAccuracy

  // Seasonal components (if method supports it)
  seasonality?: SeasonalComponents

  // Metadata
  generatedAt: string
  dataPointsUsed: number
  confidence: number // 0.95 = 95% confidence
}

/**
 * A single forecast point with confidence interval
 */
export interface ForecastPoint {
  date: string
  value: number
  lowerBound: number // 95% confidence interval lower bound
  upperBound: number // 95% confidence interval upper bound
}

/**
 * Forecast accuracy metrics
 */
export interface ForecastAccuracy {
  mae: number // Mean Absolute Error
  mape: number // Mean Absolute Percentage Error
  rmse: number // Root Mean Square Error
  r2?: number // R-squared (for regression methods)
}

/**
 * Seasonal decomposition components
 */
export interface SeasonalComponents {
  trend: TimeSeriesPoint[]
  seasonal: TimeSeriesPoint[]
  residual: TimeSeriesPoint[]
}

// ============================================================================
// FORECAST REQUEST
// ============================================================================

/**
 * Parameters for generating a forecast
 */
export interface ForecastRequest {
  // Required parameters
  horizon: ForecastHorizon
  method: ForecastMethod
  dimension: ForecastDimension

  // Optional parameters
  dimensionId?: string
  startDate?: string
  endDate?: string
  confidence?: number // Default 0.95 (95%)

  // Filters (matching existing dashboard filters)
  locationId?: string
  brandId?: string
  channelId?: string

  // Algorithm parameters (optional, use defaults if not provided)
  window?: number // For moving average (default: 7)
  alpha?: number // For exponential smoothing (default: 0.3)
  beta?: number // For trend smoothing (default: 0.1)
  gamma?: number // For seasonal smoothing (default: 0.3)
  period?: number // Seasonal period (default: 7 for weekly)
}

// ============================================================================
// SPECIALIZED FORECAST RESULTS
// ============================================================================

/**
 * Staffing forecast result
 * Adds staffing-specific recommendations
 */
export interface StaffingForecastResult extends ForecastResult {
  type: 'staffing'
  periods: StaffingPeriod[]
}

/**
 * A single staffing period
 */
export interface StaffingPeriod extends ForecastPoint {
  hour?: number // For hourly granularity
  expectedOrders: number
  expectedRevenue: number
  recommendedStaff: number
  busyPeriod: boolean
}

/**
 * Inventory forecast result
 * Adds inventory-specific recommendations
 */
export interface InventoryForecastResult extends ForecastResult {
  type: 'inventory'
  productId?: string
  productName?: string
  forecasts: InventoryForecast[]
}

/**
 * A single inventory forecast point
 */
export interface InventoryForecast extends ForecastPoint {
  expectedDemand: number
  suggestedOrderQty: number
  stockoutRisk: 'low' | 'medium' | 'high'
  currentStock?: number
}

// ============================================================================
// SEASONAL ANALYSIS RESULT
// ============================================================================

/**
 * Result of seasonal pattern analysis
 */
export interface SeasonalAnalysisResult {
  dimension: ForecastDimension
  dimensionId?: string

  // Seasonal patterns
  weeklyPattern: WeeklyPattern
  monthlyPattern: MonthlyPattern
  yearlyPattern?: YearlyPattern

  // Trend analysis
  trend: TrendDirection
  trendStrength: number // 0-1, higher = stronger trend

  // Seasonality strength
  seasonalityStrength: number // 0-1, higher = more seasonal

  // Notable points
  peaks: NotablePoint[]
  troughs: NotablePoint[]

  // Metadata
  generatedAt: string
  dataPointsUsed: number
}

/**
 * Weekly pattern (7 days, Sunday = 0)
 */
export interface WeeklyPattern {
  pattern: number[] // 7 values
  peakDay: number // 0-6
  troughDay: number // 0-6
  description: {
    en: string
    es: string
  }
}

/**
 * Monthly pattern (12 months)
 */
export interface MonthlyPattern {
  pattern: number[] // 12 values
  peakMonth: number // 0-11
  troughMonth: number // 0-11
  description: {
    en: string
    es: string
  }
}

/**
 * Yearly pattern (if enough data)
 */
export interface YearlyPattern {
  pattern: number[] // Daily or weekly values
  description: {
    en: string
    es: string
  }
}

/**
 * Trend direction
 */
export type TrendDirection = 'increasing' | 'decreasing' | 'stable'

/**
 * A notable point (peak or trough)
 */
export interface NotablePoint {
  date: string
  value: number
  label: {
    en: string
    es: string
  }
  type: 'peak' | 'trough'
}

// ============================================================================
// BACKTESTING RESULT
// ============================================================================

/**
 * Result of backtesting (testing forecast accuracy on historical data)
 */
export interface BacktestResult {
  method: ForecastMethod
  dimension: ForecastDimension
  dimensionId?: string

  // Accuracy metrics
  accuracy: ForecastAccuracy

  // Comparison data
  forecasts: TimeSeriesPoint[]
  actuals: TimeSeriesPoint[]
  errors: ErrorPoint[]

  // Training info
  trainingStartDate: string
  trainingEndDate: string
  testStartDate: string
  testEndDate: string
  trainingDataPoints: number
  testDataPoints: number

  // Metadata
  generatedAt: string
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
