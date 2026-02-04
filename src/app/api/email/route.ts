// File: src/app/api/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  sendNewListingAdminEmail, 
  sendNewListingConfirmationEmail,
  sendProviderStatusEmail,
  sendAdminConfirmationEmail,
  sendListingUpdatedEmail  // ADD THIS IMPORT
} from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📧 Email API called:', { event: body.event, providerId: body.providerId })

    const { 
      event, 
      providerId, 
      adminEmail, 
      action, 
      reason,
      businessName,
      status,
      recipientEmail,
      recipientType = 'provider'
    } = body

    if (!event) {
      return NextResponse.json({ error: 'Event type required' }, { status: 400 })
    }

    // For listing_updated, we don't need provider object
    if (event !== 'listing_updated' && !providerId) {
      return NextResponse.json({ error: 'Provider ID required' }, { status: 400 })
    }

    let provider = null
    let result = null

    // Get provider details (except for listing_updated)
    if (providerId && event !== 'listing_updated') {
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single()

      if (providerError) {
        console.error('Provider lookup error:', providerError)
        return NextResponse.json({ 
          error: 'Provider not found',
          details: providerError.message
        }, { status: 404 })
      }

      provider = providerData
    }

    switch (event) {
      case 'new_listing':
        console.log('📤 Sending new listing emails for:', provider?.business_name)
        
        if (!provider) {
          return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
        }

        // Use your existing working functions
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

        if (!provider) {
          return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
        }

        // Use your existing working functions
        const providerEmailResult = await sendProviderStatusEmail(provider, action, reason)
        
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

      case 'listing_updated':
        console.log('📝 Processing listing update:', { 
          businessName, 
          status, 
          recipientType 
        })
        
        // Simple validation
        if (!businessName) {
          return NextResponse.json({ error: 'Business name required' }, { status: 400 })
        }

        if (!status) {
          return NextResponse.json({ error: 'Status required' }, { status: 400 })
        }

        if (recipientType === 'provider' && !recipientEmail) {
          return NextResponse.json({ error: 'Provider email required' }, { status: 400 })
        }

        // SIMPLE SOLUTION: Use the same function for both, just pass recipientType
        result = await sendListingUpdatedEmail(
          recipientType === 'provider' ? recipientEmail! : (recipientEmail || 'admin@findapro.co.za'),
          businessName,
          status,
          providerId || 'N/A',
          recipientType
        )
        
        console.log(`✅ Email sent to ${recipientType}:`, result.success)
        break

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email processing complete',
      data: result
    })

  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process email'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'FindAPro Email Service',
    timestamp: new Date().toISOString()
  })
}