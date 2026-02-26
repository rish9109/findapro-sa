'use client'

import { motion } from 'framer-motion'
import { 
  Heart, MapPin, Calendar, Briefcase,
  Award, Zap, Shield, ChevronRight
} from 'lucide-react'
import ProviderLogoDisplay from '@/components/ProviderLogoDisplay'

// Define the Provider type interface (should match the one in your page)
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

interface ProviderCardProps {
  provider: Provider
  index: number
  searchQuery?: string
  syncingFavoriteId: string | null
  user: any // You might want to import the actual User type from your auth context
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
      className="group cursor-pointer"
    >
      <div 
        onClick={() => onProviderClick(provider.id)}
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
                verified={provider.verified}
                className="flex-shrink-0"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                    {searchQuery ? highlight(provider.business_name, searchQuery) : provider.business_name}
                  </h3>
                  <p className="text-sm text-blue-400 mt-1 truncate">
                    {searchQuery ? highlight(provider.main_service, searchQuery) : provider.main_service}
                  </p>
                </div>
                
                <button
                  onClick={(e) => onToggleFavorite(provider.id, e)}
                  disabled={syncingFavoriteId !== null}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-gray-700/50 transition-colors ml-2"
                  title={provider.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {syncingFavoriteId === provider.id ? (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart
                      className={`w-5 h-5 ${provider.is_favorite ? 'fill-purple-500 text-purple-500' : 'text-gray-400 hover:text-blue-400'}`}
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
                {searchQuery 
                  ? highlight(getServiceAreasDisplay(provider), searchQuery)
                  : getServiceAreasDisplay(provider)
                }
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
                const detailsText = provider.all_other_services;
                
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
                        <span className="line-clamp-1 text-sm">
                          {searchQuery ? highlight(item, searchQuery) : item}
                        </span>
                      </li>
                    ))}
                    {provider.all_other_services.split(/[\n,]+/).length > 3 && (
                      <li className="text-gray-400 text-xs italic">
                        +{provider.all_other_services.split(/[\n,]+/).length - 3} more
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
              <span className="text-sm font-medium text-amber-400">Accreditations1234</span>
            </div>
            <div className="min-h-[40px] flex items-center">
              {accreditationsDisplay ? (
                <p className="text-gray-300 truncate md:line-clamp-2 text-sm">
                  {searchQuery ? highlight(accreditationsDisplay, searchQuery) : accreditationsDisplay}
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
}