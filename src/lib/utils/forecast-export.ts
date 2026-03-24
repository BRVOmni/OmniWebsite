/**
 * Forecast Export Utilities
 *
 * Provides functions to export forecast data to Excel format.
 * Includes professional formatting, multiple sheets, and bilingual support.
 */

import ExcelJS from 'exceljs'
import type { ForecastResult, ForecastAccuracy } from '@/lib/forecasting/types'

// ============================================================================
// TYPES
// ============================================================================

interface ExportOptions {
  fileName?: string
  author?: string
  title?: string
  includeAccuracy?: boolean
  includeConfidenceIntervals?: boolean
  language?: 'en' | 'es'
}

interface SalesForecastExportData {
  forecast: ForecastResult
  historicalData: Array<{ date: string; value: number }>
  kpis: {
    totalSales: number
    predictedSales: number
    growthRate: number
    confidence: number
  }
}

interface StaffingForecastExportData {
  date: string
  patterns: Array<{
    hour: number
    time_label: string
    expected_sales: number
    expected_transactions: number
    recommended_staff: number
    busy_period: boolean
  }>
  summary: {
    peak_hour: number
    peak_sales: number
    total_staff_needed: number
    total_transactions: number
  }
}

interface InventoryForecastExportData {
  products: Array<{
    product_name: string
    category: string
    current_stock: number
    predicted_demand: number
    stock_out_risk: 'low' | 'medium' | 'high'
    recommended_order: number
    days_of_stock_remaining: number
  }>
  summary: {
    total_products: number
    high_risk_count: number
    medium_risk_count: number
    total_recommended_order_qty: number
  }
}

interface SeasonalForecastExportData {
  weekly_pattern: Array<{
    day_name: string
    avg_sales: number
    seasonal_index: number
  }>
  trend: {
    direction: string
    strength: number
    description: string
  }
  summary: {
    peak_day: string
    trough_day: string
    seasonal_variation_percent: number
  }
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    salesForecast: 'Sales Forecast',
    historicalData: 'Historical Data',
    forecastData: 'Forecast Data',
    date: 'Date',
    value: 'Value',
    lowerBound: 'Lower Bound (95%)',
    upperBound: 'Upper Bound (95%)',
    summary: 'Summary',
    totalSales: 'Total Sales',
    predictedSales: 'Predicted Sales',
    growthRate: 'Growth Rate',
    confidence: 'Confidence Level',
    accuracyMetrics: 'Accuracy Metrics',
    mae: 'Mean Absolute Error (MAE)',
    mape: 'Mean Absolute % Error (MAPE)',
    rmse: 'Root Mean Square Error (RMSE)',
    forecastParameters: 'Forecast Parameters',
    method: 'Method',
    horizon: 'Horizon',
    algorithm: 'Algorithm',
    generatedAt: 'Generated At',
    dataPointsUsed: 'Data Points Used',
    staff: 'Staff',
    inventoryForecast: 'Inventory Forecast',
    seasonalAnalysis: 'Seasonal Analysis',
    // Staffing
    hourlyForecast: 'Hourly Staffing Forecast',
    hour: 'Hour',
    time: 'Time',
    expectedSales: 'Expected Sales',
    expectedTransactions: 'Expected Transactions',
    recommendedStaff: 'Recommended Staff',
    busyPeriod: 'Busy Period',
    peakHour: 'Peak Hour',
    totalStaffNeeded: 'Total Staff Needed',
    // Inventory
    product: 'Product',
    category: 'Category',
    currentStock: 'Current Stock',
    predictedDemand: 'Predicted Demand',
    stockOutRisk: 'Stock Out Risk',
    recommendedOrder: 'Recommended Order',
    daysOfStockRemaining: 'Days of Stock Remaining',
    highRisk: 'High',
    mediumRisk: 'Medium',
    lowRisk: 'Low',
    // Seasonal
    weeklyPattern: 'Weekly Pattern',
    dayOfWeek: 'Day of Week',
    avgSales: 'Average Sales',
    seasonalIndex: 'Seasonal Index',
    trend: 'Trend',
    trendDirection: 'Trend Direction',
    trendStrength: 'Trend Strength',
    peakDay: 'Peak Day',
    troughDay: 'Trough Day',
    seasonalVariation: 'Seasonal Variation',
    exportDate: 'Export Date',
    totalRecords: 'Total Records'
  },
  es: {
    salesForecast: 'Pronóstico de Ventas',
    historicalData: 'Datos Históricos',
    forecastData: 'Datos del Pronóstico',
    date: 'Fecha',
    value: 'Valor',
    lowerBound: 'Límite Inferior (95%)',
    upperBound: 'Límite Superior (95%)',
    summary: 'Resumen',
    totalSales: 'Ventas Totales',
    predictedSales: 'Ventas Pronosticadas',
    growthRate: 'Tasa de Crecimiento',
    confidence: 'Nivel de Confianza',
    accuracyMetrics: 'Métricas de Precisión',
    mae: 'Error Absoluto Medio (MAE)',
    mape: 'Error Porcentual Absoluto Medio (MAPE)',
    rmse: 'Error Cuadrático Medio (RMSE)',
    forecastParameters: 'Parámetros del Pronóstico',
    method: 'Método',
    horizon: 'Horizonte',
    algorithm: 'Algoritmo',
    generatedAt: 'Generado en',
    dataPointsUsed: 'Puntos de Datos Usados',
    staff: 'Personal',
    inventoryForecast: 'Pronóstico de Inventario',
    seasonalAnalysis: 'Análisis Estacional',
    // Staffing
    hourlyForecast: 'Pronóstico de Personal por Hora',
    hour: 'Hora',
    time: 'Tiempo',
    expectedSales: 'Ventas Esperadas',
    expectedTransactions: 'Transacciones Esperadas',
    recommendedStaff: 'Personal Recomendado',
    busyPeriod: 'Período Ocupado',
    peakHour: 'Hora Pico',
    totalStaffNeeded: 'Personal Total Necesario',
    // Inventory
    product: 'Producto',
    category: 'Categoría',
    currentStock: 'Stock Actual',
    predictedDemand: 'Demanda Pronosticada',
    stockOutRisk: 'Riesgo de Agotamiento',
    recommendedOrder: 'Pedido Recomendado',
    daysOfStockRemaining: 'Días de Stock Restantes',
    highRisk: 'Alto',
    mediumRisk: 'Medio',
    lowRisk: 'Bajo',
    // Seasonal
    weeklyPattern: 'Patrón Semanal',
    dayOfWeek: 'Día de la Semana',
    avgSales: 'Ventas Promedio',
    seasonalIndex: 'Índice Estacional',
    trend: 'Tendencia',
    trendDirection: 'Dirección de la Tendencia',
    trendStrength: 'Fuerza de la Tendencia',
    peakDay: 'Día Pico',
    troughDay: 'Día Más Lento',
    seasonalVariation: 'Variación Estacional',
    exportDate: 'Fecha de Exportación',
    totalRecords: 'Total de Registros'
  }
}

