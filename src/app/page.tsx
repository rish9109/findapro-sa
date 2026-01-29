// File: src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    // Check if mobile on mount and resize
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
    router.push('/providers/provider-listings')
  }

  return (
    <div className="space-y-8 md:space-y-12 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 text-white pt-6 md:pt-12 pb-10 md:pb-16 overflow-hidden">
        {/* Enhanced Background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900/50 via-transparent to-gray-900/30"></div>
          {/* Positioned gradients within viewport */}
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] md:w-[600px] md:h-[600px] bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] md:w-[600px] md:h-[600px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          {/* Subtle grid pattern - constrained to viewport */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:40px_40px] max-w-full"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10 max-w-full">
          {/* Top CTA Section */}
          <div className="mb-6 md:mb-12 space-y-3 md:space-y-4 px-2">
            {/* Decorative element */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-6 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
              <span className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider px-1">
                For Service Providers
              </span>
              <div className="w-6 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
            </div>
            <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto px-2">
              Join South Africa's fastest-growing service directory and connect with customers in your area
            </p>
              
            <div className="space-y-3 pt-1 px-2">
              <button
                onClick={handleListBusinessClick}
                disabled={loading}
                className={`group inline-flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg shadow-lg transform transition-all duration-300 glow-pulse w-full max-w-md mx-auto ${
                  loading 
                    ? 'bg-gray-700 cursor-not-allowed text-gray-500' 
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 hover:shadow-xl hover:scale-105 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  <>
                    <span className="text-yellow-300 text-base md:text-lg group-hover:rotate-12 transition-transform duration-300">🚀</span>
                    <span className="px-1">{isMobile ? 'List Business - Free Trial' : 'List Your Business Here!'}</span>
                    <span className="text-yellow-300 text-base md:text-lg group-hover:-rotate-12 transition-transform duration-300">✨</span>
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 px-2">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-300 text-xs md:text-sm">⚡</span>
                  <p className="text-xs text-gray-400 text-center">FREE LAUNCH TRIAL Limited Time Offer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Heading for Customers */}
          <div className="space-y-4 md:space-y-6 px-2 md:px-0">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4 px-1">
              Find Trusted{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Professionals
              </span>
            </h1>
            
            <p className="text-base md:text-xl mb-4 md:mb-6 max-w-3xl mx-auto text-gray-300 leading-relaxed px-2">
              Connect with verified professionals for home services, repairs, maintenance, 
              <span className="block mt-1 text-sm md:text-lg text-gray-400">
                and everything in between
              </span>
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-4 md:mb-8 px-2 md:px-0">
              <div className="mb-4">
                <SearchBar />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="container mx-auto px-4 md:px-6 relative overflow-hidden">
        {/* Background accent - constrained */}
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
          </div>
          <CategoryGrid />
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
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-xs font-medium hover:underline transition-colors"
              >
                <span>Start your free trial today →</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS with better overflow handling */}
      <style jsx global>{`
        /* Global fix for horizontal scroll */
        html, body {
          overflow-x: hidden;
          max-width: 100%;
        }
        
        @keyframes gentleGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(234, 88, 12, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 25px rgba(234, 88, 12, 0.6),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }
        }
        
        .glow-pulse {
          animation: gentleGlow 3s ease-in-out infinite;
          position: relative;
          overflow: hidden;
          max-width: 100%;
        }
        
        .glow-pulse::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: 0.5s;
        }
        
        .glow-pulse:hover::before {
          left: 100%;
        }
        
        .glow-pulse:hover {
          animation: none;
          box-shadow: 0 0 30px rgba(234, 88, 12, 0.8),
                      0 10px 30px rgba(0, 0, 0, 0.3);
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
          
          h3 {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
          }
        }
      `}</style>
    </div>
  )
}