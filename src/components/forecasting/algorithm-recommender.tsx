/**
 * Algorithm Auto-Recommendation Component
 *
 * Analyzes data characteristics and recommends the best forecasting algorithm.
 * Provides visual indicators of data patterns and algorithm capabilities.
 */

'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { TrendingUp, Waves, CheckCircle2, XCircle, Info } from 'lucide-react'
import { algorithmInfo, recommendAlgorithm } from '@/lib/forecasting/algorithms'

interface DataCharacteristics {
  hasTrend: boolean
  hasSeasonality: boolean
  dataPoints: number
  trendStrength: number // 0-1
  seasonalityStrength: number // 0-1
  volatility: 'low' | 'medium' | 'high'
}

interface RecommendationResult {
  recommendedMethod: keyof typeof algorithmInfo
  confidence: 'high' | 'medium' | 'low'
  reasoning: {
    en: string
    es: string
  }
  alternatives: Array<{
    method: keyof typeof algorithmInfo
    reason: string
  }>
}

interface AlgorithmRecommenderProps {
  dataPoints: number
  onDataChange?: (characteristics: DataCharacteristics) => void
  onRecommendationSelect?: (method: keyof typeof algorithmInfo) => void
}

export function AlgorithmRecommender({
  dataPoints,
  onDataChange,
  onRecommendationSelect
}: AlgorithmRecommenderProps) {
  const { t, language } = useLanguage()
  const [characteristics, setCharacteristics] = useState<DataCharacteristics | null>(null)
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (dataPoints > 0) {
      analyzeData()
    }
  }, [dataPoints])

  const analyzeData = async () => {
    setAnalyzing(true)

    // Simulate analysis (in real implementation, would analyze actual data)
    // For now, use heuristics based on data point count
    const hasTrend = dataPoints > 30
    const hasSeasonality = dataPoints > 60

    const characteristics: DataCharacteristics = {
      hasTrend,
      hasSeasonality,
      dataPoints,
      trendStrength: hasTrend ? 0.7 : 0.2,
      seasonalityStrength: hasSeasonality ? 0.6 : 0.1,
      volatility: dataPoints > 90 ? 'low' : 'medium'
    }

    setCharacteristics(characteristics)
    onDataChange?.(characteristics)

    // Get recommendation
    const recommendedMethod = recommendAlgorithm(dataPoints, hasTrend, hasSeasonality)
    const algoInfo = algorithmInfo[recommendedMethod]

    let confidence: 'high' | 'medium' | 'low'
    if (dataPoints >= algoInfo.minDataPoints * 2) {
      confidence = 'high'
    } else if (dataPoints >= algoInfo.minDataPoints) {
      confidence = 'medium'
    } else {
      confidence = 'low'
    }

    const reasoningKey = hasTrend && hasSeasonality ? 'both' :
      hasTrend ? 'trend' :
      hasSeasonality ? 'seasonal' : 'stable'

    const reasoningMap: Record<string, { en: string; es: string }> = {
      both: {
        en: 'Data shows both trend and seasonality patterns. Holt-Winters (triple exponential smoothing) is recommended as it handles both components.',
        es: 'Los datos muestran patrones de tendencia y estacionalidad. Se recomienda Holt-Winters (suavizamiento exponencial triple) ya que maneja ambos componentes.'
      },
      trend: {
        en: 'Data shows a clear trend but no strong seasonality. Double exponential smoothing (Holt\'s method) is recommended for trend-based forecasting.',
        es: 'Los datos muestran una tendencia clara pero sin estacionalidad fuerte. Se recomienda el suavizamiento exponencial doble (método de Holt) para pronósticos basados en tendencias.'
      },
      seasonal: {
        en: 'Data shows seasonal patterns. Triple exponential smoothing (Holt-Winters) is recommended to capture seasonal variations.',
        es: 'Los datos muestran patrones estacionales. Se recomienda el suavizamiento exponencial triple (Holt-Winters) para capturar variaciones estacionales.'
      },
      stable: {
        en: 'Data appears stable without clear trends or seasonality. Simple exponential smoothing is recommended for consistent forecasting.',
        es: 'Los datos parecen estables sin tendencias o estacionalidad claras. Se recomienda el suavizamiento exponencial simple para un pronóstico consistente.'
      }
    }

    const alternatives = Object.entries(algorithmInfo)
      .filter(([key]) => key !== recommendedMethod)
      .slice(0, 2)
      .map(([key, info]) => ({
        method: key as keyof typeof algorithmInfo,
        reason: info.description[language === 'es' ? 'es' : 'en']
      }))

    setRecommendation({
      recommendedMethod,
      confidence,
      reasoning: reasoningMap[reasoningKey] || reasoningMap.stable,
      alternatives
    })

    setAnalyzing(false)
  }

  if (!characteristics || !recommendation) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
          <p>{analyzing ? 'Analyzing data...' : 'Waiting for data...'}</p>
        </div>
      </div>
    )
  }

  const recommendedInfo = algorithmInfo[recommendation.recommendedMethod]
  const lang = language === 'es' ? 'es' : 'en'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          {lang === 'es' ? 'Recomendación de Algoritmo' : 'Algorithm Recommendation'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {lang === 'es'
            ? 'Basado en el análisis de las características de tus datos'
            : 'Based on analysis of your data characteristics'}
        </p>
      </div>

      {/* Data Characteristics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CharacteristicItem
          label={lang === 'es' ? 'Tendencia' : 'Trend'}
          hasFeature={characteristics.hasTrend}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <CharacteristicItem
          label={lang === 'es' ? 'Estacionalidad' : 'Seasonality'}
          hasFeature={characteristics.hasSeasonality}
          icon={<Waves className="w-4 h-4" />}
        />
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{characteristics.dataPoints}</div>
          <div className="text-xs text-gray-500">{lang === 'es' ? 'Puntos de datos' : 'Data Points'}</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            characteristics.volatility === 'low' ? 'text-green-600' :
            characteristics.volatility === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {characteristics.volatility === 'low' ? 'Baja' :
             characteristics.volatility === 'medium' ? 'Media' : 'Alta'}
          </div>
          <div className="text-xs text-gray-500">{lang === 'es' ? 'Volatilidad' : 'Volatility'}</div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {recommendedInfo.name}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                recommendation.confidence === 'high' ? 'bg-green-100 text-green-700' :
                recommendation.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {recommendation.confidence === 'high' ? (lang === 'es' ? 'Alta confianza' : 'High confidence') :
                 recommendation.confidence === 'medium' ? (lang === 'es' ? 'Confianza media' : 'Medium confidence') :
                 (lang === 'es' ? 'Confianza baja' : 'Low confidence')}
              </span>
            </div>
            <p className="text-sm text-blue-800">
              {recommendation.reasoning[lang]}
            </p>
          </div>
          <button
            onClick={() => onRecommendationSelect?.(recommendation.recommendedMethod)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {lang === 'es' ? 'Seleccionar' : 'Select'}
          </button>
        </div>
      </div>

      {/* Algorithm Capabilities */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          {lang === 'es' ? 'Capacidades del Algoritmo' : 'Algorithm Capabilities'}
        </h4>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <CapabilityItem
            label={lang === 'es' ? 'Maneja Tendencia' : 'Handles Trend'}
            supported={recommendedInfo.handlesTrend}
          />
          <CapabilityItem
            label={lang === 'es' ? 'Maneja Estacionalidad' : 'Handles Seasonality'}
            supported={recommendedInfo.handlesSeasonality}
          />
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-gray-600">{lang === 'es' ? 'Mín. datos' : 'Min data'}</span>
            <span className="font-medium">{recommendedInfo.minDataPoints}</span>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      {recommendation.alternatives.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {lang === 'es' ? 'Alternativas Consideradas' : 'Alternatives Considered'}
          </h4>
          <div className="space-y-2">
            {recommendation.alternatives.map((alt) => (
              <div key={alt.method} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                <XCircle className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-700">{algorithmInfo[alt.method].name}</span>
                <span className="text-gray-500">-</span>
                <span className="text-gray-600 truncate">{alt.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface CharacteristicItemProps {
  label: string
  hasFeature: boolean
  icon: React.ReactNode
}

function CharacteristicItem({ label, hasFeature, icon }: CharacteristicItemProps) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded ${
      hasFeature ? 'bg-green-50' : 'bg-gray-50'
    }`}>
      <span className={hasFeature ? 'text-green-600' : 'text-gray-400'}>
        {icon}
      </span>
      <span className={`text-sm font-medium ${
        hasFeature ? 'text-green-700' : 'text-gray-500'
      }`}>
        {label}
      </span>
      <span className={hasFeature ? 'text-green-600' : 'text-gray-400'}>
        {hasFeature ? '✓' : '✗'}
      </span>
    </div>
  )
}

interface CapabilityItemProps {
  label: string
  supported: boolean
}

function CapabilityItem({ label, supported }: CapabilityItemProps) {
  return (
    <div className={`flex items-center justify-between p-2 rounded ${
      supported ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
    }`}>
      <span className={`text-sm ${supported ? 'text-green-700' : 'text-gray-500'}`}>
        {label}
      </span>
      <span className={`text-sm font-medium ${
        supported ? 'text-green-600' : 'text-gray-400'
      }`}>
        {supported ? '✓' : '✗'}
      </span>
    </div>
  )
}
