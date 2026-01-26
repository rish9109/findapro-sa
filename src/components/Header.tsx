// File: src/components/Header.tsx - UPDATED WITH PROVIDER DASHBOARD & MOBILE RESPONSIVE
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
  Crown,
  Menu,
  X,
  Building,
  Home,
  Search,
  Briefcase
} from 'lucide-react'

export default function Header() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { user, logout, showAuthModal, isProvider } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

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
          ? 'bg-gradient-to-b from-black/95 via-black/90 to-black/85 py-3 backdrop-blur-xl border-b border-white/5' 
          : 'bg-gradient-to-b from-black/80 via-black/60 to-transparent py-4 md:py-5'
        }
      `}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex flex-col">
                <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                  Find A Pro
                </div>
                <div className="text-xs text-gray-400 font-light tracking-wider uppercase mt-1 hidden sm:block">
                  Connecting you with verified professionals
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </span>
              </Link>
              
              <Link 
                href="/search" 
                className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Find Services
                </span>
              </Link>
              
              {user && isProvider && (
                <Link 
                  href="/providers/dashboard" 
                  className="text-orange-400 hover:text-orange-300 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-orange-500/10 flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Provider Dashboard
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              {user && isProvider && !isMobile && (
                <Link 
                  href="/providers/dashboard"
                  className="p-2 bg-gradient-to-r from-orange-600/20 to-orange-500/20 rounded-lg border border-orange-500/30 hover:border-orange-500/50 transition-colors"
                  title="Provider Dashboard"
                >
                  <Building className="w-5 h-5 text-orange-400" />
                </Link>
              )}
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-gray-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* User Authentication Section - Desktop */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              {user ? (
                // Logged in state - Desktop
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-2 pl-4 pr-5 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 hover:from-blue-500/15 hover:via-purple-500/15 hover:to-cyan-500/15 border border-white/10 transition-all duration-300 group"
                >
                  <div className="relative">
                    {/* User avatar */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-cyan-900/30 flex items-center justify-center border border-white/10 relative overflow-hidden">
                      
                      {/* User initial */}
                      <div className="relative z-10">
                        <span className="text-white font-bold text-lg md:text-xl">{userInitial}</span>
                      </div>
                      
                      {/* Premium badge */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-2 border-black flex items-center justify-center z-20 shadow-lg"
                      >
                        <Crown className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="text-left hidden lg:block">
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
                // Not logged in state - Desktop
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAuthClick}
                  className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 group"
                >
                  <UserCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Sign In / Register</span>
                  <span className="sm:hidden">Sign In</span>
                </motion.button>
              )}
              
              {/* User Dropdown - Desktop */}
              <AnimatePresence>
                {user && userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, type: "spring" }}
                    className="absolute right-0 mt-2 w-64 md:w-72 bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                  >
                    {/* User info header */}
                    <div className="p-4 md:p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
                            <span className="text-white font-bold text-xl md:text-2xl">{userInitial}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm truncate">
                            {user.user_metadata?.name?.split(' ')[0] || 'Premium Member'}
                          </h3>
                          <p className="text-gray-400 text-xs truncate mt-1">{user.email}</p>
                          <div className="mt-2">
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                              <Crown className="w-3 h-3 text-amber-400" />
                              <span className="text-xs font-medium text-white">Premium Tier</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dropdown items */}
                    <div className="p-2 md:p-3">
                      {isProvider && (
                        <Link 
                          href="/providers/dashboard" 
                          className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 group"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">Provider Dashboard</div>
                            <div className="text-xs text-gray-400">Manage your listings</div>
                          </div>
                        </Link>
                      )}
                      
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 group"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Dashboard</div>
                          <div className="text-xs text-gray-400">Manage your account</div>
                        </div>
                      </Link>
                      
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 group"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20">
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
                        className="flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 group w-full mt-1 md:mt-2"
                      >
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-red-500/10 to-pink-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20">
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

            {/* Mobile Authentication Button */}
            <div className="md:hidden">
              {user ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{userInitial}</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <UserCircle className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-gradient-to-b from-gray-900 to-black border-l border-white/10 shadow-2xl overflow-y-auto md:hidden"
            >
              {/* Mobile Menu Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                      <span className="text-white font-bold text-xl">{userInitial}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold">
                        {user?.user_metadata?.name?.split(' ')[0] || 'Welcome'}
                      </h3>
                      {user && (
                        <p className="text-xs text-gray-400">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {!user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleAuthClick()
                    }}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>

              {/* Mobile Navigation Links */}
              <div className="p-4 space-y-1">
                <Link 
                  href="/" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                
                <Link 
                  href="/search" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search className="w-5 h-5" />
                  <span>Find Services</span>
                </Link>
                
                {user && isProvider && (
                  <Link 
                    href="/providers/dashboard" 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Building className="w-5 h-5" />
                    <span>Provider Dashboard</span>
                  </Link>
                )}
                
                {user && (
                  <>
                    <div className="h-px bg-white/10 my-2"></div>
                    
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>Profile Settings</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </div>

              {/* Mobile User Status */}
              {user && (
                <div className="p-4 mt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-gray-400">Premium Tier Member</span>
                  </div>
                  {isProvider && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400">Verified Service Provider</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile User Dropdown (small popup) */}
      <AnimatePresence>
        {user && userDropdownOpen && isMobile && !mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-4 z-40 w-48 bg-gradient-to-b from-gray-900 to-black rounded-xl shadow-2xl border border-white/10 overflow-hidden md:hidden"
          >
            <div className="p-3 space-y-1">
              {isProvider && (
                <Link 
                  href="/providers/dashboard" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 transition-all duration-300"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <Building className="w-4 h-4" />
                  <span className="text-sm">Provider Dashboard</span>
                </Link>
              )}
              
              <Link 
                href="/profile" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300"
                onClick={() => setUserDropdownOpen(false)}
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Profile</span>
              </Link>
              
              <button
                onClick={() => {
                  logout()
                  setUserDropdownOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-24"></div>
    </>
  )
}