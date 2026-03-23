/**
 * Forecasting Algorithm Registry
 *
 * This file exports all forecasting algorithms and provides
 * a unified interface to select the appropriate algorithm.
 *
 * Usage:
 * ```typescript
 * import { generateForecast } from '@/lib/forecasting/algorithms'
 *
 * const forecast = generateForecast(historicalData, {
 *   method: 'exponential-smoothing',
 *   horizon: 'medium',
 *   dimension: 'location',
 *   locationId: 'abc-123'
 * })
 * ```
 */

import type { ForecastRequest, ForecastResult } from '../types'
import {
  simpleMovingAverage,
  weightedMovingAverage
} from './simple-moving-average'
import {
  simpleExponentialSmoothing,
  doubleExponentialSmoothing,
  tripleExponentialSmoothing
} from './exponential-smoothing'

// ============================================================================
// ALGORITHM REGISTRY
// ============================================================================

/**
 * Map of algorithm names to their implementations
 */
const algorithms = {
  'simple-moving-average': simpleMovingAverage,
  'weighted-moving-average': weightedMovingAverage,
  'exponential-smoothing': simpleExponentialSmoothing,
  'double-exponential-smoothing': doubleExponentialSmoothing,
  'triple-exponential-smoothing': tripleExponentialSmoothing
}

// ============================================================================
// MAIN FORECASTING FUNCTION
// ============================================================================

/**
 * Generate a forecast using the specified method
 *
 * This is the main entry point for forecasting.
 * It selects the appropriate algorithm and returns the forecast.
 *
 * @param data - Historical time series data
 * @param request - Forecast request parameters
 * @returns Forecast result with confidence intervals
 *
 * @example
 * ```typescript
 * const forecast = generateForecast(historicalSalesData, {
 *   horizon: 'medium',      // 3 months
 *   method: 'triple-exponential-smoothing',  // Holt-Winters
 *   dimension: 'location',
 *   dimensionId: 'location-123',
 *   period: 7,              // Weekly seasonality
 *   confidence: 0.95        // 95% confidence interval
 * })
 * ```
 */
export function generateForecast(
  data: Array<{ date: string; value: number; metadata?: Record<string, unknown> }>,
  request: ForecastRequest
): ForecastResult {
  // Validate input
  if (!data || data.length === 0) {
    throw new Error('No data provided for forecasting')
  }

  if (data.length < 3) {
    throw new Error(
      `Not enough data for forecasting. Need at least 3 data points, got ${data.length}.`
    )
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Get the algorithm function
  const algorithm = algorithms[request.method]

  if (!algorithm) {
    throw new Error(
      `Unknown forecast method: ${request.method}. ` +
      `Available methods: ${Object.keys(algorithms).join(', ')}`
    )
  }

  // Generate forecast using the selected algorithm
  const result = algorithm(sortedData, request)

  return result
}

// ============================================================================
// EXPORT ALL ALGORITHMS (for direct use if needed)
// ============================================================================

export {
  simpleMovingAverage,
  weightedMovingAverage
}

export {
  simpleExponentialSmoothing,
  doubleExponentialSmoothing,
  tripleExponentialSmoothing
}

// ============================================================================
// ALGORITHM METADATA
// ============================================================================

/**
 * Get information about available algorithms
 */
export const algorithmInfo = {
  'simple-moving-average': {
    name: 'Simple Moving Average',
    description: {
      en: 'Best for stable data without clear trends or seasonality',
      es: 'Mejor para datos estables sin tendencias o estacionalidad claras'
    },
    handlesTrend: false,
    handlesSeasonality: false,
    minDataPoints: 3,
    defaultParams: {
      window: 7
    }
  },
  'weighted-moving-average': {
    name: 'Weighted Moving Average',
    description: {
      en: 'Gives more weight to recent data, faster response to changes',
      es: 'Da más peso a los datos recientes, respuesta más rápida a los cambios'
    },
    handlesTrend: false,
    handlesSeasonality: false,
    minDataPoints: 3,
    defaultParams: {
      window: 7
    }
  },
  'exponential-smoothing': {
    name: 'Simple Exponential Smoothing',
    description: {
      en: 'Handles level changes but not trends or seasonality',
      es: 'Maneja cambios de nivel pero no tendencias o estacionalidad'
    },
    handlesTrend: false,
    handlesSeasonality: false,
    minDataPoints: 3,
    defaultParams: {
      alpha: 0.3
    }
  },
  'double-exponential-smoothing': {
    name: 'Double Exponential Smoothing (Holt\'s Method)',
    description: {
      en: 'Handles trends but not seasonality',
      es: 'Maneja tendencias pero no estacionalidad'
    },
    handlesTrend: true,
    handlesSeasonality: false,
    minDataPoints: 3,
    defaultParams: {
      alpha: 0.3,
      beta: 0.1
    }
  },
  'triple-exponential-smoothing': {
    name: 'Triple Exponential Smoothing (Holt-Winters)',
    description: {
      en: 'Handles both trends and seasonality - industry standard for business forecasting',
      es: 'Maneja tanto tendencias como estacionalidad - estándar de la industria'
    },
    handlesTrend: true,
    handlesSeasonality: true,
    minDataPoints: 14, // Need at least 2 × period
    defaultParams: {
      alpha: 0.3,
      beta: 0.1,
      gamma: 0.3,
      period: 7
    }
  }
}

/**
 * Get recommended algorithm based on data characteristics
 */
export function recommendAlgorithm(
  dataPoints: number,
  hasTrend: boolean,
  hasSeasonality: boolean
): keyof typeof algorithmInfo {
  // Not enough data for advanced methods
  if (dataPoints < 14) {
    return hasTrend ? 'double-exponential-smoothing' : 'exponential-smoothing'
  }

  // Has both trend and seasonality - use Holt-Winters
  if (hasTrend && hasSeasonality) {
    return 'triple-exponential-smoothing'
  }

  // Has trend only - use Holt's method
  if (hasTrend) {
    return 'double-exponential-smoothing'
  }

  // Has seasonality only - use Holt-Winters
  if (hasSeasonality) {
    return 'triple-exponential-smoothing'
  }

  // No clear pattern - use simple exponential smoothing
  return 'exponential-smoothing'
}
