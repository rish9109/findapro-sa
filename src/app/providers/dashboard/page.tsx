// File: src/app/providers/dashboard/page.tsx - SIMPLIFIED VERSION
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Provider, getUserListings } from '@/lib/supabase'
import { uploadLogo, deleteLogo } from '@/lib/vercel-blob'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Building, 
  Edit, 
  Trash2, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Shield,
  Plus,
  Image as ImageIcon,
  Eye,
  ExternalLink,
  Loader2
} from 'lucide-react'

// Status badge configuration
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
    label: 'Live'
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
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    label: 'Deleted'
  }
}
export default function ProviderDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  const [listings, setListings] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoError, setLogoError] = useState('')
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'pending' | 'other'>('all')

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        // Load user's listings
        const userListings = await getUserListings(user.id)
        setListings(userListings)
        
  // Load logo URL from user metadata
const userLogo = (user.user_metadata as any)?.logo_url
if (userLogo) {
  setLogoUrl(userLogo)
}
        
      } catch (err: any) {
        console.error('Error loading dashboard:', err)
        setError('Failed to load your listings')
      } finally {
        setLoading(false)
      }
    }
    
    if (!isLoading && user) {
      loadDashboard()
    }
  }, [user, isLoading])

  // Filter listings based on active tab
  const filteredListings = listings.filter(listing => {
    if (activeTab === 'all') return true
    if (activeTab === 'live') return listing.status === 'approved'
    if (activeTab === 'pending') return listing.status === 'pending'
    if (activeTab === 'other') return !['approved', 'pending'].includes(listing.status)
    return true
  })

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return
    
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      setLogoError('Please upload a valid image file (JPEG, PNG, WEBP, SVG)')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setLogoError('Image size must be less than 5MB')
      return
    }
    
    setUploadingLogo(true)
    setLogoError('')
    
    try {
      // Delete old logo if exists
      if (logoUrl) {
        await deleteLogo(logoUrl)
      }
      
      // Upload new logo
      const result = await uploadLogo({
        userId: user.id,
        file
      })
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      
      // Update user metadata with new logo URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          logo_url: result.url,
          logo_updated_at: new Date().toISOString()
        }
      })
      
      if (updateError) throw updateError
      
      setLogoUrl(result.url || null)
      setSuccess('Logo updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err: any) {
      console.error('Error uploading logo:', err)
      setLogoError(err.message || 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
      event.target.value = '' // Reset file input
    }
  }

  const handleDeleteListing = async (listingId: string, listingName: string) => {
    if (!confirm(`Are you sure you want to delete "${listingName}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user?.id)

      if (error) throw error
      
      // Remove from local state
      setListings(prev => prev.filter(l => l.id !== listingId))
      
      setSuccess('Listing deleted successfully!')
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err: any) {
      console.error('Error deleting listing:', err)
      setError(err.message || 'Failed to delete listing')
    }
  }

  const handleEditListing = (listingId: string) => {
    router.push(`/providers/edit-listing/${listingId}`)
  }

  const handleViewListing = (listingId: string) => {
    // This would link to the public listing page
    router.push(`/providers/${listingId}`)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            My Listings
          </h1>
          <p className="text-gray-400">
            Manage your service listings and business logo
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Logo & Actions */}
          <div className="lg:col-span-1">
            {/* Logo Upload Card */}
            <div className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Business Logo</h2>
              
              <div className="space-y-4">
                {/* Current Logo Display */}
                <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-dashed border-gray-700 overflow-hidden flex items-center justify-center">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Business Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs">No logo uploaded</p>
                    </div>
                  )}
                  
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`block w-full py-2.5 rounded-lg font-medium text-center cursor-pointer transition-all duration-300 text-sm ${
                      uploadingLogo
                        ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
                    }`}
                  >
                    {uploadingLogo ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        {logoUrl ? 'Change Logo' : 'Upload Logo'}
                      </span>
                    )}
                  </label>
                  
                  {logoError && (
                    <p className="mt-2 text-xs text-red-400 text-center">{logoError}</p>
                  )}
                  
                  <p className="text-xs text-gray-500 text-center mt-2">
                    PNG, JPG, max 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Add Listing Button */}
            {listings.length < 3 && (
              <Link
                href="/providers/provider-listings"
                className="block w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl font-semibold transition-all duration-300 text-center"
              >
                <Plus className="w-5 h-5 inline-block mr-2" />
                Add New Listing
              </Link>
            )}
          </div>

          {/* Right Column: Listings */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                All ({listings.length})
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'live'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Live ({listings.filter(l => l.status === 'approved').length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'border-yellow-500 text-yellow-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Pending ({listings.filter(l => l.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('other')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'other'
                    ? 'border-gray-500 text-gray-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Other ({listings.filter(l => !['approved', 'pending'].includes(l.status)).length})
              </button>
            </div>

            {/* Listings */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50">
                <Building className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  {activeTab === 'all' ? 'No Listings Yet' : `No ${activeTab} listings`}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {activeTab === 'all' 
                    ? 'You haven\'t created any service listings yet.'
                    : `You don't have any ${activeTab} listings.`
                  }
                </p>
                {activeTab === 'all' && listings.length < 3 && (
                  <Link
                    href="/providers/provider-listings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-lg font-medium transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Listing
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((listing) => {
                  const statusInfo = statusConfig[listing.status] || statusConfig.pending
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <div
                      key={listing.id}
                      className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50 p-5 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Listing Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-white text-lg mb-1">{listing.business_name}</h3>
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                                  <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                                  <span className={`text-xs font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Mobile Actions */}
                            <div className="sm:hidden flex items-center gap-2">
                              <button
                                onClick={() => handleEditListing(listing.id)}
                                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteListing(listing.id, listing.business_name)}
                                className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Listing Details */}
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-gray-400">Service</p>
                                <p className="text-white text-sm">{listing.main_service}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-400">Location</p>
                                <p className="text-white text-sm">{listing.city}, {listing.province}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-400">Contact</p>
                                <p className="text-white text-sm">{listing.contact_person}</p>
                              </div>
                            </div>
                            
                            {/* Status-specific messages */}
                            {listing.status === 'pending' && (
                              <div className="text-xs text-yellow-400 bg-yellow-500/10 p-3 rounded-lg">
                                Your listing is under review. Our team will contact you soon.
                              </div>
                            )}
                            
                            {listing.status === 'rejected' && listing.rejection_reason && (
                              <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg">
                                <span className="font-medium">Rejection reason:</span> {listing.rejection_reason}
                              </div>
                            )}
                            
                            {listing.status === 'paused' && listing.pause_reason && (
                              <div className="text-xs text-orange-400 bg-orange-500/10 p-3 rounded-lg">
                                <span className="font-medium">Paused:</span> {listing.pause_reason}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop Actions */}
                        <div className="hidden sm:flex flex-col gap-2">
                          <button
                            onClick={() => handleViewListing(listing.id)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditListing(listing.id)}
                            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteListing(listing.id, listing.business_name)}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* Listing Limit Notice */}
            {listings.length > 0 && listings.length < 3 && (
              <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <p className="text-sm text-gray-400">
                  You have {listings.length} of 3 listings used. {3 - listings.length} remaining.
                </p>
              </div>
            )}
            
            {listings.length >= 3 && (
              <div className="mt-6 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <p className="text-sm text-orange-400">
                  You have reached the maximum of 3 listings. Delete an existing listing to add a new one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="animate-pulse">
          {/* Header */}
          <div className="h-10 bg-gray-800 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-800 rounded w-96 mb-8"></div>
          
          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Logo Card */}
            <div className="space-y-6">
              <div className="h-64 bg-gray-800 rounded-2xl"></div>
              <div className="h-12 bg-gray-800 rounded-xl"></div>
            </div>
            
            {/* Listings */}
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-800 rounded-xl"></div>
              <div className="h-32 bg-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}