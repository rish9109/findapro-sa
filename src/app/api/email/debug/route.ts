// File: src/app/api/email/debug/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('name, subject, created_at')
      .order('name')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        hint: error.hint,
        details: error.details
      }, { status: 500 })
    }

    // Test specific template
    const { data: adminTemplate, error: adminError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'new_listing_admin')
      .single()

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        templateCount: templates?.length || 0,
        allTemplates: templates || [],
        new_listing_admin: adminTemplate ? 'Found' : 'Not found',
        adminError: adminError?.message
      },
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        nodeEnv: process.env.NODE_ENV
      }
    })

  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}