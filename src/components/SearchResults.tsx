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
import ProviderCard from '@/components/ProviderCard' // Import the new component

interface SearchResultsProps {
  results: SearchResult[]
  loading: boolean
  searchTerm: string
  className?: string
}

// Extend SearchResult to match Provider type
interface Provider extends SearchResult {
  formatted_service_areas: string[]
  other_services: string[]
  all_other_services: string
  display_accreditations: any[]
  is_favorite: boolean
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
          // You can add Supabase favorites loading here if needed
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

  // Transform SearchResult to Provider format
  const transformToProvider = (result: SearchResult): Provider => {
    // Format service areas (similar to how you do it in providers page)
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
      ...result,
      formatted_service_areas: formattedServiceAreas,
      other_services: otherServices,
      all_other_services: result.details || '',
      display_accreditations: result.provider_accreditations || [],
      is_favorite: favorites.includes(result.id)
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