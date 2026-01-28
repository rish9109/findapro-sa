// File: src/components/Header.tsx - WITH HOME ICON & CLASSY DROPDOWN
'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useSearchParams, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserCircle, 
  LogOut,
  User,
  ChevronDown,
  Sparkles,
  Home,
  Heart,
  Star,
  Briefcase
} from 'lucide-react'

export default function Header() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [categoryName, setCategoryName] = useState<string>('')
  const [providerName, setProviderName] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const { user, logout, showAuthModal, isProvider } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isHomePage = pathname === '/'
  const isProviderPage = pathname.startsWith('/providers/') && params.id
  const categoryParam = searchParams.get('category')
  const providerId = params.id as string

  // Fetch category name from Supabase when categoryParam changes
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (categoryParam && pathname === '/providers') {
        setLoading(true)
        try {
          const { data, error } = await supabase
            .from('service_categories')
            .select('name')
            .eq('id', categoryParam)
            .single()

          if (!error && data) {
            setCategoryName(data.name)
          } else {
            setCategoryName(formatId(categoryParam))
          }
        } catch (error) {
          console.error('Error fetching category:', error)
          setCategoryName(formatId(categoryParam))
        } finally {
          setLoading(false)
        }
      } else {
        setCategoryName('')
      }
    }

    fetchCategoryName()
  }, [categoryParam, pathname])

  // Fetch provider name when on provider details page
  useEffect(() => {
    const fetchProviderName = async () => {
      if (isProviderPage && providerId) {
        setLoading(true)
        try {
          const { data, error } = await supabase
            .from('providers')
            .select('business_name')
            .eq('id', providerId)
            .single()

          if (!error && data) {
            setProviderName(data.business_name)
          } else {
            setProviderName('Professional Details')
          }
        } catch (error) {
          console.error('Error fetching provider:', error)
          setProviderName('Professional Details')
        } finally {
          setLoading(false)
        }
      } else {
        setProviderName('')
      }
    }

    fetchProviderName()
  }, [isProviderPage, providerId])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
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

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false)
  }, [pathname])

  const handleAuthClick = () => {
    showAuthModal('login')
  }

  const userInitial = user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'

  // Function to get page title based on current route
  const getPageTitle = () => {
    // Provider details page
    if (isProviderPage) {
      return providerName || 'Professional Details'
    }
    
    // Providers list page with category
    if (pathname === '/providers') {
      if (categoryParam && !loading) {
        return categoryName || 'Category'
      }
      return 'Find Professionals'
    }
    
    // Other specific pages
    if (pathname === '/favorites') return 'My Favorites'
    if (pathname === '/profile') return 'My Profile'
    if (pathname === '/providers/dashboard') return 'Provider Dashboard'
    
    // Generic page name extraction
    if (pathname !== '/') {
      const pageName = pathname.split('/').pop() || ''
      if (pageName) {
        return pageName
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    }
    
    return 'Find A Pro'
  }

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled 
          ? 'bg-gradient-to-b from-black/95 via-black/90 to-black/85 py-3 backdrop-blur-xl border-b border-white/5' 
          : 'bg-gradient-to-b from-black/80 via-black/60 to-transparent py-4'
        }
      `}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo on Home, Home Icon on Other Pages */}
            <div className="flex items-center min-w-0 flex-1">
              {isHomePage ? (
                // Home page - Show Logo on left
                <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
                  <div className="flex flex-col min-w-0">
                    <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300 truncate">
                      Find A Pro
                    </div>
                    <div className="text-xs text-gray-400 font-light tracking-wider uppercase mt-0.5 hidden sm:block">
                      Connecting you with verified professionals
                    </div>
                  </div>
                </Link>
              ) : (
                // Other pages - Show Home icon (no text)
                <Link 
                  href="/" 
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors duration-300 group flex-shrink-0"
                  title="Go to Home"
                >
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 group-hover:text-white" />
                </Link>
              )}
            </div>

            {/* Center Section - Page Title (Hidden on Homepage) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex-1 min-w-0 max-w-lg mx-auto">
              {!isHomePage && (
                <div className="flex flex-col items-center justify-center min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-white text-center truncate max-w-full px-2">
                    {loading ? 'Loading...' : getPageTitle()}
                  </h1>
                </div>
              )}
            </div>

            {/* Right Section - User Authentication */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              {user ? (
                // Logged in state - Classy trigger button
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="relative group/user-trigger flex items-center gap-2 p-1.5 sm:p-2 pl-2 sm:pl-3 pr-2 sm:pr-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 hover:from-blue-500/15 hover:via-purple-500/15 hover:to-cyan-500/15 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="relative">
                    {/* User avatar with classy border */}
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-cyan-900/30 flex items-center justify-center border border-white/10 overflow-hidden group-hover/user-trigger:border-white/20 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover/user-trigger:opacity-100 transition-opacity duration-300" />
                      
                      <span className="text-white font-bold text-sm sm:text-lg relative z-10">
                        {userInitial}
                      </span>
                      
          
                    </div>
                  </div>
                  
                  {/* User info - hidden on mobile */}
                  <div className="text-left hidden sm:block">
                    <div className="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px]">
                      {user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                    </div>
                  </div>
                  
                  {/* Animated chevron */}
                  <motion.div
                    animate={{ rotate: userDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </motion.div>
                </motion.button>
              ) : (
                // Not logged in state
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAuthClick}
                  className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 group"
                >
                  <UserCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </motion.button>
              )}
              
              {/* Classy User Dropdown */}
              <AnimatePresence>
                {user && userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, type: "spring" }}
                    className="absolute right-0 mt-2 w-64 sm:w-72 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 modern-glass"
                    style={{
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset'
                    }}
                  >
                    {/* User info header with elegant gradient */}
                    <div className="relative p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] bg-[length:20px_20px]" />
                      
                      <div className="relative flex items-center gap-3">
                        {/* Premium avatar with glass effect */}
                        <div className="relative">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                            <span className="text-white font-bold text-lg sm:text-xl">{userInitial}</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm sm:text-base truncate">
                            {user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0]}
                          </h3>
                          <p className="text-gray-300 text-xs truncate mt-1">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dropdown items with elegant styling */}
                    <div className="p-2 sm:p-3">
                      {/* Favorites */}
                      <Link 
                        href="/favorites" 
                        className="group flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
                            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">My Favorites</div>
                          <div className="text-xs text-gray-400">Saved professionals</div>
                        </div>
                      </Link>

                      {/* Provider Dashboard */}
                      {isProvider && (
                        <Link 
                          href="/providers/dashboard" 
                          className="group flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <div className="relative">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
                              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-sm sm:text-base">Provider Dashboard</div>
                            <div className="text-xs text-gray-400">Manage your listings</div>
                          </div>
                        </Link>
                      )}
                      
                      {/* Profile */}
                      <Link 
                        href="/profile" 
                        className="group flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Profile</div>
                          <div className="text-xs text-gray-400">Edit your settings</div>
                        </div>
                      </Link>
                      
                      {/* Sign Out with elegant styling */}
                      <button
                        onClick={() => {
                          logout()
                          setUserDropdownOpen(false)
                        }}
                        className="w-full group flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 mt-1 sm:mt-2 border-t border-white/5 pt-2 sm:pt-3"
                      >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-red-500/10 to-pink-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Sign Out</div>
                          <div className="text-xs text-gray-400">End session</div>
                        </div>
                      </button>
                    </div>
{/* Status footer with glass effect - Right aligned */}
<div className="p-3 border-t border-white/10 bg-gradient-to-r from-gray-900/80 via-gray-900/80 to-black/80 backdrop-blur-sm">
  <div className="flex items-center justify-right">
    {isProvider && (
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 text-emerald-400" />
        <span className="text-xs text-emerald-400">Provider</span>
      </div>
    )}
  </div>
</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20 sm:h-24"></div>
    </>
  )
}

// Helper function to format ID as fallback
function formatId(id: string): string {
  const formatted = id
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return formatted || 'Details'
}