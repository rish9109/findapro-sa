// File: src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleListBusinessClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (user) {
      router.push('/providers/dashboard')
    } else {
      router.push('/providers/provider-listings')
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-8 md:space-y-12 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen overflow-x-hidden">
      {/* Header Section */}
      <header className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 text-white pt-6 md:pt-8 pb-4 md:pb-6 overflow-hidden">
        {/* Enhanced Background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900/50 via-transparent to-gray-900/30"></div>
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] md:w-[600px] md:h-[600px] bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] md:w-[600px] md:h-[600px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:40px_40px] max-w-full"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10 max-w-full">
                {/* Main Heading with Subtext */}
                <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">
              Find Trusted{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                Professionals
              </span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              For every home, service, repair, and fix across South Africa. <a 
                href="/providers/provider-listings"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent hover:from-yellow-300 hover:to-amber-300 text-xs font-medium hover:underline transition-all duration-300"                                      >
                <span>List your service now →</span>
              </a>
            </p>
          </div>
          {/* Floating Search Bar - Below Header */}

          <div className="flex flex-col items-center space-y-10">

  {/* The Search Bar - Centered */}
  <div className="flex justify-center w-full mb-0 md:mb-0">
  <SearchBar />
</div>
</div>
        </div>
      </header>
      
      {/* Categories Section */}
      <section className="container mx-auto px-4 md:px-6 relative overflow-hidden">
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[300px] h-[300px] md:w-80 md:h-80 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl max-w-full"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8 md:mb-12 px-2">
            <div className="inline-flex items-center gap-2 md:gap-3 mb-3 flex-wrap justify-center">
              <div className="w-6 md:w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Service</span> Categories
              </h2>
              <div className="w-6 md:w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
              Browse through our comprehensive list of service categories
            </p>
          </div>
          <CategoryGrid />
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50">
          <div className="text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-4 py-2 rounded-full">
              <span className="text-blue-400">✨</span>
              <span className="text-sm font-medium text-blue-300">Limited Time Offer</span>
            </div>
            
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
              Ready to Grow Your Business?
            </h3>
            
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
              Join thousands of service providers who have expanded their customer base with FindAPro
            </p>
            
            <div className="pt-2">
              <button
                onClick={handleListBusinessClick}
                disabled={loading}
                className={`group inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg transform transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-700 cursor-not-allowed text-gray-500' 
                    : 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 hover:shadow-xl hover:scale-105 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  <>
                    <span className="text-lg group-hover:rotate-12 transition-transform duration-300">🚀</span>
                    <span>Start Free Trial Now</span>
                    <span className="text-lg group-hover:-rotate-12 transition-transform duration-300">✨</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Note */}
      <div className="container mx-auto px-4 md:px-6 pb-8 max-w-full">
        <div className="border-t border-gray-800 pt-6">
          <div className="text-center space-y-3 px-2">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 mb-3">
              <div className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 font-bold">
                FindAPro
              </div>
              <div className="hidden sm:block w-0.5 h-5 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700"></div>
              <div className="text-xs text-gray-500 text-center sm:text-left">
                Connecting South Africans since 2024
              </div>
            </div>
            <p className="text-gray-500 text-xs max-w-2xl mx-auto leading-relaxed px-2">
              Trusted by thousands of homeowners and service providers across South Africa. 
              Join our growing community of professionals and customers today.
            </p>
            <div className="pt-2">
              <a 
                href="/providers/provider-listings"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent hover:from-yellow-300 hover:to-amber-300 text-xs font-medium hover:underline transition-all duration-300"              >
                <span>List your service now →</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS */}
      <style jsx global>{`
        /* Global fix for horizontal scroll */
        html, body {
          overflow-x: hidden;
          max-width: 100%;
        }
        
        /* Floating search bar glow effect */
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.7);
        }
        
        /* Button hover effects */
        .hover\:scale-\[1\.02\]:hover {
          transform: scale(1.02);
        }
        
        /* Responsive container constraints */
        .container {
          max-width: 100%;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        @media (min-width: 768px) {
          .container {
            max-width: 768px;
          }
        }
        
        @media (min-width: 1024px) {
          .container {
            max-width: 1024px;
          }
        }
        
        @media (min-width: 1280px) {
          .container {
            max-width: 1280px;
          }
        }
        
        /* Mobile-specific adjustments */
        @media (max-width: 640px) {
          h1 {
            font-size: 2.25rem !important;
            line-height: 2.5rem !important;
          }
          
          h2 {
            font-size: 1.75rem !important;
            line-height: 2.25rem !important;
          }
          
          h3 {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
          }
        }
        
        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }
      `}</style>
    </div>
  )
}