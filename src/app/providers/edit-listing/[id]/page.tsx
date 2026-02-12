// File: src/app/providers/edit-listing/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Provider } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import AccreditationDrawer from '@/components/AccreditationDrawer'
import ServiceAreaDrawer from '@/components/ServiceAreaDrawer'
import ServiceCategoryDrawer from '@/components/ServiceCategoryDrawer'
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Award,
  MapPin,
  CreditCard,
  FileText,
  Loader2,
  Mail,
  Bell,
  Users
} from 'lucide-react'

// Types
interface ServiceCategory {
  id: string
  name: string
  description?: string
  icon?: string
}

interface SelectedAccreditation {
  id: string
  accreditation_id?: string
  custom_name?: string
  custom_description?: string
  is_custom: boolean
  position: number
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

function EditListingContent() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
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
  const [formData, setFormData] = useState({
    // Business Information
    business_name: '',
    
    // Contact Information
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    alternate_phone: '',
    
    // Service Information
    main_service: '',
    main_service_id: '',
    details: '',
    experience_years: '',
    
    // Pricing & Payment
    fees_pricing: '',
    accepts_card: false,
    accepts_cash: true,
    deposit_required: false,
    
    // Business Details
    emergency_service: false,
    callout_fee: '',
    insurance: false,
    
    // Status (for display only)
    status: '',
    verified: false
  })

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Fetch user session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/')
          return
        }

        // Fetch listing
        const { data: listingData, error: listingError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', listingId)
          .eq('user_id', session.user.id)
          .single()
        
        if (listingError || !listingData) {
          setError('Listing not found or you do not have permission to edit it.')
          return
        }
        
        setListing(listingData)
        
        // Parse service areas from JSON string
        let parsedServiceAreas: string[] = []
        try {
          if (listingData.service_areas) {
            parsedServiceAreas = JSON.parse(listingData.service_areas)
          }
        } catch (e) {
          console.error('Error parsing service areas:', e)
        }
        
        // Set form data from listing
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
          status: listingData.status || '',
          verified: listingData.verified || false
        })
        
        // Set service areas from parsed data
        if (parsedServiceAreas.length > 0) {
          setServiceAreas({
            primaryArea: parsedServiceAreas[0] || '',
            additionalAreas: parsedServiceAreas.slice(1) || []
          })
        }
        
        // Load existing accreditations
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
        
        // Fetch service categories
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
      
      // Clear error when checkbox is checked
      if (checked && formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      
      // Clear error when user starts typing
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }))
      }
    }
  }

  // Service selection
  const handleServiceSelect = (service: ServiceCategory) => {
    setFormData(prev => ({ 
      ...prev, 
      main_service: service.name,
      main_service_id: service.id 
    }))
    // Clear error
    if (formErrors.main_service) {
      setFormErrors(prev => ({ ...prev, main_service: '' }))
    }
  }

  // Handle accreditations save
  const handleAccreditationsSave = (accreditations: SelectedAccreditation[]) => {
    setSelectedAccreditations(accreditations)
  }

  // Handle service areas save
  const handleServiceAreasSave = (areas: string[]) => {
    if (areas && areas.length > 0) {
      setServiceAreas({
        primaryArea: areas[0],
        additionalAreas: areas.slice(1) || []
      });
    } else {
      setServiceAreas({
        primaryArea: '',
        additionalAreas: []
      });
    }
    
    // Clear error
    if (formErrors.primaryArea) {
      setFormErrors(prev => ({ ...prev, primaryArea: '' }));
    }
  }

  // VALIDATE FORM BEFORE SUBMISSION
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    // Business Information
    if (!formData.business_name.trim()) {
      errors.business_name = 'Business name is required'
    }
    
    // Contact Information
    if (!formData.contact_person.trim()) {
      errors.contact_person = 'Contact person is required'
    }
    if (!formData.contact_phone.trim()) {
      errors.contact_phone = 'Phone number is required'
    }
    
    // Service Information
    if (!formData.main_service.trim()) {
      errors.main_service = 'Main service is required'
    }
    if (!formData.experience_years.trim()) {
      errors.experience_years = 'Experience is required'
    }
    
    // Service Areas
    if (!serviceAreas.primaryArea.trim()) {
      errors.primaryArea = 'Primary service area is required'
    }
    
    // Emergency callout fee validation
    if (formData.emergency_service && !formData.callout_fee.trim()) {
      errors.callout_fee = 'Emergency callout fee is required when offering emergency service'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Send email notifications
  const sendEmailNotifications = async (providerId: string, businessName: string, newStatus: string, userEmail: string) => {
    try {
      // Send notification to provider
      await fetch('/api/email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          event: 'listing_updated',
          providerId: providerId,
          businessName: businessName,
          status: newStatus,
          recipientEmail: userEmail,
          recipientType: 'provider'
        })
      })

      // If status requires admin review (pending), notify admin
      if (newStatus === 'pending') {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            event: 'listing_updated',
            providerId: providerId,
            businessName: businessName,
            status: newStatus,
            recipientType: 'admin',
            recipientEmail: 'admin@findapro.co.za'
          })
        })
      }
      
    } catch (emailError: any) {
      console.log('Email notification failed:', emailError.message)
      // Don't throw - continue with success flow
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorKey = Object.keys(formErrors)[0]
      const element = document.querySelector(`[name="${firstErrorKey}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    
    if (!listing) return
    
    setIsSubmitting(true)
    setError('')
    setIsSuccess(false)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in to update your listing')
        setIsSubmitting(false)
        return
      }
      
      // Prepare data for Supabase update
      const updateData: any = {
        business_name: formData.business_name,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
        alternate_phone: formData.alternate_phone,
        main_service: formData.main_service,
        main_service_id: formData.main_service_id,
        details: formData.details,
        experience_years: formData.experience_years,
        
        // Store service areas as JSON in providers table
        service_areas: JSON.stringify([
          serviceAreas.primaryArea, 
          ...(serviceAreas.additionalAreas || [])
        ]),
        
        fees_pricing: formData.fees_pricing || null,
        accepts_card: formData.accepts_card,
        accepts_cash: formData.accepts_cash,
        deposit_required: formData.deposit_required,
        emergency_service: formData.emergency_service,
        callout_fee: formData.emergency_service ? formData.callout_fee : null,
        insurance: formData.insurance,
        
        updated_at: new Date().toISOString(),
      }
      
      // Determine new status
      let newStatus = formData.status;
      let needsReview = false;
      
      if (formData.status === 'approved') {
        updateData.status = 'pending';
        newStatus = 'pending';
        needsReview = true;
      } else if (formData.status === 'rejected') {
        updateData.status = 'rejected';
        newStatus = 'rejected';
        needsReview = false;
      }
      // For other statuses (pending, pause, etc.), keep the current status
      
      // Update provider
      const { error: updateError } = await supabase
        .from('providers')
        .update(updateData)
        .eq('id', listing.id)
        .eq('user_id', user.id)
      
      if (updateError) {
        console.error('Supabase update error:', updateError)
        throw updateError
      }
      
      // Delete existing accreditations and save new ones
      if (selectedAccreditations.length > 0) {
        // First, delete existing accreditations
        await supabase
          .from('provider_accreditations')
          .delete()
          .eq('provider_id', listing.id)
        
        // Insert new accreditations
        const accreditationsData = selectedAccreditations.map((acc, index) => ({
          provider_id: listing.id,
          accreditation_id: acc.is_custom ? null : acc.accreditation_id,
          custom_name: acc.is_custom ? acc.custom_name : null,
          custom_description: acc.custom_description,
          is_custom: acc.is_custom,
          position: index,
          is_verified: false
        }))
        
        const { error: accError } = await supabase
          .from('provider_accreditations')
          .insert(accreditationsData)
          
        if (accError) {
          console.error('Error saving accreditations:', accError)
          // Continue anyway
        }
      } else {
        // Delete all accreditations if none selected
        await supabase
          .from('provider_accreditations')
          .delete()
          .eq('provider_id', listing.id)
      }
      
      // Send email notifications to provider and admin
      await sendEmailNotifications(
        listing.id,
        formData.business_name,
        newStatus,
        formData.contact_email || user.email || ''
      )
      
      // Show success message
      setSuccessMessage(
        newStatus === 'pending' 
          ? 'Changes submitted for review! Our team will review your updates within 24-48 hours.'
          : newStatus === 'rejected'
          ? 'Changes saved successfully! Your listing remains rejected.'
          : 'Changes saved successfully!'
      )
      
      setIsSuccess(true)
      setIsSubmitting(false)
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push('/providers/dashboard')
      }, 3000)
      
    } catch (err: any) {
      console.error('Error updating listing:', err)
      setError(err.message || 'Failed to update listing')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!listing) return
    
    if (!confirm(`Are you sure you want to delete "${listing.business_name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', listing.id)
      
      if (error) throw error
      
      router.push('/providers/dashboard')
    } catch (err: any) {
      console.error('Error deleting listing:', err)
      setError(err.message || 'Failed to delete listing')
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link
                href="/providers/dashboard"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            
            <div className="bg-gradient-to-b from-red-500/5 to-transparent border border-red-500/20 rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
              <p className="text-gray-300 mb-6">{error}</p>
              <Link
                href="/providers/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-medium hover:shadow-[0_0_30px_rgba(255,122,69,0.3)] transition-all"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return null
  }

  const statusInfo = statusConfig[listing.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-6 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="mb-4">
                <Link
                  href="/providers/dashboard"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white">Edit Listing</h1>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <span className={`text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-400">
                Update your service listing information
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                Delete Listing
              </button>
            </div>
          </div>

          {/* Status Alert */}
          {listing.status === 'pending' && (
            <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Listing Under Review</h3>
                  <p className="text-sm text-gray-300">
                    Your listing is currently being reviewed by our team. You can still update your information, 
                    but changes will need to be re-approved.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {listing.status === 'rejected' && listing.rejection_reason && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Listing Rejected</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    Your listing was rejected for the following reason:
                  </p>
                  <p className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg">
                    {listing.rejection_reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-emerald-400 font-medium mb-1">✓ {successMessage}</p>
                <p className="text-sm text-emerald-300">
                  Redirecting to dashboard in 3 seconds...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submitting Indicator */}
        {isSubmitting && (
          <div className="mb-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <p className="text-blue-400">
                {formData.status === 'rejected' ? 'Saving changes...' : 'Submitting changes for review...'}
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6 border border-gray-700 mb-6">
          
          {/* ==================== SECTION 1: BUSINESS INFORMATION ==================== */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">1</div>
              <h2 className="text-xl font-bold text-white">Business Information</h2>
            </div>
            
            <div className="space-y-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
                  <span>Business Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.business_name ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                  placeholder="Enter your business name"
                />
                {formErrors.business_name && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.business_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* ==================== SECTION 2: CONTACT INFORMATION ==================== */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">2</div>
              <h2 className="text-xl font-bold text-white">Contact Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
                  <span>Contact Person</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.contact_person ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                  placeholder="Full name"
                />
                {formErrors.contact_person && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.contact_person}</p>
                )}
              </div>
              
              {/* Email - Locked */}
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
                  <span>Email Address</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.contact_email}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded border border-orange-500/30">
                      Locked
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Primary Phone */}
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
                  <span>Primary Phone</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.contact_phone ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                  placeholder="+27 12 345 6789"
                />
                {formErrors.contact_phone && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.contact_phone}</p>
                )}
              </div>
              
              {/* Alternate Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternate_phone"
                  value={formData.alternate_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* ==================== SECTION 3: SERVICE INFORMATION ==================== */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">3</div>
              <h2 className="text-xl font-bold text-white">Service Information</h2>
            </div>
            
            <div className="space-y-6">
              {/* Main Service Category */}
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
                  <span>Main Service Category</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowServiceDrawer(true)}
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.main_service ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white text-left flex justify-between items-center hover:border-orange-500 transition-colors`}
                >
                  <span className={formData.main_service ? "text-white" : "text-gray-500"}>
                    {formData.main_service || "Select service category"}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {formErrors.main_service && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.main_service}</p>
                )}
              </div>
              
              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
                  <span>Years of Experience</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.experience_years ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                  placeholder="e.g., 5 years"
                />
                {formErrors.experience_years && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.experience_years}</p>
                )}
              </div>
              
              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Details
                  <span className="text-gray-500 text-xs ml-2">(Use commas or separate lines for lists)</span>
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={10}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder={
`Examples:
• Plumbing repairs, Drain cleaning, Toilet installations
OR
Plumbing repairs
Drain cleaning
Toilet installations
OR
I provide comprehensive plumbing services including repairs, maintenance, and installations.`
                  }
                />
                
                {/* Simple Format Hint */}
                <div className="mt-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-orange-400">💡</span>
                    Enter services separated by commas or on separate lines. Will display as a bullet list.
                  </span>
                </div>
              </div>
              
              {/* Accreditations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#FF7A45] flex items-center gap-1">
                    <span>Accreditations</span>
                  </label>
                  <span className="text-xs text-gray-500">
                    {selectedAccreditations.length}/10 selected
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccreditationDrawer(true)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-left flex justify-between items-center hover:border-orange-500 transition-colors"
                >
                  <div className="flex-1">
                    <span className={selectedAccreditations.length > 0 ? "text-white" : "text-gray-500"}>
                      {selectedAccreditations.length > 0 
                        ? `${selectedAccreditations.length} accreditation${selectedAccreditations.length !== 1 ? 's' : ''} selected`
                        : "Add your accreditations"}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Selected accreditations preview */}
                {selectedAccreditations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedAccreditations.slice(0, 3).map(acc => (
                      <span key={acc.id} className="px-3 py-1.5 bg-orange-500/20 text-orange-300 text-xs rounded-lg border border-orange-500/30 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {acc.is_custom ? acc.custom_name?.substring(0, 20) : 'Certified'}
                      </span>
                    ))}
                    {selectedAccreditations.length > 3 && (
                      <span className="px-3 py-1.5 bg-gray-700 text-gray-400 text-xs rounded-lg border border-gray-600">
                        +{selectedAccreditations.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================== SECTION 4: SERVICE AREAS ==================== */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">4</div>
              <h2 className="text-xl font-bold text-white">Service Areas</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
                  <span>Service Areas</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowServiceAreaDrawer(true)}
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.primaryArea ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white text-left flex justify-between items-center hover:border-orange-500 transition-colors`}
                >
                  <div className="flex-1">
                    <span className={serviceAreas.primaryArea || (serviceAreas.additionalAreas?.length || 0) > 0 ? "text-white" : "text-gray-500"}>
                      {serviceAreas.primaryArea 
                        ? `${serviceAreas.primaryArea}${(serviceAreas.additionalAreas?.length || 0) > 0 ? ` + ${serviceAreas.additionalAreas?.length} more` : ''}`
                        : "Select your service areas"}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {formErrors.primaryArea && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.primaryArea}</p>
                )}
                
                {/* Selected areas preview */}
                {(serviceAreas.primaryArea || (serviceAreas.additionalAreas?.length || 0) > 0) && (
                  <div className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {serviceAreas.primaryArea && (
                        <span className="px-3 py-2 bg-orange-500/30 text-orange-300 rounded-lg text-sm border border-orange-500/50 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {serviceAreas.primaryArea} (Primary)
                        </span>
                      )}
                      {serviceAreas.additionalAreas?.slice(0, 3).map((area, index) => (
                        <span key={index} className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {area}
                        </span>
                      ))}
                      {(serviceAreas.additionalAreas?.length || 0) > 3 && (
                        <span className="px-3 py-2 bg-gray-700 text-gray-400 text-sm rounded-lg border border-gray-600">
                          +{(serviceAreas.additionalAreas?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================== SECTION 5: BUSINESS DETAILS ==================== */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">5</div>
              <h2 className="text-xl font-bold text-white">Business Details</h2>
            </div>
            
            <div className="space-y-6">
              {/* Fees & Pricing */}
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
                  Fees & Pricing
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fees_pricing"
                    value={formData.fees_pricing}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="e.g: R 450 P/Hr , blank = Contact for price"
                  />
                </div>
              </div>
              
              {/* Checkboxes Grid */}
              <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Accepts Cash */}
                  <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      name="accepts_cash"
                      checked={formData.accepts_cash}
                      onChange={handleChange}
                      className="mr-3 accent-orange-500 w-5 h-5"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-gray-300 text-sm font-medium">Accepts Cash</label>
                    </div>
                  </div>
                  
                  {/* Accepts Card */}
                  <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      name="accepts_card"
                      checked={formData.accepts_card}
                      onChange={handleChange}
                      className="mr-3 accent-orange-500 w-5 h-5"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <label className="text-gray-300 text-sm font-medium">Accepts Card</label>
                    </div>
                  </div>
                  
                  {/* Deposit Required */}
                  <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      name="deposit_required"
                      checked={formData.deposit_required}
                      onChange={handleChange}
                      className="mr-3 accent-orange-500 w-5 h-5"
                    />
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <label className="text-gray-300 text-sm font-medium">Requires Deposit</label>
                    </div>
                  </div>
                  
                  {/* Emergency Service */}
                  <div className={`flex flex-col p-3 rounded-lg border transition-colors ${formData.emergency_service ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="emergency_service"
                        checked={formData.emergency_service}
                        onChange={handleChange}
                        className="mr-3 accent-orange-500 w-5 h-5"
                      />
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <label className="text-gray-300 text-sm font-medium">Emergency Service</label>
                      </div>
                    </div>
                    
                    {/* Callout fee appears below emergency service checkbox */}
                    {formData.emergency_service && (
                      <div className="mt-3 pl-8">
                        <div className="relative">
                          <input
                            type="text"
                            name="callout_fee"
                            value={formData.callout_fee}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-900 border ${formErrors.callout_fee ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm`}
                            placeholder="Emergency callout fee (e.g., 300)"
                          />
                        </div>
                        {formErrors.callout_fee && (
                          <p className="mt-1 text-xs text-red-400">{formErrors.callout_fee}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Insurance */}
                  <div className={`flex flex-col p-3 rounded-lg border transition-colors ${formData.insurance ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="insurance"
                        checked={formData.insurance}
                        onChange={handleChange}
                        className="mr-3 accent-orange-500 w-5 h-5"
                      />
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <label className="text-gray-300 text-sm font-medium">Have Insurance</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== SECTION 6: FORM ACTIONS ==================== */}
          <div className="pt-6 border-t border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400">
                  {formData.status === 'rejected' 
                    ? 'Save your changes, then resubmit for review from the dashboard'
                    : formData.status === 'approved'
                    ? 'Changes will reset your listing status to "Pending Review"'
                    : 'Your changes will be reviewed by our team'
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Link
                  href="/providers/dashboard"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    isSubmitting || isSuccess
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white hover:shadow-[0_0_30px_rgba(255,122,69,0.3)]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {formData.status === 'rejected' ? 'Saving Changes...' : 'Submitting...'}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      Submitted!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {formData.status === 'rejected' ? 'Save Changes' : 'Submit Changes'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Service Category Drawer */}
      <ServiceCategoryDrawer
        isOpen={showServiceDrawer}
        onClose={() => setShowServiceDrawer(false)}
        serviceCategories={serviceCategories}
        selectedCategoryId={formData.main_service_id}
        onSelect={handleServiceSelect}
        title="Select Service Category"
      />

      {/* Accreditation Drawer */}
      <AccreditationDrawer
        isOpen={showAccreditationDrawer}
        onClose={() => setShowAccreditationDrawer(false)}
        providerId={listing?.id || "temp"}
        initialSelection={selectedAccreditations}
        onSave={handleAccreditationsSave}
        maxSelection={10}
        serviceCategoryId={formData.main_service_id}
      />

      {/* Service Area Drawer */}
      <ServiceAreaDrawer
        isOpen={showServiceAreaDrawer}
        onClose={() => setShowServiceAreaDrawer(false)}
        // Convert existing structure to flat array for the Drawer
        initialAreas={serviceAreas.primaryArea ? 
          [serviceAreas.primaryArea, ...(serviceAreas.additionalAreas || [])] : 
          []}
        onSave={handleServiceAreasSave}
        maxAreas={10}
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

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-48 mb-8"></div>
          <div className="h-64 bg-gray-800 rounded-2xl mb-8"></div>
          <div className="h-96 bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}