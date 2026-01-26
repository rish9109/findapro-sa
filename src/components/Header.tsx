// File: src/components/Header.tsx - FIXED AUTH MODAL VERSION
'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserCircle, 
  LogOut,
  Settings,
  User,
  ChevronDown,
  Sparkles,
  Crown
} from 'lucide-react'

export default function Header() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, logout, showAuthModal } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAuthClick = () => {
    console.log('🔓 Auth button clicked, calling showAuthModal')
    showAuthModal('login')
  }

  const userInitial = user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <>
<header className={`
  fixed top-0 left-0 right-0 z-50 transition-all duration-500
  ${scrolled 
    ? 'bg-gradient-to-b from-black/90 via-black/80 to-black/70 py-3 backdrop-blur-xl border-b border-white/5' 
    : 'bg-gradient-to-b from-black/70 via-black/50 to-transparent py-5'
  }
`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
     
              
              <div className="flex flex-col">
                <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Find A Pro
                </div>
                <div className="text-xs text-gray-400 font-light tracking-wider uppercase mt-1">
                  Connecting you with verified professionals
                </div>
              </div>
                  
            {/* User Authentication Section */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                // Logged in state
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-2 pl-4 pr-5 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 hover:from-blue-500/15 hover:via-purple-500/15 hover:to-cyan-500/15 border border-white/10 transition-all duration-300 group"
                >
                  <div className="relative">
                    {/* User avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-cyan-900/30 flex items-center justify-center border border-white/10 relative overflow-hidden">
                      
                      {/* User initial */}
                      <div className="relative z-10">
                        <span className="text-white font-bold text-xl">{userInitial}</span>
                      </div>
                      
                      {/* Premium badge */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-2 border-black flex items-center justify-center z-20 shadow-lg"
                      >
                        <Crown className="w-3 h-3 text-white" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className="text-white font-semibold text-sm">
                      {user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Verified Member
                    </div>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>
              ) : (
                // Not logged in state - SINGLE BUTTON
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAuthClick}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 group"
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Sign In / Register</span>
                </motion.button>
              )}
              
              {/* User Dropdown */}
              <AnimatePresence>
                {user && userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, type: "spring" }}
                    className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                  >
                    {/* User info header */}
                    <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
                            <span className="text-white font-bold text-2xl">{userInitial}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm truncate">
                            {user.user_metadata?.name || 'Premium Member'}
                          </h3>
                          <p className="text-gray-400 text-xs truncate mt-1">{user.email}</p>
                          <div className="mt-2">
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                              <Crown className="w-3 h-3 text-amber-400" />
                              <span className="text-xs font-medium text-white">Premium Tier</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dropdown items */}
                    <div className="p-3">
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 group"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Dashboard</div>
                          <div className="text-xs text-gray-400">Manage your account</div>
                        </div>
                      </Link>
                      
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 group"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Profile</div>
                          <div className="text-xs text-gray-400">Edit your settings</div>
                        </div>
                      </Link>
                      
                      <button
                        onClick={() => {
                          logout()
                          setUserDropdownOpen(false)
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 group w-full mt-2"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/10 to-pink-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Sign Out</div>
                          <div className="text-xs text-gray-400">End session</div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-24"></div>
    </>
  )
}