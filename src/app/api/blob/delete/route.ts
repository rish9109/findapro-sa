// File: app/api/blob/delete/route.ts
import { del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge' // Optional: Use edge runtime for faster responses

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body
    
    if (!url) {
      console.error('API Route: Missing URL for deletion')
      return NextResponse.json(
        { error: 'Missing URL' },
        { status: 400 }
      )
    }
    
    console.log('API Route: Deleting blob:', url)
    
    // Delete from Vercel Blob
    await del(url)
    
    console.log('API Route: Delete successful')
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.log('API Route: Delete error:', error.message)
    
    // If blob not found, that's OK - it's already deleted
    if (error.message?.includes('BlobNotFound') || 
        error.message?.includes('not found') ||
        error.message?.includes('404')) {
      console.log('API Route: Blob already deleted')
      return NextResponse.json({ success: true })
    }
    
    // Check for Vercel Blob token error
    if (error.message?.includes('BLOB_READ_WRITE_TOKEN') || 
        error.message?.includes('token') ||
        error.message?.includes('authorization')) {
      console.error('API Route: Vercel Blob token misconfigured')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error. Please contact support.' 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Delete failed' 
      },
      { status: 500 }
    )
  }
}