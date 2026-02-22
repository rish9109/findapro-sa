'use client'

import { useSearch } from '@/hooks/useSearch'
import SearchBar from '@/components/SearchBar'
import { SearchResults } from '@/components/SearchResults'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMobile, setIsMobile] = useState(false)
  const [initialSearchTerm, setInitialSearchTerm] = useState('')
  
  const {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    loadingFilters
  } = useSearch()

  // Get the original search term from URL
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setInitialSearchTerm(q)
    }
  }, [searchParams])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header with search context */}
      <header className="relative bg-gray-950 text-white pt-4 pb-2 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Search context header - REPLACED back button and title */}
          <div className="mb-4">
            {initialSearchTerm && (
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                <span>Showing results for:</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                  "{initialSearchTerm}"
                </span>
              </p>
            )}
          </div>

          {/* Search Bar - clean for new searches */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search for services, businesses, accreditations..."
            className="mb-4"
            variant="compact"
          />

          {/* Results count */}
          {!loading && results.length > 0 && (
            <p className="text-sm text-gray-400">
              Found {results.length} provider{results.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 via-20% via-blue-400/30 via-80% to-transparent"></div>
      </header>

      {/* Main content - Results only */}
      <div className="container mx-auto px-4 py-6">
        <SearchResults
          results={results}
          loading={loading || loadingFilters}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  )
}