function t(key: keyof typeof translations.en, lang: 'en' | 'es' = 'en'): string {
  return translations[lang][key] || translations.en[key]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create and style a header row
 */
function createHeaderRow(worksheet: ExcelJS.Worksheet, headers: string[]): ExcelJS.Row {
  const row = worksheet.addRow(headers)
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  }
  row.alignment = { horizontal: 'center', vertical: 'middle' }
  row.height = 20
  return row
}

/**
 * Create a title row
 */
function createTitleRow(worksheet: ExcelJS.Worksheet, title: string, colspan: number): void {
  const row = worksheet.addRow([title])
  row.font = { bold: true, size: 14 }
  row.alignment = { horizontal: 'center' }
  worksheet.mergeCells(1, 1, 1, colspan)
}

/**
 * Format a number as currency
 */
function formatCurrency(value: number, currency: string = '₲'): string {
  return `${currency}${Math.round(value).toLocaleString()}`
}

/**
 * Format a percentage
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

// ============================================================================
// SALES FORECAST EXPORT
// ============================================================================

/**
 * Export sales forecast to Excel
 */
export async function exportSalesForecast(
  data: SalesForecastExportData,
  options: ExportOptions = {}
): Promise<void> {
  const {
    fileName = `sales-forecast-${new Date().toISOString().split('T')[0]}`,
    language = 'en'
  } = options

  const workbook = new ExcelJS.Workbook()
  workbook.creator = options.author || 'Corporate Food Dashboard'
  workbook.created = new Date()

  // Create Forecast sheet
  const forecastSheet = workbook.addWorksheet(t('salesForecast', language))

  // Title
  createTitleRow(forecastSheet, t('salesForecast', language), 5)
  forecastSheet.addRow([])

  // Summary section
  createHeaderRow(forecastSheet, [t('summary', language), '', '', '', ''])
  forecastSheet.addRow([t('totalSales', language), formatCurrency(data.kpis.totalSales)])
  forecastSheet.addRow([t('predictedSales', language), formatCurrency(data.kpis.predictedSales)])
  forecastSheet.addRow([t('growthRate', language), formatPercentage(data.kpis.growthRate)])
  forecastSheet.addRow([t('confidence', language), formatPercentage(data.kpis.confidence * 100)])
  forecastSheet.addRow([])

  // Parameters
  createHeaderRow(forecastSheet, [t('forecastParameters', language), '', '', '', ''])
  forecastSheet.addRow([t('method', language), data.forecast.method])
  forecastSheet.addRow([t('horizon', language), data.forecast.horizon])
  forecastSheet.addRow([t('dataPointsUsed', language), data.forecast.dataPointsUsed])
  forecastSheet.addRow([])

  // Accuracy metrics if available
  if (options.includeAccuracy && data.forecast.accuracy) {
    createHeaderRow(forecastSheet, [t('accuracyMetrics', language), '', '', '', ''])
    forecastSheet.addRow([t('mae', language), formatCurrency(data.forecast.accuracy.mae)])
    forecastSheet.addRow([t('mape', language), formatPercentage(data.forecast.accuracy.mape)])
    forecastSheet.addRow([t('rmse', language), formatCurrency(data.forecast.accuracy.rmse)])
    forecastSheet.addRow([])
  }

  // Historical data
  createHeaderRow(forecastSheet, [t('historicalData', language), t('value', language)])
  data.historicalData.forEach(d => {
    forecastSheet.addRow([d.date, Math.round(d.value)])
  })
  forecastSheet.addRow([])

  // Forecast data
  createHeaderRow(forecastSheet, [
    t('date', language),
    t('value', language),
    t('lowerBound', language),
    t('upperBound', language)
  ])
  data.forecast.forecast.forEach(d => {
    forecastSheet.addRow([
      d.date,
      Math.round(d.value),
      Math.round(d.lowerBound),
      Math.round(d.upperBound)
    ])
  })

  // Set column widths
  forecastSheet.columns = [
    { width: 15 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 20 }
  ]

  // Metadata sheet
  const metadataSheet = workbook.addWorksheet('Metadata')
  createTitleRow(metadataSheet, 'Forecast Metadata', 2)
  metadataSheet.addRow([])
  metadataSheet.addRow([t('generatedAt', language), new Date().toLocaleString()])
  metadataSheet.addRow([t('exportDate', language), new Date().toLocaleDateString()])
  metadataSheet.addRow([t('totalRecords', language), data.forecast.forecast.length])
  metadataSheet.columns = [{ width: 25 }, { width: 30 }]

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer()
  downloadFile(buffer, `${fileName}.xlsx`)
}

