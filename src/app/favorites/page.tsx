// File: src/app/favorites/page.tsx - USING PROVIDER CARD COMPONENT
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, toggleFavoriteSupabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Heart, Briefcase,
  Sparkles, ChevronRight
} from 'lucide-react'
import ProviderCard from '@/components/ProviderCard'

// Define the Provider type interface (matching what ProviderCard expects)
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
}

export default function FavoritesPage() {
  const router = useRouter()
  const { user, showAuthModal } = useAuth()
  
  const [favoriteProviders, setFavoriteProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncingFavoriteId, setSyncingFavoriteId] = useState<string | null>(null)
  const [accreditationsMap, setAccreditationsMap] = useState<Map<string, any>>(new Map())

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      showAuthModal('login')
      router.push('/providers')
    }
  }, [user, router, showAuthModal])

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

  // Load favorite providers
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError('')
        
        // Get favorite provider IDs
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('user_favorites')
          .select('provider_id')
          .eq('user_id', user.id)
        
        if (favoritesError) throw favoritesError
        
        if (!favoritesData || favoritesData.length === 0) {
          setFavoriteProviders([])
          setError('You haven\'t saved any favorites yet.')
          return
        }
        
        const providerIds = favoritesData.map(fav => fav.provider_id)
        
        const { data, error } = await supabase
          .from('providers')
          .select(`
            *,
            provider_accreditations (id, custom_name, is_custom, accreditation_id)
          `)
          .in('id', providerIds)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        if (data && data.length > 0) {
          const transformedData: Provider[] = data.map(provider => {
            // Format service areas
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
            
            // Get other services
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
              is_favorite: true // These are favorites by definition
            }
          })
          
          setFavoriteProviders(transformedData)
        } else {
          setFavoriteProviders([])
          setError('No favorite providers found.')
        }
        
      } catch (err: any) {
        console.error('Error loading favorites:', err)
        setError('Failed to load your favorites. Please try again.')
        setFavoriteProviders([])
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  // Handle provider click
  const handleProviderClick = (providerId: string) => {
    router.push(`/providers/${providerId}?ref=favorites`)
  }

  // Toggle favorite (remove from favorites)
  const toggleFavorite = async (providerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!user) {
      showAuthModal('login')
      return
    }
    
    try {
      setSyncingFavoriteId(providerId)
      
      // Optimistically update UI
      setFavoriteProviders(prev => prev.filter(p => p.id !== providerId))
      
      // Update localStorage
      const savedFavorites = localStorage.getItem('provider_favorites')
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites)
        const newFavorites = favorites.filter((id: string) => id !== providerId)
        localStorage.setItem('provider_favorites', JSON.stringify(newFavorites))
      }
      
      // Sync with Supabase
      const success = await toggleFavoriteSupabase(user.id, providerId)
      
      if (!success) {
        console.error('Failed to remove favorite from Supabase')
        // Reload favorites to restore state
        const { data } = await supabase
          .from('providers')
          .select(`
            *,
            provider_accreditations (id, custom_name, is_custom, accreditation_id)
          `)
          .eq('id', providerId)
          .single()
        
        if (data) {
          // Re-add the provider to the list
          setFavoriteProviders(prev => [...prev, data as Provider])
        }
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setSyncingFavoriteId(null)
    }
  }

  // Helper functions for display
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

  // Handle back to providers
  const handleBack = () => {
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <main className="relative container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 fill-purple-400" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                  My Favorites
                </h1>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                {favoriteProviders.length} saved {favoriteProviders.length === 1 ? 'professional' : 'professionals'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600/20 to-purple-500/20 border border-purple-500/30 rounded-lg sm:rounded-xl mt-2 sm:mt-0">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-white text-xs sm:text-sm whitespace-nowrap">Personal Collection</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400 text-sm sm:text-base">Loading your favorites...</p>
          </div>
        ) : error && favoriteProviders.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-gray-800/30 rounded-xl sm:rounded-2xl border border-gray-700 mx-2 sm:mx-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mb-6 px-4">
              {error}
            </p>
            <button
              onClick={handleBack}
              className="px-4 py-2 sm:px-6 sm:py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-400 text-sm sm:text-base"
            >
              Browse Professionals
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favoriteProviders.map((provider, index) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  index={index}
                  syncingFavoriteId={syncingFavoriteId}
                  user={user}
                  showAuthModal={showAuthModal}
                  onToggleFavorite={toggleFavorite}
                  onProviderClick={handleProviderClick}
                  getPriceDisplay={getPriceDisplay}
                  getServiceAreasDisplay={getServiceAreasDisplay}
                  getAccreditationsDisplay={getAccreditationsDisplay}
                />
              ))}
            </div>

            {favoriteProviders.length === 0 && (
              <div className="mt-6 sm:mt-8 bg-gray-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 mx-2 sm:mx-0">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3">How to save favorites</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-400 font-bold text-sm sm:text-base">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-0.5 sm:mb-1 text-sm sm:text-base">Browse professionals</p>
                      <p className="text-gray-400 text-xs sm:text-sm">Find service providers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-400 font-bold text-sm sm:text-base">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-0.5 sm:mb-1 text-sm sm:text-base">Click heart icon</p>
                      <p className="text-gray-400 text-xs sm:text-sm">On any provider card</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-400 font-bold text-sm sm:text-base">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-0.5 sm:mb-1 text-sm sm:text-base">Access anytime</p>
                      <p className="text-gray-400 text-xs sm:text-sm">View saved favorites here</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}