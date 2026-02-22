import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  searchProviders, 
  getServiceCategories, 
  getCities,
  getProvinces,
  SearchFilters,
  SearchResult,
  ServiceCategory,
  CityOption
} from '../lib/search'

export function useSearch() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('') // Keep this empty initially
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [provinces, setProvinces] = useState<string[]>([])
  const [loadingFilters, setLoadingFilters] = useState(true)
  const [initialSearchPerformed, setInitialSearchPerformed] = useState(false) // Track if we've done the initial search

  // Load filter options on mount
  useEffect(() => {
    const loadFilters = async () => {
      setLoadingFilters(true)
      try {
        const [cats, citiesData, provs] = await Promise.all([
          getServiceCategories(),
          getCities(),
          getProvinces()
        ])
        
        setCategories(cats)
        setCities(citiesData)
        setProvinces(provs)
      } catch (error) {
        console.error('Error loading filters:', error)
      } finally {
        setLoadingFilters(false)
      }
    }

    loadFilters()
  }, [])

  // Perform initial search based on URL param WITHOUT setting the search term
  useEffect(() => {
    const q = searchParams.get('q')
    
    // Only perform the initial search once
    if (q && !initialSearchPerformed) {
      console.log('Initial search with term:', q) // Debug log
      
      // Perform search directly with the URL term
      const performInitialSearch = async () => {
        setLoading(true)
        try {
          const searchResults = await searchProviders(q, filters)
          setResults(searchResults)
        } catch (error) {
          console.error('Search error:', error)
          setResults([])
        } finally {
          setLoading(false)
          setInitialSearchPerformed(true)
        }
      }
      
      performInitialSearch()
    }
  }, [searchParams, filters, initialSearchPerformed])

  // Perform search based on user typing in search bar
  const performSearch = useCallback(async () => {
    // Don't search if empty
    if (!searchTerm.trim()) {
      setResults([])
      return
    }
    
    setLoading(true)
    try {
      console.log('User search with term:', searchTerm)
      const searchResults = await searchProviders(searchTerm, filters)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filters])

  // Debounced search for user typing
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }
    
    const timer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, performSearch])

  // Update filters
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  // Remove a specific filter
  const removeFilter = (key: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  return {
    // State
    searchTerm,
    setSearchTerm,
    filters,
    results,
    loading,
    categories,
    cities,
    provinces,
    loadingFilters,
    
    // Actions
    updateFilter,
    clearFilters,
    removeFilter,
    refresh: performSearch
  }
}