// File: src/components/AccreditationDrawer.tsx
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Plus, Check, Award, Filter, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface AccreditationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  initialSelection: any[];
  onSave: (selected: any[]) => void;
  maxSelection?: number;
  serviceCategoryId?: string;
}

interface Industry {
  id: string;
  name: string;
  count?: number;
}

export default function AccreditationDrawer({
  isOpen,
  onClose,
  providerId,
  initialSelection,
  onSave,
  maxSelection = 10,
  serviceCategoryId
}: AccreditationDrawerProps) {
  // State
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<any[]>([]);
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBrowseDrawer, setShowBrowseDrawer] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [accreditations, setAccreditations] = useState<any[]>([]);
  const [isLoadingAccreditations, setIsLoadingAccreditations] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([
    { id: 'all', name: 'All Industries', count: undefined }
  ]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(new Set());
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);

  // Refs
  const customInputRef = useRef<HTMLInputElement>(null);
  const browseSearchRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);

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
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Initialize state when drawer opens
  useEffect(() => {
    if (isOpen && !isInitialized.current) {
      setSelected(initialSelection || []);
      setCustomName('');
      setError('');
      setBrowseSearch('');
      setSelectedIndustry(serviceCategoryId || 'all');
      setExpandedIndustries(new Set());
      isInitialized.current = true;
      
      // Fetch accreditations and categories
      fetchAccreditationsWithCategories();
      
      if (!isMobile) {
        const timer = setTimeout(() => {
          customInputRef.current?.focus();
        }, 150);
        return () => clearTimeout(timer);
      }
    } else if (!isOpen) {
      isInitialized.current = false;
    }
  }, [isOpen, initialSelection, isMobile, serviceCategoryId]);

  // Focus browse search when browse drawer opens
  useEffect(() => {
    if (showBrowseDrawer && !isMobile) {
      const timer = setTimeout(() => browseSearchRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [showBrowseDrawer, isMobile]);

  // Fetch provider's existing accreditations if this is an edit (not temp)
  useEffect(() => {
    if (isOpen && providerId && providerId !== 'temp') {
      fetchProviderAccreditations();
    }
  }, [isOpen, providerId]);

  const fetchAccreditationsWithCategories = async () => {
    try {
      setIsLoadingAccreditations(true);
      
      // Fetch service categories first
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
        
      if (!categoriesError && categoriesData) {
        setServiceCategories(categoriesData);
        
        // Build industries list
        const industryList: Industry[] = [
          { id: 'all', name: 'All Industries', count: undefined }
        ];
        
        categoriesData.forEach((cat: any) => {
          industryList.push({
            id: cat.id,
            name: cat.name,
            count: 0
          });
        });
        
        setIndustries(industryList);
      }
      
      // Fetch all accreditations
      const { data, error } = await supabase
        .from('accreditations')
        .select('*')
        .eq('is_global', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching accreditations:', error);
        return;
      }
      
      setAccreditations(data || []);
      
      // Update industry counts
      if (data && categoriesData) {
        const industryCounts: Record<string, number> = {};
        
        categoriesData.forEach(cat => {
          industryCounts[cat.name] = 0;
        });
        
        data.forEach((acc: any) => {
          if (acc.sector) {
            categoriesData.forEach(cat => {
              if (acc.sector.toLowerCase().includes(cat.name.toLowerCase())) {
                industryCounts[cat.name] = (industryCounts[cat.name] || 0) + 1;
              }
            });
          }
        });
        
        setIndustries(prev => {
          const updated = [...prev];
          updated.forEach((industry, index) => {
            if (industry.id !== 'all' && industry.name) {
              updated[index] = {
                ...industry,
                count: industryCounts[industry.name] || 0
              };
            }
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Error in fetchAccreditationsWithCategories:', error);
    } finally {
      setIsLoadingAccreditations(false);
    }
  };

  const fetchProviderAccreditations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('provider_accreditations')
        .select('*')
        .eq('provider_id', providerId)
        .order('position');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const accreditationIds = data
          .filter(acc => !acc.is_custom && acc.accreditation_id)
          .map(acc => acc.accreditation_id);
        
        let accreditationDetails: any[] = [];
        if (accreditationIds.length > 0) {
          const { data: accData, error: accError } = await supabase
            .from('accreditations')
            .select('*')
            .in('id', accreditationIds);
            
          if (!accError && accData) {
            accreditationDetails = accData;
          }
        }
        
        const formattedSelected = data.map((acc: any) => {
          if (acc.is_custom) {
            return {
              id: acc.id || `custom-${Date.now()}-${acc.position}`,
              custom_name: acc.custom_name,
              is_custom: true,
              position: acc.position
            };
          } else {
            const accreditation = accreditationDetails.find(a => a.id === acc.accreditation_id);
            return {
              id: acc.id || `temp-${Date.now()}-${acc.position}`,
              accreditation_id: acc.accreditation_id,
              accreditation: accreditation,
              is_custom: false,
              position: acc.position
            };
          }
        });
        
        setSelected(formattedSelected);
      }
    } catch (error) {
      console.error('Error fetching provider accreditations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle industry expansion
  const toggleIndustry = useCallback((industryId: string) => {
    setExpandedIndustries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(industryId)) {
        newSet.delete(industryId);
      } else {
        newSet.add(industryId);
      }
      return newSet;
    });
  }, []);

  // Get total count of accreditations
  const totalAccreditationsCount = useMemo(() => {
    return accreditations.length;
  }, [accreditations]);

  // Memoize filtered industries for browse drawer
  const filteredIndustries = useMemo(() => {
    if (!browseSearch.trim()) return industries.filter(i => i.id !== 'all');
    
    const searchTerm = browseSearch.toLowerCase().trim();
    
    return industries
      .filter(i => i.id !== 'all')
      .map(industry => {
        const industryMatches = industry.name.toLowerCase().includes(searchTerm);
        const matchingAccreditations = accreditations.filter(acc => 
          acc.sector?.toLowerCase().includes(industry.name.toLowerCase()) &&
          acc.name.toLowerCase().includes(searchTerm)
        );
        
        if (industryMatches) {
          return { 
            ...industry, 
            accreditations: accreditations.filter(acc => 
              acc.sector?.toLowerCase().includes(industry.name.toLowerCase())
            ) 
          };
        } else if (matchingAccreditations.length > 0) {
          return { 
            ...industry, 
            accreditations: matchingAccreditations 
          };
        }
        
        return null;
      })
      .filter(industry => industry !== null);
  }, [industries, accreditations, browseSearch]);

  const sanitizeInput = useCallback((input: string): string => {
    return input
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 100);
  }, []);

  const toggleAccreditationFromBrowse = useCallback((accreditation: any) => {
    const existing = selected.find(s => 
      !s.is_custom && s.accreditation_id === accreditation.id
    );
    
    if (existing) {
      setSelected(prev => prev.filter(s => s.id !== existing.id));
    } else {
      if (selected.length >= maxSelection) {
        setError(`Maximum ${maxSelection} accreditations allowed`);
        return;
      }
      setSelected(prev => [...prev, {
        id: `temp-${Date.now()}`,
        accreditation_id: accreditation.id,
        accreditation: accreditation,
        is_custom: false,
        position: prev.length
      }]);
    }
    setError('');
  }, [selected, maxSelection]);

  const addCustomAccreditation = useCallback(() => {
    const sanitizedName = sanitizeInput(customName);
    
    if (!sanitizedName) {
      setError('Please enter an accreditation name');
      return;
    }
    
    if (selected.some(s => s.is_custom && s.custom_name?.toLowerCase() === sanitizedName.toLowerCase())) {
      setError('This accreditation is already added');
      return;
    }
    
    if (selected.length >= maxSelection) {
      setError(`Maximum ${maxSelection} accreditations allowed`);
      return;
    }
    
    setSelected(prev => [...prev, {
      id: `custom-${Date.now()}`,
      custom_name: sanitizedName,
      is_custom: true,
      position: prev.length
    }]);
    setCustomName('');
    setError('');
    if (!isMobile) {
      customInputRef.current?.focus();
    }
  }, [customName, selected, maxSelection, sanitizeInput, isMobile]);

  const removeAccreditation = useCallback((accreditationToRemove: any) => {
    setSelected(prev => prev.filter(s => s.id !== accreditationToRemove.id));
    setError('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (customName.trim()) {
        addCustomAccreditation();
      }
    }
  }, [customName, addCustomAccreditation]);

  const handleSave = useCallback(() => {
    setIsLoading(true);
    setError('');
    
    try {
      const updatedSelection = selected.map((acc, index) => ({
        ...acc,
        position: index
      }));
      onSave(updatedSelection);
      onClose();
    } catch (err) {
      setError('Failed to save accreditations. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selected, onSave, onClose]);
  
  const clearAllAccreditations = useCallback(() => {
    setSelected([]);
    setError('');
    if (!isMobile) {
      customInputRef.current?.focus();
    }
  }, [isMobile]);

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
                <Award style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                  Accreditations
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
          
          {/* Content Area */}
          <div
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: isMobile ? '1.25rem' : '1.5rem',
              backgroundColor: '#1f2937',
            }}
          >
            {/* Browse Accreditations Button */}
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
                <span style={{ color: '#f97316' }}>Browse Accreditations</span>
                {isLoadingAccreditations && (
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Loading...</span>
                )}
              </h4>
              
              <button
                onClick={() => setShowBrowseDrawer(true)}
                disabled={isLoadingAccreditations}
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
                  cursor: isLoadingAccreditations ? 'not-allowed' : 'pointer',
                  opacity: isLoadingAccreditations ? 0.5 : 1,
                  marginBottom: '0.5rem',
                  minHeight: isMobile ? '48px' : 'auto',
                }}
                onMouseEnter={(e) => {
                  if (!isLoadingAccreditations) {
                    e.currentTarget.style.backgroundColor = '#1f2937';
                    e.currentTarget.style.borderColor = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoadingAccreditations) {
                    e.currentTarget.style.backgroundColor = '#111827';
                    e.currentTarget.style.borderColor = '#374151';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                  <span>Browse by Industry</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#f97316', fontWeight: '500' }}>
                    {totalAccreditationsCount} accreditations
                  </span>
                  <ChevronRight style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                </div>
              </button>
              
              <p style={{ fontSize: '0.75rem', color: '#e5e7eb', margin: 0 }}>
                {industries.length - 1} industries • {totalAccreditationsCount} accreditations
              </p>
            </div>
            
            {/* Add custom accreditation */}
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
                <span style={{ color: '#f97316' }}>Add Custom Accreditation</span>
              </h4>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  ref={customInputRef}
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a custom accreditation name..."
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
                  onClick={addCustomAccreditation}
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
                  aria-label="Add custom accreditation"
                >
                  <Plus style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#e5e7eb', marginTop: '0.5rem', marginBottom: 0 }}>
                Press Enter to add
              </p>
            </div>
            
            {/* Selected Accreditations */}
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
                  <span style={{ color: '#f97316' }}>Selected Accreditations</span>
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#fdba74', fontWeight: '500' }}>
                    {selected.length}/{maxSelection}
                  </span>
                  {selected.length > 0 && (
                    <button
                      onClick={clearAllAccreditations}
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
              
              {selected.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selected.map((acc, index) => {
                    const isPreconfigured = !acc.is_custom;
                    return (
                      <div
                        key={acc.id || index}
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
                          <Award style={{ 
                            width: '1rem', 
                            height: '1rem', 
                            color: isPreconfigured ? '#f97316' : '#60a5fa' 
                          }} />
                          <span style={{ color: '#d1d5db', fontSize: '0.875rem', fontWeight: '500' }}>
                            {acc.is_custom ? acc.custom_name : acc.accreditation?.name || 'Accreditation'}
                          </span>
                          {acc.is_custom && (
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
                          onClick={() => removeAccreditation(acc)}
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
                            e.currentTarget.style.color = '#f97316';
                            e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#9ca3af';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          aria-label={`Remove ${acc.is_custom ? acc.custom_name : acc.accreditation?.name}`}
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
                }}>
                  <Award style={{ width: '2rem', height: '2rem', color: '#4b5563', margin: '0 auto 0.5rem' }} />
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    No accreditations selected yet
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#4b5563', margin: 0 }}>
                    Browse industries or add custom accreditations
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
                    e.currentTarget.style.background = 'linear-gradient(to right, #f97316, #fb923c)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
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
                ) : (
                  `Save ${selected.length} Accreditation${selected.length !== 1 ? 's' : ''}`
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

      {/* Browse Accreditations Drawer */}
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
                    <Award style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                      Accreditations by Industry
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
                    {totalAccreditationsCount} accreditations • {industries.length - 1} industries
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
                  placeholder="Search industries or accreditations..."
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
              
              {/* Industries & Accreditations List */}
              <div
                style={{
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  padding: isMobile ? '1.25rem' : '1.5rem',
                  backgroundColor: '#1f2937',
                }}
              >
                {isLoadingAccreditations ? (
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
                ) : filteredIndustries.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem 1rem',
                    backgroundColor: 'rgba(17, 24, 39, 0.3)',
                    borderRadius: '0.75rem',
                  }}>
                    <Award style={{ width: '2rem', height: '2rem', color: '#4b5563', margin: '0 auto 0.5rem' }} />
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      No matches found
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredIndustries.map((industry: any) => {
                      const isExpanded = expandedIndustries.has(industry.id);
                      const industryAccreditations = accreditations.filter(acc => 
                        acc.sector?.toLowerCase().includes(industry.name.toLowerCase())
                      );
                      
                      return (
                        <div key={industry.id}>
                          {/* Industry Header - REMOVED selected count */}
                          <button
                            onClick={() => toggleIndustry(industry.id)}
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
                              <span style={{ fontWeight: '500' }}>{industry.name}</span>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {industry.count} {industry.count === 1 ? 'accreditation' : 'accreditations'}
                            </span>
                          </button>
                          
                          {/* Accreditations List */}
                          {isExpanded && (
                            <div style={{ 
                              marginLeft: isMobile ? '1rem' : '1.5rem',
                              marginTop: '0.25rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                            }}>
                              {industryAccreditations.map((acc: any) => {
                                const isSelected = selected.some(s => 
                                  !s.is_custom && s.accreditation_id === acc.id
                                );
                                const isDisabled = selected.length >= maxSelection && !isSelected;
                                
                                return (
                                  <button
                                    key={acc.id}
                                    onClick={() => !isDisabled && toggleAccreditationFromBrowse(acc)}
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
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isSelected && !isDisabled) {
                                        e.currentTarget.style.backgroundColor = '#1f2937';
                                        e.currentTarget.style.borderColor = '#4b5563';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isSelected && !isDisabled) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = '#374151';
                                      }
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                                      <Award style={{ 
                                        width: '0.875rem', 
                                        height: '0.875rem', 
                                        color: isSelected ? '#f97316' : '#6b7280' 
                                      }} />
                                      <span>{acc.name}</span>
                                    </div>
                                    {isSelected && (
                                      <Check style={{ width: '0.875rem', height: '0.875rem', color: '#f97316' }} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
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
  );
}