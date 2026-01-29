// File: src/app/providers/edit-listing/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Provider } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Building,
  Sparkles,
  Loader2
} from 'lucide-react'

// Types
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
  // Add this configuration for the 'deleted' status
  deleted: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-600/10',
    borderColor: 'border-red-600/20',
    label: 'Deleted'
  }
}

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [listing, setListing] = useState<Provider | null>(null)
  
  // Dynamic data
  const [provinces, setProvinces] = useState<Province[]>([])
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showProvinceModal, setShowProvinceModal] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    business_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    alternate_phone: '',
    main_service: '',
    main_service_id: '',
    other_services: '',
    experience_years: '',
    certifications: '',
    physical_address: '',
    city: '',
    province: '',
    province_id: '',
    service_areas: '',
    hourly_rate: '',
    callout_fee: '',
    accepts_card: false,
    accepts_cash: true,
    deposit_required: false,
    emergency_service: false,
    insurance: false,
    insurance_details: '',
    portfolio_url: '',
  })

  useEffect(() => {
    const loadData = async () => {
      if (!user || isLoading) return
      
      setLoading(true)
      try {
        const listingId = params.id as string
        
        // Fetch listing
        const { data: listingData, error: listingError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', listingId)
          .eq('user_id', user.id) // Security: user can only edit their own listings
          .single()
        
        if (listingError) {
          if (listingError.code === 'PGRST116') {
            setError('Listing not found or you do not have permission to edit it.')
          } else {
            throw listingError
          }
          return
        }
        
        if (!listingData) {
          setError('Listing not found')
          return
        }
        
        setListing(listingData)
        
        // Set form data
        setFormData({
          business_name: listingData.business_name || '',
          contact_person: listingData.contact_person || '',
          contact_email: listingData.contact_email || '',
          contact_phone: listingData.contact_phone || '',
          alternate_phone: listingData.alternate_phone || '',
          main_service: listingData.main_service || '',
          main_service_id: listingData.main_service_id || '',
          other_services: listingData.other_services || '',
          experience_years: listingData.experience_years || '',
          certifications: listingData.certifications || '',
          physical_address: listingData.physical_address || '',
          city: listingData.city || '',
          province: listingData.province || '',
          province_id: listingData.province_id || '',
          service_areas: listingData.service_areas || '',
          hourly_rate: listingData.hourly_rate || '',
          callout_fee: listingData.callout_fee || '',
          accepts_card: listingData.accepts_card || false,
          accepts_cash: listingData.accepts_cash ?? true,
          deposit_required: listingData.deposit_required || false,
          emergency_service: listingData.emergency_service || false,
          insurance: listingData.insurance || false,
          insurance_details: listingData.insurance_details || '',
          portfolio_url: listingData.portfolio_url || '',
        })
        
        // Fetch provinces
        const { data: provincesData } = await supabase
          .from('provinces')
          .select('id, name, code')
          .order('name')
        setProvinces(provincesData || [])
        
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
    
    if (!isLoading) {
      if (!user) {
        router.push('/')
      } else {
        loadData()
      }
    }
  }, [user, isLoading, router, params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const selectService = (service: ServiceCategory) => {
    setFormData(prev => ({ 
      ...prev, 
      main_service: service.name,
      main_service_id: service.id 
    }))
    setShowServiceModal(false)
  }

  const selectProvince = (province: Province) => {
    setFormData(prev => ({ 
      ...prev, 
      province: province.name,
      province_id: province.id 
    }))
    setShowProvinceModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !listing) return
    
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      // Basic validation
      if (!formData.business_name.trim()) {
        throw new Error('Business name is required')
      }
      if (!formData.contact_person.trim()) {
        throw new Error('Contact person is required')
      }
      if (!formData.contact_phone.trim()) {
        throw new Error('Contact phone is required')
      }
      if (!formData.main_service.trim()) {
        throw new Error('Main service is required')
      }
      if (!formData.city.trim()) {
        throw new Error('City is required')
      }
      if (!formData.province.trim()) {
        throw new Error('Province is required')
      }
      
      // Prepare update data (excluding contact_email since it's locked)
      const { contact_email, ...updateData } = {
        ...formData,
        updated_at: new Date().toISOString()
      }
      
      // Update listing
      const { error: updateError } = await supabase
        .from('providers')
        .update(updateData)
        .eq('id', listing.id)
        .eq('user_id', user.id) // Security: user can only update their own listings
      
      if (updateError) throw updateError
      
      setSuccess('Listing updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('')
        router.push('/providers/dashboard')
      }, 3000)
      
    } catch (err: any) {
      console.error('Error updating listing:', err)
      setError(err.message || 'Failed to update listing')
    } finally {
      setSaving(false)
    }
  }
  const handleDelete = async () => {
    if (!listing || !user) return
    
    if (!confirm(`Are you sure you want to delete "${listing.business_name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', listing.id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      router.push('/providers/dashboard')
    } catch (err: any) {
      console.error('Error deleting listing:', err)
      setError(err.message || 'Failed to delete listing')
    }
  }

  if (isLoading || loading) {
    return <LoadingSkeleton />
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24">
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all"
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

  const statusInfo = statusConfig[listing.status] || statusConfig.pending
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
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

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-emerald-400 font-medium">{success}</p>
                <p className="text-sm text-emerald-400/80">Redirecting to dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 p-6 md:p-8">
          {/* Business Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span>
              Business Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#4299E1] mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="Your registered business name"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span>
              Contact Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#4299E1] mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="Full name of contact person"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#4299E1] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                  placeholder="Your registered email"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email address cannot be changed
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#4299E1] mb-2">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="+27 12 345 6789"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="alternate_phone"
                  value={formData.alternate_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span>
              Service Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#4299E1] mb-2">
                  Main Service Category *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(true)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-left focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 flex justify-between items-center hover:border-blue-500 transition-colors"
                  >
                    <span className={formData.main_service ? "text-white" : "text-gray-500"}>
                      {formData.main_service || "Select your main service"}
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
                  name="other_services"
                  value={formData.other_services}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="List any additional services you offer (comma separated)"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#4299E1] mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="text"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
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
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="e.g., SAQCC, Wireman's License"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Coverage */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">4</span>
              Location & Coverage
            </h2>
            
            <div className="space-y-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Physical Address
                </label>
                <textarea
                  name="physical_address"
                  value={formData.physical_address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="Full street address"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#4299E1] mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="e.g., Johannesburg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#4299E1] mb-2">
                    Province *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowProvinceModal(true)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-left focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 flex justify-between items-center hover:border-blue-500 transition-colors"
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
                  name="service_areas"
                  value={formData.service_areas}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="List suburbs or areas you serve"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">5</span>
              Business Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hourly Rate
                </label>
                <input
                  type="text"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="e.g., R450"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Callout Fee
                </label>
                <input
                  type="text"
                  name="callout_fee"
                  value={formData.callout_fee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="e.g., R300 or Free"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Portfolio/Website URL
                </label>
                <input
                  type="url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="https://yourbusiness.co.za"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accepts_cash"
                      checked={formData.accepts_cash}
                      onChange={handleChange}
                      className="mr-2 accent-blue-500"
                    />
                    <label className="text-sm text-gray-300">Accepts Cash</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="accepts_card"
                      checked={formData.accepts_card}
                      onChange={handleChange}
                      className="mr-2 accent-blue-500"
                    />
                    <label className="text-sm text-gray-300">Accepts Card Payments</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="deposit_required"
                      checked={formData.deposit_required}
                      onChange={handleChange}
                      className="mr-2 accent-blue-500"
                    />
                    <label className="text-sm text-gray-300">Requires Deposit</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="emergency_service"
                      checked={formData.emergency_service}
                      onChange={handleChange}
                      className="mr-2 accent-blue-500"
                    />
                    <label className="text-sm text-gray-300">Offer Emergency Services</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="insurance"
                      checked={formData.insurance}
                      onChange={handleChange}
                      className="mr-2 accent-blue-500"
                    />
                    <label className="text-sm text-gray-300">Have Insurance</label>
                  </div>
                </div>
                
                {formData.insurance && (
                  <div className="mt-4">
                    <input
                      type="text"
                      name="insurance_details"
                      value={formData.insurance_details}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      placeholder="Insurance provider and coverage details"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400">
                  Changes will be saved immediately. Status may need re-approval if changed.
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
                  disabled={saving}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    saving
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
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
                      formData.main_service_id === service.id
                        ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-blue-500 text-blue-300'
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
                      formData.province_id === province.id
                        ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-blue-500 text-blue-300'
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

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-48 mb-8"></div>
          <div className="h-64 bg-gray-800 rounded-2xl mb-8"></div>
          <div className="h-96 bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}