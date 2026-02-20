'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackClient() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('[Callback-Client] Processing auth callback')
      
      // Get the hash fragment from the URL
      const hash = window.location.hash.substring(1) // Remove the '#'
      const params = new URLSearchParams(hash)
      
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const expiresIn = params.get('expires_in')
      const tokenType = params.get('token_type')
      
      console.log('[Callback-Client] Tokens found:', { 
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing' 
      })

      if (accessToken) {
        // Set the session manually
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })

        if (error) {
          console.error('[Callback-Client] Error setting session:', error)
          router.push('/?error=auth_failed')
        } else {
          console.log('[Callback-Client] Session set successfully')
          router.push('/')
        }
      } else {
        console.error('[Callback-Client] No access token found')
        router.push('/?error=no_token')
      }
    }

    handleAuthCallback()
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