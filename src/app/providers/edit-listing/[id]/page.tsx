// File: src/app/providers/edit-listings/[id]/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, saveProviderBusinessFeatures } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import AccreditationDrawer from '@/components/AccreditationDrawer'
import ServiceAreaDrawer from '@/components/ServiceAreaDrawer'
import ServiceCategoryDrawer from '@/components/ServiceCategoryDrawer'
import FormSubmissionDrawer from '@/components/FormSubmissionDrawer'
import BusinessFeatureDrawer from '@/components/BusinessFeatureDrawer'
import SocialLinksDrawer from '@/components/SocialLinksDrawer'
import ProviderForm, { ServiceCategory, SelectedAccreditation, SelectedBusinessFeature, SelectedSocialLink, ProviderFormData } from '@/components/ProviderForm'
import { 
  ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Shield,
  Loader2, Save  
} from 'lucide-react'

// Status configuration - defined outside component to prevent recreation
const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    label: 'Pending Review'
  },
  approved: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    label: 'Approved'
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    label: 'Rejected'
  },
  paused: {
    icon: AlertCircle,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    label: 'Paused'
  },
  suspended: {
    icon: Shield,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    label: 'Suspended'
  },
  deleted: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-600/10',
    borderColor: 'border-red-600/20',
    label: 'Deleted'
  }
}

