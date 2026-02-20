'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt: () => void
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [neverShowAgain, setNeverShowAgain] = useState(false)
  const [installed, setInstalled] = useState(false)

  const isStandalone = typeof window !== 'undefined' && 
    window.matchMedia('(display-mode: standalone)').matches

  const isAndroid = typeof window !== 'undefined' && 
    /Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent)

  useEffect(() => {
    if (installed) {
      const timer = setTimeout(() => {
        setInstalled(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [installed])

  useEffect(() => {
    if (isStandalone) return

    if (localStorage.getItem('findapro-install-never-again') === 'true') return

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show prompt for Android Chrome users
      if (isAndroid) {
        setShowPrompt(true)
      }
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setShowPrompt(false)
      setIsInstalling(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isStandalone, isAndroid])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setInstalled(true)
    }

    if (neverShowAgain) {
      localStorage.setItem('findapro-install-never-again', 'true')
    }

    setDeferredPrompt(null)
    setIsInstalling(false)
    setShowPrompt(false)
  }

  const handleCancel = () => {
    setShowPrompt(false)
    if (neverShowAgain) {
      localStorage.setItem('findapro-install-never-again', 'true')
    }
  }

  const handleNeverAgain = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNeverShowAgain(e.target.checked)
  }

  // Check if we should show anything at all
  const shouldShow = showPrompt || installed

  // Don't render if not Android, if standalone, or if we shouldn't show
  if (!isAndroid || isStandalone || !shouldShow) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-[100]"
      >
        <div className="relative bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/10 text-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          
          {showPrompt && (
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          <div className="p-6">
            {!installed ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                 
                  <div>
                  <h3 className="text-lg font-semibold justify-center-safe">App Install</h3>
                  <h2 className="text-lg font-semibold text-center bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
  findapro.co.za
</h2>
                    <p className="text-xs text-gray-400 justify-center-safe">FIND A PRO CONNECT (PTY) LTD</p>
             
                  </div>
                </div>

           

                <label className="flex items-center gap-3 mb-5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={neverShowAgain}
                    onChange={handleNeverAgain}
                    className="w-4 h-4 accent-amber-500 bg-gray-800 border-gray-600 rounded transition-colors"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    Don't show this again
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2.5 bg-gray-800/80 hover:bg-gray-700 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
                  >
                    Later
                  </button>

                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {isInstalling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Installing...
                      </>
                    ) : (
                      'Install App'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="text-4xl mb-3"
                >
                  🎉
                </motion.div>
                <p className="font-semibold text-lg">Installed!</p>
                <p className="text-sm text-gray-400 mt-1">
                  FindAPro is on your home screen
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}