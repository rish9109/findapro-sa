'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, saveProviderBusinessFeatures } from '@/lib/supabase'
import AccreditationDrawer from '@/components/AccreditationDrawer'
import ServiceAreaDrawer from '@/components/ServiceAreaDrawer'
import ServiceCategoryDrawer from '@/components/ServiceCategoryDrawer'
import FormSubmissionDrawer from '@/components/FormSubmissionDrawer'
import BusinessFeatureDrawer from '@/components/BusinessFeatureDrawer'
import SocialLinksDrawer from '@/components/SocialLinksDrawer'
import Portal from '@/components/Portal'
import ProviderForm, { ServiceCategory, SelectedAccreditation, SelectedBusinessFeature, SelectedSocialLink, ProviderFormData } from '@/components/ProviderForm'
import { X, Save, Loader2, ArrowLeft } from 'lucide-react'
import { useFormPersistence } from '@/hooks/useFormPersistence'

interface NewListingDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function NewListingDrawer({ isOpen, onClose, onSuccess }: NewListingDrawerProps) {
  const router = useRouter()
  const isMounted = useRef(true)
  
  // Refs for scroll position tracking
  const scrollPositionRef = useRef(0)
  const hasSubmitted = useRef(false)
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  
  // Drawer states
  const [showServiceDrawer, setShowServiceDrawer] = useState(false)
  const [showServiceAreaDrawer, setShowServiceAreaDrawer] = useState(false)
  const [showAccreditationDrawer, setShowAccreditationDrawer] = useState(false)
  const [showBusinessFeatureDrawer, setShowBusinessFeatureDrawer] = useState(false)
  const [showSocialLinksDrawer, setShowSocialLinksDrawer] = useState(false)
  
  // Submission drawer state
  const [showSubmissionDrawer, setShowSubmissionDrawer] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'submitting' | 'success' | 'error'>('submitting')
  const [submissionMessage, setSubmissionMessage] = useState('')
  const [submissionDetail, setSubmissionDetail] = useState('')
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Dynamic data
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  
  // User data
  const [existingListingsCount, setExistingListingsCount] = useState(0)
  const [userId, setUserId] = useState<string>('')
  const [existingBusinessName, setExistingBusinessName] = useState('')
  
