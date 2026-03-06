// src/components/Header.tsx - original design + only click blocking when onboarding open
'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useSearchParams, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import NewListingDrawer from '@/components/NewListingDrawer'
import { 
  UserCircle, 
  LogOut,
  User,
  ChevronDown,
  Sparkles,
  Home,
  Heart,
  Star,
  Briefcase,
  MessageCircle,
  Store // Added Store icon for business listing
} from 'lucide-react'
import OnboardingDrawer from '@/components/OnboardingDrawer'

export default function Header() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [categoryName, setCategoryName] = useState<string>('')
  const [providerName, setProviderName] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showNewListingDrawer, setShowNewListingDrawer] = useState(false)
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  
  if (isAdminRoute) return null
  
  const searchParams = useSearchParams()
  const params = useParams()
  const { user, logout, showAuthModal, isProvider } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isHomePage = pathname === '/'
  const isProviderPage = pathname.startsWith('/providers/') && params.id
  const categoryParam = searchParams.get('category')
  const providerId = params.id as string

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

  useEffect(() => {
    setUserDropdownOpen(false)
  }, [pathname])

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])


  const handleAuthClick = () => {
    showAuthModal('login')
  }

  const handleCloseOnboarding = () => {
    setShowOnboarding(false)
  }

  const handleDontShowAgain = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setShowOnboarding(false)
  }

  const userInitial = user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'

  const getPageTitle = () => {
    if (isProviderPage) {
      return providerName || 'Professional Details'
    }
    
    if (pathname === '/providers') {
      if (categoryParam && !loading) {
        return categoryName || 'Category'
      }
      return 'Find Professionals'
    }
    
    if (pathname === '/favorites') return 'My Favorites'
    if (pathname === '/profile') return 'My Profile'
    if (pathname === '/providers/dashboard') return 'Provider Dashboard'
    
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
            <div className={`flex items-center ${isHomePage ? 'flex-shrink-0' : 'flex-shrink-0 min-w-0 max-w-[120px] sm:max-w-[180px]'}`}>
              {isHomePage ? (
                <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                  <div className="flex flex-col">
                    <div className="text-lg sm:text-2xl font-black bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent group-hover:from-amber-500 group-hover:via-yellow-400 group-hover:to-amber-500 transition-all duration-300 whitespace-nowrap">
                      findapro.co.za
                    </div>
                    <div className="text-[8px] sm:text-xs text-gray-300 font-dark tracking-wider uppercase mt-0.5 whitespace-nowrap">
                      Service's you trust, professionals you'll love
                    </div>
                  </div>
                </Link>
              ) : (
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
            <div className="flex-1 flex justify-center min-w-0 px-2 sm:px-4">
              {!isHomePage && (
                <div className="flex flex-col items-center justify-center min-w-0 max-w-md mx-auto">
                  <h1 className="text-lg sm:text-xl font-bold text-white text-center truncate max-w-full px-2">
                    {loading ? 'Loading...' : getPageTitle()}
                  </h1>
                </div>
              )}
            </div>

            {/* Right Section - User Authentication */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              {!user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAuthClick}
                  className={`
                    flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl 
                    bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold 
                    hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 group
                    ${showOnboarding 
                      ? 'ring-2 ring-cyan-400/70 ring-offset-2 ring-offset-black animate-neon-pulse' 
                      : ''
                    }
                  `}
                >
                  <UserCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`
                    relative group/user-trigger flex items-center gap-2 p-1.5 sm:p-2 pl-2 sm:pl-3 pr-2 sm:pr-4 rounded-xl 
                    bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 
                    hover:from-blue-500/15 hover:via-purple-500/15 hover:to-cyan-500/15 
                    border border-white/10 hover:border-white/20 transition-all duration-300
                    ${showOnboarding 
                      ? 'ring-2 ring-cyan-400/70 ring-offset-2 ring-offset-black animate-neon-pulse' 
                      : ''
                    }
                  `}
                >
                  <div className="relative">
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-cyan-900/30 flex items-center justify-center border border-white/10 overflow-hidden group-hover/user-trigger:border-white/20 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover/user-trigger:opacity-100 transition-opacity duration-300" />
                      
                      <span className="text-white font-bold text-sm sm:text-lg relative z-10">
                        {userInitial}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-left hidden sm:block">
                    <div className="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px]">
                      {user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0]}
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: userDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </motion.div>
                </motion.button>
              )}
              
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
                    <div className="relative p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] bg-[length:20px_20px]" />
                      
                      <div className="relative flex items-center gap-3">
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
                    
                    <div className="p-2 sm:p-3">
                      {/* List Your Business - Added to dropdown */}
                      <button
  onClick={() => {
    setUserDropdownOpen(false)
    setShowNewListingDrawer(true)
  }}
  className="w-full group flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300 text-left"
>
  <div className="relative">
    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
      <Store className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
    </div>
  </div>
  <div>
    <div className="font-medium text-sm sm:text-base">List Your Business</div>
    <div className="text-xs text-gray-400">Get discovered by clients</div>
  </div>
</button>

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
                      
                      <Link 
                        href="/contact" 
                        className="group flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all duration-300"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">Contact Us</div>
                          <div className="text-xs text-gray-400">Get in touch</div>
                        </div>
                      </Link>
                      
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header - unchanged */}
      <div className="h-20 sm:h-24"></div>

      {/* Onboarding Drawer - unchanged */}
      <OnboardingDrawer
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onDontShowAgain={handleDontShowAgain}
      />
      <NewListingDrawer
  isOpen={showNewListingDrawer}
  onClose={() => setShowNewListingDrawer(false)}
  onSuccess={() => {
    setShowNewListingDrawer(false)
    // Optionally redirect to dashboard or show success
  }}
/>
    </>
  )
}

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