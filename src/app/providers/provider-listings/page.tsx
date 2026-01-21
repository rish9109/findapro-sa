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
        
        status: 'pending', // Needs admin approval
        verified: false,
        created_at: new Date().toISOString()
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
            providerId: providerId
          })
        })

        const emailResult = await emailResponse.json()
        console.log('Admin notification result:', emailResult)

        if (!emailResult.success) {
          console.warn('Email notification had issues:', emailResult)
          // Continue anyway - email is non-critical
        }
      } catch (emailError: any) {
        console.log('Email notification failed (non-critical):', emailError.message || emailError)
        // Don't fail the form if email fails
      }
      
      // Success!
      console.log('Provider created successfully:', data)
      
      // Show success message
      alert(`
        ✅ Success! Your listing has been submitted.
        
        Next steps:
        1. We will review your listing within 24 hours
        2. You'll receive an email when approved
        3. Your listing will appear in search results
        
        Reference ID: ${providerId.substring(0, 8)}
        
        Our admin team has been notified for review.
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            List Your Service on FindAPro
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Join South Africa's premier service directory. Get more customers today.
          </p>
          
          {/* Progress indicators */}
          <div className="flex justify-center space-x-8 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                1
              </div>
              <span className="text-sm font-medium">Business Info</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                2
              </div>
              <span className="text-sm font-medium">Services</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                3
              </div>
              <span className="text-sm font-medium">Location</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                4
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Section 1: Business Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b">1. Business Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your registered business name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {businessTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">VAT Registered</label>
                  </div>
                  
                  {formData.vatRegistered && (
                    <div className="flex-1">
                      <input
                        type="text"
                        name="vatNumber"
                        value={formData.vatNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b">2. Contact Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full name of contact person"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="business@email.co.za"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+27 12 345 6789"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Service Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b">3. Service Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Service Category *
                </label>
                <select
                  name="mainService"
                  value={formData.mainService}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your main service</option>
                  {serviceCategories.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Services Offered
                </label>
                <textarea
                  name="otherServices"
                  value={formData.otherServices}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List any additional services you offer (comma separated)"
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="text"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 5 years"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., NQF Level, Diplomas"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications
                  </label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., SAQCC, Wireman's License"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Location & Coverage */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b">4. Location & Coverage</h2>
            
            <div className="space-y-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Address
                </label>
                <textarea
                  name="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full street address"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Johannesburg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province *
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select province</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Areas Covered
                  </label>
                  <textarea
                    name="serviceAreas"
                    value={formData.serviceAreas}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="List suburbs or areas you serve"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Travel Distance (km)
                  </label>
                  <input
                    type="number"
                    name="travelDistance"
                    value={formData.travelDistance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Business Details */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b">5. Business Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Hours
                </label>
                <input
                  type="text"
                  name="businessHours"
                  value={formData.businessHours}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 8:00-17:00, Mon-Fri"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size
                </label>
                <input
                  type="text"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1 person, 2-5 employees"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Callout Fee
                </label>
                <input
                  type="text"
                  name="calloutFee"
                  value={formData.calloutFee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., R300 or Free"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio/Website URL
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Offer Emergency Services</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="insurance"
                      checked={formData.insurance}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Have Insurance</label>
                  </div>
                </div>
                
                {formData.insurance && (
                  <div className="mt-4">
                    <input
                      type="text"
                      name="insuranceDetails"
                      value={formData.insuranceDetails}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Insurance provider and coverage details"
                    />
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Response Time (hours)
                </label>
                <input
                  type="text"
                  name="responseTime"
                  value={formData.responseTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 24 hours"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Availability *
              </label>
              <div className="flex flex-wrap gap-3">
                {['weekdays', 'weekends', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleAvailability(day)}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.availability.includes(day)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b">6. Pricing & Terms</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Model *
                </label>
                <select
                  name="pricingModel"
                  value={formData.pricingModel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hourly">Hourly Rate</option>
                  <option value="daily">Daily Rate</option>
                  <option value="project">Project Based</option>
                  <option value="quote">Free Quote Required</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.pricingModel === 'quote' ? 'Average Project Range' : 'Hourly Rate'}
                </label>
                <input
                  type="text"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.pricingModel === 'quote' ? 'e.g., R1,500 - R15,000' : 'e.g., R450'}
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="acceptsCash"
                        checked={formData.acceptsCash}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Accepts Cash</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="acceptsCard"
                        checked={formData.acceptsCard}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Accepts Card Payments</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="depositRequired"
                        checked={formData.depositRequired}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Requires Deposit</label>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="insurance"
                      checked={formData.insurance}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Have Public Liability Insurance</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="pt-6 border-t">
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                  className="mt-1 mr-3"
                />
                <label className="text-sm text-gray-700">
                  I confirm that all information provided is accurate and complete. I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </label>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeMarketing"
                  checked={formData.agreeMarketing}
                  onChange={handleChange}
                  className="mt-1 mr-3"
                />
                <label className="text-sm text-gray-700">
                  I agree to receive occasional updates and marketing communications from FindAPro.
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                * Required fields
              </p>
              
              <button
                type="submit"
                disabled={loading || !formData.acceptTerms}
                className={`px-8 py-4 rounded-lg font-semibold text-lg ${
                  loading || !formData.acceptTerms
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Listing'}
              </button>
            </div>
          </div>
        </form>

        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="text-blue-600 text-2xl mb-3">🚀</div>
            <h4 className="font-semibold mb-2">Get More Customers</h4>
            <p className="text-sm text-gray-600">Reach thousands of potential customers in South Africa</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="text-blue-600 text-2xl mb-3">🛡️</div>
            <h4 className="font-semibold mb-2">Verified Badge</h4>
            <p className="text-sm text-gray-600">Build trust with our verification system</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="text-blue-600 text-2xl mb-3">📱</div>
            <h4 className="font-semibold mb-2">Free Listing</h4>
            <p className="text-sm text-gray-600">No monthly fees. Pay only for premium features</p>
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