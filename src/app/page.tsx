// File: src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // Added useRouter
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false) // Added loading state for button
  const router = useRouter() // Added router
  
  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Updated click handler to navigate programmatically
  const handleListBusinessClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Navigate to the provider listings page
    router.push('/providers/provider-listings')
    
    // The loading state will be cleared when the component unmounts
  }

  return (
    <div className="space-y-8 md:space-y-12 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      {/* Hero Section - Dark Theme */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 text-white pt-6 md:pt-12 pb-10 md:pb-16">
        {/* Enhanced Background pattern with more subtle effect */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900/50 via-transparent to-gray-900/30"></div>
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:40px_40px]"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Top CTA Section - Clean, no box */}
          <div className="mb-6 md:mb-12 space-y-3 md:space-y-4">
            {/* Decorative element */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-6 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
              <span className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">For Service Providers</span>
              <div className="w-6 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
            </div>
            
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
              Are You a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Service Professional</span> 
              <br className="hidden md:block" /> Ready to Grow Your Business?
            </h3>
            
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
              Join South Africa's fastest-growing service directory and connect with customers in your area
            </p>
              
            <div className="space-y-3 pt-1">
              <button
                onClick={handleListBusinessClick}
                disabled={loading}
                className={`group inline-flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg transform transition-all duration-300 glow-pulse max-w-md mx-auto w-full ${
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
                    <span className="text-yellow-300 text-lg group-hover:rotate-12 transition-transform duration-300">🚀</span>
                    <span>{isMobile ? 'List Business - Free Trial' : 'List Your Business Here!'}</span>
                    <span className="text-yellow-300 text-lg group-hover:-rotate-12 transition-transform duration-300">✨</span>
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-300 text-sm">⚡</span>
                  <p className="text-xs text-gray-400">FREE LAUNCH TRIAL Limited Time Offer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Heading for Customers */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4">
              Find Trusted{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Professionals
              </span>
            </h1>
            
            <p className="text-lg md:text-xl mb-4 md:mb-6 max-w-3xl mx-auto text-gray-300 leading-relaxed">
              Connect with verified professionals for home services, repairs, maintenance, 
              <span className="block mt-1 text-base md:text-lg text-gray-400">
                and everything in between
              </span>
            </p>
            
            {/* Simplified Search with better styling */}
            <div className="max-w-3xl mx-auto mb-4 md:mb-8">
              <div className="mb-4">
                <SearchBar />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section - Dark Theme with enhanced design */}
      <section className="container mx-auto px-4 relative">
        {/* Background accent */}
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Service</span> Categories
              </h2>
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>
          </div>
          <CategoryGrid />
        </div>
      </section>
      
      {/* Footer Note with enhanced design */}
      <div className="container mx-auto px-4 pb-8">
        <div className="border-t border-gray-800 pt-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 font-bold">
                FindAPro
              </div>
              <div className="w-0.5 h-5 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700"></div>
              <div className="text-xs text-gray-500">
                Connecting South Africans since 2024
              </div>
            </div>
            <p className="text-gray-500 text-xs max-w-2xl mx-auto leading-relaxed">
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

      {/* Add custom CSS for glow effect */}
      <style jsx>{`
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
      `}</style>
    </div>
  )
}