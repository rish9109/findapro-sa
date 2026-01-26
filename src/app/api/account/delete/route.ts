// File: src/app/api/account/delete/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ Starting account deletion for user:', userId)

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { 
          error: 'SERVER_CONFIG_ERROR',
          message: 'Server configuration error. Missing Supabase credentials.'
        },
        { status: 500 }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Check if user has active listings
    const { data: listings, error: listingsError } = await supabaseAdmin
      .from('providers')
      .select('id, business_name, status')
      .eq('user_id', userId)
      .in('status', ['pending', 'approved'])

    if (listingsError) {
      console.error('Error checking listings:', listingsError)
      return NextResponse.json(
        { 
          error: 'LISTINGS_CHECK_ERROR',
          message: 'Failed to check listings'
        },
        { status: 500 }
      )
    }

    // 2. Return error if user has active listings
    if (listings && listings.length > 0) {
      return NextResponse.json(
        { 
          error: 'USER_HAS_ACTIVE_LISTINGS',
          listings: listings.map(l => ({
            id: l.id,
            name: l.business_name,
            status: l.status
          })),
          message: `You have ${listings.length} active listing(s). Please delete them first before deleting your account.`
        },
        { status: 400 }
      )
    }

    // 3. Delete user from auth (requires admin privileges)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (deleteError) {
      console.error('❌ Supabase admin delete error:', deleteError)
      return NextResponse.json(
        { 
          error: 'AUTH_DELETE_ERROR',
          message: deleteError.message || 'Failed to delete user from authentication'
        },
        { status: 500 }
      )
    }

    console.log('✅ Account deleted successfully for user:', userId)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Account deleted successfully' 
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

  } catch (error: any) {
    console.error('❌ Account deletion error:', error)
    
    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'JSON_PARSE_ERROR',
          message: 'Invalid request format'
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'INTERNAL_ERROR',
        message: error.message || 'Internal server error'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}