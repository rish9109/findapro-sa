'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  placeholder?: string
  className?: string
  variant?: 'default' | 'compact' | 'hero'
  autoFocus?: boolean
}

export default function SearchBar({ 
  value, 
  onChange, 
  onSearch,
  placeholder = "Search for services, businesses...",
  className = "",
  variant = "default",
  autoFocus = false
}: SearchBarProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (onSearch) {
        onSearch()
      } else if (value.trim()) {
        router.push(`/search?q=${encodeURIComponent(value.trim())}`)
      }
    }
  }

  const handleSearch = () => {
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`)
    }
  }

  // Different styles based on variant
  const getContainerStyles = () => {
    switch (variant) {
      case 'hero':
        return 'max-w-3xl mx-auto'
      case 'compact':
        return 'max-w-2xl'
      default:
        return 'max-w-2xl'
    }
  }

  const getInputStyles = () => {
    const baseStyles = "w-full text-gray-900 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    
    switch (variant) {
      case 'hero':
        return `${baseStyles} px-6 py-4 text-lg rounded-2xl shadow-2xl`
      case 'compact':
        return `${baseStyles} px-4 py-2.5 text-sm rounded-lg`
      default:
        return `${baseStyles} px-4 py-3 text-base rounded-xl`
    }
  }

  return (
    <div className={`relative ${getContainerStyles()} ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg 
          className={`${variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4'} text-gray-400`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`${getInputStyles()} pl-10 pr-12 transition-all duration-300 ${
          isFocused ? 'shadow-lg scale-[1.02]' : ''
        }`}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-12 flex items-center pr-2"
          aria-label="Clear search"
        >
          <svg 
            className={`${variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4'} text-gray-400 hover:text-gray-600 transition-colors`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="absolute inset-y-0 right-0 flex items-center px-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-r-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
        aria-label="Search"
      >
        <svg 
          className={`${variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="ml-2 hidden sm:inline text-sm font-medium">Search</span>
      </button>
    </div>
  )
}