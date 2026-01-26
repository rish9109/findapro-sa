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
          result = await approveProvider(providerId)  // No adminEmail
          break
        case 'reject':
          if (!rejectionReason.trim()) {
            setActionMessage('Please provide a rejection reason')
            setActionLoading(false)
            return
          }
          result = await rejectProvider(providerId, rejectionReason)  // No adminEmail
          break
        case 'pause':
          result = await pauseProvider(providerId)  // No adminEmail
          break
        case 'delete':
          result = await deleteProvider(providerId)  // No adminEmail
          break
        case 'reactivate':
          result = await reactivateProvider(providerId)  // No adminEmail
          break
      }

      if (result?.success) {
        setActionMessage(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`)
        fetchProvider() // Refresh data
        setRejectionReason('')
        
        // Redirect to pending page if approving/rejecting from pending list
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
      <div className="text-center py-12">
        <p>Loading provider details...</p>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="text-center py-12">
        <p>Provider not found</p>
        <Link href="/admin/providers" className="text-blue-600 hover:underline">
          Back to providers
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/admin/providers" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to providers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{provider.business_name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full
              ${provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                provider.status === 'rejected' ? 'bg-red-100 text-red-800' :
                provider.status === 'paused' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'}`}>
              Status: {provider.status}
            </span>
            <span className="text-sm text-gray-600">
              Submitted: {new Date(provider.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className={`mb-6 p-4 rounded-lg ${actionMessage.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Provider Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Details Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Business Name</label>
                <p className="font-medium">{provider.business_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Registration Number</label>
                <p className="font-medium">{provider.registration_number || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Main Service</label>
                <p className="font-medium">{provider.main_service}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Services Offered</label>
                <p className="font-medium">{provider.services_offered || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Contact Person</label>
                <p className="font-medium">{provider.contact_person}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Contact Email</label>
                <p className="font-medium">{provider.contact_email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone Number</label>
                <p className="font-medium">{provider.contact_phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Website</label>
                <p className="font-medium">
                  {provider.website ? (
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {provider.website}
                    </a>
                  ) : 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Location Details Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <p className="font-medium">{provider.address}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">City</label>
                <p className="font-medium">{provider.city}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Province</label>
                <p className="font-medium">{provider.province}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Postal Code</label>
                <p className="font-medium">{provider.postal_code}</p>
              </div>
            </div>
          </div>

          {/* Additional Info Card */}
          {provider.additional_info && (
            <div className="bg-white rounded-lg shadow border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <p className="text-gray-700 whitespace-pre-line">{provider.additional_info}</p>
            </div>
          )}
        </div>

        {/* Right Column - Admin Actions */}
        <div className="space-y-6">
          {/* Admin Actions Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
            
            <div className="space-y-4">
              {/* Approve Button */}
              {provider.status !== 'approved' && provider.status !== 'deleted' && (
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : '✓ Approve Provider'}
                </button>
              )}

              {/* Reject Section */}
              {provider.status !== 'rejected' && provider.status !== 'deleted' && (
                <div>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="w-full border border-gray-300 rounded-md p-3 text-sm mb-2"
                    rows={3}
                  />
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Processing...' : '✗ Reject Provider'}
                  </button>
                </div>
              )}

              {/* Pause/Reactivate */}
              {provider.status === 'approved' ? (
                <button
                  onClick={() => handleAction('pause')}
                  disabled={actionLoading}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : '⏸️ Pause Listing'}
                </button>
              ) : provider.status === 'paused' ? (
                <button
                  onClick={() => handleAction('reactivate')}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : '▶️ Reactivate'}
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
                  className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : '🗑️ Delete Permanently'}
                </button>
              )}

              {/* View in public directory */}
              <a
                href={`/providers/${provider.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 border"
              >
                👁️ View Public Listing
              </a>
            </div>
          </div>

          {/* Status History Card */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{new Date(provider.created_at).toLocaleString()}</span>
              </div>
              {provider.reviewed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last reviewed:</span>
                  <span className="font-medium">{new Date(provider.reviewed_at).toLocaleString()}</span>
                </div>
              )}
              {provider.reviewed_by && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviewed by:</span>
                  <span className="font-medium">{provider.reviewed_by}</span>
                </div>
              )}
              {provider.rejection_reason && (
                <div>
                  <span className="text-gray-600 block mb-1">Rejection reason:</span>
                  <p className="text-red-600 text-sm">{provider.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}