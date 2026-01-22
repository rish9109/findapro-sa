// File: src/app/providers/[id]/page.tsx - FIXED VERSION WITH CATEGORY PRESERVATION
'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { 
  X, MapPin, Star, Phone, Mail, Globe,
  MessageSquare, Share2, Heart, Award, Shield, 
  CheckCircle, Users, Clock, DollarSign, ChevronRight,
  Sparkles, ExternalLink, ArrowLeft,
  Building, FileBadge, ShieldCheck, Clock4,
  Target, Navigation, PhoneCall
} from 'lucide-react'

// Mock provider data - you can replace with your actual Supabase data
const MOCK_PROVIDERS = [
  {
    id: '1',
    slug: 'luxe-interiors-design-studio',
    business_name: 'Luxe Interiors Design Studio',
    main_service: 'Interior Design',
    city: 'New York',
    province: 'NY',
    rating: 4.9,
    review_count: 128,
    price_range: '$$$$',
    logo_url: '/api/placeholder/80/80',
    description: 'Premium interior design services for luxury residences and commercial spaces. We specialize in modern, contemporary, and classic interior design with over 15 years of experience.',
    tags: ['Luxury', 'Residential', 'Commercial', 'Modern'],
    category: 'design',
    verified: true,
    featured: true,
    contact_person: 'John Smith',
    contact_email: 'john@luxeinteriors.com',
    contact_phone: '+1 (555) 123-4567',
    website: 'https://luxeinteriors.com',
    address: '123 Design Avenue',
    postal_code: '10001',
    registration_number: 'REG-123456',
    services_offered: 'Interior Design, Space Planning, Furniture Selection, Lighting Design',
    additional_info: 'Winner of 2023 Design Excellence Award. Available for international projects.',
    experience_years: '15+',
    response_time: 'Within 2 hours',
    languages: ['English', 'Spanish', 'French'],
    certifications: ['NCIDQ Certified', 'LEED AP', 'WELL AP'],
    insurance: 'Full Liability Insurance',
    portfolio_items: 45,
    happy_clients: 320
  },
]

// Cache for provider data
const providerCache = new Map<string, any>()

