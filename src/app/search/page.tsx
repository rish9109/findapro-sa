'use client'

import { useSearch } from '@/hooks/useSearch'
import SearchBar from '@/components/SearchBar'
import { SearchResults } from '@/components/SearchResults'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [originalTerm, setOriginalTerm] = useState('')
  const [originalResults, setOriginalResults] = useState([])
  const [hasLoaded, setHasLoaded] = useState(false) // Add this flag
  
  const {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    loadingFilters,
  } = useSearch()

  // Get the original search term from URL - ONLY ON PAGE LOAD
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setOriginalTerm(q)
      setSearchTerm('') // Start with EMPTY search bar
    }
  }, [searchParams, setSearchTerm]) // Remove results dependency

  // Store original results ONLY ONCE when they first load
  useEffect(() => {
    if (results.length > 0 && !hasLoaded && !loading) {
      setOriginalResults(results)
      setHasLoaded(true)
    }
  }, [results, hasLoaded, loading])

  // Clear just empties the search bar
  const handleClear = () => {
    setSearchTerm('') // Empty the input
  }

  // Determine which results to show
  const displayResults = searchTerm ? results : originalResults

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="relative bg-gray-950 text-white pt-4 pb-2 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          {/* Show what was originally searched */}
          {originalTerm && (
            <div className="mb-4">
              <p className="text-gray-400 flex items-center gap-2">
                <span>Showing results for:</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                  "{originalTerm}"
                </span>
              </p>
            </div>
          )}

          {/* Search bar starts EMPTY */}
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={handleClear}
            placeholder="Type to filter results..."
            className="mb-4"
            variant="compact"
            mode="live"
          />

          {/* Results count */}
          {!loading && displayResults.length > 0 && (
            <p className="text-sm text-gray-400">
              Found {displayResults.length} provider{displayResults.length !== 1 ? 's' : ''}
              {searchTerm && <span className="text-gray-500 ml-2">(filtered)</span>}
            </p>
          )}
        </div>
      </header>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        <SearchResults
          results={displayResults}
          loading={loading}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  )
}