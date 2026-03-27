'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { approveProvider, rejectProvider, pauseProvider, deleteProvider } from '@/lib/admin-actions'
import Link from 'next/link'
import ProviderLogoDisplay from '@/components/ProviderLogoDisplay'
import { motion } from 'framer-motion'
import { 
  Building, Mail, Phone, MapPin, Calendar, Briefcase, 
  Award, Star, CheckCircle, Users, Share2, ExternalLink,
  Tag, FileText, Eye, CreditCard, ThumbsUp, Shield, Clock,
  Zap, AlertCircle, Percent, Gift, Truck, Languages,
  Fingerprint, Settings, Leaf, Globe, Facebook, Instagram,
  Linkedin, Youtube, Music2, MessageCircle, Heart, Trash2, Send
} from 'lucide-react'

// Icon mapping function (copied from your provider detail page)
const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName) return Tag
  
  const iconMap: Record<string, any> = {
    'FileText': FileText, 'Tag': Tag, 'Eye': Eye, 'CreditCard': CreditCard,
    'ThumbsUp': ThumbsUp, 'Shield': Shield, 'Clock': Clock, 'Calendar': Calendar,
    'Zap': Zap, 'AlertCircle': AlertCircle, 'Building': Building, 'Percent': Percent,
    'Award': Award, 'MessageCircle': MessageCircle,
    'Clipboard': FileText, 'Truck': Truck, 'Languages': Languages,
    'Heart': Heart, 'Gift': Gift, 'Users': Users, 'ShieldCheck': Shield,
    'Fingerprint': Fingerprint, 'Leaf': Leaf, 'Settings': Settings,
    'Globe': Globe, 'Facebook': Facebook, 'Instagram': Instagram,
    'LinkedIn': Linkedin, 'Youtube': Youtube, 'Music2': Music2
  }
  
  return iconMap[iconName] || Tag
}

