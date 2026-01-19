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
      <div className="text-center py-12">
        <p>Loading pending reviews...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Reviews</h1>
          <p className="text-gray-600">
            Review and approve/reject new provider submissions
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => fetchPendingProviders()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              providers.forEach(sendAdminEmail)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Email All to Admin
          </button>
        </div>
      </div>

      {providers.length === 0 ? (
        <div className="bg-white rounded-lg shadow border p-12 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No pending reviews at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{provider.business_name}</h3>
                    <p className="text-sm text-gray-600">{provider.city}, {provider.province}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{provider.contact_person}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Email</p>
                    <p className="font-medium">{provider.contact_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{provider.contact_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Main Service</p>
                    <p className="font-medium">{provider.main_service}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-medium">{formatDate(provider.created_at)}</p>
                  </div>
                </div>

                {provider.other_services && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Other Services</p>
                    <p className="text-sm bg-gray-50 p-3 rounded">{provider.other_services}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <Link
                    href={`/admin/providers/${provider.id}/review`}
                    className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Review Submission
                  </Link>
                  
                  <button
                    onClick={() => sendAdminEmail(provider)}
                    className="block w-full text-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Email to Admin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}