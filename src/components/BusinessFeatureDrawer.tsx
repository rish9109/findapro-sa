// File: src/components/BusinessFeatureDrawer.tsx
'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase, getBusinessFeatures, getBusinessFeatureCategories } from '@/lib/supabase'
import { 
  X, Plus, Check, ChevronDown, ChevronRight, Star, Tag, Filter
} from 'lucide-react'
import { createPortal } from 'react-dom'

interface BusinessFeatureDrawerProps {
  isOpen: boolean
  onClose: () => void
  providerId: string
  initialSelection: any[]
  onSave: (selected: any[]) => void
  maxSelection?: number
}

interface FeatureCategory {
  id: string
  name: string
  count?: number
}

export default function BusinessFeatureDrawer({
  isOpen,
  onClose,
  providerId,
  initialSelection,
  onSave,
  maxSelection = 10
}: BusinessFeatureDrawerProps) {
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState<any[]>([])
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showBrowseDrawer, setShowBrowseDrawer] = useState(false)
  const [browseSearch, setBrowseSearch] = useState('')
  const [features, setFeatures] = useState<any[]>([])
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [categories, setCategories] = useState<FeatureCategory[]>([
    { id: 'all', name: 'All Features', count: undefined }
  ])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showCustomForm, setShowCustomForm] = useState(false)

  const customNameRef = useRef<HTMLInputElement>(null)
  const browseSearchRef = useRef<HTMLInputElement>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && !isInitialized.current) {
      setSelected(initialSelection || [])
      setCustomName('')
      setCustomDescription('')
      setError('')
      setBrowseSearch('')
      setShowCustomForm(false)
      setExpandedCategories(new Set())
      isInitialized.current = true
      fetchFeaturesWithCategories()
      if (!isMobile) {
        const timer = setTimeout(() => {
          customNameRef.current?.focus()
        }, 150)
        return () => clearTimeout(timer)
      }
    } else if (!isOpen) {
      isInitialized.current = false
    }
  }, [isOpen, initialSelection, isMobile])

  useEffect(() => {
    if (showBrowseDrawer && !isMobile) {
      const timer = setTimeout(() => browseSearchRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [showBrowseDrawer, isMobile])

  useEffect(() => {
    if (isOpen && providerId && providerId !== 'temp' && providerId !== 'new') {
      fetchProviderFeatures()
    }
  }, [isOpen, providerId])

  const fetchFeaturesWithCategories = async () => {
    try {
      setIsLoadingFeatures(true)
      
      // Fetch all features
      const data = await getBusinessFeatures()
      setFeatures(data || [])
      
      // Fetch unique categories
      const categoryNames = await getBusinessFeatureCategories()
      
      const categoryList: FeatureCategory[] = [
        { id: 'all', name: 'All Features', count: data?.length || 0 }
      ]
      
      // Add categories with counts
      categoryNames.forEach(categoryName => {
        const count = data?.filter(f => f.category === categoryName).length || 0
        categoryList.push({
          id: categoryName,
          name: categoryName,
          count
        })
      })
      
      setCategories(categoryList)
      
    } catch (error) {
      console.error('Error in fetchFeaturesWithCategories:', error)
    } finally {
      setIsLoadingFeatures(false)
    }
  }

  const fetchProviderFeatures = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('provider_business_features')
        .select(`
          *,
          feature:business_features(*)
        `)
        .eq('provider_id', providerId)
        .order('position')
        
      if (error) throw error
      
      if (data && data.length > 0) {
        const formattedSelected = data.map((item: any) => ({
          id: item.id,
          feature_id: item.feature_id,
          feature: item.feature,
          custom_name: item.custom_name,
          custom_description: item.custom_description,
          is_custom: item.is_custom,
          position: item.position,
          is_verified: item.is_verified
        }))
        setSelected(formattedSelected)
      }
    } catch (error) {
      console.error('Error fetching provider features:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }, [])

  const totalFeaturesCount = useMemo(() => features.length, [features])

  // Memoize filtered categories for browse drawer
  const filteredCategories = useMemo(() => {
    if (!browseSearch.trim()) return categories.filter(i => i.id !== 'all')
    
    const searchTerm = browseSearch.toLowerCase().trim()
    
    return categories
      .filter(i => i.id !== 'all')
      .map(category => {
        const categoryMatches = category.name.toLowerCase().includes(searchTerm)
        const matchingFeatures = features.filter(f => 
          f.category === category.id &&
          f.name.toLowerCase().includes(searchTerm)
        )
        
        if (categoryMatches) {
          return { 
            ...category, 
            features: features.filter(f => f.category === category.id)
          }
        } else if (matchingFeatures.length > 0) {
          return { 
            ...category, 
            features: matchingFeatures 
          }
        }
        
        return null
      })
      .filter(category => category !== null)
  }, [categories, features, browseSearch])

  const sanitizeInput = useCallback((input: string): string => {
    return input.replace(/[<>]/g, '').trim().slice(0, 100)
  }, [])

  const toggleFeatureFromBrowse = useCallback((feature: any) => {
    const existing = selected.find(s => !s.is_custom && s.feature_id === feature.id)
    if (existing) {
      setSelected(prev => prev.filter(s => s.id !== existing.id))
    } else {
      if (selected.length >= maxSelection) {
        setError(`Maximum ${maxSelection} features allowed`)
        return
      }
      setSelected(prev => [...prev, {
        id: `temp-${Date.now()}-${Math.random()}`,
        feature_id: feature.id,
        feature: feature,
        is_custom: false,
        position: prev.length
      }])
    }
    setError('')
  }, [selected, maxSelection])

  const addCustomFeature = useCallback(() => {
    const sanitizedName = sanitizeInput(customName)
    const sanitizedDescription = sanitizeInput(customDescription)
    
    if (!sanitizedName) {
      setError('Please enter a feature name')
      return
    }
    
    if (selected.some(s => s.is_custom && s.custom_name?.toLowerCase() === sanitizedName.toLowerCase())) {
      setError('This feature is already added')
      return
    }
    
    if (selected.length >= maxSelection) {
      setError(`Maximum ${maxSelection} features allowed`)
      return
    }
    
    setSelected(prev => [...prev, {
      id: `custom-${Date.now()}-${Math.random()}`,
      custom_name: sanitizedName,
      custom_description: sanitizedDescription,
      is_custom: true,
      position: prev.length
    }])
    setCustomName('')
    setCustomDescription('')
    setShowCustomForm(false)
    setError('')
  }, [customName, customDescription, selected, maxSelection, sanitizeInput])

  const removeFeature = useCallback((featureToRemove: any) => {
    setSelected(prev => prev.filter(s => s.id !== featureToRemove.id))
    setError('')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (customName.trim()) {
        addCustomFeature()
      }
    }
  }, [customName, addCustomFeature])

  const handleSave = useCallback(() => {
    setIsLoading(true)
    setError('')
    try {
      const updatedSelection = selected.map((feat, index) => ({
        ...feat,
        position: index
      }))
      onSave(updatedSelection)
      onClose()
    } catch (err) {
      setError('Failed to save features. Please try again.')
      console.error('Save error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selected, onSave, onClose])

  const clearAllFeatures = useCallback(() => {
    setSelected([])
    setError('')
    if (!isMobile) {
      customNameRef.current?.focus()
    }
  }, [isMobile])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999999,
    }}>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999999,
          cursor: 'pointer',
        }}
        onClick={onClose}
      />
      
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          left: isMobile ? 0 : 'auto',
          zIndex: 1000000,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: isMobile ? '100%' : '560px',
          marginLeft: 'auto',
        }}
      >
        <div
          style={{
            backgroundColor: '#1f2937',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100dvh',
            animation: 'slideLeft 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
              borderBottom: '1px solid #374151',
              backgroundColor: '#1f2937',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                  Business Features
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  color: '#9ca3af',
                  padding: isMobile ? '0.5rem' : '0.375rem',
                  borderRadius: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: isMobile ? '44px' : 'auto',
                  minWidth: isMobile ? '44px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#9ca3af'
                }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
          </div>
          
          {error && (
            <div style={{
              margin: isMobile ? '0.75rem 1.25rem 0' : '1rem 1.5rem 0',
              padding: isMobile ? '0.625rem 0.875rem' : '0.75rem 1rem',
              backgroundColor: 'rgba(185, 28, 28, 0.2)',
              border: '1px solid rgba(185, 28, 28, 0.5)',
              borderRadius: '0.5rem',
              flexShrink: 0,
            }}>
              <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>
                {error}
              </p>
            </div>
          )}
          
          <div
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: isMobile ? '1.25rem' : '1.5rem',
              backgroundColor: '#1f2937',
            }}
          >
            {/* Browse Features Button - NEW: matches AccreditationDrawer style */}
            <div style={{ marginBottom: isMobile ? '1.25rem' : '1.5rem' }}>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: 'white', 
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ color: '#f97316' }}>Browse Features</span>
                {isLoadingFeatures && (
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Loading...</span>
                )}
              </h4>
              
              <button
                onClick={() => setShowBrowseDrawer(true)}
                disabled={isLoadingFeatures}
                style={{
                  width: '100%',
                  padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'white',
                  fontSize: '0.9375rem',
                  cursor: isLoadingFeatures ? 'not-allowed' : 'pointer',
                  opacity: isLoadingFeatures ? 0.5 : 1,
                  marginBottom: '0.5rem',
                  minHeight: isMobile ? '48px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  if (!isLoadingFeatures) {
                    e.currentTarget.style.backgroundColor = '#1f2937';
                    e.currentTarget.style.borderColor = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoadingFeatures) {
                    e.currentTarget.style.backgroundColor = '#111827';
                    e.currentTarget.style.borderColor = '#374151';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                  <span>Browse by Category</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#f97316', fontWeight: '500' }}>
                    {totalFeaturesCount} features
                  </span>
                  <ChevronRight style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                </div>
              </button>
              
              <p style={{ fontSize: '0.75rem', color: '#e5e7eb', margin: 0 }}>
                {categories.length - 1} categories • {totalFeaturesCount} features
              </p>
            </div>
            
            {/* Add custom feature */}
            <div style={{ marginBottom: isMobile ? '1.25rem' : '1.5rem' }}>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: 'white', 
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ color: '#f97316' }}>Add Custom Feature</span>
              </h4>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  ref={customNameRef}
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a custom feature name..."
                  inputMode="text"
                  autoCapitalize="words"
                  enterKeyHint="done"
                  style={{
                    flex: 1,
                    padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    minHeight: isMobile ? '48px' : 'auto',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#f97316';
                    e.currentTarget.style.boxShadow = '0 0 0 1px #f97316';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={addCustomFeature}
                  disabled={selected.length >= maxSelection}
                  style={{
                    padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                    background: selected.length >= maxSelection
                      ? '#374151'
                      : 'linear-gradient(to right, #ea580c, #f97316)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: selected.length >= maxSelection
                      ? '#6b7280'
                      : 'white',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    cursor: selected.length >= maxSelection
                      ? 'not-allowed'
                      : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: isMobile ? '48px' : 'auto',
                    minHeight: isMobile ? '48px' : 'auto',
                  }}
                  aria-label="Add custom feature"
                >
                  <Plus style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#e5e7eb', marginTop: '0.5rem', marginBottom: 0 }}>
                Press Enter to add
              </p>
            </div>

            {/* Selected Features */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '0.75rem' 
              }}>
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: 'white', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{ color: '#f97316' }}>Selected Features</span>
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#fdba74', fontWeight: '500' }}>
                    {selected.length}/{maxSelection}
                  </span>
                  {selected.length > 0 && (
                    <button
                      onClick={clearAllFeatures}
                      style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: isMobile ? '0.5rem' : '0.25rem',
                        minHeight: isMobile ? '44px' : 'auto',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9ca3af'
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
              
              {selected.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selected.map((feat) => {
                    return (
                      <div
                        key={feat.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                          background: 'linear-gradient(to right, rgba(17, 24, 39, 0.5), rgba(31, 41, 55, 0.3))',
                          border: '1px solid #374151',
                          borderRadius: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Tag style={{ 
                            width: '1rem', 
                            height: '1rem', 
                            color: feat.is_custom ? '#60a5fa' : '#f97316' 
                          }} />
                          <div>
                            <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                              {feat.is_custom ? feat.custom_name : feat.feature?.name}
                            </span>
                            {feat.custom_description && (
                              <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                                {feat.custom_description}
                              </p>
                            )}
                          </div>
                          {feat.is_custom && (
                            <span style={{ 
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              backgroundColor: 'rgba(96, 165, 250, 0.2)',
                              color: '#93c5fd',
                              borderRadius: '9999px',
                              marginLeft: '0.5rem',
                            }}>
                              Custom
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFeature(feat)}
                          style={{
                            color: '#9ca3af',
                            background: 'transparent',
                            border: 'none',
                            padding: isMobile ? '0.5rem' : '0.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.375rem',
                            minHeight: isMobile ? '44px' : 'auto',
                            minWidth: isMobile ? '44px' : 'auto',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#f97316'
                            e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#9ca3af'
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <X style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: isMobile ? '2rem 1rem' : '2rem 1rem',
                  border: '2px dashed #374151',
                  borderRadius: '0.75rem',
                }}>
                  <Star style={{ width: '2rem', height: '2rem', color: '#4b5563', margin: '0 auto 0.5rem' }} />
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    No features selected yet
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: 0 }}>
                    Browse categories or add custom features
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div
            style={{
              padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
              borderTop: '1px solid #374151',
              backgroundColor: '#1f2937',
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              width: '100%',
              zIndex: 10,
              paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: isMobile ? '0.875rem 0.75rem' : '0.75rem',
                  backgroundColor: '#374151',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  minHeight: isMobile ? '48px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: isMobile ? '0.875rem 0.75rem' : '0.75rem',
                  background: isLoading
                    ? '#374151'
                    : 'linear-gradient(to right, #ea580c, #f97316)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: isLoading ? '#6b7280' : 'white',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: isMobile ? '48px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #f97316, #fb923c)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #ea580c, #f97316)'
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Saving...
                  </>
                ) : (
                  `Save ${selected.length} Feature${selected.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          input, button { font-size: 16px !important; }
          input[type="text"] { font-size: 16px; }
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar {
          width: 6px;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
          background: #1f2937;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
      `}</style>

      {/* Browse Features Drawer - NEW: matches AccreditationDrawer style */}
      {showBrowseDrawer && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000001,
        }}>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000001,
              cursor: 'pointer',
            }}
            onClick={() => setShowBrowseDrawer(false)}
          />
          
          <div
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              right: 0,
              left: isMobile ? 0 : 'auto',
              zIndex: 1000002,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: isMobile ? '100%' : '560px',
              marginLeft: 'auto',
            }}
          >
            <div
              style={{
                backgroundColor: '#1f2937',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100dvh',
                animation: 'slideLeft 0.3s ease-out',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                  borderBottom: '1px solid #374151',
                  backgroundColor: '#1f2937',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                      Features by Category
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowBrowseDrawer(false)}
                    style={{
                      color: '#9ca3af',
                      padding: isMobile ? '0.5rem' : '0.375rem',
                      borderRadius: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: isMobile ? '44px' : 'auto',
                      minWidth: isMobile ? '44px' : 'auto',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#374151';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#9ca3af';
                    }}
                  >
                    <X style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                    {totalFeaturesCount} features • {categories.length - 1} categories
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#fdba74', margin: 0 }}>
                    {selected.length}/{maxSelection} selected
                  </p>
                </div>
                
                {/* Search */}
                <input
                  ref={browseSearchRef}
                  type="text"
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                  placeholder="Search categories or features..."
                  inputMode="search"
                  enterKeyHint="search"
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '0.9375rem',
                    outline: 'none',
                    minHeight: isMobile ? '48px' : 'auto',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#f97316';
                    e.currentTarget.style.boxShadow = '0 0 0 1px #f97316';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              {/* Categories & Features List */}
              <div
                style={{
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  padding: isMobile ? '1.25rem' : '1.5rem',
                  backgroundColor: '#1f2937',
                }}
              >
                {isLoadingFeatures ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      border: '2px solid #f97316',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 0.5rem',
                    }} />
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                      Loading...
                    </p>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem 1rem',
                    backgroundColor: 'rgba(17, 24, 39, 0.3)',
                    borderRadius: '0.75rem',
                  }}>
                    <Tag style={{ width: '2rem', height: '2rem', color: '#4b5563', margin: '0 auto 0.5rem' }} />
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      No matches found
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* All Features category first */}
                    <div key="all">
                      <button
                        onClick={() => toggleCategory('all')}
                        style={{
                          width: '100%',
                          padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                          backgroundColor: expandedCategories.has('all') ? '#1f2937' : '#111827',
                          border: '1px solid #374151',
                          borderRadius: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: 'white',
                          fontSize: '0.9375rem',
                          cursor: 'pointer',
                          marginBottom: expandedCategories.has('all') ? '0.25rem' : 0,
                          minHeight: isMobile ? '48px' : 'auto',
                        }}
                        onMouseEnter={(e) => {
                          if (!expandedCategories.has('all')) e.currentTarget.style.backgroundColor = '#1f2937'
                        }}
                        onMouseLeave={(e) => {
                          if (!expandedCategories.has('all')) e.currentTarget.style.backgroundColor = '#111827'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {expandedCategories.has('all') ? (
                            <ChevronDown style={{ width: '1rem', height: '1rem', color: '#f97316' }} />
                          ) : (
                            <ChevronRight style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                          )}
                          <Star style={{ width: '1rem', height: '1rem', color: '#f97316' }} />
                          <span style={{ fontWeight: '500' }}>All Features</span>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {totalFeaturesCount} features
                        </span>
                      </button>

                      {/* All Features list */}
                      {expandedCategories.has('all') && (
                        <div style={{ 
                          marginLeft: isMobile ? '1rem' : '1.5rem',
                          marginTop: '0.25rem',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}>
                          {features.map((feature: any) => {
                            const isSelected = selected.some(s => !s.is_custom && s.feature_id === feature.id)
                            const isDisabled = selected.length >= maxSelection && !isSelected
                            
                            return (
                              <button
                                key={feature.id}
                                onClick={() => !isDisabled && toggleFeatureFromBrowse(feature)}
                                disabled={isDisabled}
                                style={{
                                  width: '100%',
                                  padding: isMobile ? '0.75rem 1rem' : '0.625rem 1rem',
                                  backgroundColor: isSelected
                                    ? 'rgba(249, 115, 22, 0.15)'
                                    : isDisabled
                                    ? 'rgba(17, 24, 39, 0.2)'
                                    : 'transparent',
                                  border: '1px solid',
                                  borderColor: isSelected
                                    ? 'rgba(249, 115, 22, 0.3)'
                                    : '#374151',
                                  borderRadius: '0.5rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  color: isSelected
                                    ? '#fdba74'
                                    : isDisabled
                                    ? '#6b7280'
                                    : '#d1d5db',
                                  fontSize: '0.875rem',
                                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                                  opacity: isDisabled ? 0.5 : 1,
                                  minHeight: isMobile ? '44px' : 'auto',
                                  textAlign: 'left',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected && !isDisabled) {
                                    e.currentTarget.style.backgroundColor = '#1f2937'
                                    e.currentTarget.style.borderColor = '#4b5563'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected && !isDisabled) {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.borderColor = '#374151'
                                  }
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                                  <Tag style={{ width: '0.875rem', height: '0.875rem', color: isSelected ? '#f97316' : '#6b7280' }} />
                                  <span>{feature.name}</span>
                                </div>
                                {isSelected && (
                                  <Check style={{ width: '0.875rem', height: '0.875rem', color: '#f97316' }} />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Other categories */}
                    {filteredCategories.map((category: any) => {
                      const isExpanded = expandedCategories.has(category.id)
                      const categoryFeatures = features.filter(f => f.category === category.id)
                      
                      return (
                        <div key={category.id}>
                          <button
                            onClick={() => toggleCategory(category.id)}
                            style={{
                              width: '100%',
                              padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                              backgroundColor: isExpanded ? '#1f2937' : '#111827',
                              border: '1px solid #374151',
                              borderRadius: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              color: 'white',
                              fontSize: '0.9375rem',
                              cursor: 'pointer',
                              marginBottom: isExpanded ? '0.25rem' : 0,
                              minHeight: isMobile ? '48px' : 'auto',
                            }}
                            onMouseEnter={(e) => {
                              if (!isExpanded) e.currentTarget.style.backgroundColor = '#1f2937';
                              e.currentTarget.style.borderColor = '#4b5563';
                            }}
                            onMouseLeave={(e) => {
                              if (!isExpanded) e.currentTarget.style.backgroundColor = '#111827';
                              e.currentTarget.style.borderColor = '#374151';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {isExpanded ? (
                                <ChevronDown style={{ width: '1rem', height: '1rem', color: '#f97316' }} />
                              ) : (
                                <ChevronRight style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                              )}
                              <Tag style={{ width: '1rem', height: '1rem', color: '#f97316' }} />
                              <span style={{ fontWeight: '500' }}>{category.name}</span>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {category.count} {category.count === 1 ? 'feature' : 'features'}
                            </span>
                          </button>
                          
                          {isExpanded && (
                            <div style={{ 
                              marginLeft: isMobile ? '1rem' : '1.5rem',
                              marginTop: '0.25rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                            }}>
                              {categoryFeatures.map((feature: any) => {
                                const isSelected = selected.some(s => !s.is_custom && s.feature_id === feature.id)
                                const isDisabled = selected.length >= maxSelection && !isSelected
                                
                                return (
                                  <button
                                    key={feature.id}
                                    onClick={() => !isDisabled && toggleFeatureFromBrowse(feature)}
                                    disabled={isDisabled}
                                    style={{
                                      width: '100%',
                                      padding: isMobile ? '0.75rem 1rem' : '0.625rem 1rem',
                                      backgroundColor: isSelected
                                        ? 'rgba(249, 115, 22, 0.15)'
                                        : isDisabled
                                        ? 'rgba(17, 24, 39, 0.2)'
                                        : 'transparent',
                                      border: '1px solid',
                                      borderColor: isSelected
                                        ? 'rgba(249, 115, 22, 0.3)'
                                        : '#374151',
                                      borderRadius: '0.5rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      color: isSelected
                                        ? '#fdba74'
                                        : isDisabled
                                        ? '#6b7280'
                                        : '#d1d5db',
                                      fontSize: '0.875rem',
                                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                                      opacity: isDisabled ? 0.5 : 1,
                                      minHeight: isMobile ? '44px' : 'auto',
                                      textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isSelected && !isDisabled) {
                                        e.currentTarget.style.backgroundColor = '#1f2937'
                                        e.currentTarget.style.borderColor = '#4b5563'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isSelected && !isDisabled) {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                        e.currentTarget.style.borderColor = '#374151'
                                      }
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                                      <Tag style={{ width: '0.875rem', height: '0.875rem', color: isSelected ? '#f97316' : '#6b7280' }} />
                                      <span>{feature.name}</span>
                                    </div>
                                    {isSelected && (
                                      <Check style={{ width: '0.875rem', height: '0.875rem', color: '#f97316' }} />
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div
                style={{
                  padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                  borderTop: '1px solid #374151',
                  backgroundColor: '#1f2937',
                  flexShrink: 0,
                  position: 'sticky',
                  bottom: 0,
                  width: '100%',
                  zIndex: 10,
                  paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem',
                }}
              >
                <button
                  onClick={() => setShowBrowseDrawer(false)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.875rem' : '0.75rem',
                    background: 'linear-gradient(to right, #ea580c, #f97316)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                    minHeight: isMobile ? '48px' : 'auto',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #f97316, #fb923c)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #ea580c, #f97316)';
                  }}
                >
                  Done ({selected.length})
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>,
    document.body
  )
}