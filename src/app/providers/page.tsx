// src/app/providers/page.tsx - CLEANED UP WITH LOGIN CHECK
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  Search, Filter, MapPin, Star, Heart, Clock, DollarSign, 
  ChevronRight, Sparkles, Shield, TrendingUp, Award, Zap,
  Bookmark
} from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const MOCK_PROVIDERS = [
  {
    id: '1',
    business_name: 'Luxe Interiors Design Studio',
    main_service: 'Interior Design',
    city: 'New York',
    province: 'NY',
    rating: 4.9,
    review_count: 128,
    price_range: '$$$$',
    logo_url: '/api/placeholder/80/80',
    description: 'Premium interior design services for luxury residences',
    tags: ['Luxury', 'Residential', 'Commercial'],
    is_favorite: false,
    verified: true,
    featured: true,
    category: 'design'
  },
  {
    id: '2',
    business_name: 'Golden Touch Builders',
    main_service: 'Construction',
    city: 'Los Angeles',
    province: 'CA',
    rating: 4.8,
    review_count: 89,
    price_range: '$$$',
    logo_url: '/api/placeholder/80/80',
    description: 'High-end construction and remodeling experts',
    tags: ['Construction', 'Remodeling', 'Luxury'],
    is_favorite: true,
    verified: true,
    featured: true,
    category: 'home-services'
  },
  {
    id: '3',
    business_name: 'Precision Engineering Group',
    main_service: 'Engineering',
    city: 'Chicago',
    province: 'IL',
    rating: 4.7,
    review_count: 64,
    price_range: '$$$$$',
    logo_url: '/api/placeholder/80/80',
    description: 'Advanced engineering solutions for complex projects',
    tags: ['Engineering', 'Consulting', 'Industrial'],
    is_favorite: false,
    verified: true,
    featured: false,
    category: 'repairs'
  },
  {
    id: '4',
    business_name: 'Elite Legal Partners',
    main_service: 'Legal Services',
    city: 'Miami',
    province: 'FL',
    rating: 4.9,
    review_count: 142,
    price_range: '$$$$',
    logo_url: '/api/placeholder/80/80',
    description: 'Top-tier legal counsel for businesses and individuals',
    tags: ['Legal', 'Corporate', 'Consulting'],
    is_favorite: false,
    verified: true,
    featured: true,
    category: 'accounting'
  },
  {
    id: '5',
    business_name: 'Digital Nexus Solutions',
    main_service: 'IT Services',
    city: 'Seattle',
    province: 'WA',
    rating: 4.6,
    review_count: 56,
    price_range: '$$$',
    logo_url: '/api/placeholder/80/80',
    description: 'Cutting-edge technology solutions for modern businesses',
    tags: ['IT', 'Software', 'Consulting'],
    is_favorite: true,
    verified: true,
    featured: false,
    category: 'tech-support'
  },
  {
    id: '6',
    business_name: 'Wellness Harmony Center',
    main_service: 'Health & Wellness',
    city: 'Denver',
    province: 'CO',
    rating: 4.8,
    review_count: 93,
    price_range: '$$',
    logo_url: '/api/placeholder/80/80',
    description: 'Holistic wellness and health optimization services',
    tags: ['Wellness', 'Health', 'Therapy'],
    is_favorite: false,
    verified: true,
    featured: true,
    category: 'wellness'
  },
]