  // Selection states
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
    accept_terms: false
  })


  const persistenceKey = `new_listing_${userId || 'temp'}`;

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
    isOpen && !loadingData && !hasSubmitted.current
  );

  // Track mounted state
  useEffect(() => {
    isMounted.current = true
    hasSubmitted.current = false
    return () => {
      isMounted.current = false
    }
  }, [])

  // Track scroll position only when not submitting
  useEffect(() => {
    const handleScroll = () => {
      if (!loading && !showSubmissionDrawer && !hasSubmitted.current) {
        scrollPositionRef.current = window.scrollY
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [loading, showSubmissionDrawer])

  // Add CSS to prevent scroll on focus and maintain scroll position
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
      
      .form-field-container {
        min-height: 80px;
        contain: layout;
      }
      
      .preview-section {
        min-height: 60px;
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

  // Fetch all initial data when drawer opens
  useEffect(() => {
    if (!isOpen) return
    
    const fetchInitialData = async () => {
      try {
        setLoadingData(true)
        
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUserId(session.user.id)
          setUserEmail(session.user.email || '')
          setFormData(prev => ({ ...prev, contact_email: session.user.email || '' }))
          
          const { data: existingListings } = await supabase
            .from('providers')
            .select('business_name')
            .eq('user_id', session.user.id)
          
          if (existingListings && existingListings.length > 0) {
            setExistingListingsCount(existingListings.length)
            
            if (existingListings[0]?.business_name) {
              setExistingBusinessName(existingListings[0].business_name)
              setFormData(prev => ({ 
                ...prev, 
                business_name: existingListings[0].business_name 
              }))
            }
            
            if (existingListings.length >= 3) {
              alert('You have reached the maximum limit of 3 listings.')
              onClose()
              router.push('/providers/dashboard')
            }
          }
        }
        
        const { data: servicesData } = await supabase
          .from('service_categories')
          .select('id, name, description, icon')
          .eq('is_active', true)
          .order('name')
        setServiceCategories(servicesData || [])
        
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        if (isMounted.current) setLoadingData(false)
      }
    }
    
    fetchInitialData()
  }, [isOpen, router, onClose])

  // Check listing limit
  const checkListingLimit = async () => {
    if (!userId) return false
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    return (count || 0) < 3
  }

  // Get existing logo URL
  const getExistingLogoUrl = async (userId: string): Promise<string | null> => {
    try {
      const { data } = await supabase
        .from('providers')
        .select('logo_url')
        .eq('user_id', userId)
        .not('logo_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
      return data?.[0]?.logo_url || null
    } catch {
      return null
    }
  }

  // Update user to provider status
  const updateUserToProvider = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      if (user.user_metadata?.is_provider) return true
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          is_provider: true,
          became_provider_at: new Date().toISOString()
        }
      })
      return !error
    } catch {
      return false
    }
  }

  // Drawer handlers
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

  // Selection handlers
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

  // Handler for ServiceAreaDrawer (expects string array)
  const handleServiceAreaDrawerSave = useCallback((areas: string[]) => {
    setServiceAreas({
      primaryArea: areas[0] || '',
      additionalAreas: areas.slice(1) || []
    })
    if (formErrors.primaryArea) {
      setFormErrors(prev => ({ ...prev, primaryArea: '' }))
    }
  }, [formErrors])

  // Handler for ProviderForm (expects object with primaryArea/additionalAreas)
  const handleServiceAreasChange = useCallback((areas: { primaryArea: string; additionalAreas: string[] }) => {
    setServiceAreas(areas)
    if (formErrors.primaryArea) {
      setFormErrors(prev => ({ ...prev, primaryArea: '' }))
    }
  }, [formErrors])

  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      clearSavedData() // Clear saved form data
      onClose()
    }
  }, [onClose, clearSavedData])

  const handleCloseDrawer = useCallback(() => {
    setShowSubmissionDrawer(false)
    hasSubmitted.current = false
    if (submissionStatus === 'success') {
      onSuccess?.()
      onClose()
    }
  }, [submissionStatus, onSuccess, onClose])

  const handleRetry = useCallback(() => {
    setShowSubmissionDrawer(false)
    hasSubmitted.current = false
    handleSubmit(new Event('submit') as any)
  }, [])

  // Validate form
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}
    
    if (!formData.business_name.trim() && !existingBusinessName) {
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
    if (!formData.accept_terms) {
      errors.accept_terms = 'You must accept the terms'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, existingBusinessName, serviceAreas])

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
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!validateForm()) {
      showIncompleteFormNotification()
      return
    }
    
    const canCreate = await checkListingLimit()
    if (!canCreate) {
      alert('Maximum 3 listings reached.')
      onClose()
      router.push('/providers/dashboard')
      return
    }
    
    // Mark that we've submitted - this will stop scroll tracking
    hasSubmitted.current = true
    
    setSubmissionStatus('submitting')
    setSubmissionMessage('Creating your listing...')
    setSubmissionDetail('Please wait while we save your information')
    setShowSubmissionDrawer(true)
    setLoading(true)
    
    // Allow the page to scroll to top naturally
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Please log in')
      
      const existingLogoUrl = await getExistingLogoUrl(user.id)
      await updateUserToProvider()
      
      const businessNameToUse = existingBusinessName || formData.business_name
      
      const providerData = {
        user_id: user.id,
        business_name: businessNameToUse,
        logo_url: existingLogoUrl,
        contact_person: formData.contact_person,
        contact_email: userEmail,
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
        status: 'pending',
        created_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        launch_trial: true,
      }
      
      const { data, error } = await supabase
        .from('providers')
        .insert([providerData])
        .select()
        .single()
      
      if (error) throw error
      
      if (selectedAccreditations.length > 0) {
        const accreditationsData = selectedAccreditations.map((acc, index) => ({
          provider_id: data.id,
          accreditation_id: acc.is_custom ? null : acc.accreditation_id,
          custom_name: acc.is_custom ? acc.custom_name : null,
          custom_description: acc.custom_description,
          is_custom: acc.is_custom,
          position: index,
          is_verified: false
        }))
        
        await supabase.from('provider_accreditations').insert(accreditationsData)
      }
      
      // Save business features (optional)
      if (selectedBusinessFeatures.length > 0) {
        await saveProviderBusinessFeatures(data.id, selectedBusinessFeatures)
      }
      
      // Save social links
      if (selectedSocialLinks.length > 0 && data?.id) {
        const socialLinksData = selectedSocialLinks.map((link, index) => ({
          provider_id: data.id,
          platform_id: link.is_custom ? null : link.platform_id,
          custom_platform_name: link.is_custom ? link.custom_platform_name : null,
          url: link.url,
          display_order: index
        }))
        
        const { error: socialError } = await supabase
          .from('provider_social_links')
          .insert(socialLinksData)
        
        if (socialError) {
          console.error('Error saving social links:', socialError)
          // Don't throw - still want to show success for the main listing
        }
      }
      
      // Send notification (non-blocking)
      console.log('📤 Attempting to send email for:', data.business_name, 'Email:', data.contact_email)
      
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event: 'new_listing', 
          provider: data,
          launchTrial: true 
        })
      })
      .then(async response => {
        const result = await response.json()
        if (response.ok) {
          console.log('✅ Email sent successfully:', {
            requestId: result.requestId,
            adminEmail: result.data?.adminEmail,
            providerEmail: result.data?.providerEmail
          })
        } else {
          console.error('❌ Email API returned error:', result)
        }
        return result
      })
      .catch((error) => {
        console.error('❌ Email notification network error:', error.message)
      })
      
      if (isMounted.current) {
        setSubmissionStatus('success')
        setSubmissionMessage('Listing Created!')
        setSubmissionDetail('Your service listing has been submitted successfully.')
        clearSavedData()
      }
      
    } catch (error: any) {
      console.error('Error:', error)
      if (isMounted.current) {
        setSubmissionStatus('error')
        setSubmissionMessage('Submission Failed')
        setSubmissionDetail(error.message || 'Failed to submit form')
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [validateForm, existingBusinessName, formData, userEmail, serviceAreas, selectedAccreditations, selectedBusinessFeatures, selectedSocialLinks, showIncompleteFormNotification, router, onClose])

  if (!isOpen) return null

  return (
    <Portal>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl z-50 flex flex-col h-full">

{/* Sticky Header */}
<div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center justify-between z-10 flex-shrink-0">
  <div className="flex items-center gap-1 sm:gap-4 min-w-0 flex-1">
 
    <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white whitespace-nowrap">
      Create Service Listing
    </h2>
  </div>

</div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Listings counter */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 max-w-xs mx-auto mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Your Listings:</span>
                  <span className="text-white font-bold">{existingListingsCount}/3</span>
                </div>
                <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all"
                    style={{ width: `${(existingListingsCount / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Logo notification */}
              {existingListingsCount > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400 text-sm">ⓘ</span>
                    </div>
                    <div>
                      <p className="text-sm text-orange-300 font-medium mb-1">Logo Notice</p>
                      <p className="text-xs text-orange-400/80">
                        Your business logo (if uploaded) will automatically appear on this new listing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Form */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-700 mb-6">
                <ProviderForm
                  mode="create"
                  serviceCategories={serviceCategories}
                  userEmail={userEmail}
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
                  disabledFields={existingBusinessName ? ['business_name'] : []}
                />
                
                {/* Form Actions */}
                <div className="pt-6 border-t border-gray-700 mt-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                      Your listing will be reviewed by our team within 24-48 hours
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
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          loading
                            ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                            : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white hover:shadow-lg'
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Create Listing</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nested Drawers */}
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
        providerId="temp"
        initialSelection={selectedAccreditations}
        onSave={handleAccreditationsSave}
        maxSelection={10}
        serviceCategoryId={formData.main_service_id}
      />

      <BusinessFeatureDrawer
        isOpen={showBusinessFeatureDrawer}
        onClose={handleCloseBusinessFeatureDrawer}
        providerId="new"
        initialSelection={selectedBusinessFeatures}
        onSave={handleBusinessFeaturesSave}
        maxSelection={10}
      />

      <SocialLinksDrawer
        isOpen={showSocialLinksDrawer}
        onClose={handleCloseSocialLinksDrawer}
        providerId="temp"
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
        maxAreas={20}
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