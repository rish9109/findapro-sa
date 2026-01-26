// File: src/app/api/listings/delete/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { listingId } = body

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting listing:', listingId)

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { 
          error: 'SERVER_CONFIG_ERROR',
          message: 'Server configuration error'
        },
        { status: 500 }
      )
    }

    // Create client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { 
          error: 'UNAUTHORIZED',
          message: 'Unauthorized - Please sign in'
        },
        { status: 401 }
      )
    }

    // Verify the listing belongs to the user
    const { data: listing, error: listingError } = await supabase
      .from('providers')
      .select('user_id')
      .eq('id', listingId)
      .single()

    if (listingError) {
      console.error('Listing not found:', listingError)
      return NextResponse.json(
        { 
          error: 'LISTING_NOT_FOUND',
          message: 'Listing not found'
        },
        { status: 404 }
      )
    }

    if (listing.user_id !== session.user.id) {
      return NextResponse.json(
        { 
          error: 'FORBIDDEN',
          message: 'You are not authorized to delete this listing'
        },
        { status: 403 }
      )
    }

    // Delete the listing
    const { error: deleteError } = await supabase
      .from('providers')
      .delete()
      .eq('id', listingId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { 
          error: 'DELETE_FAILED',
          message: deleteError.message
        },
        { status: 500 }
      )
    }

    console.log('✅ Listing deleted successfully:', listingId)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Listing deleted successfully' 
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

  } catch (error: any) {
    console.error('Error deleting listing:', error)
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