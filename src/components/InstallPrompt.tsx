'use client'

import { useState, useEffect } from 'react'

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

  // Auto-hide success message after 5 seconds (best practice)
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

  // ← This was the main source of all the bugs you reported
  if (!isAndroid || isStandalone || (!showPrompt && !installed)) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-gray-900 border border-gray-700 text-white p-6 rounded-2xl shadow-2xl z-[100]">
      {!installed ? (
        <>
          <h3 className="text-lg font-semibold mb-2">Install FindAPro</h3>
          <p className="text-sm text-gray-400 mb-5">
            Get faster access • Works offline • App-like experience
          </p>

          <label className="flex items-center gap-3 mb-5 cursor-pointer">
            <input
              type="checkbox"
              checked={neverShowAgain}
              onChange={handleNeverAgain}
              className="w-5 h-5 accent-indigo-600 bg-gray-700 border-gray-600 rounded"
            />
            <span className="text-sm text-gray-300">Don't show this again</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition"
            >
              Cancel
            </button>

            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              {isInstalling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Installing...
                </>
              ) : (
                'Install'
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-semibold text-lg">Installed successfully!</p>
          <p className="text-sm text-gray-400 mt-2">
            FindAPro is now on your home screen
          </p>
        </div>
      )}
    </div>
  )
}