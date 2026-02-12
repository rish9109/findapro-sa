// File: src/components/ServiceAreaDrawer.tsx - FIXED
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Plus, MapPin, Check, List } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createPortal } from 'react-dom';

interface ServiceAreaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialAreas: string[];
  onSave: (areas: string[]) => void;
  maxAreas?: number;
}

export default function ServiceAreaDrawer({
  isOpen,
  onClose,
  initialAreas = [],
  onSave,
  maxAreas = 7,
}: ServiceAreaDrawerProps) {
  // State
  const [mounted, setMounted] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBrowseDrawer, setShowBrowseDrawer] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [provinces, setProvinces] = useState<{ id: string; name: string; code: string }[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs
  const customInputRef = useRef<HTMLInputElement>(null);
  const browseSearchRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);
  const mainDrawerRef = useRef<HTMLDivElement>(null);
  const browseDrawerRef = useRef<HTMLDivElement>(null);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showBrowseDrawer) {
          setShowBrowseDrawer(false);
        } else {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, [isOpen, showBrowseDrawer, onClose]);

  // Initialize state when drawer opens
  useEffect(() => {
    if (isOpen && !isInitialized.current) {
      setSelectedAreas([...initialAreas]);
      setNewArea('');
      setError('');
      setBrowseSearch('');
      isInitialized.current = true;
      
      // Fetch provinces from database
      fetchProvinces();
      
      // DO NOT auto-focus on mobile to prevent keyboard opening
      if (!isMobile) {
        const timer = setTimeout(() => {
          customInputRef.current?.focus();
        }, 150);
        return () => clearTimeout(timer);
      }
    } else if (!isOpen) {
      isInitialized.current = false;
    }
  }, [isOpen, initialAreas, isMobile]);

  // Focus browse search when browse drawer opens - only on desktop
  useEffect(() => {
    if (showBrowseDrawer && !isMobile) {
      const timer = setTimeout(() => browseSearchRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [showBrowseDrawer, isMobile]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Fetch provinces function
  const fetchProvinces = async () => {
    try {
      setIsLoadingProvinces(true);
      const { data, error } = await supabase
        .from('provinces')
        .select('id, name, code')
        .order('name');
      
      if (error) {
        console.error('Error fetching provinces:', error);
        return;
      }
      
      setProvinces(data || []);
    } catch (error) {
      console.error('Error in fetchProvinces:', error);
    } finally {
      setIsLoadingProvinces(false);
    }
  };
  
  // Memoize filtered provinces for browse drawer
  const filteredProvinces = useMemo(() => {
    if (!browseSearch.trim()) return provinces;
    return provinces.filter(province =>
      province.name.toLowerCase().includes(browseSearch.toLowerCase().trim())
    );
  }, [provinces, browseSearch]);
  
  const sanitizeInput = useCallback((input: string): string => {
    return input
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 100);
  }, []);
  
  const toggleAreaFromBrowse = useCallback((areaName: string) => {
    setSelectedAreas(prev => {
      if (prev.includes(areaName)) {
        return prev.filter(area => area !== areaName);
      } else {
        if (prev.length >= maxAreas) {
          setError(`Maximum ${maxAreas} service areas allowed`);
          return prev;
        }
        return [...prev, areaName];
      }
    });
    setError('');
  }, [maxAreas]);
  
  const addCustomArea = useCallback(() => {
    const sanitizedArea = sanitizeInput(newArea);
    
    if (!sanitizedArea) {
      setError('Please enter an area name');
      return;
    }
    
    if (selectedAreas.includes(sanitizedArea)) {
      setError('This area is already added');
      return;
    }
    
    if (selectedAreas.length >= maxAreas) {
      setError(`Maximum ${maxAreas} service areas allowed`);
      return;
    }
    
    setSelectedAreas(prev => [...prev, sanitizedArea]);
    setNewArea('');
    setError('');
    // Only refocus on desktop
    if (!isMobile) {
      customInputRef.current?.focus();
    }
  }, [newArea, selectedAreas, maxAreas, sanitizeInput, isMobile]);
  
  const removeArea = useCallback((areaToRemove: string) => {
    setSelectedAreas(prev => prev.filter(area => area !== areaToRemove));
    setError('');
  }, []);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newArea.trim()) {
        addCustomArea();
      }
    }
  }, [newArea, addCustomArea]);
  
  const handleSave = useCallback(() => {
    if (selectedAreas.length === 0) {
      setError('Please select at least one service area');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      onSave(selectedAreas);
      onClose();
    } catch (err) {
      setError('Failed to save service areas. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAreas, onSave, onClose]);
  
  const clearAllAreas = useCallback(() => {
    setSelectedAreas([]);
    setError('');
    if (!isMobile) {
      customInputRef.current?.focus();
    }
  }, [isMobile]);

  // Don't render if not open or not mounted
  if (!isOpen || !mounted) return null;

  // Main Drawer Portal
  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999999,
    }}>
      {/* Backdrop */}
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
      
      {/* Drawer Container - Always slides from right - FIXED: Consistent animation on all devices */}
      <div
        ref={mainDrawerRef}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          left: isMobile ? 0 : 'auto', // Full width on mobile but still slides from right
          zIndex: 1000000,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: isMobile ? '100%' : '560px',
          marginLeft: 'auto', // Pushes to the right
        }}
      >
        {/* Drawer Content */}
        <div
          style={{
            backgroundColor: '#1f2937',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100dvh', // Use dynamic viewport height for mobile
            animation: 'slideLeft 0.3s ease-out',
            position: 'relative',
          }}
        >
          {/* Header - FIXED: Better mobile padding */}
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
                <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                  Service Areas
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
                  transition: 'all 0.2s',
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
          </div>
          
          {/* Error message */}
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
          
          {/* Content Area - Scrollable - FIXED: Better mobile padding */}
          <div
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: isMobile ? '1.25rem' : '1.5rem',
              backgroundColor: '#1f2937',
            }}
          >
            {/* Browse Areas Button */}
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
                <span style={{ color: '#f97316' }}>Preconfigured Areas</span>
                {isLoadingProvinces && (
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Loading...</span>
                )}
              </h4>
              
              <button
                onClick={() => setShowBrowseDrawer(true)}
                disabled={isLoadingProvinces}
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
                  cursor: isLoadingProvinces ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isLoadingProvinces ? 0.5 : 1,
                  marginBottom: '0.5rem',
                  minHeight: isMobile ? '48px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  if (!isLoadingProvinces) {
                    e.currentTarget.style.backgroundColor = '#1f2937';
                    e.currentTarget.style.borderColor = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoadingProvinces) {
                    e.currentTarget.style.backgroundColor = '#111827';
                    e.currentTarget.style.borderColor = '#374151';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <List style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                  <span>Browse Provinces ({provinces.length})</span>
                </div>
                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  {selectedAreas.length}/{maxAreas}
                </span>
              </button>
              
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                Select from our list of provinces
              </p>
            </div>
            
            {/* Add custom area - FIXED: Better mobile touch targets */}
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
                <span style={{ color: '#f97316' }}>Add Custom Area</span>
                <span style={{ 
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.5rem',
                  backgroundColor: '#374151',
                  color: '#d1d5db',
                  borderRadius: '9999px',
                }}>
                  Optional
                </span>
              </h4>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  ref={customInputRef}
                  type="text"
                  value={newArea}
                  onChange={(e) => {
                    setNewArea(e.target.value);
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a custom area name..."
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
                    transition: 'all 0.2s',
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
                  onClick={addCustomArea}
                  disabled={!newArea.trim() || selectedAreas.length >= maxAreas || selectedAreas.includes(newArea.trim())}
                  style={{
                    padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                    background: !newArea.trim() || selectedAreas.length >= maxAreas || selectedAreas.includes(newArea.trim())
                      ? '#374151'
                      : 'linear-gradient(to right, #ea580c, #f97316)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: !newArea.trim() || selectedAreas.length >= maxAreas || selectedAreas.includes(newArea.trim())
                      ? '#6b7280'
                      : 'white',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    cursor: !newArea.trim() || selectedAreas.length >= maxAreas || selectedAreas.includes(newArea.trim())
                      ? 'not-allowed'
                      : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: isMobile ? '48px' : 'auto',
                    minHeight: isMobile ? '48px' : 'auto',
                  }}
                  aria-label="Add custom area"
                >
                  <Plus style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', marginBottom: 0 }}>
                Press Enter to add custom area
              </p>
            </div>
            
            {/* Selected Areas - FIXED: Better mobile spacing */}
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
                  <span style={{ color: '#f97316' }}>Selected Areas</span>
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#fdba74', fontWeight: '500' }}>
                    {selectedAreas.length}/{maxAreas}
                  </span>
                  {selectedAreas.length > 0 && (
                    <button
                      onClick={clearAllAreas}
                      style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px',
                        padding: isMobile ? '0.5rem' : '0.25rem',
                        minHeight: isMobile ? '44px' : 'auto',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9ca3af';
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>
              
              {/* Areas list */}
              {selectedAreas.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedAreas.map((area, index) => {
                    const isPreconfigured = provinces.some(province => province.name === area);
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                          background: 'linear-gradient(to right, rgba(17, 24, 39, 0.5), rgba(31, 41, 55, 0.3))',
                          border: '1px solid #374151',
                          borderRadius: '0.75rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <MapPin style={{ 
                            width: '1rem', 
                            height: '1rem', 
                            color: isPreconfigured ? '#f97316' : '#60a5fa' 
                          }} />
                          <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                            {area}
                          </span>
                          {!isPreconfigured && (
                            <span style={{ 
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              backgroundColor: 'rgba(96, 165, 250, 0.2)',
                              color: '#93c5fd',
                              borderRadius: '9999px',
                            }}>
                              Custom
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeArea(area)}
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
                            transition: 'all 0.2s',
                            minHeight: isMobile ? '44px' : 'auto',
                            minWidth: isMobile ? '44px' : 'auto',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#f97316';
                            e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#9ca3af';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          aria-label={`Remove ${area}`}
                        >
                          <X style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: isMobile ? '2rem 1rem' : '2rem 1rem',
                  border: '2px dashed #374151',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(to right, rgba(17, 24, 39, 0.2), rgba(31, 41, 55, 0.1))',
                }}>
                  <MapPin style={{ width: '2rem', height: '2rem', color: '#4b5563', margin: '0 auto 0.5rem' }} />
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    No areas selected yet
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: 0 }}>
                    Browse provinces or add custom areas
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer - FIXED: Sticky footer that's not cut off on mobile */}
          <div
            style={{
              padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
              borderTop: '1px solid #374151',
              backgroundColor: '#1f2937',
              flexShrink: 0,
              boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
              position: 'sticky',
              bottom: 0,
              width: '100%',
              zIndex: 10,
              paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem',
            }}
          >
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem',
              flexDirection: 'row',
            }}>
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
                  transition: 'background-color 0.2s',
                  minHeight: isMobile ? '48px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selectedAreas.length === 0 || isLoading}
                style={{
                  flex: 1,
                  padding: isMobile ? '0.875rem 0.75rem' : '0.75rem',
                  background: selectedAreas.length === 0 || isLoading
                    ? '#374151'
                    : 'linear-gradient(to right, #ea580c, #f97316)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: selectedAreas.length === 0 || isLoading ? '#6b7280' : 'white',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  cursor: selectedAreas.length === 0 || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: isMobile ? '48px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  if (selectedAreas.length > 0 && !isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #f97316, #fb923c)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAreas.length > 0 && !isLoading) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #ea580c, #f97316)';
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
                ) : selectedAreas.length > 0 ? (
                  `Save ${selectedAreas.length} Area${selectedAreas.length !== 1 ? 's' : ''}`
                ) : (
                  'Save Areas'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Mobile optimizations - FIXED: Consistent drawer animation and safe areas */
        @media (max-width: 768px) {
          div[style*="position: fixed"][style*="bottom: 0"][style*="right: 0"] {
            left: 0 !important;
          }
          
          button, input, select {
            min-height: 48px;
          }
          
          input, button {
            font-size: 16px !important;
          }
          
          /* Safe area insets for modern mobile devices */
          @supports (padding: max(0px)) {
            div[style*="padding-bottom: max(1rem, env(safe-area-inset-bottom))"] {
              padding-bottom: max(1rem, env(safe-area-inset-bottom)) !important;
            }
          }
          
          /* Prevent zoom on input focus */
          input[type="text"] {
            font-size: 16px;
          }
        }

        /* Tablet optimizations */
        @media (min-width: 769px) and (max-width: 1024px) {
          div[style*="max-width: 560px"] {
            max-width: 480px !important;
          }
        }

        /* Custom scrollbar */
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
        
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>

      {/* Browse Provinces Drawer - FIXED: Consistent with main drawer */}
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
            ref={browseDrawerRef}
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
              {/* Header - FIXED: Better mobile padding */}
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
                    <List style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                      Browse Provinces
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
                      transition: 'all 0.2s',
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
                    {provinces.length} provinces available
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#fdba74', margin: 0 }}>
                    {selectedAreas.length}/{maxAreas} selected
                  </p>
                </div>
                
                {/* Search in browse drawer */}
                <input
                  ref={browseSearchRef}
                  type="text"
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                  placeholder="Search provinces..."
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
                    transition: 'all 0.2s',
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
              
              {/* Provinces List - Scrollable */}
              <div
                style={{
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  padding: isMobile ? '1.25rem' : '1.5rem',
                  backgroundColor: '#1f2937',
                }}
              >
                {isLoadingProvinces ? (
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
                      Loading provinces...
                    </p>
                  </div>
                ) : filteredProvinces.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem 1rem',
                    backgroundColor: 'rgba(17, 24, 39, 0.3)',
                    borderRadius: '0.75rem',
                  }}>
                    <List style={{ width: '2rem', height: '2rem', color: '#4b5563', margin: '0 auto 0.5rem' }} />
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      No provinces found
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredProvinces.map((province) => {
                      const isSelected = selectedAreas.includes(province.name);
                      const isDisabled = selectedAreas.length >= maxAreas && !isSelected;
                      
                      return (
                        <button
                          key={province.id}
                          onClick={() => !isDisabled && toggleAreaFromBrowse(province.name)}
                          disabled={isDisabled}
                          style={{
                            width: '100%',
                            padding: isMobile ? '0.875rem 1rem' : '0.75rem 1rem',
                            backgroundColor: isSelected
                              ? 'rgba(249, 115, 22, 0.2)'
                              : isDisabled
                              ? 'rgba(17, 24, 39, 0.2)'
                              : '#111827',
                            border: '1px solid',
                            borderColor: isSelected
                              ? 'rgba(249, 115, 22, 0.5)'
                              : isDisabled
                              ? '#374151'
                              : '#374151',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: isSelected
                              ? '#fdba74'
                              : isDisabled
                              ? '#6b7280'
                              : 'white',
                            fontSize: '0.875rem',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: isDisabled ? 0.5 : 1,
                            minHeight: isMobile ? '48px' : 'auto',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected && !isDisabled) {
                              e.currentTarget.style.backgroundColor = '#1f2937';
                              e.currentTarget.style.borderColor = '#4b5563';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected && !isDisabled) {
                              e.currentTarget.style.backgroundColor = '#111827';
                              e.currentTarget.style.borderColor = '#374151';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin style={{ 
                              width: '1rem', 
                              height: '1rem', 
                              color: isSelected ? '#f97316' : '#6b7280' 
                            }} />
                            <span style={{ fontWeight: isSelected ? '500' : '400' }}>
                              {province.name}
                            </span>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              color: isSelected ? '#fdba74' : '#6b7280' 
                            }}>
                              ({province.code})
                            </span>
                          </div>
                          {isSelected && (
                            <Check style={{ width: '1rem', height: '1rem', color: '#f97316' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Footer - FIXED: Sticky footer with safe area */}
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
                    transition: 'all 0.2s',
                    minHeight: isMobile ? '48px' : 'auto',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #f97316, #fb923c)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #ea580c, #f97316)';
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>,
    document.body
  );
}