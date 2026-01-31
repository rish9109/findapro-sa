// File: src/components/SearchBar.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight } from 'lucide-react'

export default function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isExpanded])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isExpanded])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim() || isSearching) return
    
    setIsSearching(true)
    
    try {
      // Navigate to search results
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      
      // Show success state briefly
      await new Promise(resolve => setTimeout(resolve, 600))
      
    } finally {
      handleClose()
    }
  }

  const handleToggle = () => {
    if (isExpanded) {
      if (search.trim()) {
        handleSearch(new Event('submit') as any)
      } else {
        handleClose()
      }
    } else {
      setIsExpanded(true)
    }
  }

  const handleClose = () => {
    setIsExpanded(false)
    setSearch('')
    setIsSearching(false)
  }

  // Get current icon based on state
  const getCurrentIcon = () => {
    if (isSearching) {
      return <Search className="w-5 h-5 text-green-400 animate-pulse" />
    }
    if (isExpanded) {
      return search.trim() ? 
        <ArrowRight className="w-5 h-5" /> : 
        <X className="w-5 h-5" />
    }
    return <Search className="w-5 h-5" />
  }

  return (
    <div className="relative">
      {/* Main Container */}
      <div className={`
        relative transition-all duration-300 ease-out
        ${isExpanded ? 'w-80 md:w-96' : 'w-12'}
      `}>
        {/* Background Container */}
        <div className={`
          absolute inset-0 rounded-full transition-all duration-300 overflow-hidden
          ${isExpanded 
            ? 'bg-gray-900/95 backdrop-blur-sm border border-gray-700/60 shadow-2xl' 
            : 'bg-gray-800 hover:bg-gray-700/80 cursor-pointer'
          }
        `}>
          {/* Success glow effect */}
          {isSearching && (
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 animate-pulse" />
          )}
        </div>

        {/* Interactive Content */}
        <div className="relative flex items-center h-12">
          {/* Action Button */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={isSearching}
            className={`
              flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full
              transition-all duration-300 disabled:opacity-70
              ${isExpanded 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-gray-300 hover:text-white'
              }
            `}
            aria-label={isExpanded ? (search.trim() ? "Search" : "Close") : "Open search"}
          >
            {getCurrentIcon()}
          </button>

          {/* Search Input */}
          {isExpanded && (
            <form onSubmit={handleSearch} className="flex-1 pr-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What service are you looking for?"
                  className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm md:text-base pr-4"
                  autoComplete="off"
                  disabled={isSearching}
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      {isSearching && (
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-xs text-emerald-400 font-medium">
            Finding results...
          </span>
        </div>
      )}
    </div>
  )
}