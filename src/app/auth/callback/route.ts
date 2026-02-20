import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  console.log('[CALLBACK] Route was HIT — full URL:', request.url)
  
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    // Handle PKCE flow (if it ever works)
    console.log('[CALLBACK] Code found — attempting exchange')
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() { 
            const cookieStore = await cookies()
            return cookieStore.getAll() 
          },
          async setAll(cookiesToSet) {
            try {
              const cookieStore = await cookies()
              cookiesToSet.forEach(({ name, value, options }) => 
                cookieStore.set(name, value, options)
              )
            } catch (error) {}
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[CALLBACK] Exchange FAILED:', error.message)
      return NextResponse.redirect(
        new URL(`/?error=exchange_failed`, requestUrl.origin)
      )
    }
    console.log('[CALLBACK] Exchange SUCCESS')
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  // No code found - this is implicit flow with token in fragment
  // Redirect to client-side handler to process the fragment
  console.log('[CALLBACK] No code param - redirecting to client handler')
  return NextResponse.redirect(
    new URL('/auth/callback-client', requestUrl.origin)
  )
}