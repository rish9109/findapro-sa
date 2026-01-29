'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { approveProvider, rejectProvider, pauseProvider, deleteProvider, reactivateProvider } from '@/lib/admin-actions'
import Link from 'next/link'

export default function ProviderDetailPage() {
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const router = useRouter()
  const params = useParams()
  const providerId = params.id as string

  useEffect(() => {
    fetchProvider()
    fetchAdminEmail()
  }, [providerId])

  async function fetchAdminEmail() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setAdminEmail(user.email || '')
  }

  async function fetchProvider() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single()

      if (error) throw error
      setProvider(data)
    } catch (error) {
      console.error('Error fetching provider:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(action: 'approve' | 'reject' | 'pause' | 'delete' | 'reactivate') {
    if (!providerId) return
  
    setActionLoading(true)
    setActionMessage('')
  
    try {
      let result
  
      switch (action) {
        case 'approve':
          result = await approveProvider(providerId)
          break
        case 'reject':
          if (!rejectionReason.trim()) {
            setActionMessage('Please provide a rejection reason')
            setActionLoading(false)
            return
          }
          result = await rejectProvider(providerId, rejectionReason)
          break
        case 'pause':
          result = await pauseProvider(providerId)
          break
        case 'delete':
          result = await deleteProvider(providerId)
          break
        case 'reactivate':
          result = await reactivateProvider(providerId)
          break
      }

      if (result?.success) {
        setActionMessage(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`)
        fetchProvider()
        setRejectionReason('')
        
        if (action === 'approve' || action === 'reject') {
          setTimeout(() => router.push('/admin/pending'), 1500)
        }
      } else {
        setActionMessage(`Failed to ${action}: ${result?.error?.message || 'Unknown error'}`)
      }
    } catch (error: any) {
      setActionMessage(`Error: ${error.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading provider details...</p>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mt-4">Provider not found</h2>
          <p className="text-gray-400 mt-2">The provider you're looking for doesn't exist or has been removed.</p>
   
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{provider.business_name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`px-3 py-1.5 text-sm font-semibold rounded-full
                ${provider.status === 'approved' ? 'bg-green-900/30 text-green-300 border border-green-700' :
                  provider.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700' :
                  provider.status === 'rejected' ? 'bg-red-900/30 text-red-300 border border-red-700' :
                  provider.status === 'paused' ? 'bg-gray-700 text-gray-300 border border-gray-600' :
                  'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                Status: {provider.status}
              </span>
              <span className="text-sm text-gray-400">
                Submitted: {new Date(provider.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-lg ${actionMessage.includes('success') 
            ? 'bg-green-900/30 text-green-300 border border-green-700' 
            : 'bg-red-900/30 text-red-300 border border-red-700'}`}>
            <div className="flex items-start gap-3">
              {actionMessage.includes('success') ? (
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{actionMessage}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Provider Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Details Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Business Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm text-gray-400">Business Name</label>
                  <p className="font-medium text-white mt-1">{provider.business_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Registration Number</label>
                  <p className="font-medium text-white mt-1">{provider.registration_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Main Service</label>
                  <p className="font-medium text-white mt-1">{provider.main_service}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Services Offered</label>
                  <p className="font-medium text-white mt-1">{provider.services_offered || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm text-gray-400">Contact Person</label>
                  <p className="font-medium text-white mt-1">{provider.contact_person}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Contact Email</label>
                  <p className="font-medium text-white mt-1">{provider.contact_email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone Number</label>
                  <p className="font-medium text-white mt-1">{provider.contact_phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Website</label>
                  <p className="font-medium mt-1">
                    {provider.website ? (
                      <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                        {provider.website}
                      </a>
                    ) : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Details Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-sm text-gray-400">Address</label>
                  <p className="font-medium text-white mt-1">{provider.address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">City</label>
                  <p className="font-medium text-white mt-1">{provider.city}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Province</label>
                  <p className="font-medium text-white mt-1">{provider.province}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Postal Code</label>
                  <p className="font-medium text-white mt-1">{provider.postal_code}</p>
                </div>
              </div>
            </div>

            {/* Additional Info Card */}
            {provider.additional_info && (
              <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Additional Information
                </h2>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-line">{provider.additional_info}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Admin Actions */}
          <div className="space-y-6">
            {/* Admin Actions Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Admin Actions
              </h2>
              
              <div className="space-y-4">
                {/* Approve Button */}
                {provider.status !== 'approved' && provider.status !== 'deleted' && (
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-green-900/30 text-green-300 hover:bg-green-900/40 border border-green-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {actionLoading ? 'Processing...' : 'Approve Provider'}
                  </button>
                )}

                {/* Reject Section */}
                {provider.status !== 'rejected' && provider.status !== 'deleted' && (
                  <div>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter rejection reason..."
                      className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-sm mb-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                    />
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-red-900/30 text-red-300 hover:bg-red-900/40 border border-red-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {actionLoading ? 'Processing...' : 'Reject Provider'}
                    </button>
                  </div>
                )}

                {/* Pause/Reactivate */}
                {provider.status === 'approved' ? (
                  <button
                    onClick={() => handleAction('pause')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/40 border border-yellow-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {actionLoading ? 'Processing...' : 'Pause Listing'}
                  </button>
                ) : provider.status === 'paused' ? (
                  <button
                    onClick={() => handleAction('reactivate')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-900/30 text-blue-300 hover:bg-blue-900/40 border border-blue-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {actionLoading ? 'Processing...' : 'Reactivate'}
                  </button>
                ) : null}

                {/* Delete Button */}
                {provider.status !== 'deleted' && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
                        handleAction('delete')
                      }
                    }}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600 py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {actionLoading ? 'Processing...' : 'Delete Permanently'}
                  </button>
                )}

                {/* View in public directory */}
                <a
                  href={`/providers/${provider.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-gray-900/50 text-gray-300 hover:text-white hover:bg-gray-900 border border-gray-700 py-3 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Public Listing
                </a>
              </div>
            </div>

            {/* Status History Card */}
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-5 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status History
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Created:</span>
                  <span className="font-medium text-white">{new Date(provider.created_at).toLocaleString()}</span>
                </div>
                {provider.reviewed_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Last reviewed:</span>
                    <span className="font-medium text-white">{new Date(provider.reviewed_at).toLocaleString()}</span>
                  </div>
                )}
                {provider.reviewed_by && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Reviewed by:</span>
                    <span className="font-medium text-white">{provider.reviewed_by}</span>
                  </div>
                )}
                {provider.rejection_reason && (
                  <div className="pt-3 border-t border-gray-700">
                    <span className="text-sm text-gray-400 block mb-2">Rejection reason:</span>
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{provider.rejection_reason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}