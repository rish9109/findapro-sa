// File: src/components/Header.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Find<span className="text-blue-600">A</span>Pro
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link href="/providers" className="text-gray-700 hover:text-blue-600 font-medium">
              Find Providers
            </Link>
            <Link href="/providers/provider-listings" className="text-gray-700 hover:text-blue-600 font-medium">
  List Your Service
</Link>
            <Link 
              href="/login" 
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Sign Up Free
            </Link>
            <Link href="/providers" className="text-gray-700 hover:text-blue-600 font-medium">
  Find Providers
</Link>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-700 py-2">Home</Link>
              <Link href="/providers" className="text-gray-700 py-2">Find Providers</Link>
              <Link href="/add-listing" className="text-gray-700 py-2">List Your Service</Link>
              <div className="pt-2 border-t">
                <Link href="/login" className="block py-2 text-blue-600">Login</Link>
                <Link href="/register" className="block py-2 text-blue-600 font-medium">Sign Up</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}