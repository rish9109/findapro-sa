'use client'

import { motion } from 'framer-motion'
import { 
  Heart, MapPin, Calendar, Briefcase,
  Award, Zap, Shield, ChevronRight, Tag
} from 'lucide-react'
import ProviderLogoDisplay from '@/components/ProviderLogoDisplay'
import { ProviderBusinessFeature } from '@/lib/supabase'

// Define the Provider type interface
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
  // Business features from the database
  business_features?: Array<{
    id: string
    provider_id: string
    feature_id: string | null
    custom_name: string | null
    custom_description: string | null
    is_custom: boolean
    position: number
    is_verified: boolean
    feature?: {
      id: string
      name: string
      category: string | null
      icon?: string | null
      description?: string | null
    }
  }>
}

interface ProviderCardProps {
  provider: Provider
  index: number
  searchQuery?: string
  syncingFavoriteId: string | null
  user: any
  showAuthModal: (mode: 'login' | 'signup') => void
  onToggleFavorite: (providerId: string, e: React.MouseEvent) => void
  onProviderClick: (providerId: string) => void
  getPriceDisplay: (provider: Provider) => string
  getServiceAreasDisplay: (provider: Provider) => string
  getAccreditationsDisplay: (provider: Provider) => string | null
  highlightText?: (text: string, query: string) => React.ReactNode
}

