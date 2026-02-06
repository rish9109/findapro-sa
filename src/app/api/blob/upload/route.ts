// File: app/api/blob/upload/route.ts
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge' // Optional: Use edge runtime for faster responses

export async function POST(request: NextRequest) {
  try {
    console.log('API Route: Upload request received')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const filename = formData.get('filename') as string
    
    if (!file || !userId) {
      console.error('API Route: Missing file or userId')
      return NextResponse.json(
        { error: 'Missing file or userId' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
    if (!validTypes.includes(file.type)) {
      console.error('API Route: Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, WEBP, SVG, or GIF' },
        { status: 400 }
      )
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error('API Route: File too large:', file.size)
      return NextResponse.json(
        { error: 'File must be less than 5MB' },
        { status: 400 }
      )
    }

    // Use the provided filename or generate one
    const blobFilename = filename || `logos/${userId}/logo-${Date.now()}.${file.name.split('.').pop()}`
    
    console.log('API Route: Uploading to Vercel Blob:', blobFilename)
    
    // Upload to Vercel Blob
    const blob = await put(blobFilename, file, {
      access: 'public',
      // Token automatically read from BLOB_READ_WRITE_TOKEN env var
    })

    console.log('API Route: Upload successful:', blob.url)
    
    return NextResponse.json({ 
      success: true, 
      url: blob.url 
    })
    
  } catch (error: any) {
    console.error('API Route: Upload error:', error)
    
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
        error: error.message || 'Failed to upload file' 
      },
      { status: 500 }
    )
  }
}