// File: src/lib/vercel-blob.ts
import { put, del } from '@vercel/blob'

export interface UploadLogoOptions {
  userId: string
  file: File
}

export interface UploadLogoResponse {
  success: boolean
  url?: string
  error?: string
}

export async function uploadLogo({ userId, file }: UploadLogoOptions): Promise<UploadLogoResponse> {
  try {
    if (!process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured')
    }

    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `logos/${userId}/logo-${timestamp}.${extension}`
    
    console.log('Uploading logo to:', filename)
    
    const { url } = await put(filename, file, {
      access: 'public',
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN
    })

    console.log('Logo uploaded successfully:', url)
    return { success: true, url }
  } catch (error: any) {
    console.error('Error uploading logo:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to upload logo' 
    }
  }
}

export async function deleteLogo(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Delete logo called for URL:', url)
    
    if (!process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN) {
      return { success: false, error: 'BLOB_READ_WRITE_TOKEN not configured' }
    }

    // Try to delete - if it fails with 404, that's OK
    await del(url, { 
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN 
    })
    
    console.log('Delete successful')
    return { success: true }
    
  } catch (error: any) {
    console.log('Delete attempt result (may be expected):', error.message)
    
    // If the blob doesn't exist, that's fine - it's already deleted
    if (error.message?.includes('BlobNotFound') || 
        error.message?.includes('not found') ||
        error.message?.includes('404')) {
      console.log('Logo already deleted - treating as success')
      return { success: true }
    }
    
    // For any other error, return failure
    return { 
      success: false, 
      error: error.message || 'Delete failed' 
    }
  }
}