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
import { Package, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react'
import type { ForecastResult, ForecastRequest } from '@/lib/forecasting/types'

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
  const [forecast, setForecast] = useState<ForecastResult | null>(null)

  useEffect(() => {
    loadProductForecasts()
  }, [])

  const loadProductForecasts = async () => {
    setLoading(true)
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: salesData } = await supabase
        .from('sales')
        .select('id, date, products_summary')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

      if (salesData) {
        const forecasts = analyzeProductDemand(salesData)
        setProductForecasts(forecasts)
      }
    } catch (error) {
      console.error('Failed to load product forecasts:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeProductDemand = (salesData: any[]): ProductForecast[] => {
    const productStats: Record<string, {
      total_qty: number
      daily_avg: number
      category: string
    }> = {}

    salesData.forEach(sale => {
      try {
        const products = typeof sale.products_summary === 'string'
          ? JSON.parse(sale.products_summary)
          : sale.products_summary

        if (Array.isArray(products)) {
          products.forEach((p: any) => {
            const name = p.product_name || p.name || 'Unknown'
            if (!productStats[name]) {
              productStats[name] = {
                total_qty: 0,
                daily_avg: 0,
                category: p.category || 'General'
              }
            }
            productStats[name].total_qty += Number(p.quantity || 0)
          })
        }
      } catch (e) {
        // Skip invalid entries
      }
    })

    return Object.entries(productStats)
      .map(([name, stats]) => {
        const dailyAvg = stats.total_qty / 30
        const predictedDemand = dailyAvg * 7 // Next 7 days
        const currentStock = Math.floor(Math.random() * 100) // Simulated - would come from inventory table
        const stockOutRisk = currentStock < predictedDemand * 0.5 ? 'high'
          : currentStock < predictedDemand ? 'medium'
          : 'low'
        const recommendedOrder = Math.max(0, predictedDemand - currentStock)

        return {
          product_name: name,
          current_stock: currentStock,
          predicted_demand: Math.round(predictedDemand),
          stock_out_risk: stockOutRisk,
          recommended_order: Math.round(recommendedOrder),
          category: stats.category
        }
      })
      .sort((a, b) => b.recommended_order - a.recommended_order)
      .slice(0, 20)
  }

  const handleForecast = async (params: ForecastRequest) => {
    setGenerating(true)
    try {
      // Aggregate by category for forecast
      const byCategory: Record<string, number[]> = []

      productForecasts.forEach(p => {
        if (!byCategory[p.category]) {
          byCategory[p.category] = []
        }
        byCategory[p.category].push(p.predicted_demand)
      })

      const forecastData = Object.entries(byCategory).map(([cat, demands]) => ({
        date: cat,
        amount: demands.reduce((s, d) => s + d, 0)
      }))

      setForecast({
        algorithm: params.method,
        horizon: params.horizon,
        data: forecastData.map(d => d.value),
        metrics: { mae: 0, mse: 0, rmse: 0, mape: 0 }
      })
    } catch (error) {
      console.error('Inventory forecast failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  const highRiskProducts = productForecasts.filter(p => p.stock_out_risk === 'high')
  const totalRecommendedOrder = productForecasts.reduce((sum, p) => sum + p.recommended_order, 0)

  const topProducts = productForecasts.slice(0, 10)
  const chartData = topProducts.map(p => ({
    date: p.product_name.substring(0, 15),
    amount: p.predicted_demand
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('inventoryForecasting') || 'Inventory Forecasting'}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('inventoryForecastingDescription') || 'Predict product demand and optimize inventory levels'}
          </p>
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
