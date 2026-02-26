// File: src/components/SearchResults.tsx

import React from 'react'
import { SearchResult } from '../lib/search'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Heart, MapPin, Star, Briefcase,
  Shield, Zap, Award, ChevronRight,
  Calendar
} from 'lucide-react'
import ProviderLogoDisplay from '@/components/ProviderLogoDisplay'
import { useState, useEffect } from 'react'
import { supabase, toggleFavoriteSupabase } from '@/lib/supabase'
import ProviderCard from '@/components/ProviderCard'

interface SearchResultsProps {
  results: SearchResult[]
  loading: boolean
  searchTerm: string
  className?: string
}

// Define a type that matches what ProviderCard expects
interface TransformedProvider {
  id: string
  business_name: string
  main_service: string
  main_service_id?: string
  service_areas: string  // This should be a string, not an array
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
  accreditations: any[] | null
  display_accreditations: any[]
  is_favorite: boolean
  business_features?: any[]
}

export function SearchResults({ 
  results, 
  loading, 
  searchTerm,
  className = "" 
}: SearchResultsProps) {
  const router = useRouter()
  const { user, showAuthModal } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [syncingFavoriteId, setSyncingFavoriteId] = useState<string | null>(null)
  const [accreditationsMap, setAccreditationsMap] = useState<Map<string, any>>(new Map())

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        if (user) {
          const savedFavorites = localStorage.getItem('provider_favorites')
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites))
          }
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
      }
    }

    loadFavorites()
  }, [user])

  // Fetch accreditations
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
      
      // Sync with Supabase
      const success = await toggleFavoriteSupabase(user.id, providerId)
      
      if (!success) {
        console.error('Failed to sync favorite with Supabase')
        // Revert on failure
        if (isCurrentlyFavorite) {
          newFavorites = [...newFavorites, providerId]
        } else {
          newFavorites = newFavorites.filter(id => id !== providerId)
        }
        setFavorites(newFavorites)
        localStorage.setItem('provider_favorites', JSON.stringify(newFavorites))
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setSyncingFavoriteId(null)
    }
  }

  const handleProviderClick = (providerId: string) => {
    if (!user) {
      showAuthModal('login')
      return
    }
    
    router.push(`/providers/${providerId}`)
  }

  const getPriceDisplay = (provider: SearchResult) => {
    if (provider.fees_pricing) {
      return provider.fees_pricing
    }
    if (provider.callout_fee) {
      return provider.callout_fee
    }
    return 'Contact for rates'
  }

  const getServiceAreasDisplay = (provider: SearchResult) => {
    try {
      if (provider.service_areas && provider.service_areas.length > 0) {
        const cleanedAreas = provider.service_areas
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
          display += ` +${additionalCount} more`
        }
        return display
      }
      
      return 'Service area not specified'
    } catch (error) {
      console.error('Error in getServiceAreasDisplay:', error)
      return 'Service area not specified'
    }
  }

  const getAccreditationsDisplay = (provider: SearchResult) => {
    if (provider.provider_accreditations && provider.provider_accreditations.length > 0) {
      const accreditationNames = provider.provider_accreditations.slice(0, 2).map((acc: any) => {
        if (acc.is_custom) {
          return acc.custom_name?.substring(0, 15) || 'Custom'
        } else if (acc.accreditation_id) {
          const accreditation = accreditationsMap.get(acc.accreditation_id)
          return accreditation?.name?.substring(0, 15) || 'Certified'
        }
        return 'Certified'
      })
      
      const display = accreditationNames.join(', ')
      const additionalCount = provider.provider_accreditations.length - 2
      
      if (additionalCount > 0) {
        return `${display} +${additionalCount} more`
      }
      return display
    }
    return null
  }

  // Transform SearchResult to match ProviderCard's expected format
  const transformToProvider = (result: SearchResult): TransformedProvider => {
    // Format service areas for display as an array
    let formattedServiceAreas: string[] = []
    if (result.service_areas && result.service_areas.length > 0) {
      formattedServiceAreas = result.service_areas.map((area: string) => {
        return area
          .split(' ')
          .map((word: string) => {
            const trimmedWord = word.trim()
            if (trimmedWord.length === 0) return ''
            return trimmedWord.charAt(0).toUpperCase() + trimmedWord.slice(1).toLowerCase()
          })
          .join(' ')
      })
    }

    // Create a string version of service areas for the service_areas field
    const serviceAreasString = result.service_areas && result.service_areas.length > 0
      ? result.service_areas.join(', ')
      : ''

    // Get other services from details
    let otherServices: string[] = []
    if (result.details) {
      otherServices = result.details
        .split(/[\n,]+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s && s.length > 0)
        .slice(0, 3)
    }

    return {
      id: result.id,
      business_name: result.business_name,
      main_service: result.main_service,
      main_service_id: result.main_service_id,
      service_areas: serviceAreasString, // This is now a string, not an array
      formatted_service_areas: formattedServiceAreas,
      fees_pricing: result.fees_pricing,
      callout_fee: result.callout_fee,
      rating: result.rating || 0,
      total_reviews: result.total_reviews || 0,
      other_services: otherServices,
      all_other_services: result.details || '',
      experience_years: result.experience_years || 0,
      emergency_service: result.emergency_service || false,
      insurance: result.insurance || false,
      accepts_card: result.accepts_card || false,
      accepts_cash: result.accepts_cash || false,
      verified: result.verified || false,
      accreditations: result.provider_accreditations || null,
      display_accreditations: result.provider_accreditations || [],
      is_favorite: favorites.includes(result.id),
      business_features: result.business_features || []
    }
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

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-400">Loading professional service providers...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          {searchTerm 
            ? `No results found for "${searchTerm}"` 
            : 'No providers found'}
        </h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your search
        </p>
      </div>
    )
  }

  const providers = results.map(transformToProvider)

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {providers.map((provider, index) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          index={index}
          searchQuery={searchTerm}
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
  )
}