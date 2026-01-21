// File: src/components/Header.tsx (Modern Dark Theme)
'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserCircle, 
  Menu, 
  X, 
  Bell, 
  ChevronDown,
  LogOut,
  Settings,
  User,
  Home,
  Shield,
  MapPin,
  Briefcase
} from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, isLoading, logout, showAuthModal } = useAuth()
  const isHomePage = pathname === '/'
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLoginClick = () => {
    showAuthModal('login')
    setMenuOpen(false)
  }

  const handleUserAction = () => {
    if (user) {
      setUserDropdownOpen(!userDropdownOpen)
    } else {
      handleLoginClick()
    }
  }

  const userInitial = user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'bg-gray-900 border-b border-gray-800 py-3' 
          : 'bg-gray-900 py-5'
        }
      `}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo - Modern Dark Theme */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                {/* Modern dark logo */}
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center border border-gray-700 relative overflow-hidden">
                  {/* Subtle pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50"></div>
                  
                  {/* Modern geometric accent lines */}
                  <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-blue-500 transform -translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-blue-500 transform -translate-x-1/2"></div>
                  <div className="absolute left-0 top-1/2 h-0.5 w-2 bg-blue-500 transform -translate-y-1/2"></div>
                  <div className="absolute right-0 top-1/2 h-0.5 w-2 bg-blue-500 transform -translate-y-1/2"></div>
                  
                  {/* Center "F" */}
                  <div className="font-black text-xl text-white z-10 relative">
                    F
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute -inset-1 bg-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </motion.div>
              
              <div className="flex flex-col">
                {/* Main Title */}
                <div className="text-2xl font-bold text-white tracking-tight">
                  Find A Pro
                </div>
                
                {/* Subtext - SA Trusted Business Directory */}
                <div className="text-xs text-gray-400 font-medium tracking-wide flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>SA's Trusted Business Directory</span>
                  <Shield className="w-3 h-3 text-green-500" />
                </div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {!isHomePage && (
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white font-medium transition-colors duration-200 px-4 py-2.5 rounded-lg hover:bg-gray-800 group"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              )}
              
              {/* Notifications (only when logged in) */}
              {user && (
                <button className="relative p-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 group">
                  <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-gray-900"></div>
                </button>
              )}
              
              {/* User Section */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUserAction}
                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 group"
                >
                  {user ? (
                    <>
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600 group-hover:border-gray-500 transition-colors duration-200 relative overflow-hidden">
                          {/* Verified badge */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <Shield className="w-2 h-2 text-white" />
                          </div>
                          <span className="text-white font-bold text-lg">{userInitial}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-white font-medium text-sm">
                          {user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0]}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          Business Account
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 group-hover:bg-gray-700 transition-colors duration-200">
                          <UserCircle className="w-7 h-7 text-gray-400 group-hover:text-white transition-colors duration-200" />
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-white font-medium text-sm">Sign In</span>
                        <span className="text-gray-400 text-xs">Business Portal</span>
                      </div>
                    </>
                  )}
                </motion.button>
                
                {/* User Dropdown */}
                <AnimatePresence>
                  {user && userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600 relative">
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                              <Shield className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-white font-bold text-xl">{userInitial}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm truncate">{user.user_metadata?.name || 'Business User'}</h3>
                            <p className="text-gray-400 text-xs truncate">{user.email}</p>
                            <div className="flex items-center mt-1">
                              <div className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full border border-gray-600">
                                <span className="text-gray-300 text-xs font-medium flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" />
                                  <span>Verified Business</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <Link 
                          href="/profile" 
                          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>
                        <Link 
                          href="/dashboard" 
                          className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Business Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setUserDropdownOpen(false)
                          }}
                          className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
            
            {/* Mobile Menu Button */}
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-[80px] w-full"></div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[80px] left-0 right-0 z-[49] md:hidden bg-gray-800 border-b border-gray-700"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-3">
                {!isHomePage && (
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 font-medium transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                )}
                
                {/* Mobile User Section */}
                <div className="pt-3 border-t border-gray-700">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-3 mb-4 p-4 rounded-lg bg-gray-700/50">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600 relative">
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                            <Shield className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-white font-bold text-xl">{userInitial}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm">{user.user_metadata?.name || 'Business User'}</h3>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                          <div className="flex items-center mt-1">
                            <div className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full border border-gray-600">
                              <span className="text-gray-300 text-xs font-medium flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                <span>Verified Business</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Notifications */}
                      {user && (
                        <button className="flex items-center gap-2 w-full py-3 px-4 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 mb-2">
                          <div className="relative">
                            <Bell className="w-4 h-4" />
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-gray-800"></div>
                          </div>
                          Notifications
                        </button>
                      )}
                      
                      <div className="space-y-1">
                        <Link 
                          href="/profile" 
                          className="block py-3 px-4 rounded-lg bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link 
                          href="/dashboard" 
                          className="block py-3 px-4 rounded-lg bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => setMenuOpen(false)}
                        >
                          Business Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setMenuOpen(false)
                          }}
                          className="block w-full py-3 px-4 rounded-lg bg-gray-700/30 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 text-left"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleLoginClick}
                        className="block w-full py-3.5 text-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                      >
                        Sign In
                      </button>
                      <p className="text-gray-400 text-xs text-center px-2">
                        Access SA's trusted business directory
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}