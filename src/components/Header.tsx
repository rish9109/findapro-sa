// File: src/components/Header.tsx (updated)
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isLoading, logout, showAuthModal } = useAuth()

  const handleLoginClick = () => {
    showAuthModal('login')
    setMenuOpen(false)
  }

  const handleSignupClick = () => {
    showAuthModal('signup')
    setMenuOpen(false)
  }

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
            
            {user ? (
              <>
                <Link href="/providers/provider-listings" className="text-gray-700 hover:text-blue-600 font-medium">
                  List Your Service
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">
                    Hi, {user.user_metadata.name || user.email.split('@')[0]}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  Login
                </button>
                <button
                  onClick={handleSignupClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Sign Up Free
                </button>
              </>
            )}
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
              <Link href="/" className="text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/providers" className="text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Find Providers</Link>
              
              {user ? (
                <>
                  <Link href="/providers/provider-listings" className="text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                    List Your Service
                  </Link>
                  <div className="pt-2 border-t">
                    <span className="block py-2 text-gray-600">
                      Hi, {user.user_metadata.name || user.email.split('@')[0]}
                    </span>
                    <button
                      onClick={() => {
                        logout()
                        setMenuOpen(false)
                      }}
                      className="block py-2 text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-2 border-t">
                  <button
                    onClick={handleLoginClick}
                    className="block py-2 text-blue-600"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignupClick}
                    className="block py-2 text-blue-600 font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}