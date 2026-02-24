// src/components/SamsungBrowserNotice.tsx
'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function SamsungBrowserNotice() {
  const [show, setShow] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [chromeIntentUrl, setChromeIntentUrl] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasDismissed = localStorage.getItem('samsung-notice-dismissed') === 'true'
    if (hasDismissed) return

    const ua = navigator.userAgent.toLowerCase()
    const isSamsungBrowser =
      /samsungbrowser/i.test(ua) ||
      /samsung internet/i.test(ua) ||
      (/samsung/i.test(ua) && /chrome/i.test(ua) && !/edg/i.test(ua) && !/firefox/i.test(ua))

    if (isSamsungBrowser) {
      const url = window.location.href
      setCurrentUrl(url)
      
      // Create Chrome Intent URL for Android
      const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end;`
      setChromeIntentUrl(intentUrl)
      
      setShow(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('samsung-notice-dismissed', 'true')
    setShow(false)
  }

  const handleSwitchToChrome = () => {
    // Try Chrome Intent first (Android)
    if (chromeIntentUrl) {
      window.location.href = chromeIntentUrl
    }
    
    // Fallback: if intent doesn't work after 500ms, try regular link
    setTimeout(() => {
      window.location.href = currentUrl
    }, 500)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="modern-glass rounded-2xl p-4 shadow-2xl border border-gray-700/60 backdrop-blur-xl animate-subtle-float">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-amber-300 mb-1">
              Better experience available
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Samsung Internet sometimes adjusts colors automatically. For the most accurate look (especially gradients and dark mode), try viewing this page in Chrome.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={handleSwitchToChrome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              >
                Switch to Chrome
              </button>
              <a
                href="https://www.google.com/chrome/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 border border-gray-600 transition-all"
              >
                Get Chrome
              </a>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700/60 text-gray-300 hover:bg-gray-600/60 border border-gray-600 transition-all"
              >
                Maybe later
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1 -mt-1 -mr-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}