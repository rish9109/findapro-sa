import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Fuse from 'fuse.js'
import { 
  searchProvidersInDB, // Use DB search for initial
  filterProvidersLocally, // Use local filter for live search
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
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult[]>([])
  const [initialResults, setInitialResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [provinces, setProvinces] = useState<string[]>([])
  const [loadingFilters, setLoadingFilters] = useState(true)
  const [initialSearchPerformed, setInitialSearchPerformed] = useState(false)

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

  // Perform initial search based on URL param - USING DATABASE SEARCH
  useEffect(() => {
    const q = searchParams.get('q')
    
    if (q && !initialSearchPerformed) {
      console.log('Initial DB search with term:', q)
      
      const performInitialSearch = async () => {
        setLoading(true)
        try {
          // Use DATABASE search for initial query
          const searchResults = await searchProvidersInDB(q, filters)
          console.log(`Found ${searchResults.length} results from DB`)
          setResults(searchResults)
          setInitialResults(searchResults)
        } catch (error) {
          console.error('Search error:', error)
          setResults([])
          setInitialResults([])
        } finally {
          setLoading(false)
          setInitialSearchPerformed(true)
        }
      }
      
      performInitialSearch()
    }
  }, [searchParams, filters, initialSearchPerformed])

  // Local filtering for live search
  const filterResults = useCallback((query: string) => {
    if (!initialResults.length) return
    
    if (!query.trim()) {
      setResults(initialResults)
      return
    }

    // Use the local filter function
    const filtered = filterProvidersLocally(initialResults, query)
    setResults(filtered)
  }, [initialResults])

  // Debounced filtering for user typing
  useEffect(() => {
    if (!initialSearchPerformed) return
    
    const timer = setTimeout(() => {
      filterResults(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, filterResults, initialSearchPerformed])

  // Update filters and re-run DB search
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      
      const q = searchParams.get('q')
      if (q) {
        setLoading(true)
        searchProvidersInDB(q, newFilters).then(newResults => {
          setResults(newResults)
          setInitialResults(newResults)
          setLoading(false)
        })
      }
      
      return newFilters
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    
    const q = searchParams.get('q')
    if (q) {
      setLoading(true)
      searchProvidersInDB(q, {}).then(newResults => {
        setResults(newResults)
        setInitialResults(newResults)
        setLoading(false)
      })
    }
  }

  // Remove a specific filter
  const removeFilter = (key: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      
      const q = searchParams.get('q')
      if (q) {
        setLoading(true)
        searchProvidersInDB(q, newFilters).then(newResults => {
          setResults(newResults)
          setInitialResults(newResults)
          setLoading(false)
        })
      }
      
      return newFilters
    })
  }

  return {
    searchTerm,
    setSearchTerm,
    filters,
    results,
    loading,
    categories,
    cities,
    provinces,
    loadingFilters,
    updateFilter,
    clearFilters,
    removeFilter
  }
}