export default function ProviderDetailPage() {
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [pauseReason, setPauseReason] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  
  // State for related data
  const [accreditations, setAccreditations] = useState<any[]>([])
  const [businessFeatures, setBusinessFeatures] = useState<any[]>([])
  const [socialLinks, setSocialLinks] = useState<any[]>([])
  const [accreditationsMap, setAccreditationsMap] = useState<Map<string, any>>(new Map())
  
  const router = useRouter()
  const params = useParams()
  const providerId = params.id as string

  useEffect(() => {
    fetchProvider()
    fetchAdminEmail()
    fetchGlobalAccreditations()
  }, [providerId])

  async function fetchAdminEmail() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setAdminEmail(user.email || '')
    } catch (error) {
      console.error('Error fetching admin email:', error)
    }
  }

  // Fetch global accreditations
  async function fetchGlobalAccreditations() {
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

  // Parse service areas helper
  const parseServiceAreas = (serviceAreas: string | null) => {
    if (!serviceAreas) return []
    try {
      const serviceAreasStr = serviceAreas.trim()
      if (serviceAreasStr.startsWith('[') && serviceAreasStr.endsWith(']')) {
        const parsed = JSON.parse(serviceAreasStr)
        return Array.isArray(parsed) ? parsed.map((area: any) => String(area).trim()) : [serviceAreas]
      }
      return serviceAreasStr.split(',').map((area: string) => area.trim()).filter((area: string) => area !== '')
    } catch {
      return serviceAreas.split(',').map((area: string) => area.trim()).filter((area: string) => area !== '')
    }
  }

  async function fetchProvider() {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          provider_accreditations (*),
          business_features:provider_business_features(
            *,
            feature:business_features(*)
          ),
          social_links:provider_social_links(
            *,
            platform:social_platforms(*)
          )
        `)
        .eq('id', providerId)
        .maybeSingle()
  
      if (error) {
        console.error('Error with full query:', error)
        const { data: basicData, error: basicError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', providerId)
          .maybeSingle()
  
        if (basicError) throw basicError
        if (!basicData) throw new Error('Provider not found')
  
        setProvider(basicData)
        if (basicData.service_areas) {
          setServiceAreas(parseServiceAreas(basicData.service_areas))
        }
        return
      }
  
      if (!data) {
        throw new Error('Provider not found')
      }
  
      setProvider(data)
      
      if (data.service_areas) {
        setServiceAreas(parseServiceAreas(data.service_areas))
      }
  
      if (data.provider_accreditations?.length > 0) {
        setAccreditations(data.provider_accreditations)
      }
  
      if (data.business_features?.length > 0) {
        setBusinessFeatures(data.business_features)
      }
  
      if (data.social_links?.length > 0) {
        setSocialLinks(data.social_links)
      }
  
    } catch (error) {
      console.error('Error fetching provider:', error)
      setActionMessage('Failed to load provider details')
    } finally {
      setLoading(false)
    }
  }

  // Function to send notification email without changing status
  async function sendNotificationEmail() {
    if (!notificationMessage.trim()) {
      setActionMessage('Please enter a notification message')
      return
    }

    setActionLoading(true)
    try {
      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'custom_notification',
          provider: provider,
          adminEmail,
          message: notificationMessage,
          action: 'notify'
        }),
      })

      const emailResult = await emailResponse.json()
      if (emailResponse.ok) {
        setActionMessage('Notification sent successfully!')
        setNotificationMessage('')
        setShowNotifyModal(false)
      } else {
        setActionMessage('Failed to send notification')
      }
    } catch (error: any) {
      setActionMessage(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAction(action: 'approve' | 'reject' | 'pause' | 'resume' | 'delete') {
    if (!providerId) return

    if (action === 'delete') {
      setShowDeleteConfirm(true)
      return
    }

    setActionLoading(true)
    setActionMessage('')

    try {
      let result

      switch (action) {
        case 'approve':
          result = await approveProvider(providerId, adminEmail)
          break
        case 'reject':
          if (!rejectionReason.trim()) {
            setActionMessage('Please provide a rejection reason')
            setActionLoading(false)
            return
          }
          result = await rejectProvider(providerId, rejectionReason, adminEmail)
          break
        case 'pause':
          const pauseReasonText = pauseReason.trim() || undefined
          result = await pauseProvider(providerId, pauseReasonText, adminEmail)
          break
        case 'resume':
          result = await approveProvider(providerId, adminEmail)
          break
      }

      if (result?.success) {
        setActionMessage(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`)
        await fetchProvider()
        setRejectionReason('')
        setPauseReason('')
        
        if (action === 'approve' || action === 'reject') {
          setTimeout(() => router.push('/admin/pending'), 1500)
        }
      } else {
        setActionMessage(`Failed to ${action}: ${result?.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      setActionMessage(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      const result = await deleteProvider(providerId, deleteReason || undefined, adminEmail)
      
      if (result.success) {
        setActionMessage('Provider deleted successfully!')
        setTimeout(() => router.push('/admin/providers'), 1500)
      } else {
        setActionMessage(`Failed to delete: ${result.error}`)
      }
    } catch (error: any) {
      setActionMessage(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
      setShowDeleteConfirm(false)
      setDeleteReason('')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const getPriceDisplay = () => {
    if (provider?.fees_pricing) {
      return provider.fees_pricing
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading provider details...</p>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mt-4">Provider not found</h2>
          <p className="text-gray-400 mt-2">The provider you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/admin/providers"
            className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all"
          >
            Back to Providers
          </Link>
        </div>
      </div>
    )
  }

  const otherServices = getOtherServices()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Logo */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/admin/providers"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Providers
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <ProviderLogoDisplay
                providerId={provider.id}
                businessName={provider.business_name}
                size="lg"
                showBorder={true}
                showVerified={false}
                shape="square"
                clickToZoom={true}
              />
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{provider.business_name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full
                    ${provider.status === 'approved' ? 'bg-green-900/30 text-green-300 border border-green-700' :
                      provider.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700' :
                      provider.status === 'rejected' ? 'bg-red-900/30 text-red-300 border border-red-700' :
                      provider.status === 'pause' ? 'bg-gray-700 text-gray-300 border border-gray-600' :
                      'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                    Status: {provider.status}
                  </span>
                  <span className="text-sm text-gray-400">
                    Submitted: {formatDate(provider.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-lg ${actionMessage.includes('successful') || actionMessage.includes('sent')
            ? 'bg-green-900/30 text-green-300 border border-green-700' 
            : 'bg-red-900/30 text-red-300 border border-red-700'}`}>
            <div className="flex items-start gap-3">
              {actionMessage.includes('successful') || actionMessage.includes('sent') ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <span>{actionMessage}</span>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete <span className="font-semibold text-white">{provider.business_name}</span>? 
                This action cannot be undone.
              </p>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deletion (optional)..."
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteReason('')
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Modal */}
        {showNotifyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">Send Notification</h3>
              <p className="text-gray-300 mb-4">
                Send a message to <span className="font-semibold text-white">{provider.business_name}</span> without changing their status.
              </p>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter your message..."
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={sendNotificationEmail}
                  disabled={actionLoading || !notificationMessage.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  onClick={() => {
                    setShowNotifyModal(false)
                    setNotificationMessage('')
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Provider Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Details Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                Business Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm text-gray-400">Business Name</label>
                  <p className="font-medium text-white mt-1">{provider.business_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Main Service</label>
                  <p className="font-medium text-white mt-1">{provider.main_service || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Experience Years</label>
                  <p className="font-medium text-white mt-1">{provider.experience_years || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Fees & Pricing</label>
                  <p className="font-medium text-emerald-400 mt-1">{getPriceDisplay()}</p>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Contact Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm text-gray-400">Contact Person</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="font-medium text-white">{provider.contact_person}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Contact Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="font-medium text-white">{provider.contact_email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Primary Phone</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="font-medium text-white">{provider.contact_phone}</p>
                    {provider.primary_has_whatsapp && (
                      <span className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.349 0-9.703 4.352-9.706 9.702 0 1.703.444 3.371 1.286 4.836L2 22l5.539-1.504c1.414.783 3.004 1.196 4.64 1.197h.004c5.347 0 9.701-4.353 9.704-9.703.001-2.598-1.01-5.041-2.897-6.928zM12.018 20.06h-.003c-1.446 0-2.864-.389-4.082-1.12l-.293-.174-3.288.875.88-3.2-.19-.305c-.758-1.215-1.158-2.617-1.158-4.064.003-4.445 3.619-8.06 8.067-8.06 2.153 0 4.178.841 5.699 2.368 1.521 1.527 2.358 3.553 2.357 5.71-.002 4.446-3.618 8.062-8.064 8.062z"/>
                        </svg>
                        WhatsApp
                      </span>
                    )}
                  </div>
                </div>
                {provider.alternate_phone && (
                  <div>
                    <label className="text-sm text-gray-400">Alternate Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="font-medium text-white">{provider.alternate_phone}</p>
                      {provider.alternate_has_whatsapp && (
                        <span className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2c-5.349 0-9.703 4.352-9.706 9.702 0 1.703.444 3.371 1.286 4.836L2 22l5.539-1.504c1.414.783 3.004 1.196 4.64 1.197h.004c5.347 0 9.701-4.353 9.704-9.703.001-2.598-1.01-5.041-2.897-6.928zM12.018 20.06h-.003c-1.446 0-2.864-.389-4.082-1.12l-.293-.174-3.288.875.88-3.2-.19-.305c-.758-1.215-1.158-2.617-1.158-4.064.003-4.445 3.619-8.06 8.067-8.06 2.153 0 4.178.841 5.699 2.368 1.521 1.527 2.358 3.553 2.357 5.71-.002 4.446-3.618 8.062-8.064 8.062z"/>
                          </svg>
                          WhatsApp
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Service Areas Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Service Areas
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {serviceAreas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {serviceAreas.map((area, index) => (
                      <span key={index} className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-800">
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No service areas specified</p>
                )}
              </div>
            </div>

            {/* Business Features Card */}
            {businessFeatures.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  Business Features
                </h2>
                
                <div className="grid grid-cols-1 gap-3">
                  {businessFeatures.map((feat: any) => {
                    const IconComponent = feat.is_custom 
                      ? Tag 
                      : getIconComponent(feat.feature?.icon)
                    
                    return (
                      <div
                        key={feat.id}
                        className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 flex items-start gap-3"
                      >
                        <IconComponent className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
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
                    )
                  })}
                </div>
              </div>
            )}

            {/* Accreditations Card */}
            {accreditations.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Accreditations & Certifications
                </h2>
                
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
                        className="p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start gap-3">
                          <Award className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">{accreditationName}</h4>
                            <p className="text-sm text-gray-300">{accreditationDescription}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              {acc.issued_date && (
                                <div>
                                  <span className="text-gray-500">Issued:</span>{' '}
                                  <span className="text-gray-300">{new Date(acc.issued_date).toLocaleDateString()}</span>
                                </div>
                              )}
                              {acc.expiry_date && (
                                <div>
                                  <span className="text-gray-500">Expires:</span>{' '}
                                  <span className="text-gray-300">{new Date(acc.expiry_date).toLocaleDateString()}</span>
                                </div>
                              )}
                              {acc.certificate_number && (
                                <div className="col-span-2">
                                  <span className="text-gray-500">Cert #:</span>{' '}
                                  <span className="text-gray-300">{acc.certificate_number}</span>
                                </div>
                              )}
                            </div>
                            
                            {acc.is_verified && (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-2">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Social Links Card */}
            {socialLinks.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-400" />
                  Connect Online
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {socialLinks.map((link: any) => {
                    const IconComponent = getIconComponent(link.platform?.icon_name || 'Globe')
                    
                    const platformColor = link.platform?.name === 'Facebook' ? '#1877F2' :
                                        link.platform?.name === 'Instagram' ? '#E4405F' :
                                        link.platform?.name === 'LinkedIn' ? '#0A66C2' :
                                        link.platform?.name === 'YouTube' ? '#FF0000' :
                                        link.platform?.name === 'TikTok' ? '#00f2ea' :
                                        link.platform?.name === 'Website' ? '#3B82F6' : '#9CA3AF'
                    
                    return (
                      <motion.a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative overflow-hidden"
                      >
                        <div className="relative p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <IconComponent 
                                className="w-4 h-4" 
                                style={{ color: platformColor }}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                {link.platform?.name || link.custom_platform_name || 'Social'}
                              </p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {link.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                              </p>
                            </div>
                            
                            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                          </div>
                        </div>
                      </motion.a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Details/Services Card */}
            {provider.details && (
              <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  Additional Details & Services
                </h2>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  {otherServices.length > 0 ? (
                    <ul className="space-y-2">
                      {otherServices.map((item: string, index: number) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <span className="text-purple-400 mr-2 mt-0.5 flex-shrink-0">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-300 whitespace-pre-line">{provider.details}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Admin Actions */}
          <div className="space-y-6">
            {/* Admin Actions Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Admin Actions
              </h2>
              
              <div className="space-y-4">
                {/* Notification Button - Always visible */}
                <button
                  onClick={() => setShowNotifyModal(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-purple-900/30 text-purple-300 hover:bg-purple-900/40 border border-purple-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  Send Notification (No Status Change)
                </button>

                {provider.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-green-900/30 text-green-300 hover:bg-green-900/40 border border-green-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {actionLoading ? 'Processing...' : 'Approve Provider'}
                    </button>

                    <div className="space-y-3">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows={3}
                      />
                      <button
                        onClick={() => handleAction('reject')}
                        disabled={actionLoading || !rejectionReason.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-red-900/30 text-red-300 hover:bg-red-900/40 border border-red-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {actionLoading ? 'Processing...' : 'Reject Provider'}
                      </button>
                    </div>
                  </>
                )}

                {provider.status === 'approved' && (
                  <div className="space-y-3">
                    <textarea
                      value={pauseReason}
                      onChange={(e) => setPauseReason(e.target.value)}
                      placeholder="Enter pause reason (optional)..."
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={2}
                    />
                    <button
                      onClick={() => handleAction('pause')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/40 border border-yellow-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {actionLoading ? 'Processing...' : 'Pause Listing'}
                    </button>
                  </div>
                )}

                {provider.status === 'pause' && (
                  <button
                    onClick={() => handleAction('resume')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-900/30 text-blue-300 hover:bg-blue-900/40 border border-blue-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {actionLoading ? 'Processing...' : 'Resume Listing'}
                  </button>
                )}

                {/* Delete Button - Always visible except for deleted providers */}
                {provider.status !== 'deleted' && (
                  <button
                    onClick={() => handleAction('delete')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-red-900/30 text-red-300 hover:bg-red-900/40 border border-red-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Delete Permanently'}
                  </button>
                )}

                <a
                  href={`/providers/${provider.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-gray-900/50 text-gray-300 hover:text-white hover:bg-gray-900 border border-gray-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  View Public Listing
                </a>
              </div>
            </div>

            {/* Status History Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Status History
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Created:</span>
                  <span className="font-medium text-white">{formatDate(provider.created_at)}</span>
                </div>
                {provider.submitted_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Submitted:</span>
                    <span className="font-medium text-white">{formatDate(provider.submitted_at)}</span>
                  </div>
                )}
                {provider.reviewed_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Reviewed:</span>
                    <span className="font-medium text-white">{formatDate(provider.reviewed_at)}</span>
                  </div>
                )}
                {provider.updated_at && provider.updated_at !== provider.created_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Last updated:</span>
                    <span className="font-medium text-white">{formatDate(provider.updated_at)}</span>
                  </div>
                )}
                {provider.rejection_reason && (
                  <div className="pt-3 border-t border-gray-700">
                    <span className="text-sm text-gray-400 block mb-2">Rejection reason:</span>
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{provider.rejection_reason}</p>
                    </div>
                  </div>
                )}
                {provider.pause_reason && (
                  <div className="pt-3 border-t border-gray-700">
                    <span className="text-sm text-gray-400 block mb-2">Pause reason:</span>
                    <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
                      <p className="text-yellow-300 text-sm">{provider.pause_reason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Quick Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{businessFeatures.length}</div>
                  <div className="text-xs text-gray-400">Features</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{accreditations.length}</div>
                  <div className="text-xs text-gray-400">Accreditations</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{socialLinks.length}</div>
                  <div className="text-xs text-gray-400">Social Links</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{serviceAreas.length}</div>
                  <div className="text-xs text-gray-400">Service Areas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}