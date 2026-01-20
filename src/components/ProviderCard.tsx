// File: src/components/ProviderCard.tsx (updated)
'use client'

import { useState } from 'react'
import ProtectedContent from './ProtectedContent'
import Link from 'next/link'

interface ProviderCardProps {
  provider: {
    id: string
    name: string
    rating: number
    reviewCount: number
    service: string
    location: string
    description: string
    verified: boolean
    price: string
    availability: string
  }
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const [showContact, setShowContact] = useState(false)

  const handleContactClick = () => {
    setShowContact(true)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
              {provider.verified && (
                <span className="text-blue-500">✓</span>
              )}
            </div>
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
              {provider.service}
            </span>
          </div>
          
          {/* Rating */}
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="font-bold text-gray-900">{provider.rating}</span>
              <span className="text-gray-500 text-sm">({provider.reviewCount})</span>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center text-gray-600 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span>{provider.location}</span>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 mb-6 line-clamp-3">
          {provider.description}
        </p>
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">Price</div>
            <div className="font-semibold text-gray-900">{provider.price}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Availability</div>
            <div className="font-semibold text-green-600">{provider.availability}</div>
          </div>
        </div>
        
        {/* Contact Buttons */}
        <div className="space-y-3">
          {showContact ? (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 p-3 rounded-lg hover:bg-green-200">
                  <span>📞</span>
                  <span>Call Now</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200">
                  <span>✉️</span>
                  <span>Message</span>
                </button>
              </div>
              <button 
                onClick={() => setShowContact(false)}
                className="text-gray-500 text-sm hover:text-gray-700"
              >
                Hide contact info
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <ProtectedContent action="contact this provider">
                <button 
                  onClick={handleContactClick}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Contact Provider
                </button>
              </ProtectedContent>
              
              <ProtectedContent action="view full profile">
                <Link 
                  href={`/providers/${provider.id}`}
                  className="px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  View Profile
                </Link>
              </ProtectedContent>
            </div>
          )}
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Member since 2023</span>
          <span className="text-green-600 font-medium">✓ Responds quickly</span>
        </div>
      </div>
    </div>
  )
}