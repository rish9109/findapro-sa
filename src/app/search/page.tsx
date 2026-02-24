'use client'

import { useSearch } from '@/hooks/useSearch'
import SearchBar from '@/components/SearchBar'
import { SearchResults } from '@/components/SearchResults'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

// Get the return type from your useSearch hook
type SearchResultsType = ReturnType<typeof useSearch>['results'][number]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [originalTerm, setOriginalTerm] = useState('')
  const [originalResults, setOriginalResults] = useState<SearchResultsType[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)
  
  const {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    loadingFilters,
  } = useSearch()

  // Rest of your component remains the same...
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setOriginalTerm(q)
      setSearchTerm('')
    }
  }, [searchParams, setSearchTerm])

  useEffect(() => {
    if (results.length > 0 && !hasLoaded && !loading) {
      setOriginalResults(results)
      setHasLoaded(true)
    }
  }, [results, hasLoaded, loading])

  const handleClear = () => {
    setSearchTerm('')
  }

  const displayResults = searchTerm ? results : originalResults

  return (
    // Your JSX remains exactly the same...
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="relative bg-gray-950 text-white pt-4 pb-2 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
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

          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={handleClear}
            placeholder="Type to filter results..."
            className="mb-4"
            variant="compact"
            mode="live"
          />

          {!loading && displayResults.length > 0 && (
            <p className="text-sm text-gray-400">
              Found {displayResults.length} provider{displayResults.length !== 1 ? 's' : ''}
              {searchTerm && <span className="text-gray-500 ml-2">(filtered)</span>}
            </p>
          )}
        </div>
      </header>

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