// ============================================================================
// STAFFING FORECAST EXPORT
// ============================================================================

/**
 * Export staffing forecast to Excel
 */
export async function exportStaffingForecast(
  data: StaffingForecastExportData,
  options: ExportOptions = {}
): Promise<void> {
  const {
    fileName = `staffing-forecast-${new Date().toISOString().split('T')[0]}`,
    language = 'en'
  } = options

  const workbook = new ExcelJS.Workbook()
  workbook.creator = options.author || 'Corporate Food Dashboard'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet(t('hourlyForecast', language))

  // Title
  createTitleRow(worksheet, t('hourlyForecast', language), 6)
  worksheet.addRow([])

  // Summary
  createHeaderRow(worksheet, [t('summary', language), '', '', '', '', ''])
  worksheet.addRow([t('peakHour', language), `${data.summary.peak_hour}:00`])
  worksheet.addRow([t('totalStaffNeeded', language), data.summary.total_staff_needed])
  worksheet.addRow([])

  // Hourly data
  createHeaderRow(worksheet, [
    t('hour', language),
    t('time', language),
    t('expectedSales', language),
    t('expectedTransactions', language),
    t('recommendedStaff', language),
    t('busyPeriod', language)
  ])

  data.patterns.forEach(p => {
    worksheet.addRow([
      p.hour,
      p.time_label,
      Math.round(p.expected_sales),
      Math.round(p.expected_transactions),
      p.recommended_staff,
      p.busy_period ? '✓' : ''
    ])
  })

  // Set column widths
  worksheet.columns = [
    { width: 10 },
    { width: 12 },
    { width: 18 },
    { width: 20 },
    { width: 18 },
    { width: 12 }
  ]

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer()
  downloadFile(buffer, `${fileName}.xlsx`)
}

