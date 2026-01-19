// File: src/app/api/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendNewListingAdminEmail, sendProviderStatusEmail, sendAdminConfirmationEmail } from '@/lib/resend'

// Trigger when new provider is submitted
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, providerId, adminEmail, action, reason } = body

    if (!event) {
      return NextResponse.json(
        { error: 'Event type required' },
        { status: 400 }
      )
    }

    // Get provider details
    const { data: provider, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (error || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    let result

    switch (event) {
      case 'new_listing':
        result = await sendNewListingAdminEmail(provider)
        break

      case 'status_update':
        if (!action) {
          return NextResponse.json(
            { error: 'Action required for status update' },
            { status: 400 }
          )
        }
        
        // Send email to provider
        await sendProviderStatusEmail(provider, action, reason)
        
        // Send confirmation to admin
        if (adminEmail) {
          await sendAdminConfirmationEmail(adminEmail, provider, action, reason)
        }
        
        result = { success: true }
        break

      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: result
    })

  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'FindAPro Email Service',
    timestamp: new Date().toISOString()
  })
}