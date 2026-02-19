// src/app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  console.log('[CALLBACK] Route was HIT — full URL:', request.url)
  console.log('[CALLBACK] Origin:', requestUrl.origin)
  console.log('[CALLBACK] Search params:', Object.fromEntries(requestUrl.searchParams.entries()))

  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    console.log('[CALLBACK] Code found — attempting exchange')
    
    // Await the cookies() promise
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
            } catch (error) {
              // Handle error silently or log in development
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[CALLBACK] Exchange FAILED:', error.message)
      return NextResponse.redirect(
        new URL(`/?error=exchange_failed&msg=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }

    console.log('[CALLBACK] Exchange SUCCESS — user:', data.user?.email)
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  console.log('[CALLBACK] No code param — invalid callback')
  return NextResponse.redirect(
    new URL('/?error=no_code_param', requestUrl.origin)
  )
}