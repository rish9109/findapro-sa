// File: src/app/api/email/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendNewListingAdminEmail, sendNewListingConfirmationEmail, sendProviderStatusEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType, providerId, action, reason } = body

    if (!testType) {
      return NextResponse.json({ error: 'testType required' }, { status: 400 })
    }

    console.log(`🧪 [Test] Running email test: ${testType}`)

    let result

    switch (testType) {
      case 'templates_check':
        // Check all templates exist
        const { data: templates, error } = await supabase
          .from('email_templates')
          .select('name, subject')
          .order('name')

        if (error) throw error

        const requiredTemplates = ['new_listing_admin', 'listing_submitted', 'listing_approved', 'listing_rejected', 'listing_paused', 'listing_deleted']
        const missingTemplates = requiredTemplates.filter(template => 
          !templates?.find(t => t.name === template)
        )

        result = {
          templates,
          missingTemplates,
          allTemplatesPresent: missingTemplates.length === 0
        }
        break

      case 'new_listing':
        if (!providerId) {
          return NextResponse.json({ error: 'providerId required for new_listing test' }, { status: 400 })
        }

        const { data: provider } = await supabase
          .from('providers')
          .select('*')
          .eq('id', providerId)
          .single()

        if (!provider) {
          return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
        }

        const [adminResult, providerResult] = await Promise.allSettled([
          sendNewListingAdminEmail(provider),
          sendNewListingConfirmationEmail(provider)
        ])

        result = {
          adminEmail: adminResult.status === 'fulfilled' ? adminResult.value : adminResult.reason,
          providerEmail: providerResult.status === 'fulfilled' ? providerResult.value : providerResult.reason
        }
        break

      case 'status_update':
        if (!providerId || !action) {
          return NextResponse.json({ error: 'providerId and action required' }, { status: 400 })
        }

        const { data: providerForStatus } = await supabase
          .from('providers')
          .select('*')
          .eq('id', providerId)
          .single()

        if (!providerForStatus) {
          return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
        }

        const statusResult = await sendProviderStatusEmail(providerForStatus, action, reason)
        result = { statusEmail: statusResult }
        break

      default:
        return NextResponse.json({ error: 'Unknown test type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Test ${testType} completed`,
      timestamp: new Date().toISOString(),
      result
    })

  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        note: 'Check your configuration'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Email Test Endpoint',
    endpoints: {
      POST: {
        description: 'Run email tests',
        body: {
          testType: 'templates_check | new_listing | status_update',
          providerId: 'UUID of provider (for new_listing and status_update tests)',
          action: 'approve | reject | pause | delete (for status_update test)',
          reason: 'Optional reason (for status_update test)'
        }
      }
    }
  })
}