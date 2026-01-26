// File: src/app/providers/provider-listings/page.tsx - COMPLETE WITH ALL SECTIONS
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'

// Types for our data
interface Province {
  id: string
  name: string
  code: string
}

interface ServiceCategory {
  id: string
  name: string
  description?: string
  icon?: string
}

// Move all the existing code into this component
function ProviderListingsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showProvinceModal, setShowProvinceModal] = useState(false)
  
  // NEW: State for dynamic data from Supabase
  const [provinces, setProvinces] = useState<Province[]>([])
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // NEW: User's existing listings count
  const [existingListingsCount, setExistingListingsCount] = useState(0)
  const [userId, setUserId] = useState<string>('')
  
  // fetch existing business name
  const [existingBusinessName, setExistingBusinessName] = useState('')

  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    
    // Contact Information
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    alternatePhone: '',
    
    // Service Information
    mainService: '',
    mainServiceId: '', // NEW: Store the ID as well
    otherServices: '',
    experienceYears: '',
    certifications: '',
    
    // Location & Coverage
    physicalAddress: '',
    city: '',
    province: '',
    provinceId: '', // NEW: Store the ID as well
    serviceAreas: '',
    
    // Pricing & Payment
    hourlyRate: '',
    calloutFee: '',
    acceptsCard: false,
    acceptsCash: true,
    depositRequired: false,
    
    // Business Details
    emergencyService: false,
    insurance: false,
    insuranceDetails: '',
    portfolioUrl: '',
    
    // Terms
    acceptTerms: false
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true)
        
        // Fetch user session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUserId(session.user.id)
          setUserEmail(session.user.email || '')
          setFormData(prev => ({ ...prev, contactEmail: session.user.email || '' }))
          
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
        
        // Fetch provinces from Supabase
        const { data: provincesData, error: provincesError } = await supabase
          .from('provinces')
          .select('id, name, code')
          .order('name')
        
        if (provincesError) throw provincesError
        setProvinces(provincesData || [])
        
        // Fetch service categories from Supabase
        const { data: servicesData, error: servicesError } = await supabase
          .from('service_categories')
          .select('id, name, description, icon')
          .eq('is_active', true)
          .order('name')
        
        if (servicesError) throw servicesError
        setServiceCategories(servicesData || [])
        
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchInitialData()
  }, [router])

  // NEW: Check listing limit before submission
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

  // NEW: Update user to provider status
  const updateUserToProvider = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return false
      
      // Check if already marked as provider
      if (user.user_metadata?.is_provider) return true
      
      // Update user metadata to mark as provider
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Updated selectService to store both name and ID
  const selectService = (service: ServiceCategory) => {
    setFormData(prev => ({ 
      ...prev, 
      mainService: service.name,
      mainServiceId: service.id 
    }))
    setShowServiceModal(false)
  }

  // Updated selectProvince to store both name and ID
  const selectProvince = (province: Province) => {
    setFormData(prev => ({ 
      ...prev, 
      province: province.name,
      provinceId: province.id 
    }))
    setShowProvinceModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.acceptTerms) {
      alert('Please accept the terms and conditions')
      return
    }
    
    // NEW: Check listing limit
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
      
      // NEW: Update user to provider status
      await updateUserToProvider()
      
      // Use locked business name if exists, otherwise use form data
      const businessNameToUse = existingBusinessName || formData.businessName
      
      // Prepare data for Supabase
      const providerData = {
        user_id: user.id, // ADDED: Link listing to user
        business_name: businessNameToUse,
        
        contact_person: formData.contactPerson,
        contact_email: userEmail,
        contact_phone: formData.contactPhone,
        alternate_phone: formData.alternatePhone,
        
        main_service: formData.mainService,
        main_service_id: formData.mainServiceId,
        other_services: formData.otherServices,
        experience_years: formData.experienceYears,
        certifications: formData.certifications,
        
        physical_address: formData.physicalAddress,
        city: formData.city,
        province: formData.province,
        province_id: formData.provinceId,
        service_areas: formData.serviceAreas,
        
        hourly_rate: formData.hourlyRate,
        callout_fee: formData.calloutFee,
        accepts_card: formData.acceptsCard,
        accepts_cash: formData.acceptsCash,
        deposit_required: formData.depositRequired,
        
        emergency_service: formData.emergencyService,
        
        insurance: formData.insurance,
        insurance_details: formData.insuranceDetails,
        portfolio_url: formData.portfolioUrl,
        
        status: 'pending',
        verified: false,
        created_at: new Date().toISOString(),
        launch_trial: true // Flag for launch trial participants
      }
      
      console.log('Submitting provider data:', providerData)
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('providers')
        .insert([providerData])
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned after insertion')
      }
      
      const providerId = data[0].id
      console.log('Provider created with ID:', providerId)
      
      // Send new listing notification to admin
      try {
        console.log('Sending email notification for provider ID:', providerId)
        
        const emailResponse = await fetch('/api/email', {
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

        const emailResult = await emailResponse.json()
        console.log('Admin notification result:', emailResult)

        if (!emailResult.success) {
          console.warn('Email notification had issues:', emailResult)
        }
      } catch (emailError: any) {
        console.log('Email notification failed:', emailError.message || emailError)
      }
      
      // Success!
      console.log('Provider created successfully:', data)
      
      // Show success message
      alert(`Thank you for submitting your listing! Our team will review it and contact you soon. You can track your listing status in your Provider Dashboard.`)
      
      // Reset form (except business name if locked)
      setFormData({
        businessName: existingBusinessName || '', // Keep locked name
        contactPerson: '',
        contactEmail: userEmail,
        contactPhone: '',
        alternatePhone: '',
        mainService: '',
        mainServiceId: '',
        otherServices: '',
        experienceYears: '',
        certifications: '',
        physicalAddress: '',
        city: '',
        province: '',
        provinceId: '',
        serviceAreas: '',
        hourlyRate: '',
        calloutFee: '',
        acceptsCard: false,
        acceptsCash: true,
        depositRequired: false,
        emergencyService: false,
        insurance: false,
        insuranceDetails: '',
        portfolioUrl: '',
        acceptTerms: false
      })
      
      // Redirect to dashboard after successful creation
      setTimeout(() => {
        router.push('/providers/dashboard')
      }, 1500)
      
    } catch (error: any) {
      console.error('Error submitting form:', error)
      alert(`Error: ${error.message || 'Failed to submit form. Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while fetching data
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading form data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header with Launch Badge */}
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
              LIST YOUR SERVICE
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-400">
            List Your Service on FindAPro
          </h1>
          <p className="text-gray-300 text-xl mb-8 max-w-3xl mx-auto">
            Join South Africa's premier service directory.
          </p>
          
          {/* NEW: Listing limit indicator */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Your Listings:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xl">{existingListingsCount}</span>
                <span className="text-gray-400">/ 3</span>
              </div>
            </div>
            <div className="mt-2 bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(existingListingsCount / 3) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {existingListingsCount >= 3 
                ? 'Maximum limit reached. Delete a listing to create new ones.'
                : `${3 - existingListingsCount} listing${3 - existingListingsCount !== 1 ? 's' : ''} remaining`
              }
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
          {/* Section 1: Business Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
              Business Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#FF7A45] mb-2">
                  Business Name *
                </label>
                {existingBusinessName ? (
                  // Show locked business name
                  <div className="relative">
                    <input
                      type="text"
                      value={existingBusinessName}
                      readOnly
                      disabled
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                        Locked
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Business name is locked from your first listing
                    </p>
                  </div>
                ) : (
                  // New user - can enter business name
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Your registered business name"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
              Contact Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Full name of contact person"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={userEmail}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 cursor-not-allowed"
                  placeholder="Your registered email"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is your registered email address and cannot be changed
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+27 12 345 6789"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Service Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
              Service Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#FF7A45] mb-2">
                  Main Service Category *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(true)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-left focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex justify-between items-center hover:border-orange-500 transition-colors"
                  >
                    <span className={formData.mainService ? "text-white" : "text-gray-500"}>
                      {formData.mainService || "Select your main service"}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Other Services Offered
                </label>
                <textarea
                  name="otherServices"
                  value={formData.otherServices}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="List any additional services you offer (comma separated)"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#FF7A45] mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="text"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 5 years"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Certifications
                  </label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., SAQCC, Wireman's License"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Location & Coverage */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">4</span>
              Location & Coverage
            </h2>
            
            <div className="space-y-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Physical Address
                </label>
                <textarea
                  name="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Full street address"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#FF7A45] mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Johannesburg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#FF7A45] mb-2">
                    Province *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowProvinceModal(true)}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-left focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex justify-between items-center hover:border-orange-500 transition-colors"
                    >
                      <span className={formData.province ? "text-white" : "text-gray-500"}>
                        {formData.province || "Select province"}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Service Areas Covered
                </label>
                <textarea
                  name="serviceAreas"
                  value={formData.serviceAreas}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="List suburbs or areas you serve"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Business Details */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">5</span>
              Business Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hourly Rate
                </label>
                <input
                  type="text"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., R450"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Callout Fee
                </label>
                <input
                  type="text"
                  name="calloutFee"
                  value={formData.calloutFee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., R300 or Free"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Portfolio/Website URL
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://yourbusiness.co.za"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="emergencyService"
                      checked={formData.emergencyService}
                      onChange={handleChange}
                      className="mr-2 accent-orange-500"
                    />
                    <label className="text-sm text-gray-300">Offer Emergency Services</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="insurance"
                      checked={formData.insurance}
                      onChange={handleChange}
                      className="mr-2 accent-orange-500"
                    />
                    <label className="text-sm text-gray-300">Have Insurance</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="acceptsCash"
                      checked={formData.acceptsCash}
                      onChange={handleChange}
                      className="mr-2 accent-orange-500"
                    />
                    <label className="text-sm text-gray-300">Accepts Cash</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="acceptsCard"
                      checked={formData.acceptsCard}
                      onChange={handleChange}
                      className="mr-2 accent-orange-500"
                    />
                    <label className="text-sm text-gray-300">Accepts Card Payments</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="depositRequired"
                      checked={formData.depositRequired}
                      onChange={handleChange}
                      className="mr-2 accent-orange-500"
                    />
                    <label className="text-sm text-gray-300">Requires Deposit</label>
                  </div>
                </div>
                
                {formData.insurance && (
                  <div className="mt-4">
                    <input
                      type="text"
                      name="insuranceDetails"
                      value={formData.insuranceDetails}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Insurance provider and coverage details"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Terms and Submit */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">6</span>
              Terms & Submission
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                  className="mt-1 mr-3 accent-orange-500"
                />
                <label className="text-sm text-gray-300">
                  I confirm that all information provided is accurate and complete. I agree to the{' '}
                  <a href="#" className="text-orange-400 hover:text-orange-300 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-orange-400 hover:text-orange-300 hover:underline">Privacy Policy</a>.
                </label>
              </div>
              
              <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-orange-400">📋</span>
                  What happens next?
                </h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span>Our team will review your listing within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span>You'll receive an email notification when approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span>You can track status in your Provider Dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">✓</span>
                    <span>Launch trial participants get priority review</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400">
                  Ready to join South Africa's premier service directory?
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading || !formData.acceptTerms}
                className={`px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  loading || !formData.acceptTerms
                    ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  'SUBMIT LISTING'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Service Category Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-gray-800 shadow-2xl">
            <div className="sticky top-0 z-10 bg-gray-800 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Select Main Service Category</h3>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceCategories.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => selectService(service)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      formData.mainServiceId === service.id
                        ? 'bg-gradient-to-r from-orange-600/30 to-orange-500/30 border-orange-500 text-orange-300'
                        : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium">{service.name}</div>
                    {service.description && (
                      <div className="text-sm text-gray-400 mt-1">{service.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-800 px-6 py-4 border-t border-gray-700">
              <button
                onClick={() => setShowServiceModal(false)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Province Modal */}
      {showProvinceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="relative w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl bg-gray-800 shadow-2xl">
            <div className="sticky top-0 z-10 bg-gray-800 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Select Province</h3>
                <button
                  onClick={() => setShowProvinceModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-3">
                {provinces.map((province) => (
                  <button
                    key={province.id}
                    type="button"
                    onClick={() => selectProvince(province)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      formData.provinceId === province.id
                        ? 'bg-gradient-to-r from-orange-600/30 to-orange-500/30 border-orange-500 text-orange-300'
                        : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium">{province.name}</div>
                    <div className="text-sm text-gray-400">Code: {province.code}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-800 px-6 py-4 border-t border-gray-700">
              <button
                onClick={() => setShowProvinceModal(false)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrap the entire component with ProtectedRoute
export default function ProviderListingsPage() {
  return (
    <ProtectedRoute>
      <ProviderListingsContent />
    </ProtectedRoute>
  )
}