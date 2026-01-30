// File: src/app/providers/dashboard/page.tsx - FIXED VERSION
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
  EyeOff,
  Loader2,
  RefreshCw,
  Play,
  Pause,
  Info,
  MapPin
} from 'lucide-react'

// Status badge configuration - UPDATED to match DATABASE status values ('pause' not 'paused')
const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    label: 'Pending Review',
    action: 'edit'
  },
  approved: { // This is "Live" status
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    label: 'Live',
    action: 'edit'
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    label: 'Rejected',
    action: 'resubmit'
  },
  pause: {  // <-- CHANGED FROM 'paused' TO 'pause' (DATABASE VALUE)
    icon: Pause,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    label: 'Paused',
    action: 'edit'
  }
  // Note: 'suspended' and 'deleted' are NOT in database constraint, so they won't appear
}

// Interface for service area data
interface ServiceAreaData {
  primaryArea?: string;
  additionalAreas?: string[];
}

export default function ProviderDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  const [listings, setListings] = useState<Provider[]>([])
  const [serviceAreas, setServiceAreas] = useState<Record<string, ServiceAreaData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoError, setLogoError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        // Load user's listings
        const userListings = await getUserListings(user.id)
        console.log('Listings loaded:', userListings) // Debug log
        setListings(userListings)
        
        // Load service areas for each listing
        const areasData: Record<string, ServiceAreaData> = {}
        
        for (const listing of userListings) {
          // Try to get service areas from new table first
          const { data: serviceAreasData } = await supabase
            .from('provider_service_areas')
            .select('area_name, is_primary')
            .eq('provider_id', listing.id)
            .order('position')
          
          if (serviceAreasData && serviceAreasData.length > 0) {
            const primaryArea = serviceAreasData.find(area => area.is_primary)
            const additionalAreas = serviceAreasData.filter(area => !area.is_primary)
            
            areasData[listing.id] = {
              primaryArea: primaryArea?.area_name || '',
              additionalAreas: additionalAreas.map(area => area.area_name)
            }
          } else {
            // Fallback to old service_areas field
            areasData[listing.id] = {
              primaryArea: listing.main_service_area || listing.city || '',
              additionalAreas: []
            }
          }
        }
        
        setServiceAreas(areasData)
        
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
      // Since 'deleted' is not in database constraint, we should actually delete the record
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

  const handleResubmitListing = async (listingId: string) => {
    try {
      // Update listing status back to pending
      const { error } = await supabase
        .from('providers')
        .update({ 
          status: 'pending',
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .eq('user_id', user?.id)

      if (error) throw error
      
      // Update local state
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: 'pending', rejection_reason: null }
            : listing
        )
      )
      
      setSuccess('Listing submitted for review!')
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err: any) {
      console.error('Error resubmitting listing:', err)
      setError(err.message || 'Failed to resubmit listing')
    }
  }

  const handleTogglePauseListing = async (listingId: string, currentStatus: string) => {
    console.log('Toggling pause status:', listingId, 'current:', currentStatus)
    
    try {
      const newStatus = currentStatus === 'pause' ? 'approved' : 'pause' // <-- FIXED: 'pause' not 'paused'
      console.log('Setting new status:', newStatus)
      
      const { error } = await supabase
        .from('providers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }
      
      // Update local state
      setListings(prev => 
        prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: newStatus }
            : listing
        )
      )
      
      const action = newStatus === 'pause' ? 'paused' : 'resumed'
      setSuccess(`Listing ${action} successfully!`)
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err: any) {
      console.error('Error toggling pause status:', err)
      setError(err.message || 'Failed to update listing')
    }
  }

  const handleViewListing = (listingId: string) => {
    // This would link to the public listing page
    router.push(`/providers/${listingId}`)
  }

  // Count listings by status for quick overview - UPDATED to match database values
  const liveCount = listings.filter(l => l.status === 'approved').length
  const pendingCount = listings.filter(l => l.status === 'pending').length
  const rejectedCount = listings.filter(l => l.status === 'rejected').length
  const pausedCount = listings.filter(l => l.status === 'pause').length // <-- FIXED: 'pause' not 'paused'
  
  // Remove suspended and deleted counts since they're not in database constraint
  // const suspendedCount = listings.filter(l => l.status === 'suspended').length
  // const deletedCount = listings.filter(l => l.status === 'deleted').length

  // Get primary service area for a listing
  const getPrimaryServiceArea = (listingId: string) => {
    const areaData = serviceAreas[listingId]
    return areaData?.primaryArea || 'Not specified'
  }

  // Debug: Log current listings and counts
  useEffect(() => {
    if (listings.length > 0) {
      console.log('Current listings:', listings.map(l => ({ 
        id: l.id, 
        name: l.business_name, 
        status: l.status 
      })))
      console.log('Counts:', { liveCount, pendingCount, rejectedCount, pausedCount })
    }
  }, [listings, liveCount, pendingCount, rejectedCount, pausedCount])

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

        {/* Edit Warning Notice */}
        {listings.some(l => l.status === 'approved') && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-400 font-medium mb-1">
                  Important Note About Editing Live Listings
                </p>
                <p className="text-sm text-blue-300">
                  When you edit a <span className="font-semibold">Live</span> listing and save changes, 
                  it will need to be <span className="font-semibold">re-approved</span> by our team 
                  before going live again. This ensures all information remains accurate and up-to-date.
                </p>
              </div>
            </div>
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

            {/* Quick Stats */}
            <div className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Listing Overview</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Listings</span>
                  <span className="text-white font-semibold">{listings.length}/3</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-gray-400">Live</span>
                  </div>
                  <span className="text-white font-semibold">{liveCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-400">Pending</span>
                  </div>
                  <span className="text-white font-semibold">{pendingCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-400">Rejected</span>
                  </div>
                  <span className="text-white font-semibold">{rejectedCount}</span>
                </div>
                
                {/* Always show Paused count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-gray-400">Paused</span>
                  </div>
                  <span className="text-white font-semibold">{pausedCount}</span>
                </div>
              </div>
            </div>

            {/* Add Listing Button - Dynamic */}
            <Link
              href={listings.length < 3 ? "/providers/provider-listings" : "#"}
              className={`block w-full py-3 text-center rounded-xl font-semibold transition-all duration-300 ${
                listings.length < 3
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white cursor-pointer'
                  : 'bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (listings.length >= 3) {
                  e.preventDefault()
                }
              }}
            >
              <Plus className="w-5 h-5 inline-block mr-2" />
              {listings.length < 3 ? 'Add New Listing' : 'Maximum Listings Reached'}
            </Link>
            
            {listings.length >= 3 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Delete an existing listing to add a new one
              </p>
            )}
          </div>

          {/* Right Column: Listings */}
          <div className="lg:col-span-2">
            {/* Header with counts */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Listings</h2>
              <div className="text-sm text-gray-400">
                Showing {listings.length} of 3 listings
              </div>
            </div>

            {/* Listings */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50">
                <Building className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No Listings Yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't created any service listings yet. Create your first listing to start getting customers.
                </p>
                <Link
                  href="/providers/provider-listings"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-lg font-medium transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => {
                  const statusInfo = statusConfig[listing.status] || statusConfig.pending
                  const StatusIcon = statusInfo.icon
                  const isLive = listing.status === 'approved'
                  const isPaused = listing.status === 'pause' // <-- FIXED: 'pause' not 'paused'
                  const isRejected = listing.status === 'rejected'
                  const primaryServiceArea = getPrimaryServiceArea(listing.id)
                  
                  return (
                    <div
                      key={listing.id}
                      className="bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50 hover:border-gray-600 p-5 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Listing Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-white text-lg mb-1">
                                {listing.business_name}
                              </h3>
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusInfo.bgColor} border ${statusInfo.borderColor}`}>
                                  <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                                  <span className={`text-xs font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                </div>
                                {listing.verified && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Mobile Actions */}
                            <div className="sm:hidden flex items-center gap-2">
                              {isLive && (
                                <button
                                  onClick={() => handleViewListing(listing.id)}
                                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                                  title="View Listing"
                                >
                                  <Eye className="w-4 h-4 text-gray-300" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleEditListing(listing.id)}
                                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 text-blue-400" />
                              </button>
                              
                              {isRejected && (
                                <button
                                  onClick={() => handleResubmitListing(listing.id)}
                                  className="p-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg transition-colors"
                                  title="Resubmit"
                                >
                                  <RefreshCw className="w-4 h-4 text-orange-400" />
                                </button>
                              )}
                              
                              {/* Pause/Resume Toggle for Live/Paused listings */}
                              {(isLive || isPaused) && (
                                <button
                                  onClick={() => handleTogglePauseListing(listing.id, listing.status)}
                                  className="p-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg transition-colors"
                                  title={isLive ? 'Pause Listing' : 'Resume Listing'}
                                >
                                  {isLive ? (
                                    <Pause className="w-4 h-4 text-orange-400" />
                                  ) : (
                                    <Play className="w-4 h-4 text-orange-400" />
                                  )}
                                </button>
                              )}
                              
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
                              
                              {/* Primary Service Area */}
                              <div className="space-y-1">
                                <p className="text-xs text-gray-400">Primary Service Area</p>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                  <p className="text-white text-sm">{primaryServiceArea}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-xs text-gray-400">Contact</p>
                                <p className="text-white text-sm">{listing.contact_person}</p>
                              </div>
                            </div>
                            
                            {/* Status-specific messages */}
                            {listing.status === 'pending' && (
                              <div className="text-xs text-yellow-400 bg-yellow-500/10 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">Under Review:</span> Your listing is being reviewed by our team. We'll contact you soon.
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {isRejected && listing.rejection_reason && (
                              <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">Rejection reason:</span> {listing.rejection_reason}
                                    <p className="mt-1 text-red-300">
                                      Edit your listing to address the issues above, then click "Resubmit" to send for review.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {isPaused && (
                              <div className="text-xs text-orange-400 bg-orange-500/10 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Pause className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">Listing Paused:</span> Your listing is not visible to customers.
                                    {listing.pause_reason && (
                                      <>
                                        <br />
                                        <span className="font-medium">Reason:</span> {listing.pause_reason}
                                      </>
                                    )}
                                    <p className="mt-1 text-orange-300">Click "Resume" to make your listing live again.</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Live listing edit warning */}
                            {isLive && (
                              <div className="text-xs text-blue-400 bg-blue-500/10 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">Note:</span> Editing this live listing will require re-approval by our team.
                                    Your listing will remain live until changes are reviewed.
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop Actions */}
                        <div className="hidden sm:flex flex-col gap-2">
                          {/* View button - ONLY for Live listings */}
                          {isLive && (
                            <button
                              onClick={() => handleViewListing(listing.id)}
                              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          )}
                          
                          {/* Edit button */}
                          <button
                            onClick={() => handleEditListing(listing.id)}
                            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          
                          {/* Resubmit Button for rejected listings */}
                          {isRejected && (
                            <button
                              onClick={() => handleResubmitListing(listing.id)}
                              className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500/50 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Resubmit
                            </button>
                          )}
                          
                          {/* Pause/Resume Toggle for Live/Paused listings */}
                          {(isLive || isPaused) && (
                            <button
                              onClick={() => handleTogglePauseListing(listing.id, listing.status)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 ${
                                isLive
                                  ? 'bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500/50'
                                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50'
                              }`}
                            >
                              {isLive ? (
                                <>
                                  <Pause className="w-4 h-4" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  Resume
                                </>
                              )}
                            </button>
                          )}
                          
                          {/* Delete button */}
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
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    You have {listings.length} of 3 listings used. {3 - listings.length} remaining.
                  </p>
                  <Link
                    href="/providers/provider-listings"
                    className="text-sm text-orange-400 hover:text-orange-300 font-medium"
                  >
                    Add New Listing
                  </Link>
                </div>
              </div>
            )}
            
            {listings.length >= 3 && (
              <div className="mt-6 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <p className="text-sm text-orange-400">
                  <span className="font-medium">Maximum limit reached:</span> You have 3 active listings. 
                  Delete an existing listing to add a new one.
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
              <div className="h-32 bg-gray-800 rounded-xl"></div>
              <div className="h-32 bg-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}