function EditListingContent() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string
  
  // Refs to track mounted state and prevent updates after unmount
  const isMounted = useRef(true)
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  
  // Submission drawer state
  const [showSubmissionDrawer, setShowSubmissionDrawer] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'submitting' | 'success' | 'error'>('submitting')
  const [submissionMessage, setSubmissionMessage] = useState('')
  const [submissionDetail, setSubmissionDetail] = useState('')
  
  // Drawer states
  const [showServiceDrawer, setShowServiceDrawer] = useState(false)
  const [showServiceAreaDrawer, setShowServiceAreaDrawer] = useState(false)
  const [showAccreditationDrawer, setShowAccreditationDrawer] = useState(false)
  const [showBusinessFeatureDrawer, setShowBusinessFeatureDrawer] = useState(false)
  const [showSocialLinksDrawer, setShowSocialLinksDrawer] = useState(false)
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Dynamic data
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  
  // Existing data
  const [listing, setListing] = useState<any>(null)
  const [selectedAccreditations, setSelectedAccreditations] = useState<SelectedAccreditation[]>([])
  const [selectedBusinessFeatures, setSelectedBusinessFeatures] = useState<SelectedBusinessFeature[]>([])
  const [selectedSocialLinks, setSelectedSocialLinks] = useState<SelectedSocialLink[]>([])
  const [serviceAreas, setServiceAreas] = useState<{
    primaryArea: string;
    additionalAreas: string[];
  }>({
    primaryArea: '',
    additionalAreas: []
  })
  
  // Locked fields state
  const [existingBusinessName, setExistingBusinessName] = useState<string>('')
  const [lockedFields, setLockedFields] = useState<string[]>([])
  
  // Form state
  const [formData, setFormData] = useState<ProviderFormData>({
    business_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    alternate_phone: '',
    primary_has_whatsapp: false,
    alternate_has_whatsapp: false,
    main_service: '',
    main_service_id: '',
    details: '',
    experience_years: '',
    fees_pricing: '',
    status: ''
  })

  // Track mounted state
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Add CSS to prevent scroll on focus
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      input:focus, 
      textarea:focus, 
      select:focus, 
      button:focus {
        scroll-margin: 0px !important;
        scroll-margin-top: 0px !important;
        scroll-margin-bottom: 0px !important;
      }
      
      html {
        overflow-anchor: none;
      }
      
      * {
        scroll-behavior: auto !important;
      }
      
      .no-scroll-jump {
        contain: content;
      }
    `
    document.head.appendChild(styleElement)
    
    return () => {
      document.head.removeChild(styleElement)
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [])

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/')
          return
        }

        const { data: listingData, error: listingError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', listingId)
          .eq('user_id', session.user.id)
          .single()
        
        if (listingError || !listingData) {
          if (isMounted.current) setError('Listing not found')
          return
        }
        
        if (isMounted.current) {
          setListing(listingData)
          
          // Business name should ALWAYS be locked, just like email
          setExistingBusinessName(listingData.business_name)
          setLockedFields(['business_name', 'contact_email'])
          
          // Parse service areas
          let parsedServiceAreas: string[] = []
          try {
            if (listingData.service_areas) {
              parsedServiceAreas = JSON.parse(listingData.service_areas)
            }
          } catch (e) {
            console.error('Error parsing service areas:', e)
          }
          
          setFormData({
            business_name: listingData.business_name || '',
            contact_person: listingData.contact_person || '',
            contact_email: listingData.contact_email || '',
            contact_phone: listingData.contact_phone || '',
            alternate_phone: listingData.alternate_phone || '',
            primary_has_whatsapp: listingData.primary_has_whatsapp || false,
            alternate_has_whatsapp: listingData.alternate_has_whatsapp || false,
            main_service: listingData.main_service || '',
            main_service_id: listingData.main_service_id || '',
            details: listingData.details || '',
            experience_years: listingData.experience_years || '',
            fees_pricing: listingData.fees_pricing || '',
            status: listingData.status || ''
          })
          
          if (parsedServiceAreas.length > 0) {
            setServiceAreas({
              primaryArea: parsedServiceAreas[0] || '',
              additionalAreas: parsedServiceAreas.slice(1) || []
            })
          }
          
          // Load accreditations
          const { data: accreditationsData } = await supabase
            .from('provider_accreditations')
            .select('*')
            .eq('provider_id', listingId)
            .order('position')
          
          if (accreditationsData) {
            const formattedAccreditations: SelectedAccreditation[] = accreditationsData.map(acc => ({
              id: acc.id || `temp-${Date.now()}`,
              accreditation_id: acc.accreditation_id || undefined,
              custom_name: acc.custom_name || undefined,
              custom_description: acc.custom_description || undefined,
              is_custom: acc.is_custom || false,
              position: acc.position || 0
            }))
            setSelectedAccreditations(formattedAccreditations)
          }

          // Load business features
          const { data: featuresData } = await supabase
            .from('provider_business_features')
            .select(`
              *,
              feature:business_features(*)
            `)
            .eq('provider_id', listingId)
            .order('position')
          
          if (featuresData) {
            const formattedFeatures: SelectedBusinessFeature[] = featuresData.map(item => ({
              id: item.id,
              feature_id: item.feature_id,
              feature: item.feature,
              custom_name: item.custom_name,
              custom_description: item.custom_description,
              is_custom: item.is_custom,
              position: item.position
            }))
            setSelectedBusinessFeatures(formattedFeatures)
          }
          
// Load social links - FIXED
const { data: socialLinksData } = await supabase
  .from('provider_social_links')
  .select(`
    *,
    platform:social_platforms(*)
  `)
  .eq('provider_id', listingId)
  .order('display_order')

if (socialLinksData) {
  const formattedLinks: SelectedSocialLink[] = socialLinksData.map(item => ({
    id: item.id,
    platform_id: item.platform_id, // CRITICAL: store this separately
    platform: item.platform,
    custom_platform_name: item.custom_platform_name,
    url: item.url,
    is_custom: item.is_custom
  }))
  console.log('Loaded social links:', formattedLinks) // Debug log
  setSelectedSocialLinks(formattedLinks)
}          
          const { data: servicesData } = await supabase
            .from('service_categories')
            .select('id, name, description, icon')
            .eq('is_active', true)
            .order('name')
          setServiceCategories(servicesData || [])
        }
        
      } catch (err: any) {
        console.error('Error loading listing:', err)
        if (isMounted.current) setError(err.message || 'Failed to load listing')
      } finally {
        if (isMounted.current) setLoading(false)
      }
    }
    
    loadData()
  }, [router, listingId])

  // Memoized handlers - all useCallback with empty deps where possible
  const handleServiceSelect = useCallback((service: ServiceCategory) => {
    setFormData(prev => ({ 
      ...prev, 
      main_service: service.name,
      main_service_id: service.id 
    }))
    if (formErrors.main_service) {
      setFormErrors(prev => ({ ...prev, main_service: '' }))
    }
  }, [formErrors])

  const handleAccreditationsSave = useCallback((accreditations: SelectedAccreditation[]) => {
    setSelectedAccreditations(accreditations)
  }, [])

  const handleBusinessFeaturesSave = useCallback((features: SelectedBusinessFeature[]) => {
    setSelectedBusinessFeatures(features)
    if (formErrors.business_features) {
      setFormErrors(prev => ({ ...prev, business_features: '' }))
    }
  }, [formErrors])

  const handleSocialLinksSave = useCallback((links: SelectedSocialLink[]) => {
    setSelectedSocialLinks(links)
  }, [])

  const handleServiceAreaDrawerSave = useCallback((areas: string[]) => {
    setServiceAreas({
      primaryArea: areas[0] || '',
      additionalAreas: areas.slice(1) || []
    })
    if (formErrors.primaryArea) {
      setFormErrors(prev => ({ ...prev, primaryArea: '' }))
    }
  }, [formErrors])

  const handleServiceAreasChange = useCallback((areas: { primaryArea: string; additionalAreas: string[] }) => {
    setServiceAreas(areas)
    if (formErrors.primaryArea) {
      setFormErrors(prev => ({ ...prev, primaryArea: '' }))
    }
  }, [formErrors])

  const showIncompleteFormNotification = useCallback(() => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <span>⚠️</span>
        <div>
          <p class="font-semibold">Incomplete Form</p>
          <p class="text-sm opacity-90">Please fill in all required fields</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-slide-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }, []);

  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/providers/dashboard')
    }
  }, [router])

  const handleCloseDrawer = useCallback(() => {
    setShowSubmissionDrawer(false)
    if (submissionStatus === 'success') {
      router.push('/providers/dashboard')
    }
  }, [submissionStatus, router])

  const handleRetry = useCallback(() => {
    setShowSubmissionDrawer(false)
    handleSubmit(new Event('submit') as any)
  }, [])

  // Validate form
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}
    
    if (!formData.business_name.trim()) {
      errors.business_name = 'Business name is required'
    }
    if (!formData.contact_person.trim()) {
      errors.contact_person = 'Contact person is required'
    }
    if (!formData.contact_phone.trim()) {
      errors.contact_phone = 'Phone number is required'
    }
    if (!formData.main_service.trim()) {
      errors.main_service = 'Main service is required'
    }
    if (!formData.experience_years.trim()) {
      errors.experience_years = 'Experience is required'
    }
    if (!serviceAreas.primaryArea.trim()) {
      errors.primaryArea = 'Primary service area is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, serviceAreas])

  // Send email notifications
  const sendEmailNotifications = useCallback(async (providerId: string, businessName: string, newStatus: string, userEmail: string) => {
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'listing_updated',
          providerId,
          businessName,
          status: newStatus,
          recipientEmail: userEmail,
          recipientType: 'provider'
        })
      })

      if (newStatus === 'pending') {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'listing_updated',
            providerId,
            businessName,
            status: newStatus,
            recipientType: 'admin',
            recipientEmail: 'admin@findapro.co.za'
          })
        })
      }
    } catch (emailError: any) {
      console.log('Email notification failed:', emailError.message)
    }
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!validateForm() || !listing) {
      showIncompleteFormNotification()
      return
    }
    
    setSubmissionStatus('submitting')
    setSubmissionMessage('Saving your changes...')
    setSubmissionDetail('Please wait while we update your listing')
    setShowSubmissionDrawer(true)
    setIsSubmitting(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please log in')
      
      const updateData: any = {
        business_name: formData.business_name,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        alternate_phone: formData.alternate_phone,
        primary_has_whatsapp: formData.primary_has_whatsapp || false,
        alternate_has_whatsapp: formData.alternate_has_whatsapp || false,
        main_service: formData.main_service,
        main_service_id: formData.main_service_id,
        details: formData.details,
        experience_years: formData.experience_years,
        service_areas: JSON.stringify([serviceAreas.primaryArea, ...(serviceAreas.additionalAreas || [])]),
        fees_pricing: formData.fees_pricing || null,
        updated_at: new Date().toISOString(),
      }
      
      // Initialize with current status or fallback to 'pending'
      let newStatus: string = formData.status || listing.status || 'pending'
      
      if (formData.status === 'approved') {
        updateData.status = 'pending'
        newStatus = 'pending'
      } else if (formData.status === 'rejected') {
        updateData.status = 'rejected'
        newStatus = 'rejected'
      } else {
        updateData.status = newStatus // Keep existing status
      }
      
      const { error: updateError } = await supabase
        .from('providers')
        .update(updateData)
        .eq('id', listing.id)
        .eq('user_id', user.id)
      
      if (updateError) throw updateError
      
      // Handle accreditations
      await supabase.from('provider_accreditations').delete().eq('provider_id', listing.id)
      
      if (selectedAccreditations.length > 0) {
        const accreditationsData = selectedAccreditations.map((acc, index) => ({
          provider_id: listing.id,
          accreditation_id: acc.is_custom ? null : acc.accreditation_id,
          custom_name: acc.is_custom ? acc.custom_name : null,
          custom_description: acc.custom_description,
          is_custom: acc.is_custom,
          position: index,
          is_verified: false
        }))
        
        await supabase.from('provider_accreditations').insert(accreditationsData)
      }

      // Handle business features
      if (selectedBusinessFeatures.length > 0) {
        await saveProviderBusinessFeatures(listing.id, selectedBusinessFeatures)
      } else {
        // Delete all features if none selected
        await supabase.from('provider_business_features').delete().eq('provider_id', listing.id)
      }
      
 // Handle social links - FIXED (removed is_custom from insert)
try {
  // Always delete existing links first
  const { error: deleteError } = await supabase
    .from('provider_social_links')
    .delete()
    .eq('provider_id', listing.id)
  
  if (deleteError) {
    console.error('Error deleting existing social links:', deleteError)
    throw deleteError
  }
  
  // Insert new links if any exist
  if (selectedSocialLinks.length > 0) {
    console.log('Saving social links:', selectedSocialLinks) // Debug log
    
    // Prepare data for insertion - WITHOUT is_custom field
    const socialLinksData = selectedSocialLinks.map((link, index) => {
      // Handle custom links
      if (link.is_custom) {
        return {
          provider_id: listing.id,
          platform_id: null,
          custom_platform_name: link.custom_platform_name || link.platform?.name,
          url: link.url,
          display_order: index
          // REMOVED: is_custom: true
        }
      }
      
      // Handle predefined platform links - get platform_id from various possible locations
      let platformId = null
      
      if (link.platform_id) {
        // Direct platform_id
        platformId = link.platform_id
      } else if (link.platform?.id) {
        // From nested platform object
        platformId = link.platform.id
      }
      
      if (!platformId) {
        console.error('Missing platform_id for non-custom link:', link)
        return null // Skip invalid links
      }
      
      return {
        provider_id: listing.id,
        platform_id: platformId,
        custom_platform_name: null,
        url: link.url,
        display_order: index
        // REMOVED: is_custom: false
      }
    }).filter(link => link !== null) // Remove any invalid links
    
    console.log('Formatted social links data:', socialLinksData) // Debug log
    
    if (socialLinksData.length > 0) {
      const { error: insertError } = await supabase
        .from('provider_social_links')
        .insert(socialLinksData)
      
      if (insertError) {
        console.error('Error inserting social links:', insertError)
        throw insertError
      }
      
      console.log(`✅ Successfully saved ${socialLinksData.length} social links`)
    }
  }
} catch (socialError) {
  console.error('Failed to save social links:', socialError)
  throw socialError // This will trigger the error state in the submission drawer
}
      await sendEmailNotifications(
        listing.id,
        formData.business_name,
        newStatus,
        formData.contact_email || user.email || ''
      )
      
      if (isMounted.current) {
        setSubmissionStatus('success')
        setSubmissionMessage('Changes Saved!')
        setSubmissionDetail(
          newStatus === 'pending' 
            ? 'Your changes have been submitted for review.'
            : 'Changes saved successfully!'
        )
      }
      
    } catch (err: any) {
      console.error('Error:', err)
      if (isMounted.current) {
        setSubmissionStatus('error')
        setSubmissionMessage('Update Failed')
        setSubmissionDetail(err.message || 'Failed to update listing')
      }
    } finally {
      if (isMounted.current) setIsSubmitting(false)
    }
  }, [validateForm, listing, showIncompleteFormNotification, formData, serviceAreas, selectedAccreditations, selectedBusinessFeatures, selectedSocialLinks, sendEmailNotifications])

  const handleDelete = useCallback(async () => {
    if (!listing) return
    if (!confirm(`Delete "${listing.business_name}"? This cannot be undone.`)) return
    
    setIsDeleting(true)
    try {
      // First delete related records
      await supabase.from('provider_accreditations').delete().eq('provider_id', listing.id)
      await supabase.from('provider_business_features').delete().eq('provider_id', listing.id)
      await supabase.from('provider_social_links').delete().eq('provider_id', listing.id)

      // Then delete the provider
      const { error } = await supabase.from('providers').delete().eq('id', listing.id)
      if (error) throw error
      
      router.push('/providers/dashboard')
    } catch (err: any) {
      console.error('Error deleting:', err)
      if (isMounted.current) setError(err.message || 'Failed to delete listing')
    } finally {
      if (isMounted.current) setIsDeleting(false)
    }
  }, [listing, router])

  // Memoized drawer handlers - stable references
  const handleOpenServiceDrawer = useCallback(() => setShowServiceDrawer(true), [])
  const handleOpenAreaDrawer = useCallback(() => setShowServiceAreaDrawer(true), [])
  const handleOpenAccreditationDrawer = useCallback(() => setShowAccreditationDrawer(true), [])
  const handleOpenBusinessFeatureDrawer = useCallback(() => setShowBusinessFeatureDrawer(true), [])
  const handleOpenSocialLinksDrawer = useCallback(() => setShowSocialLinksDrawer(true), [])

  const handleCloseServiceDrawer = useCallback(() => setShowServiceDrawer(false), [])
  const handleCloseAreaDrawer = useCallback(() => setShowServiceAreaDrawer(false), [])
  const handleCloseAccreditationDrawer = useCallback(() => setShowAccreditationDrawer(false), [])
  const handleCloseBusinessFeatureDrawer = useCallback(() => setShowBusinessFeatureDrawer(false), [])
  const handleCloseSocialLinksDrawer = useCallback(() => setShowSocialLinksDrawer(false), [])

  // Get status info - moved BEFORE formProps
  const statusInfo = listing ? (statusConfig[listing.status as keyof typeof statusConfig] || statusConfig.pending) : statusConfig.pending

  // Memoize form props to prevent re-renders
  const formProps = useMemo(() => ({
    mode: 'edit' as const,
    serviceCategories,
    userEmail: formData.contact_email,
    existingBusinessName,
    selectedAccreditations,
    onAccreditationsChange: handleAccreditationsSave,
    selectedBusinessFeatures,
    onBusinessFeaturesChange: handleBusinessFeaturesSave,
    selectedSocialLinks,
    onSocialLinksChange: handleSocialLinksSave,
    serviceAreas,
    onServiceAreasChange: handleServiceAreasChange,
    formData,
    onFormChange: setFormData,
    formErrors,
    setFormErrors,
    onOpenServiceDrawer: handleOpenServiceDrawer,
    onOpenAreaDrawer: handleOpenAreaDrawer,
    onOpenAccreditationDrawer: handleOpenAccreditationDrawer,
    onOpenBusinessFeatureDrawer: handleOpenBusinessFeatureDrawer,
    onOpenSocialLinksDrawer: handleOpenSocialLinksDrawer,
    statusInfo,
    disabledFields: [...lockedFields, ...(listing?.status === 'deleted' ? ['all'] as const : [])]
  }), [
    serviceCategories,
    formData.contact_email,
    existingBusinessName,
    selectedAccreditations,
    selectedBusinessFeatures,
    selectedSocialLinks,
    serviceAreas,
    formData,
    formErrors,
    statusInfo,
    lockedFields,
    listing?.status,
    handleAccreditationsSave,
    handleBusinessFeaturesSave,
    handleSocialLinksSave,
    handleServiceAreasChange,
    handleOpenServiceDrawer,
    handleOpenAreaDrawer,
    handleOpenAccreditationDrawer,
    handleOpenBusinessFeatureDrawer,
    handleOpenSocialLinksDrawer
  ])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-20 sm:pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link href="/providers/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
            
            <div className="bg-gradient-to-b from-red-500/5 to-transparent border border-red-500/20 rounded-2xl p-6 sm:p-8 text-center">
              <AlertCircle className="w-12 sm:w-16 h-12 sm:h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Error</h1>
              <p className="text-sm sm:text-base text-gray-300 mb-6">{error}</p>
              <Link href="/providers/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-medium">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-4 sm:py-6 px-3 sm:px-4 pt-20 sm:pt-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
            <div>
              <div className="mb-4">
                <Link href="/providers/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Edit Listing</h1>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor} w-fit`}>
                  {statusInfo.icon && <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />}
                  <span className={`text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-gray-400">Update your service listing information</p>
            </div>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`w-full sm:w-auto px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Listing'
              )}
            </button>
          </div>

          {listing.status === 'rejected' && listing.rejection_reason && (
            <div className="mb-6 sm:mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-300 mb-2">Rejection reason:</p>
                  <p className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg">{listing.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-700 mb-6 no-scroll-jump">
          <ProviderForm {...formProps} />
          
          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-700 mt-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                {formData.status === 'rejected' 
                  ? 'Save changes, then resubmit for review from the dashboard'
                  : formData.status === 'approved'
                  ? 'Changes will reset your listing status to "Pending Review"'
                  : 'Your changes will be reviewed by our team'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <ServiceCategoryDrawer
        isOpen={showServiceDrawer}
        onClose={handleCloseServiceDrawer}
        serviceCategories={serviceCategories}
        selectedCategoryId={formData.main_service_id}
        onSelect={handleServiceSelect}
        title="Select Service Category"
      />

      <AccreditationDrawer
        isOpen={showAccreditationDrawer}
        onClose={handleCloseAccreditationDrawer}
        providerId={listing?.id || "temp"}
        initialSelection={selectedAccreditations}
        onSave={handleAccreditationsSave}
        maxSelection={10}
        serviceCategoryId={formData.main_service_id}
      />

      <BusinessFeatureDrawer
        isOpen={showBusinessFeatureDrawer}
        onClose={handleCloseBusinessFeatureDrawer}
        providerId={listing?.id || "new"}
        initialSelection={selectedBusinessFeatures}
        onSave={handleBusinessFeaturesSave}
        maxSelection={10}
      />

      <SocialLinksDrawer
        isOpen={showSocialLinksDrawer}
        onClose={handleCloseSocialLinksDrawer}
        providerId={listing?.id || "new"}
        initialLinks={selectedSocialLinks}
        onSave={handleSocialLinksSave}
        maxLinks={4}
      />

      <ServiceAreaDrawer
        isOpen={showServiceAreaDrawer}
        onClose={handleCloseAreaDrawer}
        initialAreas={serviceAreas.primaryArea ? 
          [serviceAreas.primaryArea, ...(serviceAreas.additionalAreas || [])] : []}
        onSave={handleServiceAreaDrawerSave} 
        maxAreas={10}
      />

      <FormSubmissionDrawer
        isOpen={showSubmissionDrawer}
        status={submissionStatus}
        message={submissionMessage}
        detail={submissionDetail}
        onClose={handleCloseDrawer}
        onRetry={handleRetry}
        disableClose={submissionStatus === 'submitting'}
      />
    </div>
  )
}

export default function EditListingPage() {
  return (
    <ProtectedRoute>
      <EditListingContent />
    </ProtectedRoute>
  )
}