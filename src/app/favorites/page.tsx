// File: src/app/favorites/page.tsx - UPDATED WITH NO SERVICE AREA FILTERING
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Heart, MapPin, Star, Briefcase,
  Shield, Zap, Award, ChevronRight,
  CheckCircle, Calendar, ArrowLeft,
  Sparkles
} from 'lucide-react'

export default function FavoritesPage() {
  const router = useRouter()
  const { user, showAuthModal } = useAuth()
  
  const [favoriteProviders, setFavoriteProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
        
        // UPDATED: Removed provider_service_areas join, using providers.service_areas text field
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
          const transformedData = data.map(provider => {
            // UPDATED: Get service areas from providers.service_areas text field - NO FILTERING
            let formattedServiceAreas = []
            if (provider.service_areas) {
              formattedServiceAreas = provider.service_areas
                .split(',')
                .map((area: string) => area.trim())
                .filter((area: string) => area !== ''); // Only remove empty strings
            }
            
            // UPDATED: Get details (other services) from providers.details text field
            let otherServices = []
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
              
              // UPDATED: Service area info
              service_areas: provider.service_areas || '',
              formatted_service_areas: formattedServiceAreas,
              
              // UPDATED: Pricing - uses fees_pricing instead of hourly_rate
              fees_pricing: provider.fees_pricing,
              callout_fee: provider.callout_fee,
              
              rating: provider.rating || 4.5,
              total_reviews: provider.total_reviews || 0,
              
              // UPDATED: Services from details field
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
              
              is_favorite: true
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

  // UPDATED: Get price display - uses fees_pricing instead of hourly_rate
  const getPriceDisplay = (provider: any) => {
    if (provider.fees_pricing) {
      const price = provider.fees_pricing.toString().replace(/[^0-9]/g, '')
      if (price) {
        return `R${price}/hr`
      }
      return provider.fees_pricing
    }
    if (provider.callout_fee) {
      const callout = provider.callout_fee.toString().replace(/[^0-9]/g, '')
      if (callout) {
        return `R${callout} callout`
      }
      return provider.callout_fee
    }
    return 'Contact for rates'
  }
  // Get service areas display - YOUR EXACT ENHANCED FUNCTION
  const getServiceAreasDisplay = (provider: any) => {
    try {
      // Use ONLY the formatted_service_areas array
      if (provider.formatted_service_areas && provider.formatted_service_areas.length > 0) {
        // Filter out single letters and common typos
        const cleanedAreas = provider.formatted_service_areas
    
          .map((area: string) => {
            // Additional cleaning for each area
            return area
              .trim()
              .replace(/^[^a-zA-Z]+/, '') // Remove leading non-letters
              .replace(/[^a-zA-Z\s]+$/, '') // Remove trailing non-letters
          })
          .filter((area: string) => area.length > 0); // Final filter
        
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
  // Get accreditations display
  const getAccreditationsDisplay = (provider: any) => {
    if (provider.display_accreditations && provider.display_accreditations.length > 0) {
      const accreditationNames = provider.display_accreditations.slice(0, 2).map((acc: any) => {
        if (acc.is_custom) {
          return acc.custom_name?.substring(0, 12) || 'Custom'
        } else if (acc.accreditation_id) {
          const accreditation = accreditationsMap.get(acc.accreditation_id)
          return accreditation?.name?.substring(0, 12) || 'Certified'
        }
        return 'Certified'
      })
      
      const display = accreditationNames.join(', ')
      const additionalCount = provider.accreditations.length - 2
      
      if (additionalCount > 0) {
        return `${display} +${additionalCount}`
      }
      return display
    }
    return null
  }

  // Get business initials
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
      '#8B5CF6', // Purple
    ]
    
    if (!businessName) return colors[0]
    const charCode = businessName.charCodeAt(0)
    return colors[charCode % colors.length]
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
      {/* Main Content - Mobile optimized */}
      <main className="relative container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        
        {/* Header - Mobile optimized */}
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

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400 text-sm sm:text-base">Loading your favorites...</p>
          </div>
        ) : error ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favoriteProviders.map((provider, index) => {
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
                  {/* PROVIDER CARD - Mobile optimized */}
                  <div 
                    onClick={() => handleProviderClick(provider.id)}
                    className="h-full bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-purple-500/30 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(139,92,246,0.15)] sm:hover:shadow-[0_20px_40px_rgba(139,92,246,0.15)] flex flex-col"
                  >
                    {/* Card Header - Mobile optimized */}
                    <div className="p-4 sm:p-6 border-b border-gray-700/50">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Business Logo - Smaller on mobile */}
                        <div className="relative flex-shrink-0">
                          <div 
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border-2 border-purple-500/30 flex items-center justify-center shadow-lg overflow-hidden"
                            style={{ 
                              backgroundColor: businessColor + '10',
                            }}
                          >
                            <div 
                              className="w-full h-full flex items-center justify-center"
                              style={{ backgroundColor: businessColor }}
                            >
                              <span className="text-xl sm:text-2xl font-bold text-white">
                                {businessInitials}
                              </span>
                            </div>
                          </div>
                          
                          {/* Favorite Badge - Smaller on mobile */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full border-2 border-gray-800 flex items-center justify-center shadow-lg">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
                          </div>
                        </div>
                        
                        {/* Business Name and Service Category - Mobile optimized */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              {/* Business Name - Truncated on mobile */}
                              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                                {provider.business_name}
                              </h3>
                              {/* Service Category */}
                              <p className="text-xs sm:text-sm text-purple-400 mt-0.5 sm:mt-1 truncate">
                                {provider.main_service}
                              </p>
                            </div>
                          </div>
                          
                          {/* Rating and Price - Mobile optimized */}
                          <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                              <span className="font-semibold text-white text-sm sm:text-base">
                                {provider.rating || 'New'}
                              </span>
                              {provider.total_reviews > 0 && (
                                <span className="text-gray-400 text-xs sm:text-sm">
                                  ({provider.total_reviews})
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <span className="font-semibold text-emerald-400 text-sm sm:text-base">
                                {getPriceDisplay(provider)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Body - Mobile optimized spacing */}
                    <div className="p-4 sm:p-6 flex-1 flex flex-col">
                      {/* Service Areas */}
                      <div className="mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-blue-400">Service Areas</span>
                        </div>
                        <div className="min-h-[36px] sm:min-h-[44px] flex items-center">
                          <p className="text-gray-300 font-semibold text-sm sm:text-base truncate md:line-clamp-2">
                            {getServiceAreasDisplay(provider)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Years of Experience */}
                      <div className="mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-emerald-400">Experience</span>
                        </div>
                        <div className="min-h-[36px] sm:min-h-[44px] flex items-center">
                          <p className="text-gray-300 font-semibold text-sm sm:text-base">
                            {provider.experience_years ? 
                              `${provider.experience_years} years` : 
                              'Not specified'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Other Services Offered */}
                      <div className="mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-purple-400">Details & Services</span>
                        </div>
                        <div className="min-h-[36px] sm:min-h-[44px]">
                          {(() => {
                            const detailsText = provider.all_other_services;
                            
                            if (!detailsText?.trim()) {
                              return (
                                <p className="text-gray-500 italic text-xs sm:text-sm">No details provided</p>
                              );
                            }
                            
                            const items = detailsText
                            .split(/[\n,]+/)
                            .map((item: string) => item.trim())
                            .filter((item: string) => item)
                            .map((item: string) => item.replace(/^[•\-*\s]+/, ''));
                            
                            if (items.length === 0) {
                              return (
                                <p className="text-gray-500 italic text-xs sm:text-sm">No details provided</p>
                              );
                            }
                            
                            const displayItems = items.slice(0, 2); // Show only 2 on mobile
                            
                            return (
                              <ul className="space-y-0.5 sm:space-y-1">
                                {displayItems.map((item: string, index: number) => (
                                  <li key={index} className="flex items-start text-gray-300 text-xs sm:text-sm">
                                    <span className="text-purple-400 mr-1.5 sm:mr-2 mt-0.5">•</span>
                                    <span className="line-clamp-1">{item}</span>
                                  </li>
                                ))}
                                {items.length > 2 && (
                                  <li className="text-gray-400 text-xs sm:text-sm italic">
                                    +{items.length - 2} more
                                  </li>
                                )}
                              </ul>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* Accreditations */}
                      <div className="mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-amber-400">Accreditations</span>
                        </div>
                        <div className="min-h-[36px] sm:min-h-[44px] flex items-center">
                          {accreditationsDisplay ? (
                            <p className="text-gray-300 text-sm sm:text-base truncate sm:line-clamp-2">
                              {accreditationsDisplay}
                            </p>
                          ) : (
                            <p className="text-gray-500 italic text-xs sm:text-sm">No accreditations listed</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Features/Badges Row - Mobile optimized */}
                      <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-700/50">
                        <div className="flex gap-1.5 sm:gap-2 min-h-[32px] sm:min-h-[40px] items-center overflow-x-auto pb-1 sm:pb-0">
                          {provider.emergency_service || provider.insurance || provider.accepts_card || provider.accepts_cash ? (
                            <div className="flex gap-1.5 sm:gap-2 flex-nowrap">
                              {/* Emergency Service */}
                              {provider.emergency_service && (
                                <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg border border-red-500/20 min-w-[60px] sm:min-w-[70px] justify-center flex-shrink-0">
                                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                                  <span className="text-xs font-medium text-red-400">24/7</span>
                                </div>
                              )}
                              
                              {/* Insurance */}
                              {provider.insurance && (
                                <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20 min-w-[60px] sm:min-w-[70px] justify-center flex-shrink-0">
                                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                                  <span className="text-xs font-medium text-blue-400">Insured</span>
                                </div>
                              )}
                              
                              {/* Payment Methods */}
                              {provider.accepts_card && (
                                <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20 min-w-[50px] sm:min-w-[60px] flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-emerald-400">Card</span>
                                </div>
                              )}
                              
                              {provider.accepts_cash && (
                                <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20 min-w-[50px] sm:min-w-[60px] flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-emerald-400">Cash</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="min-h-[32px] sm:min-h-[40px] flex items-center">
                              <p className="text-gray-500 text-xs sm:text-sm italic">No features specified</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* View Details CTA - Mobile optimized */}
                      <div className="pt-3 sm:pt-4 border-t border-gray-700/50 flex items-center justify-between mt-3 sm:mt-4">
                        <span className="text-gray-400 text-xs sm:text-sm">
                          Click for full details
                        </span>
                        <div className="flex items-center gap-0.5 sm:gap-1 text-purple-400 group-hover:text-purple-300 transition-colors">
                          <span className="text-xs sm:text-sm font-medium">View</span>
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Empty state help - Mobile optimized */}
        {!loading && favoriteProviders.length === 0 && (
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
      </main>
    </div>
  )
}