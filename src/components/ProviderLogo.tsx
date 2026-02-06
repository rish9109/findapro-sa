'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadLogo, deleteLogo } from '@/lib/vercel-blob'
import { Upload, Image as ImageIcon, Loader2, Trash2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ProviderLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export default function ProviderLogo({
  size = 'md',
  className = '',
  onSuccess,
  onError
}: ProviderLogoProps) {
  const { user } = useAuth()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [deletingLogo, setDeletingLogo] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [hasListings, setHasListings] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const sizeConfig = {
    sm: { container: 'w-16 h-16', icon: 'w-6 h-6' },
    md: { container: 'w-32 h-32', icon: 'w-8 h-8' },
    lg: { container: 'w-48 h-48', icon: 'w-10 h-10' },
    xl: { container: 'w-64 h-64', icon: 'w-12 h-12' }
  }
  
  const loadUserData = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const { data: providers, error } = await supabase
        .from('providers')
        .select('id, logo_url')
        .eq('user_id', user.id)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })
        
      if (error) throw error
      
      setHasListings(!!providers && providers.length > 0)
      
      if (providers && providers.length > 0) {
        setLogoUrl(providers[0].logo_url)
      } else {
        setLogoUrl(null)
      }
    } catch (err) {
      console.error('Error loading user data:', err)
      setHasListings(false)
      setLogoUrl(null)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadUserData()
  }, [user])

  const updateAllProviderLogos = async (newLogoUrl: string | null) => {
    if (!user) return false
    
    try {
      const { error } = await supabase
        .from('providers')
        .update({ 
          logo_url: newLogoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .neq('status', 'deleted')
      
      if (error) throw error
      
      console.log(`Updated logo_url to ${newLogoUrl} for user ${user.id}`)
      return true
    } catch (err) {
      console.error('Error updating provider logos:', err)
      throw err
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return
    
    if (!hasListings) {
      const errorMsg = 'Please create a listing first before uploading a logo'
      setLogoError(errorMsg)
      onError?.(errorMsg)
      return
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Please upload a JPEG, PNG, WEBP, or SVG file'
      setLogoError(errorMsg)
      onError?.(errorMsg)
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'File must be less than 5MB'
      setLogoError(errorMsg)
      onError?.(errorMsg)
      return
    }
    
    setUploadingLogo(true)
    setLogoError('')
    
    try {
      // Upload new logo first
      console.log('Uploading new logo...')
      const result = await uploadLogo({
        userId: user.id,
        file
      })
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      
      const newLogoUrl = result.url
      if (!newLogoUrl) {
        throw new Error('Upload failed - no URL returned')
      }
      
      console.log('New logo uploaded:', newLogoUrl)
      
      // Update database with new logo
      await updateAllProviderLogos(newLogoUrl)
      
      // IMMEDIATELY update UI - don't wait for old logo deletion
      setLogoUrl(newLogoUrl)
      
      // Show success message
      onSuccess?.('Logo uploaded successfully!')
      
      // Try to delete old logo if exists (in background, don't wait)
      if (logoUrl && logoUrl !== newLogoUrl) {
        console.log('Attempting to delete old logo:', logoUrl)
        deleteLogo(logoUrl).then(result => {
          console.log('Background delete result:', result.success ? 'Success' : 'Failed/Already deleted')
        }).catch(err => {
          console.warn('Background delete error (non-critical):', err)
        })
      }
      
    } catch (err: any) {
      console.error('Error in logo upload process:', err)
      const errorMsg = err.message || 'Failed to upload logo'
      setLogoError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setUploadingLogo(false)
      event.target.value = ''
    }
  }

  const handleDeleteLogo = async () => {
    if (!user) return
    
    if (!confirm('Are you sure you want to delete your logo?')) {
      return
    }
    
    setDeletingLogo(true)
    setLogoError('')
    
    try {
      // Store current logo URL before clearing it
      const currentLogoUrl = logoUrl
      
      // IMMEDIATELY update UI and database
      setLogoUrl(null)
      await updateAllProviderLogos(null)
      
      // Show success message
      onSuccess?.('Logo deleted successfully!')
      
      // Try to delete from blob storage (in background, don't wait)
      if (currentLogoUrl) {
        console.log('Deleting logo from blob storage:', currentLogoUrl)
        deleteLogo(currentLogoUrl).then(result => {
          console.log('Background delete result:', result.success ? 'Success' : 'Failed/Already deleted')
        }).catch(err => {
          console.warn('Background delete error (non-critical):', err)
        })
      }
      
    } catch (err: any) {
      console.error('Error deleting logo:', err)
      const errorMsg = err.message || 'Failed to delete logo'
      setLogoError(errorMsg)
      onError?.(errorMsg)
      // Reload data to restore correct state
      loadUserData()
    } finally {
      setDeletingLogo(false)
    }
  }

  const uploadDisabled = uploadingLogo || deletingLogo || !hasListings || loading
  const uploadTooltip = !hasListings ? 'Create a listing first to upload a logo' : ''

  if (loading) {
    return (
      <div className={`bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
          <div className={`${sizeConfig[size].container} mx-auto bg-gray-800 rounded-xl mb-4`}></div>
          <div className="h-10 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-b from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700/50 p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-white mb-4">Business Logo</h2>
      
      <div className="space-y-4">
        <div className={`relative ${sizeConfig[size].container} mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-dashed border-gray-700 overflow-hidden flex items-center justify-center`}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Business Logo" 
              className="w-full h-full object-cover"
              key={logoUrl} // Force re-render when URL changes
            />
          ) : (
            <div className="text-center p-4">
              <ImageIcon className={`${sizeConfig[size].icon} text-gray-600 mx-auto mb-2`} />
              <p className="text-gray-500 text-xs">No logo uploaded</p>
            </div>
          )}
          
          {(uploadingLogo || deletingLogo) && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {!hasListings && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-400">
                Create your first service listing to upload a business logo.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <input
            type="file"
            id="logo-upload"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={handleLogoUpload}
            className="hidden"
            disabled={uploadDisabled}
            title={uploadTooltip}
          />
          <label
            htmlFor="logo-upload"
            className={`block w-full py-2.5 rounded-lg font-medium text-center transition-all duration-300 text-sm ${
              uploadDisabled
                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 cursor-pointer'
            }`}
            title={uploadTooltip}
          >
            {uploadingLogo ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </span>
            )}
          </label>
          
          {logoUrl && (
            <button
              onClick={handleDeleteLogo}
              disabled={uploadDisabled}
              className={`w-full py-2.5 rounded-lg font-medium text-center transition-all duration-300 text-sm flex items-center justify-center gap-2 ${
                uploadDisabled
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                  : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50'
              }`}
            >
              {deletingLogo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Logo
                </>
              )}
            </button>
          )}
        </div>
        
        {logoError && (
          <p className="mt-2 text-xs text-red-400 text-center">{logoError}</p>
        )}
        
        {!uploadDisabled && (
          <p className="text-xs text-gray-500 text-center mt-2">
            PNG, JPG, max 5MB. Logo will appear on all your listings.
          </p>
        )}
      </div>
    </div>
  )
}