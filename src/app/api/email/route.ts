// File: src/app/api/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  sendNewListingAdminEmail, 
  sendNewListingConfirmationEmail,
  sendProviderStatusEmail,
  sendAdminConfirmationEmail,
  sendListingUpdatedEmail
} from '@/lib/resend'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log('\n')
  console.log('='.repeat(80))
  console.log(`📧 [${requestId}] EMAIL API CALLED at ${new Date().toISOString()}`)
  console.log('='.repeat(80))
  
  try {
    // Log raw request body
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
      status,
      recipientEmail,
      recipientType = 'provider'
    } = body

    // Validate required fields
    if (!event) {
      console.error(`❌ [${requestId}] No event provided`)
      return NextResponse.json({ 
        success: false,
        error: 'Event type required' 
      }, { status: 400 })
    }

    console.log(`📧 [${requestId}] Processing event: "${event}"`)
    console.log(`📧 [${requestId}] Has direct provider:`, !!directProvider)
    console.log(`📧 [${requestId}] Provider ID:`, providerId || 'not provided')
    
    let provider = directProvider || null
    let result = null

    // Log provider data if available
    if (provider) {
      console.log(`📧 [${requestId}] Direct provider data:`, {
        id: provider.id,
        business_name: provider.business_name,
        contact_email: provider.contact_email,
        contact_person: provider.contact_person,
        status: provider.status
      })
    }

    // Only fetch from DB if provider data wasn't provided directly
    if (!provider && providerId && event !== 'listing_updated') {
      console.log(`📧 [${requestId}] Fetching provider from DB with ID: ${providerId}`)
      
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single()

      if (providerError) {
        console.error(`❌ [${requestId}] Provider lookup error:`, providerError)
        return NextResponse.json({ 
          success: false,
          error: 'Provider not found',
          details: providerError.message
        }, { status: 404 })
      }

      provider = providerData
      console.log(`📧 [${requestId}] Provider fetched from DB:`, {
        id: provider.id,
        business_name: provider.business_name,
        contact_email: provider.contact_email
      })
    }

    // Handle different event types
    switch (event) {
      case 'new_listing':
        console.log(`📧 [${requestId}] ===== NEW LISTING EVENT =====`)
        
        if (!provider) {
          console.error(`❌ [${requestId}] No provider data available for new_listing`)
          return NextResponse.json({ 
            success: false,
            error: 'Provider data required for new listing' 
          }, { status: 404 })
        }

        console.log(`📧 [${requestId}] Sending emails for:`, {
          business: provider.business_name,
          admin_to: 'admin@findapro.co.za',
          provider_to: provider.contact_email
        })

        // Send emails sequentially with detailed logging
        console.log(`📧 [${requestId}] Calling sendNewListingAdminEmail...`)
        const adminResult = await sendNewListingAdminEmail(provider)
        console.log(`📧 [${requestId}] Admin email result:`, JSON.stringify(adminResult, null, 2))
        
        console.log(`📧 [${requestId}] Calling sendNewListingConfirmationEmail...`)
        const providerResult = await sendNewListingConfirmationEmail(provider)
        console.log(`📧 [${requestId}] Provider email result:`, JSON.stringify(providerResult, null, 2))
        
        result = { 
          success: true,
          adminEmail: adminResult,
          providerEmail: providerResult
        }
        
        console.log(`📧 [${requestId}] New listing emails completed`)
        break

      case 'status_update':
        console.log(`📧 [${requestId}] ===== STATUS UPDATE EVENT =====`)
        console.log(`📧 [${requestId}] Action:`, action)
        console.log(`📧 [${requestId}] Reason:`, reason)
        
        if (!action) {
          console.error(`❌ [${requestId}] No action provided for status_update`)
          return NextResponse.json({ 
            success: false,
            error: 'Action required' 
          }, { status: 400 })
        }

        if (!provider) {
          console.error(`❌ [${requestId}] No provider found for status_update`)
          return NextResponse.json({ 
            success: false,
            error: 'Provider not found' 
          }, { status: 404 })
        }

        console.log(`📧 [${requestId}] Sending status update email to provider:`, provider.contact_email)
        const providerEmailResult = await sendProviderStatusEmail(provider, action, reason)
        console.log(`📧 [${requestId}] Provider status email result:`, JSON.stringify(providerEmailResult, null, 2))
        
        let adminConfirmResult = null
        if (adminEmail) {
          console.log(`📧 [${requestId}] Sending admin confirmation to:`, adminEmail)
          adminConfirmResult = await sendAdminConfirmationEmail(adminEmail, provider, action, reason)
          console.log(`📧 [${requestId}] Admin confirmation result:`, JSON.stringify(adminConfirmResult, null, 2))
        }
        
        result = { 
          success: true, 
          providerEmail: providerEmailResult,
          adminConfirmation: adminConfirmResult
        }
        break

      case 'listing_updated':
        console.log(`📧 [${requestId}] ===== LISTING UPDATED EVENT =====`)
        console.log(`📧 [${requestId}] Business name:`, businessName)
        console.log(`📧 [${requestId}] Status:`, status)
        console.log(`📧 [${requestId}] Recipient type:`, recipientType)
        console.log(`📧 [${requestId}] Recipient email:`, recipientEmail)
        
        // Validate required fields
        if (!businessName) {
          console.error(`❌ [${requestId}] No business name provided`)
          return NextResponse.json({ 
            success: false,
            error: 'Business name required' 
          }, { status: 400 })
        }

        if (!status) {
          console.error(`❌ [${requestId}] No status provided`)
          return NextResponse.json({ 
            success: false,
            error: 'Status required' 
          }, { status: 400 })
        }

        if (recipientType === 'provider' && !recipientEmail) {
          console.error(`❌ [${requestId}] Provider email required but not provided`)
          return NextResponse.json({ 
            success: false,
            error: 'Provider email required' 
          }, { status: 400 })
        }

        const emailTo = recipientType === 'provider' 
          ? recipientEmail! 
          : (recipientEmail || 'admin@findapro.co.za')
        
        console.log(`📧 [${requestId}] Sending listing updated email to:`, emailTo)
        
        result = await sendListingUpdatedEmail(
          emailTo,
          businessName,
          status,
          providerId || 'N/A',
          recipientType
        )
        
        console.log(`📧 [${requestId}] Listing updated email result:`, JSON.stringify(result, null, 2))
        break

      default:
        console.error(`❌ [${requestId}] Unknown event type:`, event)
        return NextResponse.json({ 
          success: false,
          error: 'Unknown event type' 
        }, { status: 400 })
    }

    const duration = Date.now() - startTime
    console.log(`📧 [${requestId}] ✅ Request completed in ${duration}ms`)
    console.log('='.repeat(80))
    console.log('\n')

    return NextResponse.json({
      success: true,
      message: 'Email processing complete',
      requestId,
      duration: `${duration}ms`,
      data: result
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ [${requestId}] Email API error after ${duration}ms:`)
    console.error(`❌ [${requestId}] Error message:`, error.message)
    console.error(`❌ [${requestId}] Error stack:`, error.stack)
    console.error('='.repeat(80))
    console.log('\n')
    
    return NextResponse.json(
      { 
        success: false,
        requestId,
        duration: `${duration}ms`,
        error: error.message || 'Failed to process email',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    endpoints: ['POST /api/email - Send emails'],
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