// src/components/InstallPrompt.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt: () => void
}

export default function InstallPrompt() {
  const { user } = useAuth()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  
  const pathname = usePathname()

  const isStandalone = typeof window !== 'undefined' && 
    window.matchMedia('(display-mode: standalone)').matches

  const isAndroid = typeof window !== 'undefined' && 
    /Android/i.test(navigator.userAgent)

  // Check if user has permanently dismissed
  const hasUserDismissed = typeof window !== 'undefined' && 
    localStorage.getItem('findapro-install-dismissed') === 'true'

  // Get display name from user
  const displayName = user?.user_metadata?.full_name || 
                      user?.user_metadata?.name || 
                      user?.email?.split('@')[0] || 
                      'Pro'

  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      console.log('Install prompt event captured') // Debug
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    }
  }, [])

  // Show prompt when user logs in AND we have the prompt
  useEffect(() => {
    if (user && deferredPrompt && !hasUserDismissed && !isStandalone && pathname === '/') {
      // Small delay to ensure smooth UX after login
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [user, deferredPrompt, hasUserDismissed, isStandalone, pathname])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available')
      return
    }

    setIsInstalling(true)
    
    // Must call prompt() as a direct result of user click
    deferredPrompt.prompt()
    
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted install')
      setShowPrompt(false)
    } else {
      console.log('User dismissed install')
    }
    
    setDeferredPrompt(null) // Can only use once
    setIsInstalling(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  const handleDontShowAgain = () => {
    localStorage.setItem('findapro-install-dismissed', 'true')
    setShowPrompt(false)
  }

  // Don't render if conditions not met
  if (!user || !isAndroid || isStandalone || !showPrompt || pathname !== '/' || hasUserDismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-[100]"
      >
        <div className="relative bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/10 text-white rounded-2xl shadow-2xl overflow-hidden">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>

          <div className="p-6">
            <h3 className="text-lg font-semibold mb-1">Welcome, {displayName}! 👋</h3>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4">
              Install Find A Pro App
            </h2>

            <div className="space-y-2 mb-5 text-sm text-gray-300">
              <p>✓ One-tap access</p>
              <p>✓ Faster loading</p>
              <p>✓ Better Experience</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 rounded-xl font-medium transition-all transform active:scale-95"
              >
                {isInstalling ? 'Installing...' : 'Install App'}
              </button>
              
              <div className="flex gap-2 text-xs">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-all"
                >
                  Later
                </button>
                <button
                  onClick={handleDontShowAgain}
                  className="flex-1 py-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-all"
                >
                  Don't show again
                </button>
              </div>
            </div>
            
            {/* Debug info - remove in production */}
            <p className="text-[10px] text-gray-600 mt-3 text-center">
              {deferredPrompt ? '✓ Install ready' : '⏳ Loading install...'}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}