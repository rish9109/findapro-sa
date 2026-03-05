'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function BulkEmailPage() {
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [providers, setProviders] = useState<any[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    statusFilter: 'all'
  })
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetchProviders()
  }, [emailForm.statusFilter])

  async function fetchProviders() {
    setLoading(true)
    try {
      let query = supabase
        .from('providers')
        .select('id, business_name, contact_email, contact_person, status')
        .order('business_name')

      if (emailForm.statusFilter !== 'all') {
        query = query.eq('status', emailForm.statusFilter)
      }

      const { data, error } = await query
      if (error) throw error
      setProviders(data || [])
    } catch (error) {
      console.error('Error fetching providers:', error)
      setStatus({ type: 'error', message: 'Failed to load providers' })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProviders([])
    } else {
      setSelectedProviders(providers.map(p => p.id))
    }
    setSelectAll(!selectAll)
  }

  const handleSelectProvider = (providerId: string) => {
    setSelectedProviders(prev => {
      const newSelection = prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
      
      setSelectAll(newSelection.length === providers.length)
      return newSelection
    })
  }

  const sendBulkEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      setStatus({ type: 'error', message: 'Subject and message are required' })
      return
    }

    if (selectedProviders.length === 0) {
      setStatus({ type: 'error', message: 'Select at least one provider' })
      return
    }

    setSending(true)
    setStatus(null)

    try {
      const selectedProviderData = providers.filter(p => selectedProviders.includes(p.id))
      
      // Send emails sequentially with small delays to avoid rate limits
      const results = []
      for (const provider of selectedProviderData) {
        try {
          const response = await fetch('/api/email/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider,
              subject: emailForm.subject,
              message: emailForm.message
            })
          })
          
          const result = await response.json()
          results.push({ provider: provider.business_name, success: result.success })
          
          // Small delay between sends
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          results.push({ provider: provider.business_name, success: false })
        }
      }

      const successCount = results.filter(r => r.success).length
      setStatus({ 
        type: 'success', 
        message: `Emails sent: ${successCount}/${selectedProviders.length} successful` 
      })

      // Log the bulk email action
      await supabase.from('admin_actions').insert([{
        action: 'bulk_email',
        details: {
          recipients: selectedProviders.length,
          subject: emailForm.subject,
          statusFilter: emailForm.statusFilter
        },
        created_at: new Date().toISOString()
      }])

    } catch (error: any) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Bulk Email</h1>
      <p className="text-gray-400 mb-6">Send emails to multiple service providers</p>

      {status && (
        <div className={`mb-6 p-4 rounded-lg ${
          status.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-700' :
          'bg-red-900/30 text-red-300 border border-red-700'
        }`}>
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Compose Message</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter email subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  rows={10}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Write your message here..."
                />
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Selected: {selectedProviders.length} providers
                  </span>
                  <button
                    onClick={sendBulkEmail}
                    disabled={sending || selectedProviders.length === 0}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send Bulk Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-white mb-4">Select Recipients</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={emailForm.statusFilter}
                onChange={(e) => setEmailForm({ ...emailForm, statusFilter: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">All Providers</option>
                <option value="approved">Approved Only</option>
                <option value="pending">Pending Only</option>
                <option value="rejected">Rejected Only</option>
                <option value="pause">Paused Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-xs text-gray-500">
                {providers.length} total
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                providers.map(provider => (
                  <label key={provider.id} className="flex items-start p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProviders.includes(provider.id)}
                      onChange={() => handleSelectProvider(provider.id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-600 bg-gray-700"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{provider.business_name}</p>
                      <p className="text-xs text-gray-400 truncate">{provider.contact_email}</p>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1
                        ${provider.status === 'approved' ? 'bg-green-900/30 text-green-300' :
                          provider.status === 'pending' ? 'bg-yellow-900/30 text-yellow-300' :
                          provider.status === 'rejected' ? 'bg-red-900/30 text-red-300' :
                          'bg-gray-600 text-gray-300'}`}>
                        {provider.status}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}