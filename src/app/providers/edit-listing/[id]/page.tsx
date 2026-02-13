// edit-listings/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Provider } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import AccreditationDrawer from '@/components/AccreditationDrawer'
import ServiceAreaDrawer from '@/components/ServiceAreaDrawer'
import ServiceCategoryDrawer from '@/components/ServiceCategoryDrawer'
import FormSubmissionDrawer from '@/components/FormSubmissionDrawer'
import ProviderForm, { ServiceCategory, SelectedAccreditation, ProviderFormData } from '@/components/ProviderForm'
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Loader2
} from 'lucide-react'

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

function EditListingContent() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Dynamic data
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  
  // Existing data
  const [listing, setListing] = useState<Provider | null>(null)
  const [selectedAccreditations, setSelectedAccreditations] = useState<SelectedAccreditation[]>([])
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
    main_service: '',
    main_service_id: '',
    details: '',
    experience_years: '',
    fees_pricing: '',
    accepts_card: false,
    accepts_cash: true,
    deposit_required: false,
    emergency_service: false,
    callout_fee: '',
    insurance: false,
    status: ''
  })

  // Add CSS to prevent scroll on focus
  useEffect(() => {
    // Disable browser's built-in scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    
    // Add CSS to prevent scroll on focus
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
      
      /* Disable scroll anchoring */
      html {
        overflow-anchor: none;
      }
      
      /* Prevent any automatic scrolling */
      * {
        scroll-behavior: auto !important;
      }
      
      /* Ensure form container doesn't cause scroll jumps */
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
          setError('Listing not found')
          return
        }
        
        setListing(listingData)
        
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
          main_service: listingData.main_service || '',
          main_service_id: listingData.main_service_id || '',
          details: listingData.details || '',
          experience_years: listingData.experience_years || '',
          fees_pricing: listingData.fees_pricing || '',
          accepts_card: listingData.accepts_card || false,
          accepts_cash: listingData.accepts_cash ?? true,
          deposit_required: listingData.deposit_required || false,
          emergency_service: listingData.emergency_service || false,
          callout_fee: listingData.callout_fee || '',
          insurance: listingData.insurance || false,
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
        
        const { data: servicesData } = await supabase
          .from('service_categories')
          .select('id, name, description, icon')
          .eq('is_active', true)
          .order('name')
        setServiceCategories(servicesData || [])
        
      } catch (err: any) {
        console.error('Error loading listing:', err)
        setError(err.message || 'Failed to load listing')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [router, listingId])

  // Memoized handlers
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

  const handleServiceAreasSave = useCallback((areas: string[]) => {
    setServiceAreas({
      primaryArea: areas[0] || '',
      additionalAreas: areas.slice(1) || []
    })
    if (formErrors.primaryArea) {
      setFormErrors(prev => ({ ...prev, primaryArea: '' }))
    }
  }, [formErrors])

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
    if (formData.emergency_service && !formData.callout_fee.trim()) {
      errors.callout_fee = 'Emergency callout fee is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, serviceAreas])

  // Send email notifications
  const sendEmailNotifications = async (providerId: string, businessName: string, newStatus: string, userEmail: string) => {
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!validateForm() || !listing) return
    
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
        main_service: formData.main_service,
        main_service_id: formData.main_service_id,
        details: formData.details,
        experience_years: formData.experience_years,
        service_areas: JSON.stringify([serviceAreas.primaryArea, ...(serviceAreas.additionalAreas || [])]),
        fees_pricing: formData.fees_pricing || null,
        accepts_card: formData.accepts_card,
        accepts_cash: formData.accepts_cash,
        deposit_required: formData.deposit_required,
        emergency_service: formData.emergency_service,
        callout_fee: formData.emergency_service ? formData.callout_fee : null,
        insurance: formData.insurance,
        updated_at: new Date().toISOString(),
      }
      
      let newStatus = formData.status
      if (formData.status === 'approved') {
        updateData.status = 'pending'
        newStatus = 'pending'
      } else if (formData.status === 'rejected') {
        updateData.status = 'rejected'
        newStatus = 'rejected'
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
      
      await sendEmailNotifications(
        listing.id,
        formData.business_name,
        newStatus,
        formData.contact_email || user.email || ''
      )
      
      setSubmissionStatus('success')
      setSubmissionMessage('Changes Saved!')
      setSubmissionDetail(
        newStatus === 'pending' 
          ? 'Your changes have been submitted for review.'
          : 'Changes saved successfully!'
      )
      
    } catch (err: any) {
      console.error('Error:', err)
      setSubmissionStatus('error')
      setSubmissionMessage('Update Failed')
      setSubmissionDetail(err.message || 'Failed to update listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!listing) return
    if (!confirm(`Delete "${listing.business_name}"? This cannot be undone.`)) return
    
    try {
      await supabase.from('providers').delete().eq('id', listing.id)
      router.push('/providers/dashboard')
    } catch (err: any) {
      console.error('Error deleting:', err)
      setError(err.message || 'Failed to delete listing')
    }
  }

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

  const statusInfo = statusConfig[listing.status as keyof typeof statusConfig] || statusConfig.pending

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
              className="w-full sm:w-auto px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors"
            >
              Delete Listing
            </button>
          </div>

          {/* Status Alerts */}
          {listing.status === 'pending' && (
            <div className="mb-6 sm:mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">Listing under review. Changes will need re-approval.</p>
              </div>
            </div>
          )}
          
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
          <ProviderForm
            mode="edit"
            serviceCategories={serviceCategories}
            userEmail={formData.contact_email}
            selectedAccreditations={selectedAccreditations}
            onAccreditationsChange={handleAccreditationsSave}
            serviceAreas={serviceAreas}
            onServiceAreasChange={handleServiceAreasSave}
            formData={formData}
            onFormChange={setFormData}
            formErrors={formErrors}
            onOpenServiceDrawer={() => setShowServiceDrawer(true)}
            onOpenAreaDrawer={() => setShowServiceAreaDrawer(true)}
            onOpenAccreditationDrawer={() => setShowAccreditationDrawer(true)}
            statusInfo={statusInfo}
            disabledFields={listing.status === 'deleted' ? ['all'] : []}
          />
          
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
        onClose={() => setShowServiceDrawer(false)}
        serviceCategories={serviceCategories}
        selectedCategoryId={formData.main_service_id}
        onSelect={handleServiceSelect}
        title="Select Service Category"
      />

      <AccreditationDrawer
        isOpen={showAccreditationDrawer}
        onClose={() => setShowAccreditationDrawer(false)}
        providerId={listing?.id || "temp"}
        initialSelection={selectedAccreditations}
        onSave={handleAccreditationsSave}
        maxSelection={10}
        serviceCategoryId={formData.main_service_id}
      />

      <ServiceAreaDrawer
        isOpen={showServiceAreaDrawer}
        onClose={() => setShowServiceAreaDrawer(false)}
        initialAreas={serviceAreas.primaryArea ? 
          [serviceAreas.primaryArea, ...(serviceAreas.additionalAreas || [])] : []}
        onSave={handleServiceAreasSave}
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