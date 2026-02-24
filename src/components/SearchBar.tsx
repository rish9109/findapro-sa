'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  onClear?: () => void  
  placeholder?: string
  className?: string
  variant?: 'default' | 'compact' | 'hero'
  autoFocus?: boolean
  showClearButton?: boolean
  mode?: 'live' | 'navigate'
}

export default function SearchBar({ 
  value, 
  onChange, 
  onSearch,
  placeholder = "Search for services, businesses...",
  className = "",
  variant = "default",
  autoFocus = false,
  showClearButton = true,
  onClear,
  mode = 'live'
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
      e.preventDefault()
      
      if (mode === 'navigate') {
        // In navigate mode, trigger search on Enter
        if (onSearch) {
          onSearch()
        } else if (value.trim()) {
          router.push(`/search?q=${encodeURIComponent(value.trim())}`)
        }
      }
      // In live mode, Enter does nothing (prevents form submission)
    }
  }

  const handleSearchClick = () => {
    if (mode === 'navigate') {
      if (onSearch) {
        onSearch()
      } else if (value.trim()) {
        router.push(`/search?q=${encodeURIComponent(value.trim())}`)
      }
    }
  }

  const handleClear = () => {
    onChange('')
    if (onClear) {
      onClear() // Call the parent's clear handler
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }
  
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

  const getInputPadding = () => {
    const hasLeftIcon = true
    const hasRightIcon = value && showClearButton
    const hasSearchButton = mode === 'navigate'
    
    if (hasSearchButton) {
      if (hasRightIcon) {
        switch (variant) {
          case 'hero':
            return 'pl-12 pr-24'
          case 'compact':
            return 'pl-10 pr-20'
          default:
            return 'pl-10 pr-20'
        }
      } else {
        switch (variant) {
          case 'hero':
            return 'pl-12 pr-16'
          case 'compact':
            return 'pl-10 pr-14'
          default:
            return 'pl-10 pr-14'
        }
      }
    } else {
      if (hasRightIcon) {
        switch (variant) {
          case 'hero':
            return 'pl-12 pr-12'
          case 'compact':
            return 'pl-10 pr-10'
          default:
            return 'pl-10 pr-10'
        }
      } else {
        switch (variant) {
          case 'hero':
            return 'pl-12 pr-4'
          case 'compact':
            return 'pl-10 pr-4'
          default:
            return 'pl-10 pr-4'
        }
      }
    }
  }

  return (
    <div className={`relative ${getContainerStyles()} ${className}`}>
      {/* Search Icon - Left side */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        <Search className={`${variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4'}`} />
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
        className={`${getInputStyles()} ${getInputPadding()} transition-all duration-300 ${
          isFocused ? 'shadow-lg scale-[1.02]' : ''
        }`}
      />

      {/* Clear button */}
      {value && showClearButton && (
        <button
          onClick={handleClear}
          className={`absolute top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors z-10 ${
            mode === 'navigate' ? 'right-16' : 'right-3'
          }`}
          style={{ 
            right: mode === 'navigate' 
              ? (variant === 'hero' ? '4.5rem' : '3.5rem') 
              : '0.75rem' 
          }}
          aria-label="Clear search"
          type="button"
        >
          <X className={`${variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4'} text-gray-500 hover:text-gray-700`} />
        </button>
      )}

      {/* Search button - Only shown in navigate mode */}
      {mode === 'navigate' && (
        <button
          onClick={handleSearchClick}
          className="absolute inset-y-0 right-0 flex items-center px-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-r-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
          aria-label="Search"
          type="button"
        >
          <Search className={`${variant === 'hero' ? 'w-5 h-5' : 'w-4 h-4'}`} />
          <span className="ml-2 hidden sm:inline text-sm font-medium">Search</span>
        </button>
      )}
    </div>
  )
}