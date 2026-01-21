// File: src/components/Header.tsx - LUXURY VERSION
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
  Sparkles,
  Star,
  Crown,
  Search,
  MessageSquare
} from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading, logout, showAuthModal } = useAuth()
  const isHomePage = pathname === '/'
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
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

  const handleLoginClick = () => {
    showAuthModal('login')
    setMenuOpen(false)
  }

  const userInitial = user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled 
          ? 'glass-luxury py-3 backdrop-blur-xl border-b border-white/10' 
          : 'bg-gradient-to-b from-black/50 to-transparent py-5'
        }
      `}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Luxury Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-teal-500/20 animate-gradient-shift"></div>
                  
                  {/* Geometric pattern */}
                  <div className="absolute inset-3 rounded-xl border-2 border-white/5"></div>
                  
                  {/* Center icon */}
                  <div className="relative z-10">
                    <Crown className="w-7 h-7 text-gradient" />
                  </div>
                  
                  {/* Glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 to-teal-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>
              
              <div className="flex flex-col">
                <div className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  FindAPro
                </div>
                <div className="text-xs text-white/50 font-medium tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Premium Service Network</span>
                  <Star className="w-3 h-3 text-purple-400" />
                </div>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {/* Premium Navigation Items */}
              {[
                { href: '/', label: 'Home', icon: Home },
                { href: '/providers', label: 'Providers', icon: Star },
                { href: '/categories', label: 'Categories', icon: Sparkles },
                { href: '/premium', label: 'Premium', icon: Crown },
                { href: '/contact', label: 'Contact', icon: MessageSquare }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300
                    ${pathname === item.href
                      ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-white border border-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              
              {/* Search Button */}
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {/* Notifications */}
              {user && (
                <button className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                  <Bell className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full ring-2 ring-luxury-navy animate-pulse"></div>
                </button>
              )}
              
              {/* User Section */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => user ? setUserDropdownOpen(!userDropdownOpen) : handleLoginClick()}
                  className="flex items-center gap-3 p-2 pl-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-300 group"
                >
                  {user ? (
                    <>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10 relative overflow-hidden">
                          {/* Gradient border effect */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                          <div className="absolute inset-0 bg-gradient-to-br from-luxury-navy to-luxury-midnight rounded-xl z-10 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{userInitial}</span>
                          </div>
                          {/* Premium badge */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-2 border-luxury-navy flex items-center justify-center z-20">
                            <Crown className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold text-sm">
                          {user.user_metadata?.name?.split(' ')[0] || user.email?.split('@')[0]}
                        </div>
                        <div className="text-xs text-white/50 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Premium Account
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors duration-300">
                        <UserCircle className="w-7 h-7 text-white/70 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold text-sm">Sign In</div>
                        <div className="text-xs text-white/50">Premium Access</div>
                      </div>
                    </>
                  )}
                </motion.button>
                
                {/* Luxury User Dropdown */}
                <AnimatePresence>
                  {user && userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, type: "spring" }}
                      className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-luxury-navy to-luxury-midnight rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                    >
                      {/* User info header */}
                      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/30 to-teal-500/30 flex items-center justify-center border border-white/10">
                              <span className="text-white font-bold text-2xl">{userInitial}</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-2 border-luxury-navy flex items-center justify-center">
                              <Crown className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm truncate">
                              {user.user_metadata?.name || 'Premium Member'}
                            </h3>
                            <p className="text-white/50 text-xs truncate mt-1">{user.email}</p>
                            <div className="mt-2">
                              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-white/10">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span className="text-xs font-medium text-white/80">Elite Tier</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dropdown items */}
                      <div className="p-2">
                        <Link 
                          href="/dashboard" 
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 group"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10 group-hover:border-white/20">
                            <Settings className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">Dashboard</div>
                            <div className="text-xs text-white/50">Manage your business</div>
                          </div>
                        </Link>
                        
                        <Link 
                          href="/profile" 
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 group"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10 group-hover:border-white/20">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">Profile</div>
                            <div className="text-xs text-white/50">Edit your profile</div>
                          </div>
                        </Link>
                        
                        <button
                          onClick={() => {
                            logout()
                            setUserDropdownOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 group w-full"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10 group-hover:border-white/20">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">Sign Out</div>
                            <div className="text-xs text-white/50">End your session</div>
                          </div>
                        </button>
                      </div>
                      
                      {/* Premium upgrade CTA */}
                      <div className="p-4 border-t border-white/10 bg-gradient-to-r from-purple-500/10 to-teal-500/10">
                        <div className="text-xs text-white/50 mb-2">Want more features?</div>
                        <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-teal-600 text-white font-semibold text-sm hover:shadow-lg transition-all duration-300">
                          Upgrade to Pro
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
              className="lg:hidden p-2.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Luxury */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, type: "spring" }}
            className="fixed inset-0 z-[49] lg:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-b from-luxury-navy to-luxury-dark border-l border-white/10 shadow-2xl overflow-y-auto">
              {/* Menu Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <button 
                    onClick={() => setMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
                
                {/* Quick User Info */}
                {user ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-teal-500/10 border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10">
                      <span className="text-white font-bold text-lg">{userInitial}</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">
                        {user.user_metadata?.name?.split(' ')[0]}
                      </div>
                      <div className="text-xs text-white/50">Premium Account</div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 text-white font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
              
              {/* Navigation Links */}
              <div className="p-4">
                {[
                  { href: '/', label: 'Home', icon: Home },
                  { href: '/providers', label: 'Providers', icon: Star },
                  { href: '/categories', label: 'Categories', icon: Sparkles },
                  { href: '/premium', label: 'Premium', icon: Crown },
                  { href: '/dashboard', label: 'Dashboard', icon: Settings },
                  { href: '/profile', label: 'Profile', icon: User },
                  { href: '/contact', label: 'Contact', icon: MessageSquare }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 mb-1"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                
                {/* Mobile Notifications */}
                {user && (
                  <button className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 mb-1 w-full">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full ring-2 ring-luxury-navy"></div>
                    </div>
                    <span className="font-medium">Notifications</span>
                  </button>
                )}
                
                {/* Sign Out */}
                {user && (
                  <button
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all duration-300 w-full mt-4 border-t border-white/10 pt-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-luxury-navy to-luxury-midnight flex items-center justify-center border border-white/10">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-24"></div>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass-luxury rounded-2xl border border-white/10 shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Search className="w-6 h-6 text-white/70" />
                  <input
                    type="text"
                    placeholder="Search for services, providers, or categories..."
                    className="flex-1 bg-transparent text-white text-lg placeholder-white/40 focus:outline-none"
                    autoFocus
                  />
                  <button 
                    onClick={() => setSearchOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
                <div className="text-white/50 text-sm">
                  Try searching for: "plumbing", "electrician", "home cleaning"
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}