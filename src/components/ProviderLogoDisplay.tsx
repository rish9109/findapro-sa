// File: src/components/ProviderLogoDisplay.tsx - WITH BOTTOM-RIGHT ICON
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface ProviderLogoDisplayProps {
  providerId: string
  businessName: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showBorder?: boolean
  showVerified?: boolean
  verified?: boolean
  shape?: 'square' | 'circle' | 'rounded'
  clickToZoom?: boolean
}

export default function ProviderLogoDisplay({
  providerId,
  businessName,
  size = 'md',
  className = '',
  showBorder = true,
  showVerified = false,
  verified = false,
  shape = 'square',
  clickToZoom = true
}: ProviderLogoDisplayProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showZoomModal, setShowZoomModal] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const sizeConfig = {
    xs: { 
      container: 'w-10 h-10', 
      text: 'text-base', 
      border: 'rounded-xl',
      verifiedBadge: 'w-4 h-4 -bottom-1 -right-1',
      badgeIcon: 'w-2.5 h-2.5',
      zoomIcon: 'w-3 h-3'
    },
    sm: { 
      container: 'w-12 h-12', 
      text: 'text-lg', 
      border: 'rounded-xl',
      verifiedBadge: 'w-4 h-4 -bottom-1 -right-1',
      badgeIcon: 'w-2.5 h-2.5',
      zoomIcon: 'w-3 h-3'
    },
    md: { 
      container: 'w-20 h-20', 
      text: 'text-2xl', 
      border: 'rounded-2xl',
      verifiedBadge: 'w-6 h-6 -bottom-1.5 -right-1.5',
      badgeIcon: 'w-3.5 h-3.5',
      zoomIcon: 'w-4 h-4'
    },
    lg: { 
      container: 'w-24 h-24', 
      text: 'text-3xl', 
      border: 'rounded-2xl',
      verifiedBadge: 'w-7 h-7 -bottom-1.5 -right-1.5',
      badgeIcon: 'w-4 h-4',
      zoomIcon: 'w-4 h-4'
    },
    xl: { 
      container: 'w-32 h-32', 
      text: 'text-4xl', 
      border: 'rounded-3xl',
      verifiedBadge: 'w-8 h-8 -bottom-2 -right-2',
      badgeIcon: 'w-5 h-5',
      zoomIcon: 'w-5 h-5'
    }
  }

  // Get shape classes
  const getShapeClass = () => {
    switch(shape) {
      case 'circle': return 'rounded-full'
      case 'rounded': return 'rounded-3xl'
      case 'square': 
      default: return 'rounded-2xl'
    }
  }

  // Get business initials for fallback
  const getBusinessInitials = (name: string) => {
    if (!name) return 'BP'
    
    const cleanName = name.trim()
    const words = cleanName.split(/\s+/).filter(word => word.length > 0)
    
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    } else if (cleanName.length >= 2) {
      return cleanName.substring(0, 2).toUpperCase()
    }
    
    return cleanName.charAt(0).toUpperCase()
  }

  // Get business color for fallback
  const getBusinessColor = (name: string) => {
    const professionalColors = [
      '#3B82F6', '#10B981', '#6366F1', '#F59E0B',
      '#06B6D4', '#8B5CF6', '#0EA5E9', '#84CC16',
      '#F97316', '#EC4899', '#EF4444', '#06B6D4',
    ]
    
    if (!name) return professionalColors[0]
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
      hash = hash & hash
    }
    
    const index = Math.abs(hash) % professionalColors.length
    return professionalColors[index]
  }

  // Fetch logo from provider
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('providers')
          .select('logo_url')
          .eq('id', providerId)
          .single()
        
        if (!error && data?.logo_url && data.logo_url.trim() !== '') {
          const url = data.logo_url.trim()
          if (url.startsWith('http') || url.startsWith('https') || url.startsWith('/')) {
            setLogoUrl(url)
          } else {
            setLogoUrl(null)
          }
        } else {
          setLogoUrl(null)
        }
      } catch (err) {
        console.error('Error fetching provider logo:', err)
        setLogoUrl(null)
      } finally {
        setLoading(false)
      }
    }

    if (providerId && providerId !== 'temp') {
      fetchLogo()
    } else {
      setLoading(false)
      setLogoUrl(null)
    }
  }, [providerId])

  const businessColor = getBusinessColor(businessName)
  const businessInitials = getBusinessInitials(businessName)
  const currentSize = sizeConfig[size]
  const shapeClass = getShapeClass()

  // Handle logo click - STOP PROPAGATION
  const handleLogoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (clickToZoom && logoUrl && !loading) {
      setShowZoomModal(true)
    }
  }

  // Handle zoom icon click
  const handleZoomIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (clickToZoom && logoUrl && !loading) {
      setShowZoomModal(true)
    }
  }

  // Close zoom modal
  const handleCloseZoom = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowZoomModal(false)
  }

  // Prevent click propagation in modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (loading) {
    return (
      <div 
        className={`${currentSize.container} ${shapeClass} bg-gradient-to-br from-gray-700/30 to-gray-800/30 animate-pulse ${className}`}
        style={showBorder ? {} : { border: 'none' }}
      />
    )
  }

  return (
    <>
      {/* Logo Container */}
      <div className={`relative group ${className}`}>
        <div 
          className={`
            ${currentSize.container} 
            ${shapeClass}
            overflow-hidden
            relative
            transition-all duration-300
            ${showBorder ? 'border-2 border-gray-700/50 shadow-lg' : 'shadow-md'}
            ${logoUrl ? 'bg-gray-900/20' : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80'}
            ${clickToZoom && logoUrl ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : ''}
          `}
          onClick={handleLogoClick}
        >
          {logoUrl ? (
            // LOGO DISPLAY
            <div className="absolute inset-0 bg-transparent">
              <img 
                src={logoUrl}
                alt={`${businessName} Logo`}
                className={`
                  w-full h-full 
                  ${shape === 'circle' ? 'object-cover' : 'object-contain'}
                  transition-opacity duration-300
                  ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setLogoUrl(null)
                  setImageLoaded(false)
                }}
                loading="lazy"
              />
              
              {/* Loading overlay */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700/30 to-gray-800/30 animate-pulse" />
              )}
            </div>
          ) : (
            // FALLBACK INITIALS
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${businessColor}40 0%, ${businessColor}80 50%, ${businessColor} 100%)`,
              }}
            >
              <span className={`
                ${currentSize.text} 
                font-bold 
                text-white 
                drop-shadow-lg
                tracking-tight
              `}>
                {businessInitials}
              </span>
            </div>
          )}
        </div>
        
        {/* ✅ ZOOM ICON - Bottom right corner */}
        {clickToZoom && logoUrl && (
          <button
            onClick={handleZoomIconClick}
            className="absolute bottom-1 right-1 p-1 bg-black/70 hover:bg-black/80 rounded-md backdrop-blur-sm transition-all duration-300 cursor-pointer z-10"
            title="Click to zoom"
          >
            <svg 
              className={`${currentSize.zoomIcon} text-white/90`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
        
        {/* Verified Badge */}
        {showVerified && verified && (
          <div className={`
            absolute 
            ${currentSize.verifiedBadge}
            bg-gradient-to-br from-emerald-500 to-emerald-600
            rounded-full 
            border-2 border-gray-900 
            flex items-center justify-center 
            shadow-xl
            z-20
          `}>
            <svg 
              className={currentSize.badgeIcon} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Zoom Modal - Clean & Minimal */}
      {showZoomModal && logoUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={handleCloseZoom}
        >
          {/* Close button - Minimal */}
          <button
            onClick={handleCloseZoom}
            className="absolute top-6 right-6 p-2.5 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-sm transition-all duration-300 z-50"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
          
          {/* Logo container */}
          <div 
            className="relative w-full max-w-3xl"
            onClick={handleModalClick}
          >
            {/* Business name - Minimal */}
            <div className="mb-6 text-center">
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-1">
                {businessName}
              </h3>
            </div>
            
            {/* Logo image - Clean container */}
            <div className="bg-gray-900/40 rounded-2xl p-6 md:p-8">
              <div className="relative w-full h-full min-h-[250px] flex items-center justify-center">
                <img 
                  src={logoUrl}
                  alt={`${businessName} Logo`}
                  className="max-w-full max-h-[60vh] w-auto h-auto object-contain"
                  onError={() => setShowZoomModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}