// File: src/app/providers/page.tsx - UPDATED TO SHOW ONLY APPROVED PROVIDERS
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Search, MapPin, Star, Heart, Clock, DollarSign, 
  ChevronRight, Shield, TrendingUp, Award, Zap,
  Bookmark, Filter, Sparkles
} from 'lucide-react'

export default function ProvidersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, showAuthModal } = useAuth()
  
  const [providers, setProviders] = useState<any[]>([])
  const [filteredProviders, setFilteredProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [favorites, setFavorites] = useState<string[]>([])
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)

  // Get category from URL on load
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setCurrentCategory(categoryFromUrl)
      sessionStorage.setItem('lastCategory', categoryFromUrl)
    }
  }, [searchParams])

  // Check if user is logged in and load favorites
  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('provider_favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Fetch ONLY APPROVED providers from Supabase
  useEffect(() => {
    fetchApprovedProviders()
  }, [])

  async function fetchApprovedProviders() {
    try {
      setLoading(true)
      
      // Fetch ONLY APPROVED providers from Supabase
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} approved providers`)
        
        // Transform Supabase data to match component format
        const transformedData = data.map(provider => ({
          id: provider.id,
          business_name: provider.business_name,
          main_service: provider.main_service || 'Professional Service',
          city: provider.city || 'Location',
          province: provider.province || 'SA',
          rating: provider.rating || 4.5,
          total_reviews: provider.total_reviews || 0,
          hourly_rate: provider.hourly_rate || 'Rates vary',
          callout_fee: provider.callout_fee || 'Contact for quote',
          description: provider.description || `${provider.business_name} professional services`,
          // Get category from main_service_id
          category_id: provider.main_service_id,
          is_favorite: favorites.includes(provider.id),
          verified: provider.verified || false,
          emergency_service: provider.emergency_service || false,
          insurance: provider.insurance || false,
          // Additional fields
          contact_person: provider.contact_person,
          contact_email: provider.contact_email,
          contact_phone: provider.contact_phone,
          address: provider.physical_address || provider.address,
          experience_years: provider.experience_years || 0,
          response_time: provider.response_time || 'Within 24 hours',
          accepts_card: provider.accepts_card || false,
          accepts_cash: provider.accepts_cash || true,
          portfolio_url: provider.portfolio_url,
          website_url: provider.website_url,
          completed_jobs: provider.completed_jobs || 0
        }))
        
        setProviders(transformedData)
        setFilteredProviders(transformedData)
      } else {
        console.log('⚠️ No approved providers found in database')
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

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If there's a current category, filter by it
      if (currentCategory && currentCategory !== 'all') {
        const filtered = providers.filter(provider => 
          provider.category_id === currentCategory
        )
        setFilteredProviders(filtered)
      } else {
        setFilteredProviders(providers)
      }
      return
    }

    const filtered = providers.filter(provider =>
      provider.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.main_service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProviders(filtered)
  }, [searchQuery, providers, currentCategory])

  // Filter by category
  const handleFilter = (filter: string) => {
    setActiveFilter(filter)
    
    if (filter === 'all') {
      setCurrentCategory(null)
      setFilteredProviders(providers)
      // Clear category from URL
      router.replace('/providers')
    } else if (filter === 'favorites') {
      // Check if user is logged in before showing favorites
      if (!user) {
        showAuthModal('login')
        return
      }
      setCurrentCategory(null)
      setFilteredProviders(providers.filter(p => favorites.includes(p.id)))
    } else {
      // Handle service category filter
      setCurrentCategory(filter)
      setFilteredProviders(providers.filter(p => p.category_id === filter))
    }
  }

  // Toggle favorite with login check
  const toggleFavorite = async (providerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Check if user is logged in
    if (!user) {
      showAuthModal('login')
      return
    }
    
    try {
      let newFavorites
      if (favorites.includes(providerId)) {
        newFavorites = favorites.filter(id => id !== providerId)
      } else {
        newFavorites = [...favorites, providerId]
      }
      
      setFavorites(newFavorites)
      localStorage.setItem('provider_favorites', JSON.stringify(newFavorites))
      
      // Update providers state
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, is_favorite: !favorites.includes(providerId) }
          : p
      ))
      
      setFilteredProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, is_favorite: !favorites.includes(providerId) }
          : p
      ))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // Handle provider click
  const handleProviderClick = (providerId: string, providerCategory?: string) => {
    // Check if user is logged in
    if (!user) {
      showAuthModal('login')
      return
    }
    
    // Store category in sessionStorage for navigation back
    const categoryToStore = currentCategory || providerCategory
    if (categoryToStore && categoryToStore !== 'all') {
      sessionStorage.setItem('lastCategory', categoryToStore)
    }
    
    // Navigate to provider details with category in URL
    const url = `/providers/${providerId}${categoryToStore && categoryToStore !== 'all' ? `?category=${categoryToStore}` : ''}`
    router.push(url)
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

  // Get rating display
  const getRatingDisplay = (provider: any) => {
    if (provider.rating && provider.total_reviews) {
      return `${provider.rating} (${provider.total_reviews} reviews)`
    }
    if (provider.rating) {
      return `${provider.rating} rating`
    }
    return 'No ratings yet'
  }

  // Stats
  const stats = {
    total: providers.length,
    emergency: providers.filter(p => p.emergency_service).length,
    insured: providers.filter(p => p.insurance).length,
    card_payments: providers.filter(p => p.accepts_card).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>


      {/* Main Content */}
      <main className="relative container mx-auto px-3 sm:px-4 py-6 sm:py-8">

        {/* Providers Grid */}
        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-400 text-sm sm:text-base">Loading approved professionals...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12 sm:py-20 modern-glass rounded-2xl border border-gray-700 mx-2">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">
              {providers.length === 0 ? 'No approved providers yet' : 'No matching providers found'}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {providers.length === 0 
                ? "Check back soon for approved service providers!" 
                : "Try adjusting your search or filter criteria"}
            </p>
            {providers.length === 0 && (
              <button
                onClick={fetchApprovedProviders}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg hover:from-emerald-500 hover:to-emerald-400 text-sm sm:text-base"
              >
                Refresh
              </button>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group cursor-pointer"
              >
                <div 
                  onClick={() => handleProviderClick(provider.id, provider.category_id)}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-700 overflow-hidden hover:border-emerald-500/50 transition-all duration-500 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] sm:hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] relative card-3d"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(provider.id, e)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/80 transition-all duration-300"
                  >
                    <Heart
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${provider.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                    />
                  </button>

                  {/* Login required overlay for non-logged in users */}
                  {!user && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-center p-4 sm:p-6">
                        <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-400 mx-auto mb-2 sm:mb-3" />
                        <p className="text-white font-semibold text-sm sm:text-base mb-1 sm:mb-2">Sign in required</p>
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">Login to view full details</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            showAuthModal('login')
                          }}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:from-emerald-500 hover:to-emerald-400 text-xs sm:text-sm"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-1">
                    {provider.emergency_service && (
                      <div className="px-2 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold flex items-center gap-1">
                        <Zap className="w-2 h-2" />
                        <span className="text-xs">24/7</span>
                      </div>
                    )}
                    {provider.insurance && (
                      <div className="px-2 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold flex items-center gap-1">
                        <Shield className="w-2 h-2" />
                        <span className="text-xs">Insured</span>
                      </div>
                    )}
                  </div>

                  {/* Provider Image/Logo */}
                  <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-purple-500/20" />
                    <div className="relative h-full flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                        {provider.business_name?.charAt(0) || 'P'}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors duration-300 truncate">
                          {provider.business_name}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5 truncate">{provider.main_service}</p>
                      </div>
                    </div>

                    {/* Rating and Price */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          <span className="font-bold text-white text-sm sm:text-base">
                            {provider.rating || 'New'}
                          </span>
                        </div>
                        {provider.total_reviews > 0 && (
                          <span className="text-gray-500 text-xs sm:text-sm">({provider.total_reviews})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold text-sm sm:text-base">
                          {getPriceDisplay(provider)}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-400 mb-3 sm:mb-4">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm truncate">
                        {provider.city}, {provider.province}
                      </span>
                    </div>

                    {/* Experience & Completed Jobs */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      {provider.experience_years > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                          <span className="text-xs sm:text-sm text-gray-400">
                            {provider.experience_years} years
                          </span>
                        </div>
                      )}
                      {provider.completed_jobs > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          <span className="text-xs sm:text-sm text-gray-400">
                            {provider.completed_jobs} jobs
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {provider.description && (
                      <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-4 sm:mb-6">
                        {provider.description}
                      </p>
                    )}

                    {/* Payment Methods */}
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                      {provider.accepts_card && (
                        <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs bg-gray-800/50 text-gray-400 border border-gray-700">
                          Card Payments
                        </span>
                      )}
                      {provider.accepts_cash && (
                        <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs bg-gray-800/50 text-gray-400 border border-gray-700">
                          Cash
                        </span>
                      )}
                    </div>

                    {/* View Button */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-800">
                      <span className="text-gray-500 text-xs sm:text-sm">
                        {user ? 'View Details' : 'Sign in to view'}
                      </span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}