export default function ProviderModalPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, showAuthModal } = useAuth()
  
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showContactForm, setShowContactForm] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [originCategory, setOriginCategory] = useState<string | null>(null)

  const providerId = params.id as string
  const isModal = searchParams.get('ref') === 'category'
  const categoryParam = searchParams.get('category') // Get category from URL if present

  // FIX 1: Proper auth check that doesn't show modal on refresh
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('🔒 No session found, showing auth modal')
          showAuthModal('login')
        } else {
          console.log('✅ User authenticated:', session.user.email)
          setAuthChecked(true)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setAuthChecked(true) // Continue anyway
      }
    }

    checkAuth()
  }, [showAuthModal])

  // FIX 2: Store the category parameter from URL or sessionStorage
  useEffect(() => {
    if (isModal) {
      // Try to get category from URL first
      if (categoryParam) {
        console.log('📌 Category from URL:', categoryParam)
        setOriginCategory(categoryParam)
        sessionStorage.setItem('lastCategory', categoryParam)
      } else {
        // Fallback to sessionStorage if category not in URL
        const lastCategory = sessionStorage.getItem('lastCategory')
        if (lastCategory) {
          console.log('📌 Category from sessionStorage:', lastCategory)
          setOriginCategory(lastCategory)
        }
      }
    }
  }, [isModal, categoryParam])

  // FIX 3: Fetch provider only after auth check
  useEffect(() => {
    if (!authChecked) return
    
    fetchProvider()
  }, [authChecked, providerId])

  // FIX 4: Handle escape key and back button
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    
    const handlePopState = () => {
      handleClose()
    }

    window.addEventListener('keydown', handleEscape)
    window.addEventListener('popstate', handlePopState)

    // Push state for modal to handle back button
    if (isModal) {
      window.history.pushState({ modal: true }, '')
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isModal])

  // FIX 5: Optimized provider fetching with cache
  const fetchProvider = useCallback(async () => {
    // Check cache first
    const cacheKey = `provider_${providerId}`
    if (providerCache.has(cacheKey)) {
      console.log('📦 Loading from cache')
      setProvider(providerCache.get(cacheKey))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      // Try Supabase first
      const { data, error: supabaseError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .eq('status', 'approved')
        .single()

      if (supabaseError) throw supabaseError

      if (data) {
        providerCache.set(cacheKey, data)
        setProvider(data)
        
        // Also store provider category in sessionStorage for reference
        if (data.category) {
          sessionStorage.setItem('providerCategory', data.category)
        }
      } else {
        // Fallback to mock
        const mockProvider = MOCK_PROVIDERS.find(p => p.id === providerId)
        if (mockProvider) {
          providerCache.set(cacheKey, mockProvider)
          setProvider(mockProvider)
          
          // Store mock provider category
          if (mockProvider.category) {
            sessionStorage.setItem('providerCategory', mockProvider.category)
          }
        } else {
          setError('Provider not found')
        }
      }
    } catch (error: any) {
      console.error('Fetch error:', error)
      
      // Fallback to mock
      const mockProvider = MOCK_PROVIDERS.find(p => p.id === providerId)
      if (mockProvider) {
        providerCache.set(cacheKey, mockProvider)
        setProvider(mockProvider)
        
        // Store mock provider category
        if (mockProvider.category) {
          sessionStorage.setItem('providerCategory', mockProvider.category)
        }
      } else {
        setError(error.message || 'Failed to load details')
      }
    } finally {
      setLoading(false)
    }
  }, [providerId])

  const handleClose = useCallback(() => {
    console.log('🔙 Closing modal, isModal:', isModal, 'originCategory:', originCategory)
    
    if (isModal) {
      // Build the back URL with category if we have it
      let backUrl = '/providers'
      
      // Priority order for determining category:
      // 1. Category from URL parameter (most reliable)
      // 2. Category stored in sessionStorage from navigation
      // 3. Provider's own category field (fallback)
      
      const categoryToUse = categoryParam || originCategory || sessionStorage.getItem('lastCategory') || sessionStorage.getItem('providerCategory')
      
      if (categoryToUse) {
        backUrl = `/providers?category=${encodeURIComponent(categoryToUse)}`
        console.log('🎯 Returning to category:', categoryToUse, 'URL:', backUrl)
      }
      
      // Use replace instead of push to avoid adding to history stack
      router.replace(backUrl)
    } else {
      // For direct access, go back or to providers
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push('/providers')
      }
    }
  }, [isModal, router, originCategory, categoryParam])

  // FIX 7: Optimized handlers
  const toggleFavorite = useCallback(() => {
    if (!user) {
      showAuthModal('login')
      return
    }
    setIsFavorite(!isFavorite)
  }, [user, isFavorite, showAuthModal])

  const handleContactClick = useCallback(() => {
    if (!user) {
      showAuthModal('login')
      return
    }
    setShowContactForm(true)
  }, [user, showAuthModal])

  const handleShare = useCallback(() => {
    if (!provider) return
    
    if (navigator.share) {
      navigator.share({
        title: provider.business_name,
        text: `Check out ${provider.business_name} on FindAPro`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }, [provider])

  // FIX 8: Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // FIX 9: Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-400">Loading professional details...</p>
        </div>
      </div>
    )
  }

  // FIX 10: Show error state with proper back navigation
  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-6 sm:p-8 rounded-2xl border border-red-500/30 max-w-md mx-4">
            <X className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg sm:text-xl mb-4">{error || 'Provider not found'}</p>
            <button
              onClick={() => {
                const lastCategory = sessionStorage.getItem('lastCategory')
                const backUrl = lastCategory && lastCategory !== 'all' 
                  ? `/providers?category=${lastCategory}` 
                  : '/providers'
                router.push(backUrl)
              }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-400 text-sm sm:text-base"
            >
              ← Back to Professionals
            </button>
          </div>
        </div>
      </div>
    )
  }

  // FIX 11: Modal view with proper portal
  if (isModal) {
    return createPortal(
      <AnimatePresence>
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <div className="relative min-h-screen flex items-center justify-center p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl lg:max-w-6xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto"
            >
              <ProviderContent 
                provider={provider}
                isFavorite={isFavorite}
                activeTab={activeTab}
                showContactForm={showContactForm}
                isFullPage={false}
                onClose={handleClose}
                onToggleFavorite={toggleFavorite}
                onContactClick={handleContactClick}
                onShare={handleShare}
                onTabChange={setActiveTab}
                onSetContactForm={setShowContactForm}
                originCategory={originCategory}
              />
            </motion.div>
          </div>
        </div>
      </AnimatePresence>,
      document.body
    )
  }

  // FIX 12: Full page view
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Back button - with category if available */}
      <div className="container mx-auto px-3 sm:px-4 pt-6 sm:pt-8">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4 sm:mb-6 group text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          {originCategory ? `Back to ${getCategoryLabel(originCategory)} Professionals` : 'Back to Professionals'}
        </button>
      </div>

      {/* Provider Content */}
      <div className="container mx-auto px-3 sm:px-4 pb-6 sm:pb-8">
        <ProviderContent 
          provider={provider}
          isFavorite={isFavorite}
          activeTab={activeTab}
          showContactForm={showContactForm}
          isFullPage={true}
          onClose={handleClose}
          onToggleFavorite={toggleFavorite}
          onContactClick={handleContactClick}
          onShare={handleShare}
          onTabChange={setActiveTab}
          onSetContactForm={setShowContactForm}
          originCategory={originCategory}
        />
      </div>
    </div>
  )
}

