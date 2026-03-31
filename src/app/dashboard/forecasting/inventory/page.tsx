'use client'

/**
 * Inventory Forecasting Page
 *
 * Product demand forecasting and stock-out risk predictions
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/language-context'
import { ForecastChart } from '@/components/forecasting/forecast-chart'
import { ForecastSelector } from '@/components/forecasting/forecast-selector'
import { KPICard } from '@/components/shared/kpi-card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Download, Package, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react'
import type { ForecastResult, ForecastRequest } from '@/lib/forecasting/types'
import { exportInventoryForecast } from '@/lib/utils/forecast-export'

interface ProductForecast {
  product_name: string
  current_stock: number
  predicted_demand: number
  stock_out_risk: 'high' | 'medium' | 'low'
  recommended_order: number
  category: string
}

export default function InventoryForecastingPage() {
  const { t } = useLanguage()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [productForecasts, setProductForecasts] = useState<ProductForecast[]>([])
  const [forecast, setForecast] = useState<any>(null)
  const [summary, setSummary] = useState<{
    total_products: number
    high_risk_count: number
    medium_risk_count: number
    total_recommended_order_qty: number
  } | null>(null)

  useEffect(() => {
    loadInventoryForecast()
  }, [])

  const loadInventoryForecast = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/forecasting/inventory')
      if (!response.ok) {
        throw new Error('Failed to load inventory forecast')
      }
      const data = await response.json()

      // Convert API response to ProductForecast format
      const forecasts: ProductForecast[] = data.products.map((p: any) => ({
        product_name: p.product_name,
        current_stock: p.current_stock,
        predicted_demand: p.predicted_period_demand,
        stock_out_risk: p.stock_out_risk,
        recommended_order: p.recommended_order,
        category: p.category
      }))

      setProductForecasts(forecasts)
      setSummary(data.summary)
    } catch (error) {
      console.error('Failed to load inventory forecast:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleForecast = async (params: ForecastRequest) => {
    setGenerating(true)
    try {
      // Regenerate forecast with new parameters
      const queryParams = new URLSearchParams({
        horizon: params.horizon
      })

      const response = await fetch(`/api/forecasting/inventory?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to generate inventory forecast')
      }

      const data = await response.json()

      // Convert API response to ProductForecast format
      const forecasts: ProductForecast[] = data.products.map((p: any) => ({
        product_name: p.product_name,
        current_stock: p.current_stock,
        predicted_demand: p.predicted_period_demand,
        stock_out_risk: p.stock_out_risk,
        recommended_order: p.recommended_order,
        category: p.category
      }))

      setProductForecasts(forecasts)
      setSummary(data.summary)

      // Create forecast data for chart
      const topProducts = forecasts.slice(0, 10)
      const forecastData = topProducts.map(p => ({
        date: p.product_name.substring(0, 15),
        amount: p.predicted_demand
      }))

      setForecast({
        algorithm: params.method,
        horizon: params.horizon,
        data: forecastData.map(d => d.amount),
        upperBound: forecastData.map(d => d.amount * 1.1),
        lowerBound: forecastData.map(d => d.amount * 0.9),
        metrics: { mae: 0, mse: 0, rmse: 0, mape: 0 }
      })
    } catch (error) {
      console.error('Inventory forecast failed:', error)
      alert('Failed to generate inventory forecast')
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = async () => {
    if (!summary || productForecasts.length === 0) {
      alert('No data to export')
      return
    }

    try {
      await exportInventoryForecast(
        {
          products: productForecasts.map(p => ({
            product_name: p.product_name,
            category: p.category,
            current_stock: p.current_stock,
            predicted_demand: p.predicted_demand,
            stock_out_risk: p.stock_out_risk,
            recommended_order: p.recommended_order,
            days_of_stock_remaining: Math.max(0, Math.floor(p.current_stock / Math.max(1, p.predicted_demand / 30)))
          })),
          summary: summary!
        },
        {
          language: (t('inventoryForecasting') === 'Pronósticos de Inventario' || t('inventoryForecasting') === 'Pronóstico de Inventario') ? 'es' : 'en'
        }
      )
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export forecast')
    }
  }

  // Calculate derived values from API data
  const highRiskProducts = productForecasts.filter(p => p.stock_out_risk === 'high')
  const totalRecommendedOrder = summary?.total_recommended_order_qty ||
    productForecasts.reduce((sum, p) => sum + p.recommended_order, 0)

  const topProducts = productForecasts.slice(0, 10)
  const chartData = topProducts.map(p => ({
    date: p.product_name.substring(0, 15),
    amount: p.predicted_demand
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header & Export */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('inventoryForecasting') || 'Inventory Forecasting'}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('inventoryForecastingDescription') || 'Predict product demand and optimize inventory levels'}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={productForecasts.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            title={t('exportExcel') || 'Export to Excel'}
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{t('exportExcel') || 'Export'}</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title={t('productsAtRisk') || 'Products at Risk'}
            value={highRiskProducts.length}
            icon={AlertTriangle}
            status={highRiskProducts.length > 0 ? 'danger' : 'success'}
          />
          <KPICard
            title={t('recommendedOrders') || 'Recommended Orders'}
            value={productForecasts.filter(p => p.recommended_order > 0).length}
            icon={ShoppingCart}
          />
          <KPICard
            title={t('totalUnitsToOrder') || 'Total Units to Order'}
            value={totalRecommendedOrder}
            icon={Package}
          />
          <KPICard
            title={t('avgDemandPerProduct') || 'Avg Demand/Product'}
            value={productForecasts.length > 0
              ? (productForecasts.reduce((s, p) => s + p.predicted_demand, 0) / productForecasts.length).toFixed(0)
              : 0}
            icon={TrendingUp}
          />
        </div>

        {/* Forecast Selector */}
        <ForecastSelector
          onForecast={handleForecast}
          loading={generating}
          dimensions={[
            { value: 'all', label: 'All Products' },
            { value: 'category', label: 'By Category' },
            { value: 'location', label: 'By Location' }
          ]}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demand Forecast */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('topProductsDemand') || 'Top 10 Products - Predicted Demand'}
            </h2>
            <ForecastChart
              data={chartData}
              showForecast={false}
              height={300}
            />
          </div>

          {/* Stock-out Risk */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('stockOutRisk') || 'Stock-Out Risk Products'}
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {highRiskProducts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {t('noStockOutRisk') || 'No products at risk of stock-out'}
                </div>
              ) : (
                highRiskProducts.map(p => (
                  <div key={p.product_name} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{p.product_name}</div>
                      <div className="text-sm text-gray-500">
                        {t('stock') || 'Stock'}: {p.current_stock} | {t('demand') || 'Demand'}: {p.predicted_demand}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-600">
                        {t('order') || 'Order'} {p.recommended_order}
                      </div>
                      <div className="text-xs text-gray-500">{p.category}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recommended Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('recommendedOrders') || 'Recommended Orders'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-gray-600 font-medium">{t('product') || 'Product'}</th>
                  <th className="text-left p-3 text-gray-600 font-medium">{t('category') || 'Category'}</th>
                  <th className="text-right p-3 text-gray-600 font-medium">{t('currentStock') || 'Current Stock'}</th>
                  <th className="text-right p-3 text-gray-600 font-medium">{t('predictedDemand') || 'Predicted Demand'}</th>
                  <th className="text-center p-3 text-gray-600 font-medium">{t('risk') || 'Risk'}</th>
                  <th className="text-right p-3 text-gray-600 font-medium">{t('recommendedOrder') || 'Order'}</th>
                </tr>
              </thead>
              <tbody>
                {productForecasts.filter(p => p.recommended_order > 0).slice(0, 15).map(p => (
                  <tr key={p.product_name} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.product_name}</td>
                    <td className="p-3 text-gray-600">{p.category}</td>
                    <td className="p-3 text-right">{p.current_stock}</td>
                    <td className="p-3 text-right">{p.predicted_demand}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        p.stock_out_risk === 'high' ? 'bg-red-100 text-red-700' :
                        p.stock_out_risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {p.stock_out_risk}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold text-blue-600">
                      {p.recommended_order}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
