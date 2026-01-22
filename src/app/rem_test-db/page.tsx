// File: src/app/test-db/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase, testConnection, fetchProviders, insertProvider, useMockData } from '@/lib/supabase'

export default function TestDBPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('')

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  async function testSupabaseConnection() {
    setLoading(true)
    
    try {
      // Test the connection
      const result = await testConnection()
      setConnectionStatus(result.message)
      
      // Fetch providers
      const { data, error } = await fetchProviders()
      
      if (error) {
        setTestResult(`❌ Fetch error: ${error.message}`)
      } else {
        setProviders(data || [])
        setTestResult(`✅ Found ${data?.length || 0} providers`)
      }
      
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`)
      console.error('Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestInsert = async () => {
    setLoading(true)
    
    try {
      const testData = {
        business_name: `Test Business ${Date.now()}`,
        contact_person: 'Test Contact',
        contact_email: 'test@example.com',
        contact_phone: '+27 11 222 3333',
        city: 'Johannesburg',
        province: 'Gauteng',
        main_service: 'Testing',
        status: 'pending',
        created_at: new Date().toISOString()
      }
      
      const { data, error } = await insertProvider(testData)
      
      if (error) {
        alert(`❌ Insert failed: ${error.message}`)
      } else {
        alert(`✅ Test insert successful!\nID: ${data?.[0]?.id}`)
        // Refresh the list
        testSupabaseConnection()
      }
      
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Supabase Database Test</h1>
      
      <div className="mb-6 space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Configuration:</h2>
          <div className="space-y-1 text-sm">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Using Mock Data:</strong> {useMockData ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Connection Status:</h2>
          <p className={connectionStatus.includes('✅') || connectionStatus.includes('Connected') ? 'text-green-600' : 'text-red-600'}>
            {loading ? 'Testing...' : connectionStatus || 'Not tested yet'}
          </p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Data Status:</h2>
          <p className={testResult.includes('✅') ? 'text-green-600' : 'text-red-600'}>
            {loading ? 'Loading...' : testResult || 'No data loaded'}
          </p>
        </div>
      </div>
      
      <div className="space-x-4 mb-8">
        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Connection & Load Data'}
        </button>
        
        <button
          onClick={handleTestInsert}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Test Insert Data
        </button>
        
        <a
          href="https://app.supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700"
        >
          Open Supabase Dashboard
        </a>
      </div>
      
      {providers.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Providers in Database ({providers.length}):</h2>
          <div className="grid gap-4">
            {providers.map(provider => (
              <div key={provider.id} className="p-4 border rounded bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{provider.business_name}</p>
                    <p className="text-gray-600">{provider.contact_person} • {provider.contact_email}</p>
                    <p className="text-gray-600">{provider.city}, {provider.province}</p>
                    <p className="text-sm text-gray-500">Service: {provider.main_service}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                      provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {provider.status}
                    </span>
                    {provider.verified && (
                      <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  <p>ID: {provider.id}</p>
                  {provider.created_at && (
                    <p>Created: {new Date(provider.created_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div className="mt-8 p-8 text-center bg-gray-50 rounded-xl">
          <p className="text-gray-600">No providers found in the database.</p>
          <p className="text-sm text-gray-500 mt-2">
            {useMockData 
              ? 'You are using mock data. Fill out the provider listing form to add mock entries.'
              : 'The database is empty. Submit a provider listing to add data.'}
          </p>
        </div>
      )}
    </div>
  )
}