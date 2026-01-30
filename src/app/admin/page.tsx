// File: src/app/admin/pages.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { approveProvider, rejectProvider, pauseProvider } from '@/lib/admin-actions'
import Link from 'next/link'

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [filteredProviders, setFilteredProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProviders()
    fetchAdminEmail()
  }, [])

  useEffect(() => {
    filterProviders()
  }, [providers, statusFilter, searchQuery])

  async function fetchAdminEmail() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setAdminEmail(user.email || '')
  }

  async function fetchProviders() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProviders(data || [])
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterProviders() {
    let filtered = providers

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.business_name.toLowerCase().includes(query) ||
        p.contact_person.toLowerCase().includes(query) ||
        p.contact_email.toLowerCase().includes(query) ||
        p.main_service.toLowerCase().includes(query)
      )
    }

    setFilteredProviders(filtered)
  }

  async function handleQuickAction(providerId: string, action: 'approve' | 'reject' | 'pause') {
    if (action === 'reject') {
      const reason = prompt('Enter rejection reason:')
      if (!reason) return
      
      const result = await rejectProvider(providerId, reason, adminEmail)
      if (result.success) fetchProviders()
    } else if (action === 'approve') {
      const result = await approveProvider(providerId, adminEmail)
      if (result.success) fetchProviders()
    } else if (action === 'pause') {
      const reason = prompt('Enter pause reason (optional):')
      const result = await pauseProvider(providerId, reason || undefined, adminEmail)
      if (result.success) fetchProviders()
    }
  }

  const statusCounts = {
    all: providers.length,
    pending: providers.filter(p => p.status === 'pending').length,
    approved: providers.filter(p => p.status === 'approved').length,
    rejected: providers.filter(p => p.status === 'rejected').length,
    paused: providers.filter(p => p.status === 'pause').length,
  }

  return (
    <div className="bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">All Service Providers</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and review service provider applications</p>
        </div>
        <div className="text-sm text-gray-400 bg-gray-800/50 px-4 py-2 rounded-lg">
          Total: <span className="font-semibold text-white">{providers.length}</span> providers
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow border border-gray-700 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected', 'paused'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${statusFilter === status
                      ? status === 'pending' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' :
                        status === 'approved' ? 'bg-green-900/30 text-green-400 border border-green-700' :
                        status === 'rejected' ? 'bg-red-900/30 text-red-400 border border-red-700' :
                        status === 'pause' ? 'bg-gray-700 text-gray-300 border border-gray-600' :
                        'bg-blue-900/30 text-blue-400 border border-blue-700'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status as keyof typeof statusCounts]})
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Search Providers</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or service..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-gray-800 rounded-lg shadow border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-400">Loading providers...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-gray-400">No providers found</p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 md:px-6 md:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-4 py-4 md:px-6 md:py-4">
                      <div className="font-medium text-white">{provider.business_name}</div>
                      <div className="text-sm text-gray-400">{provider.city}, {provider.province}</div>
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-4">
                      <div className="text-sm text-white">{provider.contact_person}</div>
                      <div className="text-sm text-gray-400">{provider.contact_email}</div>
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-4">
                      <span className="text-sm bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                        {provider.main_service}
                      </span>
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${provider.status === 'approved' ? 'bg-green-900/30 text-green-300' :
                          provider.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                          provider.status === 'rejected' ? 'bg-red-900/30 text-red-300' :
                          'bg-gray-700 text-gray-300'}`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-4 text-sm text-gray-400">
                      {new Date(provider.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/providers/${provider.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          View
                        </Link>
                        
                        {provider.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleQuickAction(provider.id, 'approve')}
                              className="text-green-400 hover:text-green-300 text-sm transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleQuickAction(provider.id, 'reject')}
                              className="text-red-400 hover:text-red-300 text-sm transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {provider.status === 'approved' && (
                          <button
                            onClick={() => handleQuickAction(provider.id, 'pause')}
                            className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                          >
                            Pause
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {filteredProviders.length > 0 && (
          <div className="px-4 py-4 md:px-6 md:py-4 border-t border-gray-700 bg-gray-900 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              Showing <span className="font-semibold text-white">{filteredProviders.length}</span> of{' '}
              <span className="font-semibold text-white">{providers.length}</span> providers
            </div>
            <button
              onClick={fetchProviders}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        )}
      </div>

      {/* Mobile Help Text */}
      <div className="mt-6 md:hidden text-center">
        <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="text-xs text-gray-400">Scroll horizontally to view all columns</span>
        </div>
      </div>
    </div>
  )
}