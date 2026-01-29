// File: src/app/admin/pending/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function PendingReviewsPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    fetchPendingProviders()
    fetchAdminEmail()
  }, [])

  async function fetchPendingProviders() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) throw error
      setProviders(data || [])
    } catch (error) {
      console.error('Error fetching pending providers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAdminEmail() {
    const { data: { user } } = await supabase.auth.getUser()
    setAdminEmail(user?.email || '')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const sendAdminEmail = async (provider: any) => {
    const subject = `New Provider Submission: ${provider.business_name}`
    const body = `
New provider submission requires review:

Business: ${provider.business_name}
Contact: ${provider.contact_person}
Email: ${provider.contact_email}
Phone: ${provider.contact_phone}
Service: ${provider.main_service}
Location: ${provider.city}, ${provider.province}

Submitted: ${formatDate(provider.created_at)}

Review URL: ${window.location.origin}/admin/providers/${provider.id}/review

Please review and take appropriate action.

Regards,
FindAPro System
    `.trim()

    // Create mailto link
    const mailtoLink = `mailto:admin@findapro.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-gray-400">Loading pending reviews...</p>
          <p className="text-sm text-gray-600 mt-2">Checking for new submissions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Pending Reviews</h1>
          <p className="text-gray-400 mt-2">
            Review and approve/reject new provider submissions
          </p>
          <div className="mt-3 text-sm text-gray-500">
            <span className="bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-full">
              {providers.length} pending submission{providers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => fetchPendingProviders()}
            className="px-4 py-2.5 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          {providers.length > 0 && (
            <button
              onClick={() => {
                if (confirm(`Send email notifications for all ${providers.length} pending submissions?`)) {
                  providers.forEach(sendAdminEmail)
                }
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email All to Admin
            </button>
          )}
        </div>
      </div>

      {providers.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 md:p-12 text-center">
          <div className="text-5xl mb-6">🎉</div>
          <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">All Caught Up!</h3>
          <p className="text-gray-400 mb-6">No pending reviews at the moment.</p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New submissions will appear here automatically
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div 
              key={provider.id} 
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-yellow-600/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]"
            >
              <div className="p-5 md:p-6">
                {/* Header with business name and status */}
                <div className="flex justify-between items-start mb-5">
                  <div className="min-w-0 flex-1 pr-3">
                    <h3 className="text-lg font-semibold text-white truncate">{provider.business_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-400 truncate">{provider.city}, {provider.province}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-900/30 text-yellow-300 border border-yellow-700 flex-shrink-0">
                    Pending
                  </span>
                </div>

                {/* Provider Details */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-900/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Contact Person</p>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="font-medium text-white">{provider.contact_person}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Contact Email</p>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="font-medium text-white truncate">{provider.contact_email}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="font-medium text-white">{provider.contact_phone}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Main Service</p>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="font-medium text-white">{provider.main_service}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Submitted</p>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="font-medium text-white text-sm">{formatDate(provider.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Other Services (if exists) */}
                {provider.other_services && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Other Services
                    </p>
                    <div className="bg-gray-900/50 border border-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-300">{provider.other_services}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href={`/admin/providers/${provider.id}/review`}
                    className="block w-full text-center py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Review Submission
                  </Link>
                  
                  <button
                    onClick={() => sendAdminEmail(provider)}
                    className="block w-full text-center py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white hover:border-gray-500 font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email to Admin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {providers.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="text-center text-sm text-gray-500">
            Showing {providers.length} pending submission{providers.length !== 1 ? 's' : ''} • 
            <span className="mx-2">•</span>
            Average wait time: 1-2 business days
          </div>
        </div>
      )}
    </div>
  )
}