// ============================================================================
// INVENTORY FORECAST EXPORT
// ============================================================================

/**
 * Export inventory forecast to Excel
 */
export async function exportInventoryForecast(
  data: InventoryForecastExportData,
  options: ExportOptions = {}
): Promise<void> {
  const {
    fileName = `inventory-forecast-${new Date().toISOString().split('T')[0]}`,
    language = 'en'
  } = options

  const workbook = new ExcelJS.Workbook()
  workbook.creator = options.author || 'Corporate Food Dashboard'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet(t('inventoryForecast', language))

  // Title
  createTitleRow(worksheet, t('inventoryForecast', language), 7)
  worksheet.addRow([])

  // Summary
  createHeaderRow(worksheet, [t('summary', language), '', '', '', '', '', ''])
  worksheet.addRow([t('totalRecords', language), data.summary.total_products])
  worksheet.addRow([t('highRisk', language), data.summary.high_risk_count])
  worksheet.addRow([t('mediumRisk', language), data.summary.medium_risk_count])
  worksheet.addRow(['Total Order Qty', data.summary.total_recommended_order_qty])
  worksheet.addRow([])

  // Product data
  createHeaderRow(worksheet, [
    t('product', language),
    t('category', language),
    t('currentStock', language),
    t('predictedDemand', language),
    t('stockOutRisk', language),
    t('recommendedOrder', language),
    t('daysOfStockRemaining', language)
  ])

  data.products.forEach(p => {
    const riskLevel = p.stock_out_risk === 'high' ? t('highRisk', language) :
      p.stock_out_risk === 'medium' ? t('mediumRisk', language) :
      t('lowRisk', language)

    worksheet.addRow([
      p.product_name,
      p.category,
      p.current_stock,
      Math.round(p.predicted_demand),
      riskLevel,
      Math.round(p.recommended_order),
      p.days_of_stock_remaining
    ])
  })

  // Set column widths
  worksheet.columns = [
    { width: 30 },
    { width: 15 },
    { width: 15 },
    { width: 18 },
    { width: 15 },
    { width: 18 },
    { width: 20 }
  ]

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer()
  downloadFile(buffer, `${fileName}.xlsx`)
}

// ============================================================================
// SEASONAL FORECAST EXPORT
// ============================================================================

/**
 * Export seasonal analysis to Excel
 */
export async function exportSeasonalAnalysis(
  data: SeasonalForecastExportData,
  options: ExportOptions = {}
): Promise<void> {
  const {
    fileName = `seasonal-analysis-${new Date().toISOString().split('T')[0]}`,
    language = 'en'
  } = options

  const workbook = new ExcelJS.Workbook()
  workbook.creator = options.author || 'Corporate Food Dashboard'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet(t('seasonalAnalysis', language))

  // Title
  createTitleRow(worksheet, t('seasonalAnalysis', language), 4)
  worksheet.addRow([])

  // Summary
  createHeaderRow(worksheet, [t('summary', language), '', '', ''])
  worksheet.addRow([t('peakDay', language), data.summary.peak_day])
  worksheet.addRow([t('troughDay', language), data.summary.trough_day])
  worksheet.addRow([t('seasonalVariation', language), formatPercentage(data.summary.seasonal_variation_percent)])
  worksheet.addRow([])

  // Trend
  createHeaderRow(worksheet, [t('trend', language), '', '', ''])
  worksheet.addRow([t('trendDirection', language), data.trend.direction])
  worksheet.addRow([t('trendStrength', language), (data.trend.strength * 100).toFixed(0) + '%'])
  worksheet.addRow(['Description', data.trend.description])
  worksheet.addRow([])

  // Weekly pattern
  createHeaderRow(worksheet, [
    t('dayOfWeek', language),
    t('avgSales', language),
    t('seasonalIndex', language),
    '% vs Average'
  ])

  data.weekly_pattern.forEach(d => {
    worksheet.addRow([
      d.day_name,
      Math.round(d.avg_sales),
      d.seasonal_index.toFixed(2),
      formatPercentage((d.seasonal_index - 1) * 100)
    ])
  })

  // Set column widths
  worksheet.columns = [
    { width: 15 },
    { width: 18 },
    { width: 18 },
    { width: 18 }
  ]

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer()
  downloadFile(buffer, `${fileName}.xlsx`)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Download a file from a buffer
 */
function downloadFile(buffer: ArrayBuffer, fileName: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  window.URL.revokeObjectURL(url)
}
