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
import { supabase } from '@/lib/supabase'

interface SearchResultsProps {
  results: SearchResult[]
  loading: boolean
  searchTerm: string
  className?: string
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
      
      // You can add Supabase sync here if needed
      
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((provider, index) => {
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
            <div 
              onClick={() => handleProviderClick(provider.id)}
              className="h-full bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] flex flex-col"
            >
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <ProviderLogoDisplay
                      providerId={provider.id}
                      businessName={provider.business_name}
                      size="md"
                      showBorder={true}
                      showVerified={true}
                      verified={provider.verified || false}
                      className="flex-shrink-0"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {provider.business_name}
                        </h3>
                        <p className="text-sm text-blue-400 mt-1 truncate">
                          {provider.main_service}
                        </p>
                      </div>
                      
                      <button
                        onClick={(e) => toggleFavorite(provider.id, e)}
                        disabled={syncingFavoriteId !== null}
                        className="flex-shrink-0 p-2 rounded-full hover:bg-gray-700/50 transition-colors ml-2"
                        title={favorites.includes(provider.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {syncingFavoriteId === provider.id ? (
                          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Heart
                            className={`w-5 h-5 ${favorites.includes(provider.id) ? 'fill-purple-500 text-purple-500' : 'text-gray-400 hover:text-blue-400'}`}
                          />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-400">
                          {getPriceDisplay(provider)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-blue-400">Service Areas</span>
                  </div>
                  <div className="min-h-[40px] flex items-center">
                    <p className="text-gray-300 font-semibold truncate md:line-clamp-2">
                      {getServiceAreasDisplay(provider)}
                    </p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-emerald-400">Experience</span>
                  </div>
                  <div className="min-h-[40px] flex items-center">
                    <p className="text-gray-300 font-semibold">
                      {provider.experience_years ? 
                        `${provider.experience_years} years` : 
                        'Not specified'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-purple-400">Details & Services</span>
                  </div>
                  <div className="min-h-[40px]">
                    {(() => {
                      const detailsText = provider.details;
                      
                      if (!detailsText?.trim()) {
                        return (
                          <p className="text-gray-500 italic text-sm">No details provided</p>
                        );
                      }
                      
                      const items = detailsText
                        .split(/[\n,]+/)
                        .map((item: string) => item.trim())
                        .filter((item: string) => item)
                        .slice(0, 3);
                      
                      if (items.length === 0) {
                        return (
                          <p className="text-gray-500 italic text-sm">No details provided</p>
                        );
                      }
                      
                      return (
                        <ul className="space-y-0.5">
                          {items.map((item: string, index: number) => (
                            <li key={index} className="flex items-start text-gray-300">
                              <span className="text-purple-400 mr-2 mt-0.5 text-xs">•</span>
                              <span className="line-clamp-1 text-sm">{item}</span>
                            </li>
                          ))}
                          {detailsText.split(/[\n,]+/).length > 3 && (
                            <li className="text-gray-400 text-xs italic">
                              +{detailsText.split(/[\n,]+/).length - 3} more
                            </li>
                          )}
                        </ul>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-amber-400">Accreditations</span>
                  </div>
                  <div className="min-h-[40px] flex items-center">
                    {accreditationsDisplay ? (
                      <p className="text-gray-300 truncate md:line-clamp-2 text-sm">
                        {accreditationsDisplay}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic text-sm">No accreditations listed</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-700/50">
                  {provider.emergency_service || provider.insurance || provider.accepts_card || provider.accepts_cash ? (
                    <div className="flex gap-2 min-h-[36px] items-center overflow-x-auto no-scrollbar">
                      {provider.emergency_service && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-lg border border-red-500/20 flex-shrink-0">
                          <Zap className="w-3 h-3 text-red-400" />
                          <span className="text-xs font-medium text-red-400">24/7</span>
                        </div>
                      )}
                      
                      {provider.insurance && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20 flex-shrink-0">
                          <Shield className="w-3 h-3 text-blue-400" />
                          <span className="text-xs font-medium text-blue-400">Insured</span>
                        </div>
                      )}
                      
                      {provider.accepts_card && (
                        <div className="px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20 flex-shrink-0">
                          <span className="text-xs font-medium text-emerald-400">Card</span>
                        </div>
                      )}
                      
                      {provider.accepts_cash && (
                        <div className="px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20 flex-shrink-0">
                          <span className="text-xs font-medium text-emerald-400">Cash</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="min-h-[36px] flex items-center">
                      <p className="text-gray-500 text-xs italic">No features specified</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-700/50 flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">
                    {user ? 'Click for details & contact' : 'Sign in to view details'}
                  </span>
                  <div className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300 transition-colors">
                    <span className="text-xs font-medium">View</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}