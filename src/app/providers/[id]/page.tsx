// File: src/app/providers/[id]/page.tsx - IMPROVED SHARE & CONTACT BUTTONS
'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase, isProviderFavorited, addFavorite, removeFavorite } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Heart, Share2, Phone, Mail, MapPin, 
  Star, Clock, DollarSign, Shield, Zap, Award, 
  CheckCircle, Calendar, Briefcase, Users, Globe,
  ExternalLink, ShieldCheck, FileBadge, Sparkles,
  PhoneCall, MessageSquare, Building, AlertCircle,
  Copy, Facebook, Twitter, Linkedin, MessageCircle
} from 'lucide-react'

export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, showAuthModal } = useAuth()
  
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [syncingFavorite, setSyncingFavorite] = useState(false)
  const [accreditations, setAccreditations] = useState<any[]>([])
  const [serviceAreas, setServiceAreas] = useState<any[]>([])
  const [accreditationsMap, setAccreditationsMap] = useState<Map<string, any>>(new Map())
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  const providerId = params.id as string
  const categoryParam = searchParams.get('category')

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch provider details
  useEffect(() => {
    fetchProviderDetails()
  }, [providerId])

  // Check favorite status
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && provider) {
        try {
          const isFav = await isProviderFavorited(user.id, provider.id)
          setIsFavorite(isFav)
        } catch (error) {
          console.error('Error checking favorite status:', error)
        }
      }
    }
    
    if (provider && user) {
      checkFavoriteStatus()
    }
  }, [provider, user])

  // Fetch global accreditations
  useEffect(() => {
    const fetchGlobalAccreditations = async () => {
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
    
    fetchGlobalAccreditations()
  }, [])

  const fetchProviderDetails = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch provider with all related data
      const { data, error: providerError } = await supabase
        .from('providers')
        .select(`
          *,
          provider_service_areas (*),
          provider_accreditations (*)
        `)
        .eq('id', providerId)
        .eq('status', 'approved')
        .single()

      if (providerError) throw providerError

      if (data) {
        // Fetch additional service areas if needed
        if (data.provider_service_areas && data.provider_service_areas.length > 0) {
          setServiceAreas(data.provider_service_areas)
        }

        // Fetch accreditations details
        if (data.provider_accreditations && data.provider_accreditations.length > 0) {
          setAccreditations(data.provider_accreditations)
        }

        setProvider(data)
      } else {
        setError('Provider not found or not approved')
      }
    } catch (error: any) {
      console.error('Error fetching provider:', error)
      setError(error.message || 'Failed to load provider details')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      showAuthModal('login')
      return
    }
    
    if (!provider) return
    
    try {
      setSyncingFavorite(true)
      
      // Optimistic update
      const newIsFavorite = !isFavorite
      setIsFavorite(newIsFavorite)
      
      // Sync with Supabase
      let success = false
      if (newIsFavorite) {
        success = await addFavorite(user.id, provider.id)
      } else {
        success = await removeFavorite(user.id, provider.id)
      }
      
      if (!success) {
        // Revert on error
        setIsFavorite(!newIsFavorite)
        console.error('Failed to sync favorite with Supabase')
      }
      
      // Update localStorage for consistency
      const savedFavorites = localStorage.getItem('provider_favorites')
      let favorites = savedFavorites ? JSON.parse(savedFavorites) : []
      
      if (newIsFavorite) {
        if (!favorites.includes(provider.id)) {
          favorites.push(provider.id)
        }
      } else {
        favorites = favorites.filter((id: string) => id !== provider.id)
      }
      
      localStorage.setItem('provider_favorites', JSON.stringify(favorites))
      
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setIsFavorite(!isFavorite)
    } finally {
      setSyncingFavorite(false)
    }
  }

  const handleShare = (method?: 'copy' | 'facebook' | 'twitter' | 'linkedin' | 'whatsapp') => {
    if (!provider) return
    
    const url = window.location.href
    const title = provider.business_name
    const text = `Check out ${provider.business_name} on FindAPro - ${provider.main_service}`
    
    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(url)
          .then(() => {
            setNotificationMessage('Link copied to clipboard!')
            setShowNotification(true)
            setShowShareMenu(false)
            setTimeout(() => setShowNotification(false), 3000)
          })
          .catch((err) => {
            console.error('Failed to copy link:', err)
            setNotificationMessage('Failed to copy link')
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
          })
        break
        
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank')
        setShowShareMenu(false)
        break
        
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
        setShowShareMenu(false)
        break
        
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        setShowShareMenu(false)
        break
        
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank')
        setShowShareMenu(false)
        break
        
      default:
        setShowShareMenu(!showShareMenu)
        break
    }
  }

  const getServiceAreasDisplay = () => {
    if (!serviceAreas || serviceAreas.length === 0) {
      return provider?.main_service_area || 'Service area not specified'
    }
    
    const primaryArea = serviceAreas.find(area => area.is_primary)?.area_name
    const otherAreas = serviceAreas.filter(area => !area.is_primary).map(area => area.area_name)
    
    if (otherAreas.length === 0) {
      return primaryArea
    }
    
    return `${primaryArea} + ${otherAreas.length} more`
  }

  const getPriceDisplay = () => {
    if (provider?.hourly_rate) {
      return `R${provider.hourly_rate}/hr`
    }
    if (provider?.callout_fee) {
      return `R${provider.callout_fee} callout fee`
    }
    return 'Contact for rates'
  }

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

  const getBusinessInitials = (businessName: string) => {
    if (!businessName) return 'P'
    return businessName.charAt(0).toUpperCase()
  }

  const getOtherServices = () => {
    if (!provider?.other_services) return []
    return provider.other_services.split(',').map((s: string) => s.trim())
  }

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-400">Loading provider details...</p>
        </div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-8 rounded-2xl border border-red-500/30 max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-xl mb-4">{error || 'Provider not found'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-400"
            >
              ← Back to Providers
            </button>
          </div>
        </div>
      </div>
    )
  }

  const businessColor = getBusinessColor(provider.business_name)
  const businessInitials = getBusinessInitials(provider.business_name)
  const otherServices = getOtherServices()

  // Share Menu Component
  const ShareMenu = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
      ref={shareMenuRef}
    >
      <div className="p-3 border-b border-gray-700/50">
        <p className="text-sm font-medium text-white">Share this provider</p>
      </div>
      <div className="p-2">
        <button
          onClick={() => handleShare('copy')}
          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Copy className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Copy link</p>
            <p className="text-xs text-gray-400">Copy to clipboard</p>
          </div>
        </button>
        
        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">WhatsApp</p>
            <p className="text-xs text-gray-400">Share via WhatsApp</p>
          </div>
        </button>
        
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <Facebook className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Facebook</p>
            <p className="text-xs text-gray-400">Share on Facebook</p>
          </div>
        </button>
        
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
            <Twitter className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Twitter</p>
            <p className="text-xs text-gray-400">Share on Twitter</p>
          </div>
        </button>
        
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-700/20 flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">LinkedIn</p>
            <p className="text-xs text-gray-400">Share on LinkedIn</p>
          </div>
        </button>
      </div>
    </motion.div>
  )

  // Notification Component
  const Notification = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-gray-800 border border-emerald-500/30 rounded-xl p-4 shadow-2xl flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-400" />
        <span className="text-white font-medium">{notificationMessage}</span>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Notification */}
      {showNotification && <Notification />}

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Back button */}
      <div className="container mx-auto px-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-4 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Providers
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden"
        >
          {/* Header Section */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Business Logo/Initials */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-2xl border-2 border-gray-600 flex items-center justify-center shadow-lg"
                    style={{ 
                      backgroundColor: businessColor + '10',
                    }}
                  >
                    <div 
                      className="w-full h-full rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: businessColor }}
                    >
                      <span className="text-3xl font-bold text-white">
                        {businessInitials}
                      </span>
                    </div>
                  </div>
                  
                  {provider.verified && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-2 border-gray-800 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Business Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {provider.business_name}
                    </h1>
                    
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm">
                        {provider.main_service}
                      </span>
                      {categoryParam && (
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-sm">
                          {categoryParam}
                        </span>
                      )}
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-bold text-white text-lg">
                          {provider.rating || 'New'}
                        </span>
                        {provider.total_reviews > 0 && (
                          <span className="text-gray-400">
                            ({provider.total_reviews} reviews)
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-emerald-400">
                          {getPriceDisplay()}
                        </span>
                      </div>
                    </div>

                    {/* Experience */}
                    {provider.experience_years > 0 && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{provider.experience_years} years experience</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 relative">
                    <button
                      onClick={toggleFavorite}
                      disabled={syncingFavorite}
                      className="p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {syncingFavorite ? (
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-purple-500 text-purple-500' : 'text-gray-400 hover:text-purple-400'}`} />
                      )}
                    </button>
                    
                    {/* Share Button with Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => handleShare()}
                        className="p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all relative"
                        title="Share this provider"
                      >
                        <Share2 className="w-5 h-5 text-gray-400 hover:text-emerald-400" />
                      </button>
                      
                      <AnimatePresence>
                        {showShareMenu && <ShareMenu />}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs - Only Overview and Reviews */}
            <div className="mt-6 border-t border-gray-700/50 pt-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'overview' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'reviews' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                >
                  Reviews
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab - Show Everything Except Reviews */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Service Areas */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-bold text-white">Service Areas</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Primary Area */}
                      {serviceAreas.find(area => area.is_primary) && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Primary Service Area</p>
                          <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-medium">
                              {serviceAreas.find(area => area.is_primary)?.area_name}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Other Areas */}
                      {serviceAreas.filter(area => !area.is_primary).length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Additional Service Areas</p>
                          <div className="flex flex-wrap gap-2">
                            {serviceAreas
                              .filter(area => !area.is_primary)
                              .map((area, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm border border-gray-700"
                                >
                                  {area.area_name}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-bold text-white">Services Offered</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Main Service</p>
                        <p className="text-white font-medium">{provider.main_service}</p>
                      </div>
                      
                      {otherServices.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Other Services</p>
                          <div className="flex flex-wrap gap-2">
                            {otherServices.map((service, index) => (
                              <span
                                key={index}
                                className="px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-sm border border-purple-500/20"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Description */}
                  {provider.business_description && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Building className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-bold text-white">About Us</h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {provider.business_description}
                      </p>
                    </div>
                  )}

                  {/* Accreditations */}
                  {accreditations.length > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">Accreditations & Certifications</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {accreditations.map((acc, index) => {
                          let accreditationName = 'Certified Professional'
                          let accreditationDescription = 'Professional certification and accreditation'
                          let accreditationIssuer = 'Professional Body'
                          
                          if (acc.is_custom) {
                            accreditationName = acc.custom_name || 'Custom Accreditation'
                            accreditationDescription = acc.custom_description || 'Professional certification'
                            accreditationIssuer = 'Custom'
                          } else if (acc.accreditation_id) {
                            const globalAcc = accreditationsMap.get(acc.accreditation_id)
                            accreditationName = globalAcc?.name || 'Certified Professional'
                            accreditationDescription = globalAcc?.description || 'Professional certification'
                            accreditationIssuer = globalAcc?.issuer || 'Professional Body'
                          }
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-amber-500/20 hover:border-amber-500/40 transition-all group"
                            >
                              <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                  <Award className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors">
                                    {accreditationName}
                                  </h4>
                                  <p className="text-sm text-amber-400/80 mt-1">{accreditationIssuer}</p>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {accreditationDescription}
                              </p>
                              {acc.is_verified && (
                                <div className="mt-4 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  <span className="text-xs text-emerald-400">Verified by FindAPro</span>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Contact & Features */}
                <div className="space-y-6">
                  {/* Contact Information - IMPROVED FOR MOBILE */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-4">
                      <PhoneCall className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-bold text-white">Contact Information</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {provider.contact_person && (
                        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">Contact Person</p>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-white font-medium">{provider.contact_person}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Primary Phone - CLEARLY CLICKABLE */}
                      {provider.contact_phone && (
                        <a
                          href={`tel:${provider.contact_phone.replace(/[^\d+]/g, '')}`}
                          className="block p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15 transition-all group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                              <Phone className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-emerald-400 mb-1">Primary Phone</p>
                              <p className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                                {provider.contact_phone}
                              </p>
                              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                <span>Tap to call</span>
                                <PhoneCall className="w-3 h-3" />
                              </p>
                            </div>
                          </div>
                        </a>
                      )}
                      
                      {/* Alternate Phone - CLEARLY CLICKABLE */}
                      {provider.alternate_phone && (
                        <a
                          href={`tel:${provider.alternate_phone.replace(/[^\d+]/g, '')}`}
                          className="block p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/15 transition-all group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                              <Phone className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-blue-400 mb-1">Alternate Phone</p>
                              <p className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                                {provider.alternate_phone}
                              </p>
                              <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                                <span>Tap to call</span>
                                <PhoneCall className="w-3 h-3" />
                              </p>
                            </div>
                          </div>
                        </a>
                      )}
                      
                      {/* Email - CLEARLY CLICKABLE */}
                      {provider.contact_email && (
                        <a
                          href={`mailto:${provider.contact_email}`}
                          className="block p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/15 transition-all group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                              <Mail className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-purple-400 mb-1">Email Address</p>
                              <p className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                                {provider.contact_email}
                              </p>
                              <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                                <span>Tap to email</span>
                                <Mail className="w-3 h-3" />
                              </p>
                            </div>
                          </div>
                        </a>
                      )}
                      
                      {/* Website - CLEARLY CLICKABLE */}
                      {provider.portfolio_url && (
                        <a
                          href={provider.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/15 transition-all group active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                              <Globe className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-cyan-400 mb-1">Portfolio/Website</p>
                              <p className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                                Visit Website
                              </p>
                              <p className="text-xs text-cyan-400 mt-1 flex items-center gap-2">
                                <span>Tap to open</span>
                                <ExternalLink className="w-3 h-3" />
                              </p>
                            </div>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Business Features */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-bold text-white">Business Features</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {provider.emergency_service && (
                        <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <Zap className="w-4 h-4 text-red-400" />
                          <div>
                            <p className="font-medium text-white">Emergency Service</p>
                            {provider.callout_fee && (
                              <p className="text-sm text-red-400">R{provider.callout_fee} callout fee</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {provider.insurance && (
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="font-medium text-white">Insured</p>
                            {provider.insurance_details && (
                              <p className="text-sm text-blue-400 truncate">{provider.insurance_details}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {provider.verified && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="font-medium text-white">Verified Professional</p>
                            <p className="text-sm text-emerald-400">FindAPro verified</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Hours / Availability */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-bold text-white">Availability</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">Response Time</span>
                        <span className="text-white font-medium">Within 24 hours</span>
                      </div>
                      
                      {provider.emergency_service && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400">Emergency Service</span>
                          <span className="text-red-400 font-medium">24/7 Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-6">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
                  </div>
                  
                  {/* Overall Rating */}
                  <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <div className="flex">
                            {renderStars(provider.rating || 0)}
                          </div>
                          <span className="text-3xl font-bold text-white">{provider.rating || 'New'}</span>
                        </div>
                        <p className="text-gray-400">Based on {provider.total_reviews || 0} reviews</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => alert('Review functionality coming soon!')}
                          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all"
                        >
                          Write a Review
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coming Soon Message */}
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Review System Coming Soon</h4>
                    <p className="text-gray-400 mb-6">We're working on implementing a comprehensive review system.</p>
                    <div className="max-w-md mx-auto bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <p className="text-sm text-gray-300">
                        Features being developed include: star ratings, detailed reviews, photo uploads, and response system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Simplified */}
          <div className="p-6 border-t border-gray-700/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-lg font-bold text-white mb-2">{provider.business_name}</h4>
                <p className="text-gray-400">FindAPro Verified Professional</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFavorite}
                  disabled={syncingFavorite}
                  className="px-6 py-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 text-white font-medium transition-all flex items-center gap-2"
                >
                  {syncingFavorite ? (
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-purple-500 text-purple-500' : 'text-gray-400'}`} />
                  )}
                  {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}