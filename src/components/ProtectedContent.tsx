// File: src/components/ProtectedContent.tsx
'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedContentProps {
  children: ReactNode
  action?: string // Optional: Describe what action requires auth (e.g., "view contact details", "save to favorites")
  showLockIcon?: boolean
  onAuthRequired?: () => void // Optional callback when auth is required
}

export default function ProtectedContent({ 
  children, 
  action = "access this content",
  showLockIcon = true,
  onAuthRequired 
}: ProtectedContentProps) {
  const { user, isLoading, showAuthModal } = useAuth()

  const handleClick = (e: React.MouseEvent) => {
    if (!user && !isLoading) {
      e.preventDefault()
      e.stopPropagation()
      
      // Call custom callback if provided, otherwise open auth modal
      if (onAuthRequired) {
        onAuthRequired()
      } else {
        showAuthModal('login')
      }
    }
  }

  // If still loading auth state, show skeleton
  if (isLoading) {
    return <div className="relative">{children}</div>
  }

  // If user is authenticated, show content normally
  if (user) {
    return <>{children}</>
  }

  // If user is not authenticated, wrap content with protective overlay
  return (
    <div className="relative group">
      {children}
      
      {/* Protective Overlay */}
      <div 
        className="absolute inset-0 bg-white/80 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg cursor-pointer z-10"
        onClick={handleClick}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          {showLockIcon && (
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-blue-600 text-xl">🔒</span>
            </div>
          )}
          <p className="font-medium text-gray-900 mb-1">
            Sign in to {action}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Create an account or login to continue
          </p>
          <button
            onClick={handleClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}