// File: src/app/providers/page.tsx - WITH BUSINESS FEATURES
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, getUserFavorites, toggleFavoriteSupabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, MapPin, Star, Briefcase,
  Shield, Zap, Award, ChevronRight,
  Calendar, X
} from 'lucide-react'
import ProviderLogoDisplay from '@/components/ProviderLogoDisplay'
import SearchBar from '@/components/SearchBar'
import ProviderCard from '@/components/ProviderCard'

// Define the Provider type interface with business_features
interface Provider {
  id: string
  business_name: string
  main_service: string
  main_service_id?: string
  service_areas: string
  formatted_service_areas: string[]
  fees_pricing?: string | null
  callout_fee?: string | null
  rating: number
  total_reviews: number
  other_services: string[]
  all_other_services: string
  experience_years: number
  emergency_service: boolean
  insurance: boolean
  accepts_card: boolean
  accepts_cash: boolean
  verified: boolean
  accreditations: any[]
  display_accreditations: any[]
  is_favorite: boolean
  business_features?: any[] // Added business features
}

export default function ProvidersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, showAuthModal } = useAuth()
  
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [syncingFavoriteId, setSyncingFavoriteId] = useState<string | null>(null)
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categoryName, setCategoryName] = useState<string>('')
  const [accreditationsMap, setAccreditationsMap] = useState<Map<string, any>>(new Map())
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        if (user) {
          const userFavorites = await getUserFavorites(user.id)
          setFavorites(userFavorites)
          localStorage.setItem('provider_favorites', JSON.stringify(userFavorites))
        } else {
          const savedFavorites = localStorage.getItem('provider_favorites')
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites))
          }
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
        const savedFavorites = localStorage.getItem('provider_favorites')
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites))
        }
      } finally {
        setFavoritesLoaded(true)
      }
    }

    loadFavorites()
  }, [user])

  // Check URL for category filter and get category name
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
      fetchCategoryName(categoryFromUrl)
    } else {
      setSelectedCategory('all')
      setCategoryName('')
    }
  }, [searchParams])

  // Fetch category name
  const fetchCategoryName = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('name')
        .eq('id', categoryId)
        .single()

      if (!error && data) {
        setCategoryName(data.name)
      }
    } catch (error) {
      console.error('Error fetching category name:', error)
    }
  }

  // Fetch accreditations from Supabase
  useEffect(() => {
    const fetchAccreditations = async () => {
      try {
        const { data, error } = await supabase
          .from('accreditations')
          .select('*')
          .eq('is_global', true)
        
        if (!error && data) {
          const map = new Map()
          data.forEach(acc => {
            map.set(acc.id, acc)
          })
          setAccreditationsMap(map)
        }
      } catch (error) {
        console.error('Error fetching accreditations:', error)
      }
    }
    
    fetchAccreditations()
  }, [])

  // Fetch providers
  useEffect(() => {
    if (favoritesLoaded) {
      fetchApprovedProviders()
    }
  }, [favoritesLoaded])

  async function fetchApprovedProviders() {
    try {
      setLoading(true)
      
      // Updated query to include business_features with nested feature data
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          provider_accreditations (id, custom_name, is_custom, accreditation_id),
          business_features:provider_business_features(
            *,
            feature:business_features(*)
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
  
      if (error) throw error
      
      if (data && data.length > 0) {
        const transformedData: Provider[] = data.map(provider => {
          let formattedServiceAreas: string[] = []
          
          if (provider.service_areas) {
            formattedServiceAreas = provider.service_areas
              .split(',')
              .map((area: string) => area.trim())
              .map((area: string) => {
                return area
                  .split(' ')
                  .map((word: string) => {
                    const trimmedWord = word.trim()
                    if (trimmedWord.length === 0) return ''
                    return trimmedWord.charAt(0).toUpperCase() + trimmedWord.slice(1).toLowerCase()
                  })
                  .join(' ')
              })
              .filter((area: string) => area.length > 0)
          }
          
          let otherServices: string[] = []
          if (provider.details) {
            otherServices = provider.details
              .split(/[\n,]+/)
              .map((s: string) => s.trim())
              .filter((s: string) => s && s.length > 0)
              .slice(0, 3)
          }
          
          const displayAccreditations = provider.provider_accreditations || []
          
          return {
            id: provider.id,
            business_name: provider.business_name,
            main_service: provider.main_service || 'Professional Service',
            main_service_id: provider.main_service_id,
            service_areas: provider.service_areas || '',
            formatted_service_areas: formattedServiceAreas,
            fees_pricing: provider.fees_pricing,
            callout_fee: provider.callout_fee,
            rating: provider.rating || 4.5,
            total_reviews: provider.total_reviews || 0,
            other_services: otherServices,
            all_other_services: provider.details || '',
            experience_years: provider.experience_years || 0,
            emergency_service: provider.emergency_service || false,
            insurance: provider.insurance || false,
            accepts_card: provider.accepts_card || false,
            accepts_cash: provider.accepts_cash || true,
            verified: provider.verified || false,
            accreditations: provider.provider_accreditations || [],
            display_accreditations: displayAccreditations,
            is_favorite: favorites.includes(provider.id),
            business_features: provider.business_features || [] // Include business features
          }
        })
        
        setProviders(transformedData)
        
        // Apply both category and search filters
        applyFilters(transformedData, selectedCategory, searchQuery)
      } else {
        setProviders([])
        setFilteredProviders([])
      }
    } catch (error) {
      console.error('Error fetching approved providers:', error)
      setProviders([])
      setFilteredProviders([])
    } finally {
      setLoading(false)
    }
  }

  // Apply both category and search filters
  const applyFilters = (
    providersList: Provider[], 
    category: string, 
    query: string
  ) => {
    let filtered = [...providersList]
    
    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(provider => provider.main_service_id === category)
    }
    
    // Apply search filter if there's a query
    if (query.trim()) {
      setIsSearching(true)
      const searchTerms = query.toLowerCase().trim().split(/\s+/)
      
      filtered = filtered.filter(provider => {
        const searchableText = `
          ${provider.business_name} 
          ${provider.main_service} 
          ${provider.all_other_services} 
          ${provider.formatted_service_areas.join(' ')}
        `.toLowerCase()
        
        // Check if all search terms match (AND condition)
        return searchTerms.every(term => searchableText.includes(term))
      })
    } else {
      setIsSearching(false)
    }
    
    setFilteredProviders(filtered)
  }

  // Filter providers when category or search changes
  useEffect(() => {
    if (providers.length > 0) {
      applyFilters(providers, selectedCategory, searchQuery)
    }
  }, [selectedCategory, providers, searchQuery])

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  // Toggle favorite
  const toggleFavorite = async (providerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!user) {
      showAuthModal('login')
      return
    }
    
    try {
      setSyncingFavoriteId(providerId)
      
      const isCurrentlyFavorite = favorites.includes(providerId)
      let newFavorites: string[]
      
      if (isCurrentlyFavorite) {
        newFavorites = favorites.filter(id => id !== providerId)
      } else {
        newFavorites = [...favorites, providerId]
      }
      
      setFavorites(newFavorites)
      localStorage.setItem('provider_favorites', JSON.stringify(newFavorites))
      
      setProviders((prev): Provider[] => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, is_favorite: !isCurrentlyFavorite }
          : provider
      ))
      
      setFilteredProviders((prev): Provider[] => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, is_favorite: !isCurrentlyFavorite }
          : provider
      ))
      
      const success = await toggleFavoriteSupabase(user.id, providerId)
      
      if (!success) {
        console.error('Failed to sync favorite with Supabase')
        if (isCurrentlyFavorite) {
          newFavorites = [...newFavorites, providerId]
        } else {
          newFavorites = newFavorites.filter(id => id !== providerId)
        }
        setFavorites(newFavorites)
        localStorage.setItem('provider_favorites', JSON.stringify(newFavorites))
        
        setProviders((prev): Provider[] => prev.map(provider => 
          provider.id === providerId 
            ? { ...provider, is_favorite: isCurrentlyFavorite }
            : provider
        ))
        
        setFilteredProviders((prev): Provider[] => prev.map(provider => 
          provider.id === providerId 
            ? { ...provider, is_favorite: isCurrentlyFavorite }
            : provider
        ))
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setSyncingFavoriteId(null)
    }
  }

  // Handle provider click
  const handleProviderClick = (providerId: string) => {
    if (!user) {
      showAuthModal('login')
      return
    }
    
    router.push(`/providers/${providerId}`)
  }

  const getPriceDisplay = (provider: Provider) => {
    if (provider.fees_pricing) {
      return provider.fees_pricing
    }
    if (provider.callout_fee) {
      return provider.callout_fee
    }
    return 'Contact for rates'
  }

  const getServiceAreasDisplay = (provider: Provider) => {
    try {
      if (provider.formatted_service_areas && provider.formatted_service_areas.length > 0) {
        const cleanedAreas = provider.formatted_service_areas
          .map((area: string) => {
            return area
              .trim()
              .replace(/^[^a-zA-Z]+/, '')
              .replace(/[^a-zA-Z\s]+$/, '')
          })
          .filter((area: string) => area.length > 0);
        
        if (cleanedAreas.length === 0) {
          return 'Service area not specified';
        }
        
        const displayAreas = cleanedAreas.slice(0, 2)
        const additionalCount = cleanedAreas.length - 2
        
        let display = displayAreas.join(', ')
        if (additionalCount > 0) {
          display += ` +${additionalCount}`
        }
        return display
      }
      
      return 'Service area not specified'
    } catch (error) {
      console.error('Error in getServiceAreasDisplay:', error)
      return 'Service area not specified'
    }
  }

  const getAccreditationsDisplay = (provider: Provider) => {
    if (provider.display_accreditations && provider.display_accreditations.length > 0) {
      const accreditationNames = provider.display_accreditations.slice(0, 2).map((acc: any) => {
        if (acc.is_custom) {
          return acc.custom_name?.substring(0, 15) || 'Custom'
        } else if (acc.accreditation_id) {
          const accreditation = accreditationsMap.get(acc.accreditation_id)
          return accreditation?.name?.substring(0, 15) || 'Certified'
        }
        return 'Certified'
      })
      
      const display = accreditationNames.join(', ')
      const additionalCount = provider.accreditations.length - 2
      
      if (additionalCount > 0) {
        return `${display} +${additionalCount} more`
      }
      return display
    }
    return null
  }

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={i} className="bg-yellow-500/30 text-white px-0.5 rounded">{part}</mark> : 
        part
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <main className="relative container mx-auto px-4 py-8">
        
        {/* Search Bar Section - Centered below header */}
        <div className="mb-8 max-w-3xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={clearSearch}
            placeholder={
              selectedCategory !== 'all' && categoryName
                ? `Search in ${categoryName}...`
                : 'Search for professionals by name, service, or location...'
            }
            variant="compact"
            className="w-full"
            autoFocus={false}
            showClearButton={true}
          />
          
          {/* Live search results count and category indicator */}
          <AnimatePresence mode="wait">
            {!loading && (
              <motion.div
                key={searchQuery ? 'searching' : 'idle'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  {selectedCategory !== 'all' && categoryName && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium truncate max-w-[150px] sm:max-w-[200px]">
                      {categoryName}
                    </span>
                  )}
                  
                  {isSearching && (
                    <span className="text-gray-400 whitespace-nowrap">
                      {filteredProviders.length} {filteredProviders.length === 1 ? 'result' : 'results'}
                    </span>
                  )}
                </div>
                
                {isSearching && filteredProviders.length === 0 && (
                  <span className="text-gray-500 text-sm">
                    No matches found
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading professional service providers...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : selectedCategory !== 'all' 
                  ? 'No providers available yet' 
                  : 'No providers available yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try different keywords or clear your search'
                : selectedCategory !== 'all' 
                  ? 'Share the platform with business that fit a category and together lets grow our databse'
                  : 'Check back soon for approved service providers!'}
            </p>
            
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider, index) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                index={index}
                searchQuery={searchQuery}
                syncingFavoriteId={syncingFavoriteId}
                user={user}
                showAuthModal={showAuthModal}
                onToggleFavorite={toggleFavorite}
                onProviderClick={handleProviderClick}
                getPriceDisplay={getPriceDisplay}
                getServiceAreasDisplay={getServiceAreasDisplay}
                getAccreditationsDisplay={getAccreditationsDisplay}
                highlightText={highlightText}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}