export default function ProviderCard({
  provider,
  index,
  searchQuery = '',
  syncingFavoriteId,
  user,
  showAuthModal,
  onToggleFavorite,
  onProviderClick,
  getPriceDisplay,
  getServiceAreasDisplay,
  getAccreditationsDisplay,
  highlightText
}: ProviderCardProps) {
  
  const accreditationsDisplay = getAccreditationsDisplay(provider)
  
  // Helper function to get feature display name
  const getFeatureName = (feature: any): string => {
    if (feature.is_custom) {
      return feature.custom_name || 'Custom Feature'
    }
    // Access the nested feature data
    return feature.feature?.name || 'Business Feature'
  }

  // Get top features to display (limit to 3-4)
  const getDisplayFeatures = () => {
    if (!provider.business_features || provider.business_features.length === 0) {
      return []
    }
    
    // Sort by position and take first 4
    return provider.business_features
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .slice(0, 4)
  }

  const displayFeatures = getDisplayFeatures()
  const hasFeatures = displayFeatures.length > 0
  
  // Default highlight function if not provided
  const defaultHighlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={i} className="bg-yellow-500/30 text-white px-0.5 rounded">{part}</mark> : 
        part
    )
  }

  const highlight = highlightText || defaultHighlightText

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group cursor-pointer h-full"
    >
      <div 
        onClick={() => onProviderClick(provider.id)}
        className="h-full bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] flex flex-col"
      >
        {/* Header Section - Responsive height */}
        <div className="p-4 sm:p-6 border-b border-gray-700/50 min-h-[120px] sm:min-h-[140px]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <ProviderLogoDisplay
                providerId={provider.id}
                businessName={provider.business_name}
                size="md"
                showBorder={true}
                showVerified={true}
                verified={provider.verified}
                className="flex-shrink-0"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors truncate" title={provider.business_name}>
                    {searchQuery ? highlight(provider.business_name, searchQuery) : provider.business_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-400 mt-1 truncate" title={provider.main_service}>
                    {searchQuery ? highlight(provider.main_service, searchQuery) : provider.main_service}
                  </p>
                </div>
                
                <button
                  onClick={(e) => onToggleFavorite(provider.id, e)}
                  disabled={syncingFavoriteId !== null}
                  className="flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-gray-700/50 transition-colors ml-2"
                  title={provider.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {syncingFavoriteId === provider.id ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${provider.is_favorite ? 'fill-purple-500 text-purple-500' : 'text-gray-400 hover:text-blue-400'}`}
                    />
                  )}
                </button>
              </div>
              
              <div className="mt-2 sm:mt-3">
  <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
    <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
    <span className="text-xs sm:text-sm font-medium text-gray-400">Fees & Pricing</span>
  </div>
  <div className="flex items-center gap-1.5">
    <span className="font-semibold text-emerald-400 text-sm sm:text-base truncate max-w-[150px]" title={getPriceDisplay(provider)}>
      {getPriceDisplay(provider)}
    </span>
  </div>
</div>
            </div>
          </div>
        </div>
        
        {/* Content Section - All sections with responsive heights */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col gap-3 sm:gap-4">
          {/* Service Areas - Responsive height */}
          <div className="min-h-[60px] sm:min-h-[70px]">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-blue-400">Service Areas</span>
            </div>
            <div className="min-h-[32px] sm:min-h-[36px]">
              <p className="text-sm sm:text-base text-gray-300 font-semibold line-clamp-2" title={getServiceAreasDisplay(provider)}>
                {searchQuery 
                  ? highlight(getServiceAreasDisplay(provider), searchQuery)
                  : getServiceAreasDisplay(provider)
                }
              </p>
            </div>
          </div>
          
          {/* Experience - Responsive height */}
          <div className="min-h-[60px] sm:min-h-[70px]">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-emerald-400">Experience</span>
            </div>
            <div className="min-h-[32px] sm:min-h-[36px]">
              <p className="text-sm sm:text-base text-gray-300 font-semibold truncate" title={provider.experience_years ? `${provider.experience_years} years` : 'Not specified'}>
                {provider.experience_years ? 
                  `${provider.experience_years} years` : 
                  'Not specified'
                }
              </p>
            </div>
          </div>
          
          {/* Details & Services - Responsive height */}
          <div className="min-h-[80px] sm:min-h-[90px]">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-purple-400">Details & Services</span>
            </div>
            <div className="min-h-[48px] sm:min-h-[52px]">
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
                  .slice(0, 3);
                
                if (items.length === 0) {
                  return (
                    <p className="text-gray-500 italic text-xs sm:text-sm">No details provided</p>
                  );
                }
                
                return (
                  <ul className="space-y-0.5">
                    {items.map((item: string, index: number) => (
                      <li key={index} className="flex items-start text-gray-300">
                        <span className="text-purple-400 mr-1.5 sm:mr-2 mt-0.5 text-xs">•</span>
                        <span className="line-clamp-1 text-xs sm:text-sm" title={item}>
                          {searchQuery ? highlight(item, searchQuery) : item}
                        </span>
                      </li>
                    ))}
                    {provider.all_other_services.split(/[\n,]+/).length > 3 && (
                      <li className="text-gray-400 text-xs italic" title={`${provider.all_other_services.split(/[\n,]+/).length - 3} more services available`}>
                        +{provider.all_other_services.split(/[\n,]+/).length - 3} more
                      </li>
                    )}
                  </ul>
                );
              })()}
            </div>
          </div>
          
          {/* Accreditations - Responsive height */}
          <div className="min-h-[60px] sm:min-h-[70px]">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-amber-400">Accreditations</span>
            </div>
            <div className="min-h-[32px] sm:min-h-[36px]">
              {accreditationsDisplay ? (
                <p className="text-sm sm:text-base text-gray-300 line-clamp-2" title={accreditationsDisplay}>
                  {searchQuery ? highlight(accreditationsDisplay, searchQuery) : accreditationsDisplay}
                </p>
              ) : (
                <p className="text-gray-500 italic text-xs sm:text-sm">No accreditations listed</p>
              )}
            </div>
          </div>
          
          {/* Business Features Section - FIXED: Now properly displays features */}
          <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-700/50 min-h-[60px] sm:min-h-[70px]">
            {hasFeatures ? (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 min-h-[32px] sm:min-h-[36px] items-center">
                {displayFeatures.map((feature) => {
                  const featureName = getFeatureName(feature)
                  // Truncate long feature names
                  const displayName = featureName.length > 12 
                    ? featureName.substring(0, 10) + '...' 
                    : featureName
                  
                  return (
                    <div 
                      key={feature.id}
                      className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 flex-shrink-0"
                      title={`${featureName}${feature.is_verified ? ' (Verified)' : ''}`}
                    >
                      <span className="text-xs font-medium text-blue-400 whitespace-nowrap flex items-center gap-1">
                        {feature.is_verified && (
                          <span className="text-emerald-400">✓</span>
                        )}
                        {searchQuery ? highlight(displayName, searchQuery) : displayName}
                      </span>
                    </div>
                  )
                })}
                {provider.business_features && provider.business_features.length > 4 && (
                  <div 
                    className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-lg border border-gray-500/20 flex-shrink-0"
                    title={`${provider.business_features.length - 4} more features`}
                  >
                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                      +{provider.business_features.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="min-h-[32px] sm:min-h-[36px] flex items-center">
                <p className="text-gray-500 text-xs italic">No features specified</p>
              </div>
            )}
          </div>
          
          {/* Footer - Responsive height */}
          <div className="pt-3 sm:pt-4 border-t border-gray-700/50 flex items-center justify-between mt-2 min-h-[40px] sm:min-h-[50px]">
            <span className="text-xs text-gray-400 truncate max-w-[150px]" title={user ? 'Click for details & contact' : 'Sign in to view details'}>
              {user ? 'Click for details' : 'Sign in to view'}
            </span>
            <div className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0">
              <span className="text-xs font-medium">View</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}