export default function ProvidersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, showAuthModal } = useAuth()
  
  const [providers, setProviders] = useState(MOCK_PROVIDERS)
  const [filteredProviders, setFilteredProviders] = useState(MOCK_PROVIDERS)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [favorites, setFavorites] = useState<string[]>(['2', '5'])
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)

  // Get category from URL on load
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setCurrentCategory(categoryFromUrl)
      // Store for navigation back from details
      sessionStorage.setItem('lastCategory', categoryFromUrl)
    }
  }, [searchParams])

  // Check if user is logged in when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('🔒 Providers page: User not logged in')
        // We'll show auth modal only when user tries to interact
        // Don't force login on page load
      }
    }
    checkAuth()
  }, [])

  // Fetch providers from Supabase
  useEffect(() => {
    fetchProviders()
  }, [])

  async function fetchProviders() {
    try {
      setLoading(true)
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('⚠️ Using mock data - user not authenticated')
        // Use mock data if not authenticated
        setProviders(MOCK_PROVIDERS)
        setFilteredProviders(MOCK_PROVIDERS)
        return
      }

      // Try to fetch from Supabase if authenticated
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      if (data && data.length > 0) {
        console.log('✅ Fetched providers from Supabase:', data.length)
        setProviders(data)
        setFilteredProviders(data)
      } else {
        // Fallback to mock data
        setProviders(MOCK_PROVIDERS)
        setFilteredProviders(MOCK_PROVIDERS)
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
      // Fallback to mock data
      setProviders(MOCK_PROVIDERS)
      setFilteredProviders(MOCK_PROVIDERS)
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
          provider.category === currentCategory
        )
        setFilteredProviders(filtered)
      } else {
        setFilteredProviders(providers)
      }
      return
    }

    const filtered = providers.filter(provider =>
      provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.main_service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
    } else if (filter === 'featured') {
      setCurrentCategory(null)
      setFilteredProviders(providers.filter(p => p.featured))
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
      setFilteredProviders(providers.filter(p => p.main_service.toLowerCase() === filter.toLowerCase()))
    }
  }

  // Toggle favorite with login check
  const toggleFavorite = async (providerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Check if user is logged in
    if (!user) {
      console.log('🔒 Not logged in, showing auth modal')
      showAuthModal('login')
      return
    }
    
    try {
      const newFavorites = favorites.includes(providerId) 
        ? favorites.filter(id => id !== providerId)
        : [...favorites, providerId]
      
      setFavorites(newFavorites)
      
      // Update providers state
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, is_favorite: !favorites.includes(providerId) }
          : p
      ))
      
      console.log('💖 Favorite updated:', providerId, 'is now', !favorites.includes(providerId))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // Handle provider card click - FIXED with category preservation
  const handleProviderClick = (providerId: string, providerCategory?: string) => {
    // Check if user is logged in
    if (!user) {
      console.log('🔒 Not logged in, showing auth modal')
      showAuthModal('login')
      return
    }
    
  // STORE CATEGORY HERE - 
  const categoryToStore = currentCategory || providerCategory || activeFilter
  if (categoryToStore && categoryToStore !== 'all') {
    sessionStorage.setItem('lastCategory', categoryToStore)
    console.log('📌 Stored category for back navigation:', categoryToStore)
    }
    
    // Build URL with category if available
    let detailUrl = `/providers/${providerId}?ref=category`
    if (categoryToStore && categoryToStore !== 'all') {
      detailUrl += `&category=${encodeURIComponent(categoryToStore)}`
    }
    
    console.log('🔗 Navigating to:', detailUrl)
    router.replace(detailUrl)
  }

  // Get category display label
  const getCategoryLabel = (categoryId: string) => {
    const categoryMap: Record<string, string> = {
      'home-services': 'Home Services',
      'repairs': 'Repairs',
      'automotive': 'Automotive',
      'design': 'Design',
      'plumbing': 'Plumbing',
      'electrical': 'Electrical',
      'gardening': 'Gardening',
      'tech-support': 'Tech Support',
      'wellness': 'Wellness',
      'fitness': 'Fitness',
      'entertainment': 'Entertainment',
      'accounting': 'Accounting',
    }
    return categoryMap[categoryId] || categoryId
  }

  // Stats
  const stats = {
    total: providers.length,
    featured: providers.filter(p => p.featured).length,
    averageRating: (providers.reduce((acc, p) => acc + p.rating, 0) / providers.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/90 border-b border-emerald-500/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1 min-w-0">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2"
              >
                Premium Professionals
                {currentCategory && (
                  <span className="block text-lg sm:text-xl text-emerald-300 mt-1">
                    in {getCategoryLabel(currentCategory)}
                  </span>
                )}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400 text-sm sm:text-base"
              >
                Discover verified experts for your next project
                {!user && (
                  <span className="block text-sm text-emerald-400 mt-1">
                    👤 Sign in to view full details and contact professionals
                  </span>
                )}
              </motion.p>
            </div>
            
            {/* Stats - Responsive layout */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3 sm:gap-4 w-full lg:w-auto"
            >
              <div className="modern-glass rounded-xl px-3 py-2 sm:px-4 sm:py-3 border border-emerald-500/20 flex-1 lg:flex-none min-w-[120px]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  <span className="text-xs sm:text-sm text-gray-400">Total</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="modern-glass rounded-xl px-3 py-2 sm:px-4 sm:py-3 border border-purple-500/20 flex-1 lg:flex-none min-w-[120px]">
                <div className="flex items-center gap-2">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                  <span className="text-xs sm:text-sm text-gray-400">Featured</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">{stats.featured}</p>
              </div>
              <div className="modern-glass rounded-xl px-3 py-2 sm:px-4 sm:py-3 border border-cyan-500/20 flex-1 lg:flex-none min-w-[120px]">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                  <span className="text-xs sm:text-sm text-gray-400">Avg Rating</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white">{stats.averageRating}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="modern-glass rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-emerald-500/20"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search professionals, services, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 text-sm sm:text-base"
              />
            </div>
            
            {/* Filter Buttons - Responsive */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilter('all')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 ${activeFilter === 'all' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/80'}`}
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">All</span>
              </button>
              <button
                onClick={() => handleFilter('featured')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 ${activeFilter === 'featured' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/80'}`}
              >
                <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Featured</span>
              </button>
              <button
                onClick={() => handleFilter('favorites')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-300 flex items-center gap-1 sm:gap-2 ${activeFilter === 'favorites' ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/80'}`}
              >
                <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Favorites</span>
              </button>
            </div>
          </div>
          
          {/* User status indicator */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-emerald-400 truncate max-w-[200px]">
                      Logged in as {user.email}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-yellow-400">Sign in to access all features</span>
                  </>
                )}
              </div>
              {!user && (
                <button
                  onClick={() => showAuthModal('login')}
                  className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 font-medium whitespace-nowrap"
                >
                  Sign In →
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Providers Grid */}
        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-gray-400 text-sm sm:text-base">Loading premium professionals...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12 sm:py-20 modern-glass rounded-2xl border border-gray-700 mx-2">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No professionals found</h3>
            <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or filter criteria</p>
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
                  onClick={() => handleProviderClick(provider.id, provider.category)}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-700 overflow-hidden hover:border-emerald-500/50 transition-all duration-500 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] sm:hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] relative card-3d"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(provider.id, e)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/80 transition-all duration-300"
                  >
                    <Heart
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${favorites.includes(provider.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`}
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

                  {/* Featured Badge */}
                  {provider.featured && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                      <div className="px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center gap-1">
                        <Award className="w-2 h-2 sm:w-3 sm:h-3" />
                        <span className="text-xs">Featured</span>
                      </div>
                    </div>
                  )}

                  {/* Provider Image */}
                  <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-purple-500/20" />
                    <div className="relative h-full flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                        {provider.business_name.charAt(0)}
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
                      {provider.verified && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0 ml-2">
                          <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-400" />
                          <span className="text-[10px] sm:text-xs text-emerald-400">Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Rating and Price */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          <span className="font-bold text-white text-sm sm:text-base">{provider.rating}</span>
                        </div>
                        <span className="text-gray-500 text-xs sm:text-sm">({provider.review_count})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold text-sm sm:text-base">{provider.price_range}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 sm:gap-2 text-gray-400 mb-3 sm:mb-4">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm truncate">{provider.city}, {provider.province}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                      {provider.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                      {provider.tags.slice(0, 3).map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs bg-gray-800/50 text-gray-400 border border-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {provider.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-800/50 text-gray-500 border border-gray-700">
                          +{provider.tags.length - 3}
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

        {/* Stats Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 sm:mt-12 modern-glass rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-emerald-500/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/30 mb-3 sm:mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Verified Professionals</h4>
              <p className="text-gray-400 text-xs sm:text-sm">All providers undergo rigorous verification</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30 mb-3 sm:mb-4">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Premium Quality</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Only top-rated professionals featured</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30 mb-3 sm:mb-4">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Quick Response</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Average response time under 2 hours</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}