// File: src/app/providers/[id]/page.tsx
'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase, isProviderFavorited, addFavorite, removeFavorite, getProviderById } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Heart, Share2, Phone, Mail, MapPin, 
  Star, Clock, Shield, Award, 
  CheckCircle, Calendar, Briefcase, Users, 
  ShieldCheck, PhoneCall,
  Building, AlertCircle, MessageCircle, Tag, FileText,
  ThumbsUp, Zap, Leaf, Gift, Percent, Truck,
  Languages, Fingerprint, Settings, CreditCard, Eye
} from 'lucide-react'
import ProviderLogoDisplay from '@/components/ProviderLogoDisplay'
import WhatsAppButton from '@/components/WhatsAppButton'

// Icon mapping function
const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName) return Tag;
  
  const iconMap: Record<string, any> = {
    'FileText': FileText, 'Tag': Tag, 'Eye': Eye, 'CreditCard': CreditCard,
    'ThumbsUp': ThumbsUp, 'Shield': Shield, 'Clock': Clock, 'Calendar': Calendar,
    'Zap': Zap, 'AlertCircle': AlertCircle, 'Building': Building, 'Percent': Percent,
     'Award': Award, 'MessageCircle': MessageCircle,
    'Clipboard': FileText, 'Truck': Truck, 'Languages': Languages,
    'Heart': Heart, 'Gift': Gift, 'Users': Users, 'ShieldCheck': ShieldCheck,
    'Fingerprint': Fingerprint, 'Leaf': Leaf, 'Settings': Settings,
  };
  
  return iconMap[iconName] || Tag;
};

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
  const [businessFeatures, setBusinessFeatures] = useState<any[]>([])
  const [accreditationsMap, setAccreditationsMap] = useState<Map<string, any>>(new Map())
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details')
  const [notification, setNotification] = useState<{show: boolean; message: string}>({show: false, message: ''})

  const providerId = params.id as string

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

      // Fetch provider with all relations
      const { data, error: providerError } = await supabase
        .from('providers')
        .select(`
          *,
          provider_accreditations (*),
          business_features:provider_business_features(
            *,
            feature:business_features(*)
          )
        `)
        .eq('id', providerId)
        .eq('status', 'approved')
        .single()

      if (providerError) throw providerError

      if (data) {
        // Parse service areas
        let formattedServiceAreas = []
        if (data.service_areas) {
          const serviceAreasStr = data.service_areas.trim();
          
          if (serviceAreasStr.startsWith('[') && serviceAreasStr.endsWith(']')) {
            try {
              formattedServiceAreas = JSON.parse(serviceAreasStr)
                .map((area: any) => String(area).trim())
                .filter((area: string) => area !== '');
            } catch (error) {
              formattedServiceAreas = serviceAreasStr
                .split(',')
                .map((area: string) => area.trim())
                .filter((area: string) => area !== '');
            }
          } else {
            formattedServiceAreas = serviceAreasStr
              .split(',')
              .map((area: string) => area.trim())
              .filter((area: string) => area !== '');
          }
        }

        data.formatted_service_areas = formattedServiceAreas;

        if (data.provider_accreditations && data.provider_accreditations.length > 0) {
          setAccreditations(data.provider_accreditations)
        }

        if (data.business_features && data.business_features.length > 0) {
          setBusinessFeatures(data.business_features)
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
      
      const newIsFavorite = !isFavorite
      setIsFavorite(newIsFavorite)
      
      let success = false
      if (newIsFavorite) {
        success = await addFavorite(user.id, provider.id)
      } else {
        success = await removeFavorite(user.id, provider.id)
      }
      
      if (!success) {
        setIsFavorite(!newIsFavorite)
        console.error('Failed to sync favorite with Supabase')
      }
      
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

  const handleShare = async () => {
    if (!provider) return
    
    const shareData = {
      title: provider.business_name,
      text: `Check out ${provider.business_name} - ${provider.main_service || 'Professional Service'}`,
      url: window.location.href,
    }
    
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        showNotification('Link copied to clipboard!')
      } else {
        fallbackCopyToClipboard(window.location.href)
      }
    } catch (error: any) {
      console.error('Error sharing:', error)
      if (error.name !== 'AbortError') {
        showNotification('Failed to share. Try copying the link manually.')
      }
    }
  }

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showNotification('Link copied to clipboard!')
    } catch (err) {
      console.error('Fallback copy failed:', err)
      showNotification('Failed to copy link. Please copy manually.')
    }
    document.body.removeChild(textArea)
  }

  const showNotification = (message: string) => {
    setNotification({ show: true, message })
    setTimeout(() => {
      setNotification({ show: false, message: '' })
    }, 3000)
  }

  const getPriceDisplay = () => {
    if (provider?.fees_pricing) {
      return provider.fees_pricing
    }
    if (provider?.callout_fee) {
      return provider.callout_fee
    }
    return 'Contact for rates'
  }

  const getOtherServices = () => {
    if (!provider?.details) return []
    return provider.details
      .split(/[\n,]+/)
      .map((s: string) => s.trim())
      .map((s: string) => s.replace(/^[•\-*\s]+/, ''))
      .filter((s: string) => s)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading provider details...</p>
        </div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-8 rounded-xl border border-red-500/30 max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-xl mb-4">{error || 'Provider not found'}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-blue-400"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const otherServices = getOtherServices()
  const serviceAreas = provider.formatted_service_areas || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Notification Toast */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-50 border border-gray-700 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* Back button */}
      <div className="container mx-auto px-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
        >
          {/* Header Section */}
          <div className="p-6 border-b border-gray-700/50">
            {/* Mobile Layout */}
            <div className="flex items-start justify-between mb-6 md:mb-0 md:hidden">
              <ProviderLogoDisplay
                providerId={provider.id}
                businessName={provider.business_name}
                size="md"
                showBorder={true}
                showVerified={true}
                verified={provider.verified}
                shape="square"
                clickToZoom={false}
              />
              
              <div className="flex gap-2">
                <button
                  onClick={toggleFavorite}
                  disabled={syncingFavorite}
                  className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500 hover:bg-purple-500/10 transition-all"
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {syncingFavorite ? (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-purple-500 text-purple-500' : 'text-gray-400 hover:text-purple-400'}`} />
                  )}
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                  title="Share this provider"
                >
                  <Share2 className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex md:flex-row md:items-start gap-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <ProviderLogoDisplay
                  providerId={provider.id}
                  businessName={provider.business_name}
                  size="lg"
                  showBorder={true}
                  showVerified={true}
                  verified={provider.verified}
                  shape="square"
                  clickToZoom={false}
                />

                <div className="flex-1 min-w-0">
                  <div className="mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {provider.business_name}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-400">
                          {getPriceDisplay()}
                        </span>
                      </div>
                    </div>

                    {provider.experience_years && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{provider.experience_years} years experience</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 md:flex-col md:items-end md:justify-start md:mt-0">
                <button
                  onClick={toggleFavorite}
                  disabled={syncingFavorite}
                  className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500 hover:bg-purple-500/10 transition-all"
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {syncingFavorite ? (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-purple-500 text-purple-500' : 'text-gray-400 hover:text-purple-400'}`} />
                  )}
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all"
                  title="Share this provider"
                >
                  <Share2 className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                </button>
              </div>
            </div>

            <div className="md:hidden mt-4">
              <h1 className="text-2xl font-bold text-white mb-2">
                {provider.business_name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-400">
                    {getPriceDisplay()}
                  </span>
                </div>
              </div>

              {provider.experience_years && (
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{provider.experience_years} years experience</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-3 font-medium transition-all ${
                  activeTab === 'details'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Details
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-3 font-medium transition-all ${
                  activeTab === 'reviews'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Reviews
                  {provider.total_reviews > 0 && (
                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                      {provider.total_reviews}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
        
{/* Contact Information */}
<div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
  <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
  
  <div className="space-y-4">
    {provider.contact_person && (
      <div>
        <p className="text-sm text-gray-400 mb-1">Contact Person</p>
        <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
          <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-white font-medium truncate">{provider.contact_person}</span>
        </div>
      </div>
    )}
    
    {/* Primary Phone with WhatsApp */}
    {provider.contact_phone && (
      <div>
        <p className="text-sm text-gray-400 mb-1">Primary Phone</p>
        <div className="space-y-3">
          {/* Call Button - Full width */}
          <a
            href={`tel:${provider.contact_phone.replace(/[^\d+]/g, '')}`}
            className="block w-full p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-lg border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/40 transition-colors flex-shrink-0">
                <Phone className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-emerald-400 mb-1">Tap to Call</p>
                <p className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                  {provider.contact_phone}
                </p>
              </div>
              <PhoneCall className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </a>
          
          {/* WhatsApp Button - Primary */}
          {provider.primary_has_whatsapp && (
            <a
              href={`https://wa.me/${(function(phone) {
                // Format phone number for WhatsApp
                const digitsOnly = phone.replace(/\D/g, '');
                // Handle South African numbers
                if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
                  return '27' + digitsOnly.substring(1);
                }
                if (digitsOnly.length === 9) {
                  return '27' + digitsOnly;
                }
                if (digitsOnly.startsWith('27') && digitsOnly.length >= 11) {
                  return digitsOnly;
                }
                return digitsOnly;
              })(provider.contact_phone)}?text=${encodeURIComponent(`Hi ${provider.business_name}, I'm interested in your ${provider.main_service || 'services'}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg border border-green-500/30 hover:border-green-500/50 hover:bg-green-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/30 flex items-center justify-center group-hover:bg-green-500/40 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.349 0-9.703 4.352-9.706 9.702 0 1.703.444 3.371 1.286 4.836L2 22l5.539-1.504c1.414.783 3.004 1.196 4.64 1.197h.004c5.347 0 9.701-4.353 9.704-9.703.001-2.598-1.01-5.041-2.897-6.928zM12.018 20.06h-.003c-1.446 0-2.864-.389-4.082-1.12l-.293-.174-3.288.875.88-3.2-.19-.305c-.758-1.215-1.158-2.617-1.158-4.064.003-4.445 3.619-8.06 8.067-8.06 2.153 0 4.178.841 5.699 2.368 1.521 1.527 2.358 3.553 2.357 5.71-.002 4.446-3.618 8.062-8.064 8.062zM16.247 14.28c-.245-.123-1.453-.717-1.678-.798-.225-.082-.388-.123-.552.122-.164.245-.636.798-.78.962-.143.164-.287.185-.532.062-.926-.403-1.719-.917-2.402-1.527-.901-.803-1.51-1.771-1.686-2.082-.164-.29-.018-.447.124-.592.128-.128.286-.334.429-.501.143-.167.191-.287.287-.479.095-.192.048-.36-.024-.503-.071-.143-.552-1.329-.756-1.818-.199-.479-.4-.414-.552-.422a9.96 9.96 0 0 0-.47-.008c-.166.005-.398.057-.608.287-.21.23-.802.784-.802 1.913 0 1.128.822 2.218.937 2.372.115.154 1.56 2.456 3.856 3.34 2.296.884 2.296.589 2.71.552.414-.037 1.337-.546 1.525-1.074.188-.528.188-.98.132-1.075-.057-.095-.21-.154-.456-.277z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors">
                    WhatsApp
                  </p>
                </div>
                <svg className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
            </a>
          )}
        </div>
      </div>
    )}
    
    {/* Alternate Phone with WhatsApp */}
    {provider.alternate_phone && (
      <div>
        <p className="text-sm text-gray-400 mb-1">Alternate Phone</p>
        <div className="space-y-3">
          {/* Call Button - Full width */}
          <a
            href={`tel:${provider.alternate_phone.replace(/[^\d+]/g, '')}`}
            className="block w-full p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors flex-shrink-0">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-400 mb-1">Tap to Call</p>
                <p className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                  {provider.alternate_phone}
                </p>
              </div>
              <PhoneCall className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </a>
          
          {/* WhatsApp Button - Alternate */}
          {provider.alternate_has_whatsapp && (
            <a
              href={`https://wa.me/${(function(phone) {
                // Format phone number for WhatsApp
                const digitsOnly = phone.replace(/\D/g, '');
                // Handle South African numbers
                if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
                  return '27' + digitsOnly.substring(1);
                }
                if (digitsOnly.length === 9) {
                  return '27' + digitsOnly;
                }
                if (digitsOnly.startsWith('27') && digitsOnly.length >= 11) {
                  return digitsOnly;
                }
                return digitsOnly;
              })(provider.alternate_phone)}?text=${encodeURIComponent(`Hi ${provider.business_name}, I'm interested in your ${provider.main_service || 'services'}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg border border-green-500/30 hover:border-green-500/50 hover:bg-green-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/30 flex items-center justify-center group-hover:bg-green-500/40 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.349 0-9.703 4.352-9.706 9.702 0 1.703.444 3.371 1.286 4.836L2 22l5.539-1.504c1.414.783 3.004 1.196 4.64 1.197h.004c5.347 0 9.701-4.353 9.704-9.703.001-2.598-1.01-5.041-2.897-6.928zM12.018 20.06h-.003c-1.446 0-2.864-.389-4.082-1.12l-.293-.174-3.288.875.88-3.2-.19-.305c-.758-1.215-1.158-2.617-1.158-4.064.003-4.445 3.619-8.06 8.067-8.06 2.153 0 4.178.841 5.699 2.368 1.521 1.527 2.358 3.553 2.357 5.71-.002 4.446-3.618 8.062-8.064 8.062zM16.247 14.28c-.245-.123-1.453-.717-1.678-.798-.225-.082-.388-.123-.552.122-.164.245-.636.798-.78.962-.143.164-.287.185-.532.062-.926-.403-1.719-.917-2.402-1.527-.901-.803-1.51-1.771-1.686-2.082-.164-.29-.018-.447.124-.592.128-.128.286-.334.429-.501.143-.167.191-.287.287-.479.095-.192.048-.36-.024-.503-.071-.143-.552-1.329-.756-1.818-.199-.479-.4-.414-.552-.422a9.96 9.96 0 0 0-.47-.008c-.166.005-.398.057-.608.287-.21.23-.802.784-.802 1.913 0 1.128.822 2.218.937 2.372.115.154 1.56 2.456 3.856 3.34 2.296.884 2.296.589 2.71.552.414-.037 1.337-.546 1.525-1.074.188-.528.188-.98.132-1.075-.057-.095-.21-.154-.456-.277z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors">
                    WhatsApp
                  </p>
                </div>
                <svg className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
            </a>
          )}
        </div>
      </div>
    )}
    
    {/* Email */}
    {provider.contact_email && (
      <div>
        <p className="text-sm text-gray-400 mb-1">Email Address</p>
        <a
          href={`mailto:${provider.contact_email}`}
          className="block w-full p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/40 transition-colors flex-shrink-0">
              <Mail className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-purple-400 mb-1">Tap to Email</p>
              <div className="relative">
                <p className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  {provider.contact_email}
                </p>
              </div>
            </div>
            <Mail className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        </a>
      </div>
    )}
  </div>
</div>

                  {/* Service Areas */}
                  {serviceAreas.length > 0 && (
                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-bold text-white">Service Areas</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                          <p className="text-gray-300 text-lg leading-relaxed">
                            {serviceAreas.join(', ')}
                          </p>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Service available in {serviceAreas.length} area{serviceAreas.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Details & Services */}
                  {provider.details && (
                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-bold text-white">Details & Services</h3>
                      </div>
                      
                      <div className="space-y-2">
                        {otherServices.length === 0 ? (
                          <p className="text-gray-500 italic">No additional details provided</p>
                        ) : (
                          <ul className="space-y-2">
                            {otherServices.map((item: string, index: number) => (
                              <li key={index} className="flex items-start text-gray-300">
                                <span className="text-purple-400 mr-2 mt-0.5 flex-shrink-0">•</span>
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Business Description */}
                  {provider.business_description && (
                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                        <Building className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-bold text-white">About Us</h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {provider.business_description}
                      </p>
                    </div>
                  )}

                  {/* Business Features - NEW SECTION */}
                  {businessFeatures.length > 0 && (
                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">Business Features</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {businessFeatures.map((feat: any) => {
                          const IconComponent = feat.is_custom 
                            ? Tag 
                            : getIconComponent(feat.feature?.icon);
                          
                          return (
                            <div
                              key={feat.id}
                              className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 flex items-start gap-3"
                            >
                              <IconComponent className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-medium text-white">
                                  {feat.is_custom ? feat.custom_name : feat.feature?.name}
                                </h4>
                                {(feat.custom_description || feat.feature?.description) && (
                                  <p className="text-sm text-gray-400">
                                    {feat.is_custom ? feat.custom_description : feat.feature?.description}
                                  </p>
                                )}
                                {feat.is_verified && (
                                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Accreditations */}
                  {accreditations.length > 0 && (
                    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">Accreditations & Certifications</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {accreditations.map((acc, index) => {
                          let accreditationName = 'Certified Professional'
                          let accreditationDescription = 'Professional certification and accreditation'
                          
                          if (acc.is_custom) {
                            accreditationName = acc.custom_name || 'Custom Accreditation'
                            accreditationDescription = acc.custom_description || 'Professional certification'
                          } else if (acc.accreditation_id) {
                            const globalAcc = accreditationsMap.get(acc.accreditation_id)
                            accreditationName = globalAcc?.name || 'Certified Professional'
                            accreditationDescription = globalAcc?.description || 'Professional certification'
                          }
                          
                          return (
                            <div
                              key={index}
                              className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                            >
                              <div className="flex items-start gap-3">
                                <Award className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-white mb-1">{accreditationName}</h4>
                                  <p className="text-sm text-gray-300">{accreditationDescription}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Reviews Tab Content */
              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-10 h-10 text-blue-400" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-3">
                      Reviews Coming Soon!
                    </h2>
                    
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      We're working on implementing a comprehensive review system to help you make better decisions.
                      Soon you'll be able to read authentic reviews from other customers and share your own experiences.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <span className="text-xl font-bold text-white">{provider.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <p className="text-sm text-gray-400">Current Rating</p>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="text-xl font-bold text-white mb-2">{provider.total_reviews || 0}</div>
                        <p className="text-sm text-gray-400">Total Reviews</p>
                      </div>
                      
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="text-xl font-bold text-white mb-2">
                          {provider.experience_years || '0'} yrs
                        </div>
                        <p className="text-sm text-gray-400">Experience</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-500/20">
                      <h3 className="font-bold text-white mb-2">Why reviews are important</h3>
                      <ul className="text-gray-400 text-sm space-y-2 text-left">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>Verify the quality of work and professionalism</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>Understand pricing and value for money</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>Learn about response times and reliability</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>Make informed decisions based on real experiences</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-8">
                      <p className="text-gray-500 text-sm">
                        Check back soon for reviews or contact the provider directly for references.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
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
                  className="px-6 py-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-500 hover:bg-purple-500/10 text-white font-medium transition-all flex items-center gap-2"
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