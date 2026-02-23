// src/components/OnboardingDrawer.tsx
'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Briefcase, ShieldCheck, Star, Sparkles, Info } from 'lucide-react'
import Link from 'next/link'

interface OnboardingDrawerProps {
  isOpen: boolean
  onClose: () => void
  onDontShowAgain?: () => void          // optional – if you want to support "don't show again"
}

export default function OnboardingDrawer({
  isOpen,
  onClose,
  onDontShowAgain,
}: OnboardingDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

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

  // Block body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Optional: prevent touchmove bounce on iOS
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen])

  // Prevent clicks inside drawer from closing it
  const handleDrawerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Optional: remember "don't show again" via localStorage if no callback
  const handleClose = () => {
    // If parent wants to handle "don't show again", call it
    if (onDontShowAgain) {
      onDontShowAgain()
    }
    // Fallback: simple localStorage (you can remove if parent handles it)
    localStorage.setItem('hasSeenOnboarding', 'true')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop – clicking it closes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-[80px] sm:top-[96px] left-0 right-0 bottom-0 bg-black/55 backdrop-blur-sm z-[90]"
            onClick={handleClose}
          />

          {/* Drawer content – clicks here do NOT close */}
          <motion.div
            ref={drawerRef}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="fixed top-[80px] sm:top-[96px] left-0 right-0 z-[95] max-h-[calc(100vh-80px)] sm:max-h-[calc(100vh-96px)] overflow-y-auto"
            onClick={handleDrawerClick}
          >
            <div className="bg-gradient-to-b from-gray-900 via-black to-gray-950 border-t border-white/10 shadow-2xl rounded-b-3xl">
              <div className="container mx-auto px-5 sm:px-8 py-8 sm:py-12 max-w-4xl">

                {/* Hint pill */}
                <div className="mb-8 sm:mb-10 text-center sm:text-right">
                  <div className="
                    inline-flex items-center gap-3 sm:gap-4
                    px-5 py-3 sm:px-6 sm:py-3.5
                    rounded-xl
                    bg-white/5
                    border border-cyan-500/35
                    shadow-inner
                    backdrop-blur-sm
                  ">
                    <div className="flex-1 text-center sm:text-left text-gray-100 text-base sm:text-lg font-medium">
                    your account, dashboard, favorites & settings
                    </div>
                    <div className="text-cyan-300 font-bold text-xl sm:text-2xl flex-shrink-0">
                      ↑
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 flex-1 justify-center sm:justify-start">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600/25 to-purple-600/25 flex items-center justify-center border border-white/25 flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>

                    <h2 className="
                      text-2xl sm:text-3xl 
                      font-bold 
                      bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
                      bg-clip-text text-transparent
                      text-center
                    ">
                      Welcome
                    </h2>
                  </div>

                  <button
                    onClick={handleClose}
                    className="p-2.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>

                {/* Content */}
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

{/* Footer – About Us link and button */}
<div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
  {/* About Us Link - Enhanced */}
  <Link
    href="/about"
    onClick={handleClose}
    className="
      group relative
      flex items-center gap-3
      px-6 py-3 sm:px-8 sm:py-4
      rounded-2xl
      bg-gradient-to-r from-orange-500/10 to-yellow-500/10
      hover:from-orange-500/20 hover:to-yellow-500/20
      border border-orange-500/20 hover:border-orange-500/40
      transition-all duration-300 ease-out
      transform hover:scale-105 hover:-translate-y-0.5
      shadow-lg hover:shadow-orange-500/25
    "
  >
    {/* Animated background glow */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
    
    {/* Icon with pulse animation */}
    <div className="relative">
      <Info className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 group-hover:text-orange-300 transition-all duration-300 group-hover:rotate-12 animate-pulse" />
    </div>
    
    {/* Text */}
    <span className="relative text-base sm:text-lg font-semibold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:to-yellow-300">
    About FindAPro
    </span>
    
    {/* Animated arrow */}
    <svg 
      className="relative w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-all duration-300 group-hover:translate-x-1" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  </Link>

  <button
    onClick={handleClose}
    className="
      px-8 py-3.5 sm:px-10 sm:py-4
      rounded-xl sm:rounded-2xl
      bg-gradient-to-r from-cyan-700/80 to-blue-800/80
      hover:from-cyan-600/90 hover:to-blue-700/90
      border border-cyan-400/30 hover:border-cyan-400/50
      text-white font-medium text-base sm:text-lg
      shadow-md hover:shadow-cyan-900/30
      transition-all duration-300 ease-out
      active:scale-[0.98]
      hover:scale-105
    "
  >
    Ok, Got It
  </button>
</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}