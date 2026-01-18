// File: src/app/providers/page.tsx
'use client'

import { useState } from 'react'
import ProviderCard from '@/components/ProviderCard'
import SearchFilters from '@/components/SearchFilters'

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
  },
  {
    id: '7',
    name: 'AutoFix Mechanics',
    rating: 4.7,
    reviewCount: 58,
    service: 'Mechanic',
    location: 'Pretoria, Gauteng',
    description: 'Professional auto repair and maintenance services. All makes and models.',
    verified: true,
    price: 'R650/hour',
    availability: 'Available Today',
    category: 'mechanical'
  },
  {
    id: '8',
    name: 'Tech Support SA',
    rating: 4.8,
    reviewCount: 34,
    service: 'IT Support',
    location: 'Cape Town, Western Cape',
    description: 'Computer repair, network setup, and IT consulting for homes and businesses.',
    verified: true,
    price: 'R500/hour',
    availability: 'Within 48 Hours',
    category: 'it'
  },
  {
    id: '9',
    name: 'Secure Living',
    rating: 4.9,
    reviewCount: 42,
    service: 'Security Systems',
    location: 'Johannesburg, Gauteng',
    description: 'Installation and maintenance of security cameras, alarms, and access control systems.',
    verified: true,
    price: 'From R2,500',
    availability: 'Available Next Week',
    category: 'security'
  }
]

const categories = [
  { id: 'all', name: 'All Services' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'gardening', name: 'Gardening' },
  { id: 'construction', name: 'Construction' },
  { id: 'painting', name: 'Painting' },
  { id: 'mechanical', name: 'Mechanical' },
  { id: 'it', name: 'IT Support' }
]

const locations = [
  { id: 'all', name: 'All Locations' },
  { id: 'gauteng', name: 'Gauteng' },
  { id: 'wc', name: 'Western Cape' },
  { id: 'kzn', name: 'KwaZulu-Natal' },
  { id: 'ec', name: 'Eastern Cape' },
  { id: 'fs', name: 'Free State' },
  { id: 'mp', name: 'Mpumalanga' },
  { id: 'lp', name: 'Limpopo' },
  { id: 'nw', name: 'North West' },
  { id: 'nc', name: 'Northern Cape' }
]

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState('rating')

  // Filter providers based on search and filters
  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = searchQuery === '' || 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.service.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory
    const matchesLocation = selectedLocation === 'all' || 
      provider.location.toLowerCase().includes(selectedLocation.toLowerCase())
    
    return matchesSearch && matchesCategory && matchesLocation
  })

  // Sort providers
  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch(sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'reviews':
        return b.reviewCount - a.reviewCount
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search logic is handled by filteredProviders
  }

  const handlePostJob = () => {
    alert('Job posting feature coming soon!')
  }

  return (
    <div className="py-8">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Find Service Providers in South Africa
            </h1>
            <p className="text-gray-600 text-lg">
              Browse verified professionals ready to help with your project
            </p>
          </div>
          <a 
            href="/providers/provider-listings" 
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            <span className="mr-2">+</span> List Your Service
          </a>
        </div>
        
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What service do you need? (e.g., plumber, electrician, cleaner)"
                className="w-full p-4 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
            
            {/* Filters */}
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select 
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Search Providers
                </button>
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
              {['Verified Only', 'Available Today', 'Emergency Service'].map(filter => (
                <button
                  key={filter}
                  type="button"
                  className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  {filter}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="mb-12">
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              <span className="text-blue-600">{filteredProviders.length}</span> Service Providers Found
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {selectedCategory !== 'all' && `Showing ${categories.find(c => c.id === selectedCategory)?.name} services`}
              {selectedLocation !== 'all' && ` in ${locations.find(l => l.id === selectedLocation)?.name}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-600 text-sm">
              Showing 1-{filteredProviders.length} of {filteredProviders.length} results
            </span>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">View:</span>
              <button className="p-2 bg-gray-100 rounded-l-lg border">Grid</button>
              <button className="p-2 border rounded-r-lg">List</button>
            </div>
          </div>
        </div>
        
        {/* Providers Grid */}
        {filteredProviders.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No providers found</h3>
            <p className="text-gray-600 mb-6">Try changing your search filters</p>
            <button 
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedLocation('all')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
        
        {/* Pagination (if we had more data) */}
        {filteredProviders.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">← Previous</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">3</button>
            <span className="px-2">...</span>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Next →</button>
          </div>
        )}
      </div>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h3>
          <p className="text-gray-700 mb-6">
            Post your job requirement and let qualified providers come to you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handlePostJob}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Post a Job Request
            </button>
            <a 
              href="/providers/provider-listings" 
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              Are you a provider? List your service
            </a>
          </div>
        </div>
      </div>
      
      {/* Trust Indicators */}
      <div className="mt-12 pt-8 border-t">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-2">✓</div>
            <h4 className="font-semibold mb-2">Verified Providers</h4>
            <p className="text-gray-600 text-sm">All providers are vetted and verified</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <h4 className="font-semibold mb-2">Customer Reviews</h4>
            <p className="text-gray-600 text-sm">Read genuine reviews from real customers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🛡️</div>
            <h4 className="font-semibold mb-2">Secure Booking</h4>
            <p className="text-gray-600 text-sm">Book with confidence and payment protection</p>
          </div>
        </div>
      </div>
    </div>
  )
}