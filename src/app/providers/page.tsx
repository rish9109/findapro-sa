// File: src/app/providers/page.tsx (UPDATED VERSION)
'use client'

import { useState } from 'react'
import ProviderCard from '@/components/ProviderCard'
import ProtectedContent from '@/components/ProtectedContent'

// Mock data for local testing
const mockProviders = [
  {
    id: '1',
    name: 'John Plumbing Services',
    rating: 4.8,
    reviewCount: 42,
    service: 'Plumber',
    location: 'Johannesburg, Gauteng',
    description: 'Licensed plumber with 15 years experience. Specializing in leak repairs, installations, and maintenance.',
    verified: true,
    price: 'R450/hour',
    availability: 'Available Today',
    category: 'plumbing'
  },
  {
    id: '2',
    name: 'Sparky Electrical',
    rating: 4.9,
    reviewCount: 67,
    service: 'Electrician',
    location: 'Cape Town, Western Cape',
    description: 'Certified electrician for residential and commercial electrical work. Emergency services available.',
    verified: true,
    price: 'R550/hour',
    availability: 'Within 24 Hours',
    category: 'electrical'
  },
  {
    id: '3',
    name: 'Green Thumb Gardening',
    rating: 4.7,
    reviewCount: 28,
    service: 'Gardener',
    location: 'Durban, KwaZulu-Natal',
    description: 'Professional garden maintenance, landscaping, and lawn care services. Free consultations.',
    verified: true,
    price: 'R350/hour',
    availability: 'Available This Week',
    category: 'gardening'
  },
  {
    id: '4',
    name: 'Clean & Shine Services',
    rating: 4.6,
    reviewCount: 53,
    service: 'Cleaner',
    location: 'Pretoria, Gauteng',
    description: 'Professional cleaning services for homes and offices. Bonded and insured.',
    verified: true,
    price: 'R250/hour',
    availability: 'Available Today',
    category: 'cleaning'
  },
  {
    id: '5',
    name: 'BuildRight Construction',
    rating: 4.9,
    reviewCount: 39,
    service: 'Builder',
    location: 'Port Elizabeth, Eastern Cape',
    description: 'Full-service construction company specializing in renovations and new builds.',
    verified: true,
    price: 'From R1200/day',
    availability: 'Within 1 Week',
    category: 'construction'
  },
  {
    id: '6',
    name: 'Pro Painters SA',
    rating: 4.5,
    reviewCount: 31,
    service: 'Painter',
    location: 'Bloemfontein, Free State',
    description: 'Interior and exterior painting services. Quality workmanship guaranteed.',
    verified: true,
    price: 'R400/hour',
    availability: 'Available Next Week',
    category: 'painting'
  }
]

const categories = [
  { id: 'all', name: 'All Services' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'gardening', name: 'Gardening' },
  { id: 'construction', name: 'Construction' },
  { id: 'painting', name: 'Painting' }
]

const locations = [
  { id: 'all', name: 'All Locations' },
  { id: 'gauteng', name: 'Gauteng' },
  { id: 'wc', name: 'Western Cape' },
  { id: 'kzn', name: 'KwaZulu-Natal' },
  { id: 'ec', name: 'Eastern Cape' }
]

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')

  // Filter providers
  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = searchQuery === '' || 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory
    const matchesLocation = selectedLocation === 'all' || 
      provider.location.toLowerCase().includes(selectedLocation.toLowerCase())
    
    return matchesSearch && matchesCategory && matchesLocation
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by filteredProviders
  }

  return (
    <div className="py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Service Providers
        </h1>
        <p className="text-gray-600">
          Browse verified professionals in South Africa
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search providers..."
              className="flex-1 p-3 border rounded"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded font-semibold"
            >
              Search
            </button>
          </div>
          
          <div className="flex gap-4">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 p-3 border rounded"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="flex-1 p-3 border rounded"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </form>
      </div>
      
      {/* Results */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {filteredProviders.length} Providers Found
        </h2>
        
        {filteredProviders.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <ProtectedContent 
                key={provider.id} 
                action="view full profile"
                showLockIcon={true}
              >
                <ProviderCard provider={provider} />
              </ProtectedContent>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded">
            <p className="text-gray-600">No providers found. Try different search terms.</p>
          </div>
        )}
      </div>
      
      {/* CTA */}
      <div className="bg-blue-50 p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-4">Are you a service provider?</h3>
        <p className="text-gray-700 mb-6">List your business and get more customers</p>
        <ProtectedContent action="list your service">
          <a 
            href="/providers/provider-listings" 
            className="inline-block bg-green-600 text-white px-8 py-3 rounded font-semibold hover:bg-green-700"
          >
            List Your Service
          </a>
        </ProtectedContent>
      </div>
    </div>
  )
}