// File: src/app/providers/provider-listings/page.tsx (FIXED)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import AccreditationDrawer from '@/components/AccreditationDrawer'
import ServiceAreaDrawer from '@/components/ServiceAreaDrawer'
import ServiceCategoryDrawer from '@/components/ServiceCategoryDrawer'
import { Award, MapPin, Shield, Clock, CreditCard, AlertCircle, FileText, CheckCircle, ArrowLeft } from 'lucide-react'

// Types - Removed City interface
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

function ProviderListingsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showServiceDrawer, setShowServiceDrawer] = useState(false)
  const [showServiceAreaDrawer, setShowServiceAreaDrawer] = useState(false)
  const [showAccreditationDrawer, setShowAccreditationDrawer] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Dynamic data - Removed cities state
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // User data
  const [existingListingsCount, setExistingListingsCount] = useState(0)
  const [userId, setUserId] = useState<string>('')
  const [existingBusinessName, setExistingBusinessName] = useState('')

  // New states
  const [selectedAccreditations, setSelectedAccreditations] = useState<SelectedAccreditation[]>([])
  const [serviceAreas, setServiceAreas] = useState<{
    primaryArea: string;
    additionalAreas: string[];
  }>({
    primaryArea: '',
    additionalAreas: []
  })

  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    
    // Contact Information
    contactPerson: '',
    contactPhone: '',
    alternatePhone: '',
    
    // Service Information
    mainService: '',
    mainServiceId: '',
    otherServices: '', // Will store "Details"
    experienceYears: '',
    
    // Pricing & Payment
    hourlyRate: '', // Will store "Fees & Pricing"
    acceptsCard: false,
    acceptsCash: true,
    depositRequired: false,
    
    // Business Details
    emergencyService: false,
    emergencyCalloutFee: '',
    insurance: false,
    // Removed insuranceDetails
    
    // Terms
    acceptTerms: false
  })

  // Fetch all initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch user session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUserId(session.user.id)
          setUserEmail(session.user.email || '')
          
          // Check existing listings
          const { data: existingListings, error } = await supabase
            .from('providers')
            .select('business_name')
            .eq('user_id', session.user.id)
          
          if (!error && existingListings && existingListings.length > 0) {
            setExistingListingsCount(existingListings.length)
            
            // Lock business name from first listing
            if (existingListings[0]?.business_name) {
              setExistingBusinessName(existingListings[0].business_name)
              setFormData(prev => ({ 
                ...prev, 
                businessName: existingListings[0].business_name 
              }))
            }
            
            // Check if already reached limit
            if (existingListings.length >= 3) {
              alert('You have reached the maximum limit of 3 listings. Please delete an existing listing to create a new one.')
              router.push('/providers/dashboard')
            }
          }
        }
        
        // Removed cities fetch
        
        // Fetch service categories
        const { data: servicesData } = await supabase
          .from('service_categories')
          .select('id, name, description, icon')
          .eq('is_active', true)
          .order('name')
        setServiceCategories(servicesData || [])
        
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchInitialData()
  }, [router])

  // Check listing limit
  const checkListingLimit = async () => {
    if (!userId) return false
    
    const { count, error } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error checking listing limit:', error)
      return false
    }
    
    return (count || 0) < 3
  }

  // Get existing logo URL for user
  const getExistingLogoUrl = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('logo_url')
        .eq('user_id', userId)
        .not('logo_url', 'is', null)  // Only get listings with logos
        .order('created_at', { ascending: false })
        .limit(1)
        
      if (error) {
        console.error('Error fetching existing logo:', error)
        return null
      }
      
      return data?.[0]?.logo_url || null
    } catch (error) {
      console.error('Error in getExistingLogoUrl:', error)
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
      
      if (error) {
        console.error('Error updating user to provider:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in updateUserToProvider:', error)
      return false
    }
  }

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
      mainService: service.name,
      mainServiceId: service.id 
    }))
    // Clear error
    if (formErrors.mainService) {
      setFormErrors(prev => ({ ...prev, mainService: '' }))
    }
  }

  // Handle accreditations save
  const handleAccreditationsSave = (accreditations: SelectedAccreditation[]) => {
    setSelectedAccreditations(accreditations)
  }

  // Handle service areas save - UPDATED for new Drawer format
  const handleServiceAreasSave = (areas: string[]) => {
    // If we have areas, first is primary, rest are additional
    if (areas && areas.length > 0) {
      setServiceAreas({
        primaryArea: areas[0],
        additionalAreas: areas.slice(1) || [] // Ensure it's always an array
      });
    } else {
      // No areas selected
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
    if (!formData.businessName.trim() && !existingBusinessName) {
      errors.businessName = 'Business name is required'
    }
    
    // Contact Information
    if (!formData.contactPerson.trim()) {
      errors.contactPerson = 'Contact person is required'
    }
    if (!formData.contactPhone.trim()) {
      errors.contactPhone = 'Phone number is required'
    }
    
    // Service Information
    if (!formData.mainService.trim()) {
      errors.mainService = 'Main service is required'
    }
    if (!formData.experienceYears.trim()) {
      errors.experienceYears = 'Experience is required'
    }
    
    // Service Areas
    if (!serviceAreas.primaryArea?.trim()) {
      errors.primaryArea = 'Primary service area is required'
    }
    
    // Emergency callout fee validation
    if (formData.emergencyService && !formData.emergencyCalloutFee.trim()) {
      errors.emergencyCalloutFee = 'Emergency callout fee is required when offering emergency service'
    }
    
    // Removed insurance details validation
    
    // Terms
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
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
    
    // Check listing limit
    const canCreateListing = await checkListingLimit()
    if (!canCreateListing) {
      alert('You have reached the maximum limit of 3 listings. Please delete an existing listing to create a new one.')
      router.push('/providers/dashboard')
      return
    }
    
    setLoading(true)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please log in to create a listing')
        return
      }
      
      // ✅ NEW: Get existing logo URL (if any)
      const existingLogoUrl = await getExistingLogoUrl(user.id)
      
      // Update user to provider status
      await updateUserToProvider()
      
      // Use locked business name if exists, otherwise use form data
      const businessNameToUse = existingBusinessName || formData.businessName
      
      // Prepare data for Supabase
      const providerData = {
        user_id: user.id,
        business_name: businessNameToUse,
        
        // ✅ NEW: Add logo_url to new listing
        logo_url: existingLogoUrl,
        
        contact_person: formData.contactPerson,
        contact_email: userEmail,
        contact_phone: formData.contactPhone,
        alternate_phone: formData.alternatePhone,
        
        main_service: formData.mainService,
        main_service_id: formData.mainServiceId,
        details: formData.otherServices, // Changed from other_services to details
        experience_years: formData.experienceYears,
        
        // Store service areas as JSON array in the providers table
        service_areas: JSON.stringify([
          serviceAreas.primaryArea, 
          ...(serviceAreas.additionalAreas || [])
        ]),
        
        fees_pricing: formData.hourlyRate || null, // Changed from hourly_rate to fees_pricing
        accepts_card: formData.acceptsCard,
        accepts_cash: formData.acceptsCash,
        deposit_required: formData.depositRequired,
        
        emergency_service: formData.emergencyService,
        callout_fee: formData.emergencyService ? formData.emergencyCalloutFee : null,
        
        insurance: formData.insurance,
        // Removed insurance_details
        
        status: 'pending',
        verified: false,
        created_at: new Date().toISOString(),
        launch_trial: true,
      };
      
      console.log('Submitting provider data:', providerData)
      
      // Insert provider
      const { data, error } = await supabase
        .from('providers')
        .insert([providerData])
        .select()
        .single()
      
      if (error) {
        console.error('Supabase insertion error:', error)
        throw error
      }
      
      const providerId = data.id
      
      // Save accreditations if any selected
      if (selectedAccreditations.length > 0) {
        const accreditationsData = selectedAccreditations.map((acc, index) => ({
          provider_id: providerId,
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
          // Don't throw - continue with provider creation
        }
      }
      
      // Removed provider_service_areas table insertion
      
      // Send notification
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            event: 'new_listing',
            providerId: providerId,
            launchTrial: true
          })
        })
      } catch (emailError: any) {
        console.log('Email notification failed:', emailError.message)
        // Don't throw - continue with success flow
      }
      
      // Success!
      alert(`Thank you for submitting your listing! Our team will review it and contact you soon. You can track your listing status in your Provider Dashboard.`)
      
      // Reset form
      setFormData({
        businessName: existingBusinessName || '',
        contactPerson: '',
        contactPhone: '',
        alternatePhone: '',
        mainService: '',
        mainServiceId: '',
        otherServices: '',
        experienceYears: '',
        hourlyRate: '',
        acceptsCard: false,
        acceptsCash: true,
        depositRequired: false,
        emergencyService: false,
        emergencyCalloutFee: '',
        insurance: false,
        // Removed insuranceDetails
        acceptTerms: false
      })
      setSelectedAccreditations([])
      setServiceAreas({
        primaryArea: '',
        additionalAreas: []
      })
      setFormErrors({})
      
      // Redirect
      setTimeout(() => {
        router.push('/providers/dashboard')
      }, 1500)
      
    } catch (error: any) {
      console.error('Error submitting form:', error)
      alert(`Error: ${error.message || 'Failed to submit form. Please check all fields and try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  // Cancel button handler
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.back()
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Cancel Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-white mb-3">
              Create Service Listing
            </h1>
            <p className="text-gray-300 mb-6">
              Complete all sections to join FindAPro
            </p>
          </div>
          
          {/* Spacer for alignment */}
          <div className="w-24"></div>
        </div>
        
        {/* Progress */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">1</div>
            <div className="w-12 h-1 bg-gray-600"></div>
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 font-bold">2</div>
            <div className="w-12 h-1 bg-gray-600"></div>
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 font-bold">3</div>
          </div>
        </div>
        
        {/* Listings counter */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 max-w-xs mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Your Listings:</span>
            <span className="text-white font-bold">{existingListingsCount}/3</span>
          </div>
          <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all"
              style={{ width: `${(existingListingsCount / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* ✅ NEW: Logo notification for existing users */}
        {existingListingsCount > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 text-sm">ⓘ</span>
              </div>
              <div>
                <p className="text-sm text-orange-300 font-medium mb-1">
                  Logo Notice
                </p>
                <p className="text-xs text-orange-400/80">
                  Your business logo (if uploaded) will automatically appear on this new listing.
                  {existingListingsCount >= 2 && (
                    <span className="block mt-1">
                      You can update your logo in your Provider Dashboard.
                    </span>
                  )}
                </p>
              </div>
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
                {existingBusinessName ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={existingBusinessName}
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
                ) : (
                  <>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.businessName ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                      placeholder="Enter your business name"
                    />
                    {formErrors.businessName && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.businessName}</p>
                    )}
                  </>
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
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.contactPerson ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                  placeholder="Full name"
                />
                {formErrors.contactPerson && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.contactPerson}</p>
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
                    value={userEmail}
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
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.contactPhone ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                  placeholder="+27 12 345 6789"
                />
                {formErrors.contactPhone && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.contactPhone}</p>
                )}
              </div>
              
              {/* Alternate Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
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
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.mainService ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white text-left flex justify-between items-center hover:border-orange-500 transition-colors`}
                >
                  <span className={formData.mainService ? "text-white" : "text-gray-500"}>
                    {formData.mainService || "Select service category"}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {formErrors.mainService && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.mainService}</p>
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
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-900 border ${formErrors.experienceYears ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                  placeholder="e.g., 5 years"
                />
                {formErrors.experienceYears && (
                  <p className="mt-1 text-sm text-red-400">{formErrors.experienceYears}</p>
                )}
              </div>
              
              {/* Details - Renamed from Other Services */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Details
                  <span className="text-gray-500 text-xs ml-2">(Use commas or separate lines for lists)</span>
                </label>
                <textarea
                  name="otherServices"
                  value={formData.otherServices}
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
              {/* Fees & Pricing - Renamed from Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2 flex items-center gap-1">
                  Fees & Pricing
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="hourlyRate"
                    value={formData.hourlyRate}
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
                      name="acceptsCash"
                      checked={formData.acceptsCash}
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
                      name="acceptsCard"
                      checked={formData.acceptsCard}
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
                      name="depositRequired"
                      checked={formData.depositRequired}
                      onChange={handleChange}
                      className="mr-3 accent-orange-500 w-5 h-5"
                    />
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <label className="text-gray-300 text-sm font-medium">Requires Deposit</label>
                    </div>
                  </div>
                  
                  {/* Emergency Service */}
                  <div className={`flex flex-col p-3 rounded-lg border transition-colors ${formData.emergencyService ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="emergencyService"
                        checked={formData.emergencyService}
                        onChange={handleChange}
                        className="mr-3 accent-orange-500 w-5 h-5"
                      />
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <label className="text-gray-300 text-sm font-medium">Emergency Service</label>
                      </div>
                    </div>
                    
                    {/* Callout fee appears below emergency service checkbox */}
                    {formData.emergencyService && (
                      <div className="mt-3 pl-8">
                        <div className="relative">
                          <input
                            type="text"
                            name="emergencyCalloutFee"
                            value={formData.emergencyCalloutFee}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 bg-gray-900 border ${formErrors.emergencyCalloutFee ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm`}
                            placeholder="Emergency callout fee (e.g., 300)"
                          />
                        </div>
                        {formErrors.emergencyCalloutFee && (
                          <p className="mt-1 text-xs text-red-400">{formErrors.emergencyCalloutFee}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Insurance - Simplified without details */}
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
                    {/* Removed insurance details field */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== SECTION 6: TERMS & SUBMISSION ==================== */}
          <div className="pt-6 border-t border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">6</div>
              <h2 className="text-xl font-bold text-white">Terms & Submission</h2>
            </div>
            
            <div className="space-y-6">
              {/* Terms Agreement */}
              <div className={`flex items-start p-4 rounded-xl border ${formErrors.acceptTerms ? 'border-red-500/30 bg-red-500/5' : 'bg-gray-900/50 border-gray-700'}`}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                  className={`mt-1 mr-3 ${formErrors.acceptTerms ? 'accent-red-500' : 'accent-orange-500'} w-5 h-5`}
                />
                <div>
                  <label className="text-sm text-gray-300 font-medium">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    By checking this box, you confirm all information provided is accurate
                  </p>
                  {formErrors.acceptTerms && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.acceptTerms}</p>
                  )}
                </div>
              </div>
              
              {/* Review Info */}
              <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-700">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">What happens next?</h4>
                    <ul className="space-y-1 text-xs text-gray-400">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Our team reviews your listing within 24-48 hours</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>You'll receive email notification when approved</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Track status in your Provider Dashboard</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-4 rounded-xl font-bold text-lg transition-all duration-300 ${loading
                      ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 hover:shadow-lg'
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Listing...
                    </span>
                  ) : (
                    'Create Listing'
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
  selectedCategoryId={formData.mainServiceId}
  onSelect={handleServiceSelect}
  title="Select Service Category"
/>

      {/* Accreditation Drawer */}
      <AccreditationDrawer
  isOpen={showAccreditationDrawer}
  onClose={() => setShowAccreditationDrawer(false)}
  providerId="temp"
  initialSelection={selectedAccreditations}
  onSave={handleAccreditationsSave}
  maxSelection={10}
  serviceCategoryId={formData.mainServiceId}
/>

      {/* Service Area Drawer - Simplified */}
      <ServiceAreaDrawer
  isOpen={showServiceAreaDrawer}
  onClose={() => setShowServiceAreaDrawer(false)}
  initialAreas={serviceAreas.primaryArea ? 
    [serviceAreas.primaryArea, ...(serviceAreas.additionalAreas || [])] : 
    []}
  onSave={handleServiceAreasSave}
  maxAreas={7}
/>
    </div>
  )
}

export default function ProviderListingsPage() {
  return (
    <ProtectedRoute>
      <ProviderListingsContent />
    </ProtectedRoute>
  )
}