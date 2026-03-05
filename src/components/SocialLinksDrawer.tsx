// File: src/components/SocialLinksDrawer.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  X, Check, Globe, Facebook, Instagram, Linkedin, 
  Youtube, Music2, ChevronRight, ExternalLink, AlertCircle
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface SocialLinksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  initialLinks?: any[];
  onSave: (links: any[]) => void;
  maxLinks?: number;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon_name: string;
  base_url: string | null;
}

export default function SocialLinksDrawer({
  isOpen,
  onClose,
  providerId,
  initialLinks = [],
  onSave,
  maxLinks = 4
}: SocialLinksDrawerProps) {
  // State
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);
  const [showBrowseDrawer, setShowBrowseDrawer] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [safeAreaBottom, setSafeAreaBottom] = useState('0px');

  // Refs
  const browseSearchRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);

  // Icon mapping
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'Globe': Globe,
      'Facebook': Facebook,
      'Instagram': Instagram,
      'LinkedIn': Linkedin,
      'Youtube': Youtube,
      'Music2': Music2
    };
    return iconMap[iconName] || Globe;
  };

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Detect mobile and safe area
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Get safe area inset for mobile devices with notches
      const safeArea = getComputedStyle(document.documentElement).getPropertyValue('--sat');
      setSafeAreaBottom(safeArea || '0px');
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle escape key and body scroll - IMPROVED VERSION
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      // Store current scroll position
      scrollPosition.current = window.scrollY;
      
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition.current}px`;
      document.body.style.width = '100%';
      document.body.style.left = '0';
      document.body.style.right = '0';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      
      // Restore body styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.left = '';
      document.body.style.right = '';
      
      // Use requestAnimationFrame to ensure DOM update before scrolling
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPosition.current,
          behavior: 'auto' // Use 'auto' instead of 'smooth' to prevent jumping
        });
      });
    };
  }, [isOpen, onClose]);

  // Initialize state when drawer opens
  useEffect(() => {
    if (isOpen && !isInitialized.current) {
      setSelected(initialLinks || []);
      setError('');
      setBrowseSearch('');
      isInitialized.current = true;
      
      fetchPlatforms();
    } else if (!isOpen) {
      isInitialized.current = false;
    }
  }, [isOpen, initialLinks]);

  // Focus browse search when browse drawer opens
  useEffect(() => {
    if (showBrowseDrawer && !isMobile) {
      const timer = setTimeout(() => browseSearchRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [showBrowseDrawer, isMobile]);

  // Scroll to bottom when new link added
  useEffect(() => {
    if (contentRef.current && selected.length > 0) {
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [selected.length]);

  const fetchPlatforms = async () => {
    try {
      setIsLoadingPlatforms(true);
      
      const { data, error } = await supabase
        .from('social_platforms')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setPlatforms(data || []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      // Fallback mock data
      setPlatforms([
        { id: '1', name: 'Website', icon_name: 'Globe', base_url: null },
        { id: '2', name: 'Facebook', icon_name: 'Facebook', base_url: 'facebook.com/' },
        { id: '3', name: 'Instagram', icon_name: 'Instagram', base_url: 'instagram.com/' },
        { id: '4', name: 'LinkedIn', icon_name: 'LinkedIn', base_url: 'linkedin.com/' },
        { id: '5', name: 'YouTube', icon_name: 'Youtube', base_url: 'youtube.com/' },
        { id: '6', name: 'TikTok', icon_name: 'Music2', base_url: 'tiktok.com/' },
      ]);
    } finally {
      setIsLoadingPlatforms(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    
    try {
      new URL(url);
      return true;
    } catch {
      // If no protocol, try adding https://
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
  };

  const formatUrl = (url: string): string => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const updateLinkUrl = useCallback((linkId: string, url: string) => {
    setSelected(prev => 
      prev.map(link => 
        link.id === linkId 
          ? { ...link, url, urlError: url.trim() && !validateUrl(url) ? 'Invalid URL format' : '' }
          : link
      )
    );
  }, []);

  const togglePlatform = useCallback((platform: SocialPlatform) => {
    const existing = selected.find(s => s.platform_id === platform.id);
    
    if (existing) {
      setSelected(prev => prev.filter(s => s.id !== existing.id));
      setError('');
    } else {
      if (selected.length >= maxLinks) {
        setError(`Maximum ${maxLinks} social links allowed`);
        return;
      }
      
      setSelected(prev => [...prev, {
        id: `temp-${Date.now()}-${platform.id}`,
        platform_id: platform.id,
        platform: platform,
        url: '',
        urlError: 'URL is required',
        is_custom: false
      }]);
      setError('');
    }
  }, [selected, maxLinks]);

  const removeLink = useCallback((linkId: string) => {
    setSelected(prev => prev.filter(link => link.id !== linkId));
    setError('');
  }, []);

  const handleSave = useCallback(() => {
    // Validate all URLs
    let hasErrors = false;
    const updatedLinks = selected.map(link => {
      if (!link.url.trim()) {
        hasErrors = true;
        return { ...link, urlError: 'URL is required' };
      }
      if (!validateUrl(link.url)) {
        hasErrors = true;
        return { ...link, urlError: 'Invalid URL format' };
      }
      return { ...link, urlError: '' };
    });

    if (hasErrors) {
      setSelected(updatedLinks);
      setError('Please fix the URL errors before saving');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formattedLinks = updatedLinks.map((link, index) => ({
        ...link,
        url: formatUrl(link.url),
        display_order: index
      }));
      onSave(formattedLinks);
      onClose();
    } catch (err) {
      setError('Failed to save social links. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selected, onSave, onClose]);
  
  const clearAllLinks = useCallback(() => {
    setSelected([]);
    setError('');
  }, []);

  // Don't render if not open or not mounted
  if (!isOpen || !mounted) return null;

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
          WebkitTapHighlightColor: 'transparent',
        }}
        onClick={onClose}
      />
      
      {/* Drawer Container */}
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
          height: '100dvh', // Use dynamic viewport height
        }}
      >
        <div
          style={{
            backgroundColor: '#1f2937',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            animation: 'slideLeft 0.3s ease-out',
            position: 'relative',
          }}
        >
          {/* Header - Fixed at top */}
          <div
            style={{
              padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
              paddingTop: isMobile ? 'max(1rem, env(safe-area-inset-top))' : '1.25rem',
              borderBottom: '1px solid #374151',
              backgroundColor: '#1f2937',
              flexShrink: 0,
              position: 'sticky',
              top: 0,
              zIndex: 10,
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
                <Globe style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                  Social Links
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  color: '#9ca3af',
                  padding: isMobile ? '0.75rem' : '0.5rem',
                  borderRadius: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: isMobile ? '48px' : '40px',
                  minWidth: isMobile ? '48px' : '40px',
                  WebkitTapHighlightColor: 'transparent',
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
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
              Select platforms and add your links ()({selected.length}/{maxLinks})
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div style={{
              margin: isMobile ? '0.75rem 1.25rem' : '1rem 1.5rem',
              padding: isMobile ? '0.75rem 1rem' : '0.75rem 1rem',
              backgroundColor: 'rgba(185, 28, 28, 0.2)',
              border: '1px solid rgba(185, 28, 28, 0.5)',
              borderRadius: '0.75rem',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <AlertCircle style={{ width: '1rem', height: '1rem', color: '#fca5a5', flexShrink: 0 }} />
              <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>
                {error}
              </p>
            </div>
          )}
          
          {/* Content Area - Scrollable */}
          <div
            ref={contentRef}
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: isMobile ? '1.25rem' : '1.5rem',
              backgroundColor: '#1f2937',
            }}
          >
            {/* Browse Platforms Button */}
            <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#f97316', 
                marginBottom: '0.75rem',
              }}>
                Browse Platforms
              </h4>
              
              <button
                onClick={() => setShowBrowseDrawer(true)}
                disabled={isLoadingPlatforms}
                style={{
                  width: '100%',
                  padding: isMobile ? '1rem 1rem' : '0.875rem 1rem',
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'white',
                  fontSize: isMobile ? '1rem' : '0.9375rem',
                  cursor: isLoadingPlatforms ? 'not-allowed' : 'pointer',
                  opacity: isLoadingPlatforms ? 0.5 : 1,
                  minHeight: isMobile ? '56px' : '48px',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isLoadingPlatforms) {
                    e.currentTarget.style.backgroundColor = '#1f2937';
                    e.currentTarget.style.borderColor = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoadingPlatforms) {
                    e.currentTarget.style.backgroundColor = '#111827';
                    e.currentTarget.style.borderColor = '#374151';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Globe style={{ width: '1.25rem', height: '1.25rem', color: '#9ca3af' }} />
                  <span>Choose from platforms</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#f97316', fontWeight: '500' }}>
                    {platforms.length} platforms
                  </span>
                  <ChevronRight style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                </div>
              </button>
            </div>

      {/* Selected Links with URL Inputs */}
{selected.length > 0 && (
  <div>
    {/* Header with improved spacing for mobile */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '0.5rem',
    }}>
      <h4 style={{ 
        fontSize: '0.875rem', 
        fontWeight: '600', 
        color: '#f97316', 
        margin: 0,
      }}>
        Your Links
      </h4>
      {selected.length > 0 && (
        <button
          onClick={clearAllLinks}
          style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            background: 'transparent',
            border: '1px solid #4b5563',
            borderRadius: '9999px',
            cursor: 'pointer',
            padding: isMobile ? '0.5rem 1rem' : '0.25rem 0.75rem',
            minHeight: isMobile ? '40px' : 'auto',
            minWidth: isMobile ? '80px' : 'auto',
            transition: 'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.borderColor = '#ef4444';
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9ca3af';
            e.currentTarget.style.borderColor = '#4b5563';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Clear All
        </button>
      )}
    </div>

    {/* 💡 TIP - Prominently displayed for mobile */}
    <div style={{
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderLeft: '4px solid #f59e0b',
      borderRadius: '0.5rem',
      padding: isMobile ? '1rem' : '0.75rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
    }}>
      <span style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>💡</span>
      <div style={{ flex: 1 }}>
        <p style={{ 
          fontSize: isMobile ? '0.875rem' : '0.8rem', 
          color: '#fbbf24', 
          margin: 0,
          fontWeight: '500',
          lineHeight: '1.4',
        }}>
          <strong>Pro Tip:</strong> Go to your profile, tap "share", copy the link, and paste it below.
        </p>
      </div>
    </div>
    
    {/* Links List - Optimized for mobile touch */}
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '1.25rem' : '1rem' 
    }}>
      {selected.map((link) => {
        const IconComponent = getIconComponent(link.platform?.icon_name || 'Globe');
        
        return (
          <div
            key={link.id}
            style={{
              padding: isMobile ? '1.25rem 1rem' : '0.875rem',
              background: 'linear-gradient(to right, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.5))',
              border: '1px solid #374151',
              borderRadius: '1rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            {/* Platform Header - Better touch targets */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1rem',
            }}>
              <div style={{
                width: isMobile ? '2.5rem' : '2rem',
                height: isMobile ? '2.5rem' : '2rem',
                borderRadius: '0.75rem',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <IconComponent style={{ 
                  width: isMobile ? '1.25rem' : '1rem', 
                  height: isMobile ? '1.25rem' : '1rem', 
                  color: '#f97316'
                }} />
              </div>
              
              <span style={{ 
                fontWeight: '600', 
                color: 'white',
                flex: 1,
                fontSize: isMobile ? '1rem' : '0.9375rem',
              }}>
                {link.platform?.name}
              </span>
              
              {/* Remove button - Large touch target */}
              <button
                onClick={() => removeLink(link.id)}
                style={{
                  color: '#9ca3af',
                  background: 'transparent',
                  border: 'none',
                  padding: '0',
                  cursor: 'pointer',
                  width: isMobile ? '2.75rem' : '2rem',
                  height: isMobile ? '2.75rem' : '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.75rem',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X style={{ width: isMobile ? '1.25rem' : '1.125rem', height: isMobile ? '1.25rem' : '1.125rem' }} />
              </button>
            </div>

            {/* URL Input - Full width on mobile */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                padding: '0 0.25rem',
              }}>
                <label style={{ 
                  fontSize: isMobile ? '0.75rem' : '0.7rem', 
                  color: link.urlError ? '#fca5a5' : '#9ca3af',
                  fontWeight: link.urlError ? '600' : '400',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {link.urlError || 'URL'}
                </label>
                {link.url && !link.urlError && validateUrl(link.url) && (
                  <a
                    href={formatUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.75rem',
                      textDecoration: 'none',
                      padding: '0.375rem 0.5rem',
                      borderRadius: '0.5rem',
                      backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink style={{ width: '0.875rem', height: '0.875rem' }} />
                    <span>Test Link</span>
                  </a>
                )}
              </div>
              
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLinkUrl(link.id, e.target.value)}
                placeholder={`https://${link.platform?.name?.toLowerCase()}.com/yourprofile`}
                inputMode="url"
                enterKeyHint="done"
                style={{
                  width: '100%',
                  padding: isMobile ? '1rem' : '0.875rem',
                  backgroundColor: '#111827',
                  border: '2px solid',
                  borderColor: link.urlError ? '#ef4444' : '#374151',
                  borderRadius: isMobile ? '1rem' : '0.75rem',
                  color: 'white',
                  fontSize: isMobile ? '1rem' : '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  WebkitAppearance: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#f97316';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.25)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = link.urlError ? '#ef4444' : '#374151';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
          </div>
          
          {/* Footer - Fixed at bottom with safe area */}
          <div
            style={{
              padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
              paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem',
              borderTop: '1px solid #374151',
              backgroundColor: '#1f2937',
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              width: '100%',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: isMobile ? '1rem 0.75rem' : '0.875rem',
                  backgroundColor: '#374151',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontWeight: '500',
                  fontSize: isMobile ? '1rem' : '0.9375rem',
                  cursor: 'pointer',
                  minHeight: isMobile ? '56px' : '48px',
                  WebkitTapHighlightColor: 'transparent',
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
                disabled={isLoading || selected.some(s => !s.url || s.urlError)}
                style={{
                  flex: 1,
                  padding: isMobile ? '1rem 0.75rem' : '0.875rem',
                  background: isLoading || selected.some(s => !s.url || s.urlError)
                    ? '#374151'
                    : 'linear-gradient(to right, #ea580c, #f97316)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: isLoading || selected.some(s => !s.url || s.urlError) ? '#6b7280' : 'white',
                  fontWeight: '600',
                  fontSize: isMobile ? '1rem' : '0.9375rem',
                  cursor: isLoading || selected.some(s => !s.url || s.urlError) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: isMobile ? '56px' : '48px',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !selected.some(s => !s.url || s.urlError)) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #f97316, #fb923c)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !selected.some(s => !s.url || s.urlError)) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #ea580c, #f97316)';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <span>Saving...</span>
                  </>
                ) : (
                  `Save ${selected.length} Link${selected.length !== 1 ? 's' : ''}`
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
          input, button { 
            font-size: 16px !important; 
            -webkit-text-size-adjust: 100%;
          }
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

      {/* Browse Platforms Drawer */}
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
              WebkitTapHighlightColor: 'transparent',
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
              height: '100dvh',
            }}
          >
            <div
              style={{
                backgroundColor: '#1f2937',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                animation: 'slideLeft 0.3s ease-out',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
                  paddingTop: isMobile ? 'max(1rem, env(safe-area-inset-top))' : '1.25rem',
                  borderBottom: '1px solid #374151',
                  backgroundColor: '#1f2937',
                  flexShrink: 0,
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
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
                    <Globe style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                      Select Platform
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowBrowseDrawer(false)}
                    style={{
                      color: '#9ca3af',
                      padding: isMobile ? '0.75rem' : '0.5rem',
                      borderRadius: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: isMobile ? '48px' : '40px',
                      minWidth: isMobile ? '48px' : '40px',
                      WebkitTapHighlightColor: 'transparent',
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
                    {platforms.length} platforms available
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#fdba74', margin: 0 }}>
                    {selected.length}/{maxLinks} selected
                  </p>
                </div>
              </div>
              
              {/* Platforms List */}
              <div
                style={{
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  padding: isMobile ? '1.25rem' : '1.5rem',
                  backgroundColor: '#1f2937',
                }}
              >
                {isLoadingPlatforms ? (
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
                      Loading platforms...
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {platforms
                      .filter(p => p.name.toLowerCase().includes(browseSearch.toLowerCase()))
                      .map((platform) => {
                        const IconComponent = getIconComponent(platform.icon_name);
                        const isSelected = selected.some(s => s.platform_id === platform.id);
                        const isDisabled = selected.length >= maxLinks && !isSelected;
                        
                        return (
                          <button
                            key={platform.id}
                            onClick={() => togglePlatform(platform)}
                            disabled={isDisabled}
                            style={{
                              width: '100%',
                              padding: isMobile ? '1rem' : '0.875rem',
                              backgroundColor: isSelected
                                ? 'rgba(249, 115, 22, 0.15)'
                                : isDisabled
                                ? 'rgba(17, 24, 39, 0.3)'
                                : '#111827',
                              border: '1px solid',
                              borderColor: isSelected
                                ? 'rgba(249, 115, 22, 0.3)'
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
                              fontSize: isMobile ? '1rem' : '0.9375rem',
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              opacity: isDisabled ? 0.5 : 1,
                              minHeight: isMobile ? '56px' : '48px',
                              WebkitTapHighlightColor: 'transparent',
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <IconComponent style={{ 
                                width: '1.25rem', 
                                height: '1.25rem', 
                                color: isSelected ? '#f97316' : '#9ca3af' 
                              }} />
                              <span>{platform.name}</span>
                            </div>
                            {isSelected && (
                              <Check style={{ width: '1.125rem', height: '1.125rem', color: '#f97316' }} />
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div
                style={{
                  padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                  paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem',
                  borderTop: '1px solid #374151',
                  backgroundColor: '#1f2937',
                  flexShrink: 0,
                  position: 'sticky',
                  bottom: 0,
                  width: '100%',
                  zIndex: 10,
                }}
              >
                <button
                  onClick={() => setShowBrowseDrawer(false)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '1rem' : '0.875rem',
                    background: 'linear-gradient(to right, #ea580c, #f97316)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: isMobile ? '1rem' : '0.9375rem',
                    cursor: 'pointer',
                    minHeight: isMobile ? '56px' : '48px',
                    WebkitTapHighlightColor: 'transparent',
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
  );
}