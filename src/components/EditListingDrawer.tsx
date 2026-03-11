'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, saveProviderBusinessFeatures } from '@/lib/supabase'
import AccreditationDrawer from '@/components/AccreditationDrawer'
import ServiceAreaDrawer from '@/components/ServiceAreaDrawer'
import ServiceCategoryDrawer from '@/components/ServiceCategoryDrawer'
import FormSubmissionDrawer from '@/components/FormSubmissionDrawer'
import BusinessFeatureDrawer from '@/components/BusinessFeatureDrawer'
import SocialLinksDrawer from '@/components/SocialLinksDrawer'
import Portal from '@/components/Portal'
import ProviderForm, { ServiceCategory, SelectedAccreditation, SelectedBusinessFeature, SelectedSocialLink, ProviderFormData } from '@/components/ProviderForm'
import { 
  X, Clock, CheckCircle, XCircle, AlertCircle, Shield,
  Loader2, Save  
} from 'lucide-react'
import { useFormPersistence } from '@/hooks/useFormPersistence'

interface EditListingDrawerProps {
  isOpen: boolean
  onClose: () => void
  listingId: string
  onSuccess?: () => void
}

// Status configuration
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

export default function EditListingDrawer({ isOpen, onClose, listingId, onSuccess }: EditListingDrawerProps) {
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
  
  const [categoryError, setCategoryError] = useState<string>('')

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
  

  const checkExistingCategoryListing = useCallback(async (categoryId: string): Promise<boolean> => {
    if (!listing?.user_id || !categoryId || categoryId === listing.main_service_id) return false
    
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', listing.user_id)
      .eq('main_service_id', categoryId)
      .in('status', ['pending', 'approved', 'paused'])
      .neq('id', listing.id) // Exclude current listing
    
    return (count || 0) > 0
  }, [listing])

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

  const persistenceKey = `edit_listing_${listingId}`;

  const restoreData = useCallback((saved: any) => {
    if (saved.formData) setFormData(saved.formData);
    if (saved.selectedAccreditations) setSelectedAccreditations(saved.selectedAccreditations);
    if (saved.selectedBusinessFeatures) setSelectedBusinessFeatures(saved.selectedBusinessFeatures);
    if (saved.selectedSocialLinks) setSelectedSocialLinks(saved.selectedSocialLinks);
    if (saved.serviceAreas) setServiceAreas(saved.serviceAreas);
  }, []);

  const { clearSavedData } = useFormPersistence(
    persistenceKey,
    {
      formData,
      selectedAccreditations,
      selectedBusinessFeatures,
      selectedSocialLinks,
      serviceAreas,
      restore: restoreData
    },
    // Only enable persistence AFTER data is loaded AND we have a listing
    // This prevents it from restoring stale data during the initial load
    isOpen && !loading && !!listing && listing.id === listingId
  );

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

// Reset all state when listingId changes
useEffect(() => {
  // When listingId changes, clear all state immediately
  setLoading(true)
  setListing(null)
  setFormData({
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
  setSelectedAccreditations([])
  setSelectedBusinessFeatures([])
  setSelectedSocialLinks([])
  setServiceAreas({ primaryArea: '', additionalAreas: [] })
  setExistingBusinessName('')
  setLockedFields([])
  setError('')
  setCategoryError('')
  
  // Clear any saved data for the old listing
  clearSavedData()
}, [listingId]) // This runs whenever the listingId prop changes

  // Load all data when drawer opens
  useEffect(() => {
    if (!isOpen || !listingId) return
    
    const loadData = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

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
          
          // Load social links
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
              platform_id: item.platform_id,
              platform: item.platform,
              custom_platform_name: item.custom_platform_name,
              url: item.url,
              is_custom: item.is_custom
            }))
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
  }, [isOpen, listingId])

  useEffect(() => {
    if (!showServiceDrawer) {
      setCategoryError('')
    }
  }, [showServiceDrawer])

  const handleServiceSelect = useCallback(async (service: ServiceCategory) => {
    setCategoryError('')
    
    const hasExisting = await checkExistingCategoryListing(service.id)
    
    if (hasExisting) {
      // ===== USE EXISTING NOTIFICATION =====
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] animate-slide-in';
      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <span>⚠️</span>
          <div>
            <p class="font-semibold">Category Unavailable</p>
            <p class="text-sm opacity-90">You already have a listing in "${service.name}"</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('animate-slide-out');
        setTimeout(() => notification.remove(), 500);
      }, 6000);
      // ===== END NOTIFICATION =====
      
      return
    }    

    
    setFormData(prev => ({ 
      ...prev, 
      main_service: service.name,
      main_service_id: service.id 
    }))
    
    if (formErrors.main_service) {
      setFormErrors(prev => ({ ...prev, main_service: '' }))
    }
  }, [formErrors, checkExistingCategoryListing])

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
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[200] animate-slide-in';
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

  const handleCloseDrawer = useCallback(() => {
    setShowSubmissionDrawer(false)
    if (submissionStatus === 'success') {
      onSuccess?.()
      onClose()
    }
  }, [submissionStatus, onSuccess, onClose])

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

    if (categoryError) {
      errors.main_service = categoryError
    }
    if (!formData.experience_years.trim()) {
      errors.experience_years = 'Experience is required'
    }
    if (!serviceAreas.primaryArea.trim()) {
      errors.primaryArea = 'Primary service area is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, serviceAreas, categoryError])
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
        // Preserve the original status
        status: listing.status
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
        await supabase.from('provider_business_features').delete().eq('provider_id', listing.id)
      }
      
      // Handle social links 
      try {
        await supabase.from('provider_social_links').delete().eq('provider_id', listing.id)
        
        if (selectedSocialLinks.length > 0) {
          const socialLinksData = selectedSocialLinks.map((link, index) => {
            if (link.is_custom) {
              return {
                provider_id: listing.id,
                platform_id: null,
                custom_platform_name: link.custom_platform_name || link.platform?.name,
                url: link.url,
                display_order: index
              }
            }
            
            let platformId = null
            if (link.platform_id) {
              platformId = link.platform_id
            } else if (link.platform?.id) {
              platformId = link.platform.id
            }
            
            if (!platformId) return null
            
            return {
              provider_id: listing.id,
              platform_id: platformId,
              custom_platform_name: null,
              url: link.url,
              display_order: index
            }
          }).filter(link => link !== null)
          
          if (socialLinksData.length > 0) {
            const { error: insertError } = await supabase
              .from('provider_social_links')
              .insert(socialLinksData)
            
            if (insertError) throw insertError
          }
        }
      } catch (socialError) {
        console.error('Failed to save social links:', socialError)
        throw socialError
      }
      
      if (isMounted.current) {
        setSubmissionStatus('success')
        setSubmissionMessage('Changes Saved!')
        setSubmissionDetail('Your listing has been updated successfully!')
        clearSavedData()
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
  }, [validateForm, listing, showIncompleteFormNotification, formData, serviceAreas, selectedAccreditations, selectedBusinessFeatures, selectedSocialLinks])

  const handleDelete = useCallback(async () => {
    if (!listing) return
    if (!confirm(`Delete "${listing.business_name}"? This cannot be undone.`)) return
    
    setIsDeleting(true)
    try {
      await supabase.from('provider_accreditations').delete().eq('provider_id', listing.id)
      await supabase.from('provider_business_features').delete().eq('provider_id', listing.id)
      await supabase.from('provider_social_links').delete().eq('provider_id', listing.id)

      const { error } = await supabase.from('providers').delete().eq('id', listing.id)
      if (error) throw error
      
      onSuccess?.()
      onClose()
      
    } catch (err: any) {
      console.error('Error deleting:', err)
      if (isMounted.current) setError(err.message || 'Failed to delete listing')
    } finally {
      if (isMounted.current) setIsDeleting(false)
    }
  }, [listing, onSuccess, onClose])

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

  const statusInfo = listing ? (statusConfig[listing.status as keyof typeof statusConfig] || statusConfig.pending) : statusConfig.pending

  if (!isOpen) return null

  return (
    <Portal> 
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer - updated with proper positioning and scrolling */}
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl z-50 flex flex-col h-full">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Edit Listing</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
  
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
            </div>
          ) : listing ? (
            <>
              {listing.status === 'rejected' && listing.rejection_reason && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-300 mb-2">Rejection reason:</p>
                      <p className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg">{listing.rejection_reason}</p>
                    </div>
                  </div>
                </div>
              )}
  
              <ProviderForm
                mode="edit"
                serviceCategories={serviceCategories}
                userEmail={formData.contact_email}
                existingBusinessName={existingBusinessName}
                selectedAccreditations={selectedAccreditations}
                onAccreditationsChange={handleAccreditationsSave}
                selectedBusinessFeatures={selectedBusinessFeatures}
                onBusinessFeaturesChange={handleBusinessFeaturesSave}
                selectedSocialLinks={selectedSocialLinks}
                onSocialLinksChange={handleSocialLinksSave}
                serviceAreas={serviceAreas}
                onServiceAreasChange={handleServiceAreasChange}
                formData={formData}
                onFormChange={setFormData}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                onOpenServiceDrawer={handleOpenServiceDrawer}
                onOpenAreaDrawer={handleOpenAreaDrawer}
                onOpenAccreditationDrawer={handleOpenAccreditationDrawer}
                onOpenBusinessFeatureDrawer={handleOpenBusinessFeatureDrawer}
                onOpenSocialLinksDrawer={handleOpenSocialLinksDrawer}
                statusInfo={statusInfo}
                disabledFields={[...lockedFields, ...(listing?.status === 'deleted' ? ['all'] as const : [])]}
              />
  
              {/* Form Actions - inside scrollable area */}
              <div className="pt-6 border-t border-gray-700 mt-10 pb-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                    Your changes have been saved. The listing status remains as set by the admin.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
  type="button"
  onClick={() => {
    clearSavedData() // Clear saved form data
    onClose()
  }}
  className="w-full sm:w-auto px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
>
  Cancel
</button>
                    
                    <button
                      type="button"
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
            </>
          ) : null}
        </div>
      </div>
  
      {/* Nested Drawers - these will appear above the main drawer */}
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
        </Portal>
  )
}