// File: src/components/SearchBar.tsx
'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function SearchBar() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search logic here
    console.log('Searching for:', search, 'in', location)
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col md:flex-row gap-4 bg-white p-2 rounded-xl shadow-xl">
        <div className="flex-1">
          <div className="flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What service do you need? (e.g., plumber, electrician)"
              className="w-full p-4 text-gray-900 placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="md:w-64">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or province"
            className="w-full p-4 border-l border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none"
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold whitespace-nowrap"
        >
          Find Providers
        </button>
      </div>
    </form>
  )
}