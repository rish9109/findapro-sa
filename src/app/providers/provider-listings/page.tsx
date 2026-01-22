// File: src/app/providers/provider-listings/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'

// Move all the existing code into this component
function ProviderListingsContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Business Information
    businessName: '',
    businessType: 'sole_proprietor',
    registrationNumber: '',
    vatRegistered: false,
    vatNumber: '',
    
    // Contact Information
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    alternatePhone: '',
    
    // Service Information
    mainService: '',
    otherServices: '',
    experienceYears: '',
    qualifications: '',
    certifications: '',
    
    // Location & Coverage
    physicalAddress: '',
    city: '',
    province: '',
    serviceAreas: '',
    travelDistance: '10',
    
    // Pricing & Payment
    pricingModel: 'hourly',
    hourlyRate: '',
    calloutFee: '',
    acceptsCard: false,
    acceptsCash: true,
    depositRequired: false,
    
    // Availability
    availability: ['weekdays', 'weekends'],
    emergencyService: false,
    responseTime: '24',
    
    // Business Details
    businessHours: '8:00-17:00',
    teamSize: '1',
    insurance: false,
    insuranceDetails: '',
    portfolioUrl: '',
    
    // Terms
    acceptTerms: false,
    agreeMarketing: false
  })

  const businessTypes = [
    { id: 'sole_proprietor', name: 'Sole Proprietor' },
    { id: 'pty_ltd', name: 'Private Company (Pty Ltd)' },
    { id: 'cc', name: 'Close Corporation (CC)' },
    { id: 'partnership', name: 'Partnership' },
    { id: 'trust', name: 'Trust' }
  ]

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
  ]

  const serviceCategories = [
    'Plumbing & Water',
    'Electrical Services',
    'Cleaning Services',
    'Gardening & Landscaping',
    'Painting & Decorating',
    'Building & Construction',
    'Carpentry & Woodwork',
    'Mechanical & Automotive',
    'IT & Computer Services',
    'Security Systems',
    'Moving & Transport',
    'Pest Control',
    'Home Maintenance',
    'Event Planning',
    'Beauty & Wellness',
    'Health & Safety',
    'Education & Tutoring',
    'Financial Services',
    'Legal Services',
    'Other Professional Services'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const toggleAvailability = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.acceptTerms) {
      alert('Please accept the terms and conditions')
      return
    }
    
    setLoading(true)
    
    try {
      // Prepare data for Supabase
      const providerData = {
        business_name: formData.businessName,
        business_type: formData.businessType,
        registration_number: formData.registrationNumber,
        vat_registered: formData.vatRegistered,
        vat_number: formData.vatNumber,
        
        contact_person: formData.contactPerson,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        alternate_phone: formData.alternatePhone,
        
        main_service: formData.mainService,
        other_services: formData.otherServices,
        experience_years: formData.experienceYears,
        qualifications: formData.qualifications,
        certifications: formData.certifications,
        
        physical_address: formData.physicalAddress,
        city: formData.city,
        province: formData.province,
        service_areas: formData.serviceAreas,
        travel_distance: formData.travelDistance,
        
        pricing_model: formData.pricingModel,
        hourly_rate: formData.hourlyRate,
        callout_fee: formData.calloutFee,
        accepts_card: formData.acceptsCard,
        accepts_cash: formData.acceptsCash,
        deposit_required: formData.depositRequired,
        
        availability: formData.availability,
        emergency_service: formData.emergencyService,
        response_time: formData.responseTime,
        
        business_hours: formData.businessHours,
        team_size: formData.teamSize,
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
      
      // Show success message with launch trial benefits
      alert(`
        🎉 CONGRATULATIONS! You're now part of our Launch Trial!
        
        🚀 LAUNCH TRIAL BENEFITS:
        • Premium visibility for 3 months FREE
        • Early Adopter badge on your profile
        • Priority customer referrals
        • No subscription fees until trial ends
        
        📋 Next steps:
        1. We'll review your listing within 24 hours
        2. You'll receive a welcome email with trial details
        3. Your listing will appear in top search results
        
        🏆 Launch Trial ID: ${providerId.substring(0, 8).toUpperCase()}
        
        Thank you for joining our launch! Our team will contact you soon.
      `)
      
      // Reset form
      setFormData({
        businessName: '',
        businessType: 'sole_proprietor',
        registrationNumber: '',
        vatRegistered: false,
        vatNumber: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        alternatePhone: '',
        mainService: '',
        otherServices: '',
        experienceYears: '',
        qualifications: '',
        certifications: '',
        physicalAddress: '',
        city: '',
        province: '',
        serviceAreas: '',
        travelDistance: '10',
        pricingModel: 'hourly',
        hourlyRate: '',
        calloutFee: '',
        acceptsCard: false,
        acceptsCash: true,
        depositRequired: false,
        availability: ['weekdays', 'weekends'],
        emergencyService: false,
        responseTime: '24',
        businessHours: '8:00-17:00',
        teamSize: '1',
        insurance: false,
        insuranceDetails: '',
        portfolioUrl: '',
        acceptTerms: false,
        agreeMarketing: false
      })
      
    } catch (error: any) {
      console.error('Error submitting form:', error)
      alert(`Error: ${error.message || 'Failed to submit form. Please try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header with Launch Badge */}
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <span className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
              🚀 LAUNCH TRIAL - FREE FOR 3 MONTHS
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-400">
            List Your Service on FindAPro
          </h1>
          <p className="text-gray-300 text-xl mb-8 max-w-3xl mx-auto">
            Join South Africa's premier service directory. Get premium visibility during our exclusive launch trial.
          </p>
          
          {/* Launch Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <div className="text-orange-400 text-2xl mb-2">🎯</div>
              <p className="text-white text-sm font-medium">Top Search Results</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <div className="text-orange-400 text-2xl mb-2">💎</div>
              <p className="text-white text-sm font-medium">3 Months Free</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <div className="text-orange-400 text-2xl mb-2">⭐</div>
              <p className="text-white text-sm font-medium">Early Adopter Badge</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <div className="text-orange-400 text-2xl mb-2">🚀</div>
              <p className="text-white text-sm font-medium">Priority Support</p>
            </div>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Your registered business name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Type *
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {businessTypes.map(type => (
                    <option key={type.id} value={type.id} className="bg-gray-900">{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., 2023/123456/07"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="vatRegistered"
                      checked={formData.vatRegistered}
                      onChange={handleChange}
                      className="mr-2 accent-orange-500"
                    />
                    <label className="text-sm text-gray-300">VAT Registered</label>
                  </div>
                  
                  {formData.vatRegistered && (
                    <div className="flex-1">
                      <input
                        type="text"
                        name="vatNumber"
                        value={formData.vatNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="VAT Number"
                      />
                    </div>
                  )}
                </div>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="business@email.co.za"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Main Service Category *
                </label>
                <select
                  name="mainService"
                  value={formData.mainService}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="" className="bg-gray-900">Select your main service</option>
                  {serviceCategories.map(service => (
                    <option key={service} value={service} className="bg-gray-900">{service}</option>
                  ))}
                </select>
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
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    Qualifications
                  </label>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., NQF Level, Diplomas"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Province *
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="" className="bg-gray-900">Select province</option>
                    {provinces.map(province => (
                      <option key={province} value={province} className="bg-gray-900">{province}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Travel Distance (km)
                  </label>
                  <input
                    type="number"
                    name="travelDistance"
                    value={formData.travelDistance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    min="0"
                    max="500"
                  />
                </div>
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
                  Business Hours
                </label>
                <input
                  type="text"
                  name="businessHours"
                  value={formData.businessHours}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., 8:00-17:00, Mon-Fri"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Size
                </label>
                <input
                  type="text"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., 1 person, 2-5 employees"
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
                <div className="flex items-center space-x-4">
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
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Average Response Time (hours)
                </label>
                <input
                  type="text"
                  name="responseTime"
                  value={formData.responseTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., 24 hours"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Availability *
              </label>
              <div className="flex flex-wrap gap-3">
                {['weekdays', 'weekends', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleAvailability(day)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      formData.availability.includes(day)
                        ? 'bg-gradient-to-r from-orange-600/30 to-orange-500/30 border-orange-500 text-orange-300 shadow-lg shadow-orange-900/20'
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                    }`}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Pricing & Terms */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">6</span>
              Pricing & Terms
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pricing Model *
                </label>
                <select
                  name="pricingModel"
                  value={formData.pricingModel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="hourly" className="bg-gray-900">Hourly Rate</option>
                  <option value="daily" className="bg-gray-900">Daily Rate</option>
                  <option value="project" className="bg-gray-900">Project Based</option>
                  <option value="quote" className="bg-gray-900">Free Quote Required</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {formData.pricingModel === 'quote' ? 'Average Project Range' : 'Hourly Rate'}
                </label>
                <input
                  type="text"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder={formData.pricingModel === 'quote' ? 'e.g., R1,500 - R15,000' : 'e.g., R450'}
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-6">
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
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="pt-6 border-t border-gray-700">
            <div className="space-y-4 mb-8">
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
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeMarketing"
                  checked={formData.agreeMarketing}
                  onChange={handleChange}
                  className="mt-1 mr-3 accent-orange-500"
                />
                <label className="text-sm text-gray-300">
                  I agree to receive occasional updates and marketing communications from FindAPro.
                </label>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500 mb-2">
                  🚀 Limited launch trial spots available
                </p>
                <p className="text-sm text-gray-400">
                  First 100 businesses get extended 6-month trial
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
                  '🚀 JOIN LAUNCH TRIAL - SUBMIT LISTING'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-xl shadow-lg">
            <div className="text-orange-400 text-2xl mb-3">🎯</div>
            <h4 className="font-bold text-white mb-2">Premium Visibility</h4>
            <p className="text-sm text-gray-400">Top search results during 3-month trial</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-xl shadow-lg">
            <div className="text-orange-400 text-2xl mb-3">💎</div>
            <h4 className="font-bold text-white mb-2">No Fees</h4>
            <p className="text-sm text-gray-400">Zero subscription fees for 3 months</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-xl shadow-lg">
            <div className="text-orange-400 text-2xl mb-3">⭐</div>
            <h4 className="font-bold text-white mb-2">Early Adopter Badge</h4>
            <p className="text-sm text-gray-400">Show you were here from the start</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-xl shadow-lg">
            <div className="text-orange-400 text-2xl mb-3">🚀</div>
            <h4 className="font-bold text-white mb-2">Priority Support</h4>
            <p className="text-sm text-gray-400">Dedicated help during launch phase</p>
          </div>
        </div>
      </div>
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