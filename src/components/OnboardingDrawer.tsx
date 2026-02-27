// src/components/OnboardingDrawer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Briefcase, ShieldCheck, Star, Sparkles, Info, Gift, Clock, Users, CheckCircle, Zap, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface OnboardingDrawerProps {
  isOpen: boolean
  onClose: () => void
  onDontShowAgain?: () => void
  showPromo?: boolean
}

export default function OnboardingDrawer({
  isOpen,
  onClose,
  onDontShowAgain,
  showPromo = true,
}: OnboardingDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const [showPromoSection, setShowPromoSection] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 7, hours: 0 })

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Block body scroll completely
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY
      
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.touchAction = 'none'
      
      return () => {
        // Restore body scroll
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.touchAction = ''
        
        // Restore scroll position
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Scroll to top when onboarding drawer opens
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.scrollTop = 0
    }
  }, [isOpen])

  // Scroll to top when promo section is shown
  useEffect(() => {
    if (showPromoSection && drawerRef.current) {
      drawerRef.current.scrollTop = 0
    }
  }, [showPromoSection])

  // Timer for urgency
  useEffect(() => {
    if (!showPromoSection) return
    
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 7)
    
    const timer = setInterval(() => {
      const now = new Date()
      const diff = expiry.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0 })
        clearInterval(timer)
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      setTimeLeft({ days, hours })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [showPromoSection])

  // Prevent clicks inside drawer from closing it
  const handleDrawerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleClose = () => {
    if (onDontShowAgain) {
      onDontShowAgain()
    }
    localStorage.setItem('hasSeenOnboarding', 'true')
    onClose()
  }

  const remainingSpots = { firstTier: 42, secondTier: 50 }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Simple transparent backdrop - just to detect clicks */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[90]"
              onClick={handleClose}
            />

            {/* Drawer content – clicks here do NOT close */}
            <motion.div
              ref={drawerRef}
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="fixed top-[80px] sm:top-[96px] left-0 right-0 z-[95] max-h-[calc(100vh-80px)] sm:max-h-[calc(100vh-96px)] overflow-y-auto drawer-scroll"
              onClick={handleDrawerClick}
            >
              <div className="bg-gradient-to-b from-gray-900 via-black to-gray-950 border-t border-white/10 shadow-2xl rounded-b-3xl">
                <div className="container mx-auto px-5 sm:px-8 py-8 sm:py-12 max-w-4xl">

                  {/* Hint pill */}
                  <div className="mb-8 sm:mb-10 text-center sm:text-right">
                    <div className="inline-flex items-center gap-3 sm:gap-4 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-white/5 border border-cyan-500/35 shadow-inner backdrop-blur-sm">
                      <div className="flex-1 text-center sm:text-left text-gray-100 text-base sm:text-lg font-medium">
                        your account, dashboard, favorites & settings
                      </div>
                      <div className="text-cyan-300 font-bold text-xl sm:text-2xl flex-shrink-0">
                        ↑
                      </div>
                    </div>
                  </div>


                  {/* Toggle between regular content and promo section */}
                  {!showPromoSection ? (
                    /* Regular Onboarding Content */
                    <>
                      <div className="space-y-10 sm:space-y-12">
                        {/* Provider section */}
                        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl p-6 sm:p-8 border border-white/10">
                          <div className="flex items-center gap-3 mb-5">
                            <Briefcase className="w-7 h-7 text-orange-400" />
                            <h3 className="text-xl sm:text-2xl font-semibold text-white">
                              Are you a service professional?
                            </h3>
                          </div>
                          <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                            <p className="font-medium text-white mb-3">
                              Get listed and start receiving clients:
                            </p>
                            <ol className="space-y-3 pl-6 list-decimal marker:text-orange-400 marker:font-bold">
                              <li>Tap your profile icon (top right)</li>
                              <li>Select "List your business" (Receive 3 listings per account)</li>
                              <li>Complete the registration form</li>
                              <li>Wait for approval (usually 24–48 hours)</li>
                              <li>Manage listings in Provider Dashboard</li>
                            </ol>
                          </div>
                        </div>

                        {/* Clients section */}
                        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl p-6 sm:p-8 border border-white/10">
                          <div className="flex items-center gap-3 mb-5">
                            <ShieldCheck className="w-7 h-7 text-emerald-400" />
                            <h3 className="text-xl sm:text-2xl font-semibold text-white">
                              For clients looking for professionals
                            </h3>
                          </div>
                          <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                            <p className="font-medium text-white">
                              Safety & quality is our top priority:
                            </p>
                            <ul className="space-y-3">
                              <li className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>All providers manually screened before approval</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>Verified business & contact details</span>
                              </li>
                              <li className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>Save favorites & contact trusted professionals easily</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Buttons Section */}
                      <div className="mt-10 sm:mt-12">
                        {/* Main Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                          {/* Claim Launch Offer Button */}
                          {showPromo && (
                            <button
                              onClick={() => setShowPromoSection(true)}
                              className="flex-1 px-6 py-4 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 border border-amber-400/30 hover:border-amber-400/50 text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-amber-900/30 transition-all duration-300 ease-out active:scale-[0.98] hover:scale-105 whitespace-nowrap flex items-center justify-center gap-2"
                            >
                              <Gift className="w-4 h-4" />
                              View Launch Offer
                            </button>
                          )}
                          
                          <button
                            onClick={handleClose}
                            className="flex-1 px-8 py-4 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-700/80 to-blue-800/80 hover:from-cyan-600/90 hover:to-blue-700/90 border border-cyan-400/30 hover:border-cyan-400/50 text-white font-medium text-base sm:text-lg shadow-md hover:shadow-cyan-900/30 transition-all duration-300 ease-out active:scale-[0.98] hover:scale-105"
                          >
                            Ok, Got It
                          </button>
                        </div>

                        {/* About Link - Moved below buttons with subtle style */}
                        <div className="text-center">
                          <Link
                            href="/about"
                            onClick={handleClose}
                            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 transition-all duration-200 group"
                          >
                            <Info className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            <span>About FindAPro</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Promo Section */
                    <div className="space-y-8">
              
                      {/* Hero message */}
                      <div className="text-center">
                        <p className="text-3xl md:text-4xl font-bold text-white mb-2">
                          List FREE for{' '}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                            6 months
                          </span>
                        </p>
                        <p className="text-gray-300">
                          First 100 businesses only. No risk, just opportunity.
                        </p>
                        {/* Fine print */}
                        <p className="text-center text-xs text-gray-600 mt-2">
                          *Subject to approval. No credit card required.
                        </p>
                      </div>


                      {/* Tier cards - responsive */}
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-5 rounded-xl border border-amber-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                <span className="text-amber-400 font-bold text-lg">1</span>
                              </div>
                              <div>
                                <div className="font-semibold text-white">First 50 businesses</div>
                                <div className="text-amber-400 font-bold text-lg">6 Months Free</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-5 rounded-xl border border-blue-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <span className="text-blue-400 font-bold text-lg">2</span>
                              </div>
                              <div>
                                <div className="font-semibold text-white">Next 50 businesses</div>
                                <div className="text-blue-400 font-bold text-lg">3 Months Free</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* What you get - simplified for mobile */}
                      <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700">
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          Your premium listing includes:
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            'Logo & photos', 'WhatsApp', 'Multiple phones', 
                            'Service areas', 'Verified badge', '3 listings'
                          ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-300">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-center">
                        <span className="text-3xl font-bold text-white">R99</span>
                        <span className="text-gray-400 text-sm ml-2">/month after offer</span>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Link
                          href="/providers/provider-listings"
                          onClick={handleClose}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl text-center transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-500/25"
                        >
                          Claim Your Free Spot
                        </Link>
                        <button
                          onClick={() => setShowPromoSection(false)}
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-4 px-6 rounded-xl transition-all"
                        >
                          Maybe Later
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global styles to prevent background scroll and clean up drawer scrolling */}
      <style jsx global>{`
        /* Hide scrollbar but keep functionality */
        .drawer-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        .drawer-scroll::-webkit-scrollbar {
          display: none;
        }
        
        /* Ensure body doesn't scroll and stays in place */
        body {
          transition: none !important;
        }
        
        /* Prevent any pull-to-refresh on mobile */
        html, body {
          overscroll-behavior-y: none;
        }
        
        /* Smooth scrolling for drawer */
        .drawer-scroll {
          scroll-behavior: smooth;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .drawer-scroll {
            max-height: calc(100vh - 80px);
          }
        }
      `}</style>
    </>
  )
}