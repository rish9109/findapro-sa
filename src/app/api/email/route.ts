// File: src/app/api/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  sendNewListingAdminEmail, 
  sendNewListingConfirmationEmail,
  sendProviderStatusEmail,
  sendAdminConfirmationEmail 
} from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📧 Email API called:', body)

    const { event, providerId, adminEmail, action, reason } = body

    if (!event) {
      return NextResponse.json({ error: 'Event type required' }, { status: 400 })
    }

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID required' }, { status: 400 })
    }

    // Get provider details - with better error handling
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (providerError) {
      console.error('Provider lookup error:', providerError)
      
      // Check if provider exists at all
      const { count } = await supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('id', providerId)

      return NextResponse.json({ 
        error: 'Provider not found',
        details: providerError.message,
        providerExists: count > 0
      }, { status: 404 })
    }

    if (!provider) {
      return NextResponse.json({ 
        error: 'Provider not found',
        providerId,
        note: 'Check if provider was saved to database'
      }, { status: 404 })
    }

    let result

    switch (event) {
      case 'new_listing':
        console.log('📤 Sending new listing emails for:', provider.business_name)
        
        const [adminResult, providerResult] = await Promise.allSettled([
          sendNewListingAdminEmail(provider),
          sendNewListingConfirmationEmail(provider)
        ])
        
        result = { 
          success: true,
          adminEmail: adminResult.status === 'fulfilled' ? adminResult.value : adminResult.reason,
          providerEmail: providerResult.status === 'fulfilled' ? providerResult.value : providerResult.reason
        }
        break

      case 'status_update':
        console.log('🔄 Processing status update:', { action, reason })
        
        if (!action) {
          return NextResponse.json({ error: 'Action required' }, { status: 400 })
        }

        // Send email to provider
        const providerEmailResult = await sendProviderStatusEmail(provider, action, reason)
        
        // Send confirmation to admin
        let adminConfirmResult = null
        if (adminEmail) {
          adminConfirmResult = await sendAdminConfirmationEmail(adminEmail, provider, action, reason)
        }
        
        result = { 
          success: true, 
          providerEmail: providerEmailResult,
          adminConfirmation: adminConfirmResult
        }
        break

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email processing complete',
      data: result,
      provider: {
        id: provider.id,
        business_name: provider.business_name,
        status: provider.status
      }
    })

  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process email',
        note: 'Check your configuration'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'FindAPro Email Service',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    resendConfigured: !!process.env.RESEND_API_KEY
  })
}