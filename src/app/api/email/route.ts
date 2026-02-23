// File: src/app/api/email/route.ts - COMPLETE WORKING VERSION
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  sendNewListingAdminEmail, 
  sendNewListingConfirmationEmail,
  sendProviderStatusEmail,
  sendAdminConfirmationEmail,
  sendListingUpdatedEmail,
  sendResubmitConfirmationEmail
} from '@/lib/resend'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log('\n')
  console.log('='.repeat(80))
  console.log(`📧 [${requestId}] EMAIL API CALLED at ${new Date().toISOString()}`)
  console.log('='.repeat(80))
  
  try {
    const body = await request.json()
    console.log(`📧 [${requestId}] Request body:`, JSON.stringify(body, null, 2))

    const { 
      event, 
      providerId, 
      provider: directProvider,
      adminEmail, 
      action, 
      reason,
      businessName,
      recipientEmail,
      status,
      recipientType = 'provider'
    } = body

    if (!event) {
      return NextResponse.json({ 
        success: false,
        error: 'Event type required' 
      }, { status: 400 })
    }

    console.log(`📧 [${requestId}] Processing event: "${event}"`)

    // Handle different event types
    switch (event) {
      case 'new_listing':
        if (!directProvider) {
          return NextResponse.json({ 
            success: false,
            error: 'Provider data required for new listing' 
          }, { status: 400 })
        }

        const adminResult = await sendNewListingAdminEmail(directProvider)
        const providerResult = await sendNewListingConfirmationEmail(directProvider)
        
        return NextResponse.json({ 
          success: true,
          adminEmail: adminResult,
          providerEmail: providerResult
        })

      case 'status_update':
        console.log(`📧 [${requestId}] Action:`, action)
        
        if (!action) {
          return NextResponse.json({ 
            success: false,
            error: 'Action required' 
          }, { status: 400 })
        }

        // Use direct provider if provided
        let provider = directProvider || null

        // If no direct provider but we have ID, try to fetch
        if (!provider && providerId) {
          const { data: providerData } = await supabase
            .from('providers')
            .select('*')
            .eq('id', providerId)
            .maybeSingle()

          if (providerData) {
            provider = providerData
          }
        }

        // If still no provider, return warning but not error
        if (!provider) {
          console.log(`📧 [${requestId}] No provider data available for ${action}`)
          return NextResponse.json({ 
            success: false,
            warning: true,
            message: `Action ${action} completed but email could not be sent - provider data missing`
          }, { status: 200 })
        }
        
        // Send status email to provider
        const providerEmailResult = await sendProviderStatusEmail(provider, action, reason)
        
        // Send admin confirmation if admin email provided
        let adminConfirmResult = null
        if (adminEmail) {
          adminConfirmResult = await sendAdminConfirmationEmail(adminEmail, provider, action, reason)
        }
        
        return NextResponse.json({ 
          success: true, 
          providerEmail: providerEmailResult,
          adminConfirmation: adminConfirmResult
        })

      case 'resubmit_confirmation':
        if (!recipientEmail || !businessName) {
          return NextResponse.json({ 
            success: false,
            error: 'Recipient email and business name required' 
          }, { status: 400 })
        }

        const resubmitResult = await sendResubmitConfirmationEmail(recipientEmail, businessName)
        
        return NextResponse.json({ 
          success: resubmitResult.success,
          data: resubmitResult
        })

      case 'listing_updated':
        if (!businessName || !status) {
          return NextResponse.json({ 
            success: false,
            error: 'Business name and status required' 
          }, { status: 400 })
        }

        const emailTo = recipientType === 'provider' 
          ? recipientEmail! 
          : (recipientEmail || 'admin@findapro.co.za')
        
        const result = await sendListingUpdatedEmail(
          emailTo,
          businessName,
          status,
          providerId || 'N/A',
          recipientType
        )
        
        return NextResponse.json({ 
          success: true,
          data: result
        })

      default:
        return NextResponse.json({ 
          success: false,
          error: 'Unknown event type' 
        }, { status: 400 })
    }

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ [${requestId}] Email API error:`, error.message)
    
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
    timestamp: new Date().toISOString(),
    templates: [
      'new_listing_admin',
      'listing_submitted',
      'listing_approved',
      'listing_rejected',
      'listing_paused',
      'listing_deleted',
      'listing_reactivated',
      'provider_listing_updated',
      'admin_listing_updated'
    ]
  })
}