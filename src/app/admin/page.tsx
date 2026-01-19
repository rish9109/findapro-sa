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
      
      const result = await rejectProvider(providerId, reason)  // No adminEmail
      if (result.success) fetchProviders()
    } else if (action === 'approve') {
      const result = await approveProvider(providerId)  // No adminEmail
      if (result.success) fetchProviders()
    } else if (action === 'pause') {
      const result = await pauseProvider(providerId)  // No adminEmail
      if (result.success) fetchProviders()
    }
  }

  const statusCounts = {
    all: providers.length,
    pending: providers.filter(p => p.status === 'pending').length,
    approved: providers.filter(p => p.status === 'approved').length,
    rejected: providers.filter(p => p.status === 'rejected').length,
    paused: providers.filter(p => p.status === 'paused').length,
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Service Providers</h1>
        <div className="text-sm text-gray-600">
          Total: {providers.length} providers
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected', 'paused'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm rounded-full ${statusFilter === status
                      ? status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                        status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                        status === 'paused' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status as keyof typeof statusCounts]})
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Providers</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or service..."
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Providers Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p>Loading providers...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No providers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{provider.business_name}</div>
                      <div className="text-sm text-gray-500">{provider.city}, {provider.province}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{provider.contact_person}</div>
                      <div className="text-sm text-gray-500">{provider.contact_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {provider.main_service}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full
                        ${provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                          provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          provider.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(provider.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/providers/${provider.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          View
                        </Link>
                        
                        {provider.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleQuickAction(provider.id, 'approve')}
                              className="text-green-600 hover:text-green-900 text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleQuickAction(provider.id, 'reject')}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {provider.status === 'approved' && (
                          <button
                            onClick={() => handleQuickAction(provider.id, 'pause')}
                            className="text-yellow-600 hover:text-yellow-900 text-sm"
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
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredProviders.length} of {providers.length} providers
            </div>
            <button
              onClick={fetchProviders}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  )
}