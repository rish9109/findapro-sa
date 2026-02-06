// File: src/lib/vercel-blob.ts
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
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `logos/${userId}/logo-${timestamp}.${extension}`
    
    console.log('Uploading logo to:', filename)
    
    // Send to API route instead of direct upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    formData.append('filename', filename)
    
    const response = await fetch('/api/blob/upload', {
      method: 'POST',
      body: formData,
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Upload failed')
    }
    
    console.log('Logo uploaded successfully:', result.url)
    return { success: true, url: result.url }
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
    
    // Only delete from Vercel Blob if it's a blob URL
    if (!url.includes('.vercel-storage.com')) {
      console.log('Not a vercel blob URL, skipping deletion:', url)
      return { success: true }
    }
    
    const response = await fetch('/api/blob/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Delete failed')
    }
    
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