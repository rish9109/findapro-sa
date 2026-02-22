// File: src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'
import Footer from '@/components/Footer'  // <-- ADD THIS IMPORT
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  
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
      {/* Header Section - With Visible Design Elements */}
      <header className="relative bg-gray-950 text-white pt-6 md:pt-8 pb-4 md:pb-6 overflow-hidden">
        {/* Corporate Luxury Geometric Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
          
          {/* Geometric grid lines - EXACT from Corporate Luxury */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
          
          {/* Diamond pattern - EXACT from Corporate Luxury */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
          }}></div>
          
          {/* Corner Lines - EXACT from Corporate Luxury */}
          <div className="absolute top-6 left-6 w-20 h-px bg-gradient-to-r from-amber-400 to-transparent"></div>
          <div className="absolute top-6 left-6 h-20 w-px bg-gradient-to-b from-amber-400 to-transparent"></div>
          <div className="absolute bottom-6 right-6 w-20 h-px bg-gradient-to-l from-blue-400 to-transparent"></div>
          <div className="absolute bottom-6 right-6 h-20 w-px bg-gradient-to-t from-blue-400 to-transparent"></div>
          
          {/* Central geometric circle - EXACT from Corporate Luxury */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-10">
            <div className="absolute inset-0 border border-white/20 rounded-full"></div>
            <div className="absolute inset-12 border border-white/15 rounded-full"></div>
            <div className="absolute inset-24 border border-white/10 rounded-full"></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10 max-w-full">
          {/* Main Heading with Subtext - Enhanced with visible effects */}
          <div className="mb-6 md:mb-8 relative">
            {/* Shimmer effect behind heading */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/5 via-transparent to-blue-500/5 blur-xl rounded-full opacity-50"></div>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 relative">
              Find Trusted{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 relative">
                Professionals
                {/* Text underline effect */}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-orange-500/50 via-yellow-500 to-orange-500/50 rounded-full"></span>
              </span>
            </h2>

            <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed relative flex flex-col items-center">
  <span className="text-center">
    For every home, service, repair, and fix across South Africa.
  </span>
  
  <span className="absolute hidden sm:block -bottom-1 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  
  <a 
    href="/providers/provider-listings"
    className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 group"
  >
    <span className="text-lg">✨</span>
    <span className="whitespace-nowrap text-base md:text-lg font-semibold">List your business</span>
<svg
  className="h-5 w-6 sm:h-7 sm:w-7 text-amber-300 group-hover:text-white group-hover:translate-x-3 transition-all duration-500 ease-out"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  strokeWidth={3.5}          // ← bolder line
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M9 5l7 7-7 7" />
</svg>
  </a>
</p>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 via-20% via-blue-400/30 via-80% to-transparent"></div>
      </header>
      
      {/* Categories Section */}
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
      
      {/* THIS PARAGRAPH IS REPLACED WITH SEARCH BAR */}
      <div className="max-w-2xl mx-auto mb-6">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search for plumbers, electricians, tutors, events..."
          variant="compact"
        />
        
        {/* Optional: Quick search suggestions */}
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          <span className="text-xs text-gray-500">Quick search:</span>
          {['Plumber', 'Electrician', 'Tutor', 'Event Planner'].map((term) => (
            <button
              key={term}
              onClick={() => setSearchTerm(term)}
              className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
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
            List your business and start reaching more local customers. no risk, just opportunity.
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