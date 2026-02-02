// File: src/app/providers/page.tsx - BUG FIXES
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, getUserFavorites, toggleFavoriteSupabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Heart, MapPin, Star, DollarSign, Briefcase,
  Shield, Zap, Award, ChevronRight,
  CheckCircle, Calendar
} from 'lucide-react'

export default function ProvidersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, showAuthModal } = useAuth()
  
  const [providers, setProviders] = useState<any[]>([])
  const [filteredProviders, setFilteredProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [syncingFavoriteId, setSyncingFavoriteId] = useState<string | null>(null) // TRACK INDIVIDUAL HEART
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [accreditationsMap, setAccreditationsMap] = useState<Map<string, any>>(new Map())

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

  // Check URL for category filter
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

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
      
      // Fetch providers with related data
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          provider_service_areas (area_name, is_primary),
          provider_accreditations (id, custom_name, is_custom, accreditation_id)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      if (data && data.length > 0) {
        const transformedData = data.map(provider => {
          // Get ALL service areas from provider_service_areas
          const serviceAreas = provider.provider_service_areas || []
          const allServiceAreas = serviceAreas.map((area: any) => area.area_name)
          const primaryArea = serviceAreas.find((area: any) => area.is_primary)?.area_name || 
                            provider.main_service_area || 
                            'Service Area'
          
          // Get other services (parse from comma-separated string)
          let otherServices = []
          if (provider.other_services) {
            otherServices = provider.other_services.split(',').map((s: string) => s.trim()).slice(0, 3)
          }
          
          // Get accreditations for display - LINKED TO ACCREDITATIONS TABLE
          const displayAccreditations = provider.provider_accreditations || []
          
          return {
            id: provider.id,
            business_name: provider.business_name,
            main_service: provider.main_service || 'Professional Service',
            main_service_id: provider.main_service_id,
            
            // Service area info
            primary_area: primaryArea,
            service_areas: serviceAreas,
            all_service_areas: allServiceAreas,
            
            // Pricing
            hourly_rate: provider.hourly_rate,
            callout_fee: provider.callout_fee,
            
            // Ratings
            rating: provider.rating || 4.5,
            total_reviews: provider.total_reviews || 0,
            
            // Services
            other_services: otherServices,
            all_other_services: provider.other_services || '',
            
            // Features
            experience_years: provider.experience_years || 0,
            emergency_service: provider.emergency_service || false,
            insurance: provider.insurance || false,
            accepts_card: provider.accepts_card || false,
            accepts_cash: provider.accepts_cash || true,
            verified: provider.verified || false,
            
            // Accreditations
            accreditations: provider.provider_accreditations || [],
            display_accreditations: displayAccreditations,
            
            // Favorite status
            is_favorite: favorites.includes(provider.id)
          }
        })
        
        setProviders(transformedData)
        
        // Apply category filter
        if (selectedCategory !== 'all') {
          const filtered = transformedData.filter(p => p.main_service_id === selectedCategory)
          setFilteredProviders(filtered)
        } else {
          setFilteredProviders(transformedData)
        }
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

  // Filter providers when category changes
  useEffect(() => {
    if (providers.length > 0) {
      if (selectedCategory !== 'all') {
        const filtered = providers.filter(provider => provider.main_service_id === selectedCategory)
        setFilteredProviders(filtered)
      } else {
        setFilteredProviders(providers)
      }
    }
  }, [selectedCategory, providers])

  // Toggle favorite - FIXED: Only shows loading for clicked heart
  const toggleFavorite = async (providerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!user) {
      showAuthModal('login')
      return
    }
    
    try {
      // Set only this specific heart as loading
      setSyncingFavoriteId(providerId)
      
      const isCurrentlyFavorite = favorites.includes(providerId)
      let newFavorites: string[]
      
      if (isCurrentlyFavorite) {
        newFavorites = favorites.filter(id => id !== providerId)
      } else {
        newFavorites = [...favorites, providerId]
      }
      
      // Optimistic update
      setFavorites(newFavorites)
      localStorage.setItem('provider_favorites', JSON.stringify(newFavorites))
      
      // Update UI immediately
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, is_favorite: !isCurrentlyFavorite }
          : provider
      ))
      
      setFilteredProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, is_favorite: !isCurrentlyFavorite }
          : provider
      ))
      
      // Sync with Supabase in background
      const success = await toggleFavoriteSupabase(user.id, providerId)
      
      if (!success) {
        // Revert if Supabase sync fails
        console.error('Failed to sync favorite with Supabase')
        if (isCurrentlyFavorite) {
          newFavorites = [...newFavorites, providerId]
        } else {
          newFavorites = newFavorites.filter(id => id !== providerId)
        }
        setFavorites(newFavorites)
        localStorage.setItem('provider_favorites', JSON.stringify(newFavorites))
        
        // Revert UI
        setProviders(prev => prev.map(provider => 
          provider.id === providerId 
            ? { ...provider, is_favorite: isCurrentlyFavorite }
            : provider
        ))
        
        setFilteredProviders(prev => prev.map(provider => 
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

  // Get price display
  const getPriceDisplay = (provider: any) => {
    if (provider.hourly_rate) {
      return `R${provider.hourly_rate}/hr`
    }
    if (provider.callout_fee) {
      return `R${provider.callout_fee} callout`
    }
    return 'Contact for rates'
  }

  // Get service areas display - SINGLE LINE ON MOBILE
  const getServiceAreasDisplay = (provider: any) => {
    if (provider.all_service_areas && provider.all_service_areas.length > 0) {
      // Show first 2 areas, then +X more
      const displayAreas = provider.all_service_areas.slice(0, 2)
      const additionalCount = provider.all_service_areas.length - 2
      
      let display = displayAreas.join(', ')
      if (additionalCount > 0) {
        display += ` +${additionalCount}`
      }
      return display
    }
    return provider.primary_area || 'Service area not specified'
  }

  // Get accreditations display - FROM SUPABASE ACCREDITATIONS TABLE
  const getAccreditationsDisplay = (provider: any) => {
    if (provider.display_accreditations && provider.display_accreditations.length > 0) {
      // Get accreditation names from Supabase table or use custom names
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

  // Get business initials for logo
  const getBusinessInitials = (businessName: string) => {
    if (!businessName) return 'P'
    return businessName.charAt(0).toUpperCase()
  }

  // Get business color
  const getBusinessColor = (businessName: string) => {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Emerald
      '#6366F1', // Indigo
      '#EF4444', // Red
      '#F59E0B', // Amber
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#EC4899', // Pink
    ]
    
    if (!businessName) return colors[0]
    const charCode = businessName.charCodeAt(0)
    return colors[charCode % colors.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8">
        
        {/* UNIFORM CARD DESIGN - Works on mobile and desktop */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading professional service providers...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {selectedCategory !== 'all' ? 'No providers in this category' : 'No providers available yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory !== 'all' 
                ? 'Try selecting a different category or check back soon'
                : 'Check back soon for approved service providers!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider, index) => {
              const businessColor = getBusinessColor(provider.business_name)
              const businessInitials = getBusinessInitials(provider.business_name)
              const accreditationsDisplay = getAccreditationsDisplay(provider)
              
              return (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group cursor-pointer"
                >
                  {/* PROVIDER CARD - Uniform design with FIXED HEIGHTS */}
                  <div 
                    onClick={() => handleProviderClick(provider.id)}
                    className="h-full bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] flex flex-col"
                  >
                    {/* Card Header with Logo and Business Name */}
                    <div className="p-6 border-b border-gray-700/50">
                      <div className="flex items-center gap-4">
                        {/* Business Logo */}
                        <div className="relative flex-shrink-0">
                          <div 
                            className="w-20 h-20 rounded-2xl border-2 border-gray-600 flex items-center justify-center shadow-lg overflow-hidden"
                            style={{ 
                              backgroundColor: businessColor + '10',
                            }}
                          >
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: businessColor }}
                            >
                              <span className="text-2xl font-bold text-white">
                                {businessInitials}
                              </span>
                            </div>
                          </div>
                          
                          {/* Verification Badge */}
                          {provider.verified && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-gray-800 flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Business Name and Service Category */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              {/* LARGER BUSINESS NAME */}
                              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                                {provider.business_name}
                              </h3>
                              {/* Service Category - Smaller font below */}
                              <p className="text-sm text-blue-400 mt-1 truncate">
                                {provider.main_service}
                              </p>
                            </div>
                            
                            {/* Favorite Button - FIXED: Only shows loading for clicked heart */}
                            <button
                              onClick={(e) => toggleFavorite(provider.id, e)}
                              disabled={syncingFavoriteId !== null}
                              className="flex-shrink-0 p-2 rounded-full hover:bg-gray-700/50 transition-colors ml-2"
                              title={provider.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              {syncingFavoriteId === provider.id ? (
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Heart
                                  className={`w-5 h-5 ${provider.is_favorite ? 'fill-blue-500 text-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
                                />
                              )}
                            </button>
                          </div>
                          
                          {/* Rating and Price */}
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-semibold text-white">
                                {provider.rating || 'New'}
                              </span>
                              {provider.total_reviews > 0 && (
                                <span className="text-sm text-gray-400">
                                  ({provider.total_reviews})
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4 text-emerald-400" />
                              <span className="font-semibold text-emerald-400">
                                {getPriceDisplay(provider)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Body - All Required Information with CONSISTENT HEIGHTS */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Service Areas - SINGLE LINE ON MOBILE */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-blue-400">Service Areas</span>
                        </div>
                        <div className="min-h-[44px] flex items-center">
                          <p className="text-white font-semibold truncate md:line-clamp-2">
                            {getServiceAreasDisplay(provider)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Years of Experience */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-emerald-400">Experience</span>
                        </div>
                        <div className="min-h-[44px] flex items-center">
                          <p className="text-white font-semibold">
                            {provider.experience_years > 0 
                              ? `${provider.experience_years} year${provider.experience_years !== 1 ? 's' : ''}`
                              : 'Not specified'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Other Services Offered */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-purple-400">Other Services</span>
                        </div>
                        <div className="min-h-[44px] flex items-center">
                          <p className="text-gray-300 truncate md:line-clamp-2">
                            {provider.other_services && provider.other_services.length > 0 
                              ? provider.other_services.join(', ')
                              : 'No additional services listed'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Accreditations - FROM SUPABASE TABLE */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-amber-400">Accreditations</span>
                        </div>
                        <div className="min-h-[44px] flex items-center">
                          {accreditationsDisplay ? (
                            <p className="text-blue-400 truncate md:line-clamp-2">
                              {accreditationsDisplay}
                            </p>
                          ) : (
                            <p className="text-gray-500 italic">No accreditations listed</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Features/Badges Row - TRUNCATE ON MOBILE (NO SCROLL BAR) */}
                      <div className="mt-auto pt-4 border-t border-gray-700/50">
                        <div className="flex gap-2 min-h-[40px] items-center overflow-hidden">
                          {provider.emergency_service || provider.insurance || provider.accepts_card || provider.accepts_cash ? (
                            <div className="flex gap-2 flex-nowrap w-full">
                              {/* Emergency Service */}
                              {provider.emergency_service && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg border border-red-500/20 min-w-[70px] justify-center flex-shrink-0">
                                  <Zap className="w-3.5 h-3.5 text-red-400" />
                                  <span className="text-xs font-medium text-red-400">24/7</span>
                                </div>
                              )}
                              
                              {/* Insurance */}
                              {provider.insurance && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20 min-w-[70px] justify-center flex-shrink-0">
                                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                                  <span className="text-xs font-medium text-blue-400">Insured</span>
                                </div>
                              )}
                              
                              {/* Payment Methods - SAME SIZE */}
                              {provider.accepts_card && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20 min-w-[70px] flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-emerald-400">Card</span>
                                </div>
                              )}
                              
                              {provider.accepts_cash && (
                                <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20 min-w-[70px] flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-emerald-400">Cash</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="min-h-[40px] flex items-center">
                              <p className="text-gray-500 text-sm italic">No features specified</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* View Details CTA - Fixed at bottom */}
                      <div className="pt-4 border-t border-gray-700/50 flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-400">
                          {user ? 'Click for full details & contact' : 'Sign in to view details'}
                        </span>
                        <div className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300 transition-colors">
                          <span className="text-sm font-medium">View</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}