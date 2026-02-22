import React from 'react'
import { SearchFilters as FilterType, ServiceCategory, CityOption } from '../lib/search'

interface SearchFiltersProps {
  filters: FilterType
  categories: ServiceCategory[]
  cities: CityOption[]
  provinces: string[]
  onFilterChange: (key: keyof FilterType, value: any) => void
  onClearFilters: () => void
  className?: string
  isMobile?: boolean
}

export function SearchFilters({
  filters,
  categories,
  cities,
  provinces,
  onFilterChange,
  onClearFilters,
  className = "",
  isMobile = false
}: SearchFiltersProps) {
  const activeFilterCount = Object.keys(filters).length

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-white">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.categoryId || ''}
            onChange={(e) => onFilterChange('categoryId', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Province Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Province
          </label>
          <select
            value={filters.province || ''}
            onChange={(e) => {
              onFilterChange('province', e.target.value || undefined)
              if (filters.city) {
                onFilterChange('city', undefined)
              }
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Provinces</option>
            {provinces.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            City
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => onFilterChange('city', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Cities</option>
            {cities
              .filter(city => !filters.province || city.province === filters.province)
              .map((city, idx) => (
                <option key={`${city.city}-${idx}`} value={city.city}>
                  {city.city} {!filters.province && `(${city.province})`}
                </option>
              ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Minimum Rating
          </label>
          <select
            value={filters.minRating || ''}
            onChange={(e) => onFilterChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>

        {/* Emergency Service Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emergency"
            checked={filters.emergencyOnly || false}
            onChange={(e) => onFilterChange('emergencyOnly', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
          />
          <label htmlFor="emergency" className="ml-2 block text-sm text-gray-300">
            Emergency services only
          </label>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.categoryId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900/50 text-blue-300 border border-blue-700">
                {categories.find(c => c.id === filters.categoryId)?.name || 'Category'}
                <button
                  onClick={() => onFilterChange('categoryId', undefined)}
                  className="ml-1 hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-300 border border-green-700">
                {filters.city}
                <button
                  onClick={() => onFilterChange('city', undefined)}
                  className="ml-1 hover:text-green-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.minRating && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-900/50 text-yellow-300 border border-yellow-700">
                {filters.minRating}+ Stars
                <button
                  onClick={() => onFilterChange('minRating', undefined)}
                  className="ml-1 hover:text-yellow-200"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}