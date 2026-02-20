// src/app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[Auth Callback] Processing OAuth callback')
      console.log('[Auth Callback] Current URL:', window.location.href)
      
      // Check for error in URL
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')
      
      if (error) {
        console.error('[Auth Callback] OAuth error:', error, errorDescription)
        router.push(`/?error=${error}`)
        return
      }

      // Handle both code flow (PKCE) and implicit flow (fragment)
      const hash = window.location.hash.substring(1)
      
      if (hash) {
        // Implicit flow - tokens in URL fragment
        console.log('[Auth Callback] Detected implicit flow (fragment)')
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        
        if (accessToken) {
          console.log('[Auth Callback] Setting session from fragment')
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (error) {
            console.error('[Auth Callback] Session error:', error)
            router.push('/?error=session_error')
          } else {
            console.log('[Auth Callback] Session set successfully')
            router.push('/')
          }
        } else {
          console.error('[Auth Callback] No access token in fragment')
          router.push('/?error=no_token')
        }
      } else {
        // Check for code in query params (PKCE flow)
        const code = urlParams.get('code')
        if (code) {
          console.log('[Auth Callback] Detected PKCE flow with code')
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('[Auth Callback] Code exchange error:', error)
            router.push('/?error=exchange_failed')
          } else {
            console.log('[Auth Callback] Code exchange successful')
            router.push('/')
          }
        } else {
          console.error('[Auth Callback] No code or fragment found')
          router.push('/?error=invalid_callback')
        }
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}