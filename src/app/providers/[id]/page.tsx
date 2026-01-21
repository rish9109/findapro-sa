// File: src/app/providers/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabase'

// Mock provider data - replace with actual Supabase fetch
const mockProvider = {
  id: '1',
  name: 'John Plumbing Services',
  rating: 4.8,
  reviewCount: 124,
  service: 'Plumbing & Water',
  location: 'Johannesburg, Gauteng',
  description: 'Professional plumbing services with 15+ years experience. Specializing in leak repairs, installations, and maintenance. Emergency services available 24/7.',
  verified: true,
  price: 'From R450/hour',
  availability: 'Within 2 hours',
  experience: '15 years',
  certifications: 'SAQCC Certified, Wireman\'s License',
  insurance: 'Public Liability Insurance',
  portfolioUrl: 'https://johnplumbing.co.za',
  contactEmail: 'john@plumbing.co.za',
  contactPhone: '+27 11 123 4567',
  serviceAreas: ['Johannesburg', 'Pretoria', 'Midrand', 'Sandton'],
  specialties: ['Leak Repairs', 'Installations', 'Maintenance', 'Emergency Services'],
  businessHours: 'Mon-Fri: 8:00-17:00, Sat: 8:00-13:00, Emergency: 24/7'
}

export default function ProviderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [provider, setProvider] = useState(mockProvider)
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    const fetchProvider = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual Supabase fetch
        // const { data, error } = await supabase
        //   .from('providers')
        //   .select('*')
        //   .eq('id', params.id)
        //   .single()
        
        // For now, use mock data
        setTimeout(() => {
          setProvider(mockProvider)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('Error fetching provider:', error)
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProvider()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-xl p-8">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            ← Back to results
          </button>

          {/* Provider Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                  {provider.verified && (
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-xl">★</span>
                    <span className="font-bold text-gray-900 ml-1">{provider.rating}</span>
                    <span className="text-gray-500 ml-1">({provider.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>{provider.location}</span>
                  </div>
                </div>
                
                <span className="inline-block bg-blue-100 text-blue-800 text-lg font-semibold px-4 py-2 rounded-lg">
                  {provider.service}
                </span>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg min-w-[200px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">{provider.price}</div>
                  <div className="text-green-600 font-semibold mb-4">{provider.availability}</div>
                  <button
                    onClick={() => setShowContact(!showContact)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    {showContact ? 'Hide Contact' : 'Contact Now'}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Info - Only shown when requested */}
            {showContact && (
              <div className="border-t pt-6 mt-6 animate-fadeIn">
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Phone</div>
                    <a 
                      href={`tel:${provider.contactPhone}`}
                      className="text-lg font-medium text-gray-900 hover:text-blue-600"
                    >
                      {provider.contactPhone}
                    </a>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <a 
                      href={`mailto:${provider.contactEmail}`}
                      className="text-lg font-medium text-gray-900 hover:text-blue-600"
                    >
                      {provider.contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Provider Details */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* About */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 mb-6">{provider.description}</p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Experience</div>
                    <div className="font-semibold text-gray-900">{provider.experience}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Insurance</div>
                    <div className="font-semibold text-gray-900">{provider.insurance}</div>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-3">
                  {provider.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Service Areas */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Areas</h2>
                <div className="flex flex-wrap gap-3">
                  {provider.serviceAreas.map((area, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Business Hours */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                <div className="space-y-2">
                  {provider.businessHours.split(', ').map((hour, index) => (
                    <div key={index} className="text-gray-700">{hour}</div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Certifications</h3>
                <div className="space-y-2">
                  {provider.certifications.split(', ').map((cert, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Link */}
              {provider.portfolioUrl && (
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">Portfolio</h3>
                  <a 
                    href={provider.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Portfolio Website →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to work with {provider.name}?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Contact them directly for quotes, availability, and project discussions.
              </p>
              <button
                onClick={() => setShowContact(true)}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
              >
                Contact Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}