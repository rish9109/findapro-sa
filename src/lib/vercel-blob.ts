// File: src/lib/vercel-blob.ts
import { put, del } from '@vercel/blob/client' // Changed import for client-side

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
    // For client-side uploads, we don't check for token in env vars
    // The SDK handles authentication automatically via browser headers
    
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `logos/${userId}/logo-${timestamp}.${extension}`
    
    console.log('Uploading logo to:', filename)
    
    // Client-side put doesn't require a token parameter
    // It uses the browser session/headers automatically
    const { url } = await put(filename, file, {
      access: 'public',
      // Token parameter removed - SDK handles it automatically
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
    
    // Client-side delete doesn't require a token parameter
    await del(url)
    
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