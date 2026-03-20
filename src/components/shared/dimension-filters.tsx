'use client'

/**
 * Dimension Filters Component
 *
 * Dropdown filters for location, brand, channel, and payment method
 */

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface DimensionFiltersProps {
  locations: string[]
  brands: string[]
  channels: string[]
  paymentMethods: string[]
  onFilterChange: (filters: {
    location: string
    brand: string
    channel: string
    paymentMethod: string
  }) => void
}

export function DimensionFilters({
  locations,
  brands,
  channels,
  paymentMethods,
  onFilterChange,
}: DimensionFiltersProps) {
  const { t } = useLanguage()
  const [filters, setFilters] = useState({
    location: '',
    brand: '',
    channel: '',
    paymentMethod: '',
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      location: '',
      brand: '',
      channel: '',
      paymentMethod: '',
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.location || filters.brand || filters.channel || filters.paymentMethod

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">{t('filterByDimensions')}</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-3 h-3" />
            {t('clearFilters')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Location Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('location')}
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">{t('allLocations')}</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('brand')}
          </label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">{t('allBrands')}</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('channel')}
          </label>
          <select
            value={filters.channel}
            onChange={(e) => handleFilterChange('channel', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">{t('allChannels')}</option>
            {channels.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('paymentMethod')}
          </label>
          <select
            value={filters.paymentMethod}
            onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">{t('allPaymentMethods')}</option>
            {paymentMethods.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {filters.location && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md">
                {t('location')}: {filters.location}
                <button
                  onClick={() => handleFilterChange('location', '')}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.brand && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-md">
                {t('brand')}: {filters.brand}
                <button
                  onClick={() => handleFilterChange('brand', '')}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.channel && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md">
                {t('channel')}: {filters.channel}
                <button
                  onClick={() => handleFilterChange('channel', '')}
                  className="hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.paymentMethod && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded-md">
                {t('paymentMethod')}: {filters.paymentMethod}
                <button
                  onClick={() => handleFilterChange('paymentMethod', '')}
                  className="hover:text-orange-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
