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
      return (
        <div className="relative">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-enhanced-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )
    }
    if (isExpanded) {
      return search.trim() ? 
        <ArrowRight className="w-5 h-5" style={{ color: '#d1d5db' }} /> : 
        <X className="w-5 h-5" style={{ color: '#d1d5db' }} />
    }
    return <Search className="w-5 h-5" style={{ color: '#d1d5db' }} />
  }

  return (
    <div className="relative">
      {/* Main Container */}
      <div className={`
        relative transition-all duration-300 ease-out
        ${isExpanded ? 'w-80 md:w-96' : 'w-12'}
      `}>
        {/* Button Container - Minimal visibility */}
        {!isExpanded && (
          <div className="absolute inset-0 rounded-full overflow-hidden bg-black/5 backdrop-blur-sm border border-gray-500/10 cursor-pointer hover:border-gray-400/20 transition-colors"></div>
        )}

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
              relative z-10 bg-transparent
            `}
            aria-label={isExpanded ? (search.trim() ? "Search" : "Close") : "Open search"}
            style={{
              color: '#d1d5db' // gray-300 inline style to prevent flash
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#e5e7eb'; // gray-200 on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#d1d5db'; // gray-300 normal
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {getCurrentIcon()}
          </button>

          {/* Search Input - INLINE STYLES to prevent white flash */}
          {isExpanded && (
            <form onSubmit={handleSearch} className="flex-1 pr-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What service are you looking for?"
                  className="w-full bg-transparent focus:outline-none text-sm md:text-base pr-4 pl-2"
                  autoComplete="off"
                  disabled={isSearching}
                  style={{
                    color: '#d1d5db', // gray-300 - prevents white flash
                    caretColor: 'rgba(156, 163, 175, 0.8)', // gray-400
                  }}
                  onFocus={(e) => {
                    // Keep gray color even on focus
                    e.target.style.color = '#e5e7eb'; // gray-200 on focus
                  }}
                  onBlur={(e) => {
                    e.target.style.color = '#d1d5db'; // gray-300 on blur
                  }}
                />
                
                {/* Very subtle input underline */}
                <div className="absolute bottom-0 left-0 right-4 h-[0.5px] bg-gradient-to-r from-gray-400/5 via-gray-300/3 to-transparent"></div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Searching Overlay - Minimal visibility with gray tones */}
      {isSearching && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 backdrop-blur-md border border-gray-500/10 search-overlay-enter"
            style={{
              color: '#d1d5db', // gray-300 inline style
              animation: 'slide-up 0.3s ease-out forwards'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-enhanced-spin"></div>
              <span className="text-xs font-medium whitespace-nowrap">
                Searching online database...
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Single global style tag - not nested */}
      <style jsx global>{`
        /* Prevent text color flashes globally for search bar */
        input[type="text"].bg-transparent {
          color: #d1d5db !important; /* gray-300 */
        }
        
        /* Placeholder styling */
        input::placeholder {
          color: rgba(156, 163, 175, 0.7) !important; /* gray-400/70 */
        }
        
        input:focus::placeholder {
          opacity: 0.5;
        }
        
        /* Button hover states */
        button:hover {
          color: #e5e7eb !important; /* gray-200 */
        }
        
        button:disabled {
          opacity: 0.7;
          color: #9ca3af !important; /* gray-400 */
        }
        
        /* Animation for search overlay */
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        
        .search-overlay-enter {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        /* Enhanced spinner animation */
        @keyframes enhanced-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-enhanced-spin {
          animation: enhanced-spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  )
}