// Helper function to get category label from ID
function getCategoryLabel(categoryId: string): string {
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

// FIX 13: Updated ProviderContent component interface
interface ProviderContentProps {
  provider: any
  isFavorite: boolean
  activeTab: string
  showContactForm: boolean
  isFullPage: boolean
  onClose: () => void
  onToggleFavorite: () => void
  onContactClick: () => void
  onShare: () => void
  onTabChange: (tab: string) => void
  onSetContactForm: (show: boolean) => void
  originCategory?: string | null
}

function ProviderContent({
  provider,
  isFavorite,
  activeTab,
  showContactForm,
  isFullPage,
  onClose,
  onToggleFavorite,
  onContactClick,
  onShare,
  onTabChange,
  onSetContactForm,
  originCategory
}: ProviderContentProps) {
  
  // Memoized values for performance
  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'services', label: 'Services', icon: Target },
    { id: 'portfolio', label: 'Portfolio', icon: Award },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ], [])

  const stars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 sm:w-5 sm:h-5 ${i < Math.floor(provider.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
      />
    ))
  }, [provider.rating])

  const certifications = useMemo(() => {
    if (!provider.certifications || !Array.isArray(provider.certifications)) return null
    return provider.certifications.map((cert: string, index: number) => (
      <div key={index} className="flex items-center gap-2 sm:gap-3">
        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
        <span className="text-gray-300 text-sm sm:text-base">{cert}</span>
      </div>
    ))
  }, [provider.certifications])

  return (
    <div className={`bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden ${!isFullPage ? '' : 'mt-2 sm:mt-4'}`}>
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-cyan-500/10" />
        
        <div className="relative p-4 sm:p-6 lg:p-8 border-b border-emerald-500/20">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Logo/Image */}
            <div className="flex-shrink-0 flex justify-center lg:justify-start">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-purple-500 flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl font-bold">
                  {provider.business_name.charAt(0)}
                </div>
                {provider.verified && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                    <div className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold flex items-center gap-1">
                      <ShieldCheck className="w-2 h-2 sm:w-3 sm:h-3" />
                      <span className="text-xs">Verified</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">
                    {provider.business_name}
                  </h2>
                  <div className="flex items-center flex-wrap gap-2 mb-2 sm:mb-3">
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium truncate">
                      {provider.main_service}
                    </span>
                    {originCategory && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs sm:text-sm truncate">
                        {getCategoryLabel(originCategory)}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-300 text-xs sm:text-sm">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="truncate">{provider.city}, {provider.province}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-medium text-xs sm:text-sm">{provider.price_range}</span>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="flex">
                        {stars}
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-white">{provider.rating}</span>
                      <span className="text-gray-400 text-xs sm:text-sm">({provider.review_count} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mt-2 sm:mt-0">
                  <button
                    onClick={onToggleFavorite}
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-700 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all duration-300 group"
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400 group-hover:text-pink-400'}`} />
                  </button>
                  <button
                    onClick={onShare}
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-emerald-400" />
                  </button>
                  <button
                    onClick={onContactClick}
                    className="px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] sm:hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 text-sm sm:text-base"
                  >
                    Contact
                  </button>
                  {!isFullPage && (
                    <button
                      onClick={onClose}
                      className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-700 hover:bg-white/10 transition-all duration-300"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                {provider.experience_years && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Clock4 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <span className="text-gray-300 text-xs sm:text-sm">{provider.experience_years} experience</span>
                  </div>
                )}
                {provider.response_time && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    <span className="text-gray-300 text-xs sm:text-sm">{provider.response_time} response</span>
                  </div>
                )}
                {provider.happy_clients && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <span className="text-gray-300 text-xs sm:text-sm">{provider.happy_clients} happy clients</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Responsive */}
        <div className="border-b border-gray-800 overflow-x-auto">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 min-w-max">
            <div className="flex gap-2 sm:gap-4 py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-3 py-2 sm:px-4 sm:py-3 font-medium transition-all duration-300 relative flex items-center gap-1 sm:gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Description */}
              <div className="modern-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/20">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  About {provider.business_name}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-3 sm:mb-4">
                  {provider.description}
                </p>
                {provider.additional_info && (
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                    {provider.additional_info}
                  </p>
                )}
              </div>

              {/* Contact Form */}
              {showContactForm && (
                <div className="modern-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/20">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Contact {provider.contact_person}</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Your Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm sm:text-base"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Your Email</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm sm:text-base"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">Message</label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm sm:text-base"
                        placeholder={`Hi ${provider.contact_person}, I'm interested in your services...`}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => onSetContactForm(false)}
                        className="px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => onSetContactForm(false)}
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:from-emerald-500 hover:to-emerald-400 text-sm sm:text-base"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="modern-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/20">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
                  <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  Location & Service Area
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">Address</p>
                    <p className="text-white text-sm sm:text-base">{provider.address}</p>
                    <p className="text-gray-300 text-sm sm:text-base">{provider.city}, {provider.province} {provider.postal_code}</p>
                  </div>
                  {provider.serviceAreas && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400 mb-2">Service Areas</p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {provider.serviceAreas.map((area: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Contact Card */}
              <div className="modern-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/20">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Contact Information</h3>
                <div className="space-y-3 sm:space-y-4">
                  {provider.contact_person && (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-800/30">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-400">Contact Person</p>
                        <p className="text-white font-medium text-sm sm:text-base truncate">{provider.contact_person}</p>
                      </div>
                    </div>
                  )}
                  {provider.contact_phone && (
                    <a
                      href={`tel:${provider.contact_phone}`}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-400">Phone</p>
                        <p className="text-white font-medium text-sm sm:text-base truncate">{provider.contact_phone}</p>
                      </div>
                    </a>
                  )}
                  {provider.contact_email && (
                    <a
                      href={`mailto:${provider.contact_email}`}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-400">Email</p>
                        <p className="text-white font-medium text-sm sm:text-base truncate">{provider.contact_email}</p>
                      </div>
                    </a>
                  )}
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-400">Website</p>
                        <p className="text-emerald-400 font-medium text-sm sm:text-base flex items-center gap-1 truncate">
                          Visit Website
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Verification Badges */}
              <div className="modern-glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/20">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Verifications & Credentials</h3>
                <div className="space-y-2 sm:space-y-3">
                  {provider.verified && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      <span className="text-gray-300 text-sm sm:text-base">Verified Professional</span>
                    </div>
                  )}
                  {provider.registration_number && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FileBadge className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      <span className="text-gray-300 text-sm sm:text-base">Reg: {provider.registration_number}</span>
                    </div>
                  )}
                  {provider.insurance && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      <span className="text-gray-300 text-sm sm:text-base">{provider.insurance}</span>
                    </div>
                  )}
                  {certifications}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs */}
        {activeTab !== 'overview' && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-400 text-sm sm:text-base">Coming soon...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900 to-black">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span className="text-gray-400 text-xs sm:text-sm">Premium Professional • FindAPro Verified</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onShare}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-700 hover:border-emerald-500/50 transition-all duration-300"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-gray-400 text-xs sm:text-sm">Share</span>
            </button>
            <button
              onClick={onToggleFavorite}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gray-800/50 border border-gray-700 hover:border-pink-500/50 transition-all duration-300"
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
              <span className="text-gray-400 text-xs sm:text-sm">{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}