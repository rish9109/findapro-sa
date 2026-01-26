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
    // Check for the public environment variable
    if (!process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured')
    }

    // Generate filename: logos/{user_id}/logo.{extension}
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'png'
    const filename = `logos/${userId}/logo.${extension}`
    
    console.log('Uploading logo to:', filename)
    
    // Upload to Vercel Blob
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
    if (!process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured')
    }

    console.log('Deleting logo:', url)
    await del(url, { token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN })
    
    console.log('Logo deleted successfully')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting logo:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to delete logo' 
    }
  }
}