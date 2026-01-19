// src/app/directory/[id]/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function PublicProviderPage() {
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const params = useParams()
  const providerId = params.id as string

  useEffect(() => {
    fetchProvider()
  }, [providerId])

  async function fetchProvider() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .eq('status', 'approved')
        .single()

      if (error) throw error
      
      if (!data) {
        setError('Provider not found or not approved for public viewing')
      } else {
        setProvider(data)
      }
    } catch (error: any) {
      console.error('Error fetching provider:', error)
      setError('Failed to load provider details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading provider details...</p>
        </div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Provider not found'}</p>
          <Link href="/directory" className="text-blue-600 hover:underline">
            Browse all professionals
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              FindAPro
            </Link>
            <div className="flex gap-4">
              <Link href="/directory" className="text-gray-600 hover:text-blue-600">
                Directory
              </Link>
              <Link 
                href="/admin/login" 
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/directory" 
            className="inline-flex items-center text-blue-600 hover:underline mb-6"
          >
            ← Back to directory
          </Link>

          {/* Provider Card */}
          <div className="bg-white rounded-lg shadow border">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{provider.business_name}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      ✓ Verified Professional
                    </span>
                    <span className="text-gray-600">{provider.city}, {provider.province}</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">
                  {provider.main_service}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium">{provider.contact_person}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{provider.contact_email}</p>
                </div>
                {provider.contact_phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{provider.contact_phone}</p>
                  </div>
                )}
                {provider.website && (
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a 
                      href={provider.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {provider.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Business Details */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Services Offered</p>
                  <p className="font-medium">{provider.services_offered || 'Various professional services'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{provider.address}</p>
                  <p className="text-gray-600">{provider.city}, {provider.province} {provider.postal_code}</p>
                </div>
                {provider.registration_number && (
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="font-medium">{provider.registration_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {provider.additional_info && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                <p className="text-gray-700 whitespace-pre-line">{provider.additional_info}</p>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Listed on {new Date(provider.created_at).toLocaleDateString()}
                </p>
                <Link 
                  href={`/admin/login`}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Report issue
                </Link>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 text-sm text-gray-500">
            <p>Note: This is a public listing. All professionals are verified by FindAPro.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>FindAPro Directory • {new Date().getFullYear()}</p>
          <p className="mt-1">Connecting you with verified professionals</p>
        </div>
      </footer>
    </div>
  )
}