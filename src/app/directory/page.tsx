//src/app/directory/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DirectoryPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProviders()
  }, [])

  async function fetchProviders() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProviders(data || [])
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
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
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Home
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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Verified Professionals</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <p>Loading professionals...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No professionals available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Link 
                key={provider.id}
                href={`/directory/${provider.id}`}
                className="bg-white rounded-lg shadow border p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {provider.business_name}
                </h3>
                <p className="text-gray-600 mb-3">{provider.main_service}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>📍 {provider.city}, {provider.province}</span>
                </div>
                <div className="mt-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
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