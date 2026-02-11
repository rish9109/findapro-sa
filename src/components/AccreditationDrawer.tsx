// File: src/components/AccreditationDrawer.tsx - MOBILE STYLING FIXES
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Plus, Check, Award, Filter, ChevronDown } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);
  const [accreditations, setAccreditations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [customName, setCustomName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState<Industry[]>([
    { id: 'all', name: 'All Industries', count: undefined }
  ]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        setIsDropdownOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Load all data when drawer opens
  useEffect(() => {
    if (isOpen) {
      const loadAllData = async () => {
        setLoading(true);
        try {
          // Fetch service categories
          await fetchServiceCategories();
          
          // Fetch ALL global accreditations
          await fetchAllAccreditations();
          
          // Fetch provider's existing accreditations if this is an edit (not temp)
          if (providerId && providerId !== 'temp') {
            await fetchProviderAccreditations();
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadAllData();
    }
  }, [isOpen, providerId]);

  // Initialize selected from initialSelection when drawer opens (for new listings)
  useEffect(() => {
    if (isOpen && providerId === 'temp') {
      setSelected(initialSelection);
    }
  }, [isOpen, providerId, initialSelection]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.industry-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchServiceCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
        
      if (!error && data) {
        setServiceCategories(data);
        
        // Build industries with placeholder counts
        const industryList: Industry[] = [
          { id: 'all', name: 'All Industries', count: undefined }
        ];
        
        data.forEach((cat: any) => {
          industryList.push({
            id: cat.id,
            name: cat.name,
            count: 0
          });
        });
        
        setIndustries(industryList);
      }
    } catch (error) {
      console.error('Error fetching service categories:', error);
    }
  };
  
  const fetchAllAccreditations = async () => {
    try {
      // Fetch ALL global accreditations - NO FILTERING
      const { data, error } = await supabase
        .from('accreditations')
        .select('*')
        .eq('is_global', true)
        .order('name');
        
      if (error) throw error;
      
      console.log('Fetched all accreditations:', data?.length);
      setAccreditations(data || []);
      
    } catch (error) {
      console.error('Error fetching accreditations:', error);
    }
  };

  // Separate useEffect to calculate counts AFTER both accreditations AND serviceCategories are loaded
  useEffect(() => {
    if (accreditations.length > 0 && serviceCategories.length > 0) {
      const industryCounts: Record<string, number> = {};
      
      // Initialize counts for all industries
      serviceCategories.forEach(cat => {
        industryCounts[cat.name] = 0;
      });
      
      // Count accreditations per industry
      accreditations.forEach((acc: any) => {
        if (acc.sector) {
          serviceCategories.forEach(cat => {
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
  }, [accreditations, serviceCategories]);

  const fetchProviderAccreditations = async () => {
    try {
      // Fetch provider's existing accreditations
      const { data, error } = await supabase
        .from('provider_accreditations')
        .select('*')
        .eq('provider_id', providerId)
        .order('position');
        
      if (error) throw error;
      
      console.log('Fetched provider accreditations:', data?.length);
      
      if (data && data.length > 0) {
        // Get all accreditation IDs to fetch their details
        const accreditationIds = data
          .filter(acc => !acc.is_custom && acc.accreditation_id)
          .map(acc => acc.accreditation_id);
        
        // Fetch full accreditation details for standard accreditations
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
        
        // Format the selected accreditations
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
    }
  };
  
  // Filter accreditations based on SELECTED INDUSTRY only
  const filteredAccreditations = accreditations.filter(acc => {
    if (selectedIndustry === 'all') return true;
    
    const selectedIndustryObj = industries.find(i => i.id === selectedIndustry);
    if (!selectedIndustryObj?.name) return false;
    
    return acc.sector && acc.sector.toLowerCase().includes(selectedIndustryObj.name.toLowerCase());
  });
  
  const toggleAccreditation = (accreditation: any) => {
    const existing = selected.find(s => 
      !s.is_custom && s.accreditation_id === accreditation.id
    );
    
    if (existing) {
      setSelected(selected.filter(s => s.id !== existing.id));
    } else if (selected.length < maxSelection) {
      setSelected([...selected, {
        id: `temp-${Date.now()}`,
        accreditation_id: accreditation.id,
        accreditation: accreditation,
        is_custom: false,
        position: selected.length
      }]);
    }
  };
  
  const addCustomAccreditation = () => {
    if (!customName.trim() || selected.length >= maxSelection) return;
    
    const newCustom = {
      id: `custom-${Date.now()}`,
      custom_name: customName.trim(),
      is_custom: true,
      position: selected.length
    };
    
    setSelected([...selected, newCustom]);
    setCustomName('');
    setShowCustomForm(false);
  };
  
  const removeAccreditation = (id: string) => {
    setSelected(selected.filter(s => s.id !== id));
  };
  
  const handleSave = () => {
    const updatedSelection = selected.map((acc, index) => ({
      ...acc,
      position: index
    }));
    onSave(updatedSelection);
    onClose();
  };

  const getSelectedIndustryName = () => {
    if (selectedIndustry === 'all') return 'All Industries';
    const industry = industries.find(i => i.id === selectedIndustry);
    return industry?.name || 'Select Industry';
  };

  const getTotalAccreditationsCount = () => {
    return accreditations.length;
  };

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
          zIndex: 1000000,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '560px',
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
            height: '100vh',
            animation: 'slideLeft 0.3s ease-out',
          }}
        >
          {/* Header - FIXED: Better mobile spacing */}
          <div
            style={{
              padding: '1rem 1.25rem',
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
                  Select Accreditations
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  color: '#9ca3af',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
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
            
            {/* Selection info */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '0.75rem' 
            }}>
              <span style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                Selected: <span style={{ fontWeight: '600', color: '#f97316' }}>
                  {selected.length}/{maxSelection}
                </span>
              </span>
              
              {selected.length < maxSelection && (
                <button
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8125rem',
                    backgroundColor: showCustomForm ? '#4b5563' : '#374151',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!showCustomForm) {
                      e.currentTarget.style.backgroundColor = '#4b5563';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showCustomForm) {
                      e.currentTarget.style.backgroundColor = '#374151';
                    }
                  }}
                >
                  <Plus style={{ width: '1rem', height: '1rem' }} />
                  Add Custom
                </button>
              )}
            </div>
            
            {/* Selected badges - FIXED: Better mobile scrolling and spacing */}
            {selected.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                className="selected-badges-scroll"
              >
                {selected.map(acc => (
                  <div
                    key={acc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(249, 115, 22, 0.2)',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#fdba74',
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {acc.is_custom ? acc.custom_name : acc.accreditation?.name || 'Certified'}
                    </span>
                    <button
                      onClick={() => removeAccreditation(acc.id)}
                      style={{
                        color: '#fdba74',
                        background: 'transparent',
                        border: 'none',
                        padding: '0.125rem',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderRadius: '9999px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#f97316';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#fdba74';
                      }}
                    >
                      <X style={{ width: '0.75rem', height: '0.75rem' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Custom form */}
          {showCustomForm && (
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid #374151',
                backgroundColor: 'rgba(17, 24, 39, 0.5)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter custom accreditation name"
                  style={{
                    flex: 1,
                    padding: '0.75rem 0.75rem',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#f97316';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomAccreditation()}
                  autoFocus
                />
                <button
                  onClick={addCustomAccreditation}
                  disabled={!customName.trim()}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: !customName.trim() ? '#374151' : '#f97316',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: !customName.trim() ? '#6b7280' : 'white',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    cursor: !customName.trim() ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Add
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                Custom accreditations are saved to your profile only
              </p>
            </div>
          )}
          
          {/* Industries Dropdown */}
          <div
            className="industry-dropdown"
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #374151',
              backgroundColor: '#1f2937',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}>
              <label style={{
                fontSize: '0.75rem',
                fontWeight: '500',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Filter by Industry
              </label>
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
              }}>
                {getTotalAccreditationsCount()} total
              </span>
            </div>
            
            {/* Custom dropdown trigger */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                backgroundColor: '#111827',
                border: `1px solid ${isDropdownOpen ? '#f97316' : '#374151'}`,
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'white',
                fontSize: '0.9375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              <span style={{ 
                color: selectedIndustry === 'all' ? '#9ca3af' : 'white',
                fontWeight: selectedIndustry === 'all' ? 'normal' : '500',
              }}>
                {getSelectedIndustryName()}
              </span>
              <ChevronDown style={{
                width: '1.125rem',
                height: '1.125rem',
                color: '#9ca3af',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }} />
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  marginTop: '0.375rem',
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  zIndex: 1000001,
                }}
              >
                <div style={{
                  maxHeight: 'min(300px, 50vh)',
                  overflowY: 'auto',
                  padding: '0.375rem',
                }}>
                  {industries.map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => {
                        setSelectedIndustry(industry.id);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        backgroundColor: selectedIndustry === industry.id ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                        border: 'none',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: selectedIndustry === industry.id ? '#fdba74' : 'white',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        marginBottom: '0.125rem',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedIndustry !== industry.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedIndustry !== industry.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span style={{
                        fontWeight: selectedIndustry === industry.id ? '600' : '400',
                      }}>
                        {industry.name}
                      </span>
                      {industry.count !== undefined && industry.id !== 'all' && (
                        <span style={{
                          padding: '0.25rem 0.625rem',
                          backgroundColor: selectedIndustry === industry.id 
                            ? 'rgba(249, 115, 22, 0.3)' 
                            : 'rgba(75, 85, 99, 0.5)',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          color: selectedIndustry === industry.id ? '#fdba74' : '#9ca3af',
                          fontWeight: '500',
                          display: 'inline-block',
                          minWidth: '28px',
                          textAlign: 'center',
                        }}>
                          {industry.count}
                        </span>
                      )}
                      {industry.id === 'all' && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          padding: '0.25rem 0.5rem',
                        }}>
                          {accreditations.length}
                        </span>
                      )}
                      {selectedIndustry === industry.id && (
                        <Check style={{
                          width: '1rem',
                          height: '1rem',
                          color: '#f97316',
                          marginLeft: '0.5rem',
                        }} />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Mobile close button - FIXED: Better touch target */}
                <div style={{
                  padding: '0.75rem',
                  borderTop: '1px solid #374151',
                  display: 'none',
                }} className="dropdown-mobile-close">
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      backgroundColor: '#374151',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.9375rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      minHeight: '48px',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            
            {/* Active filter indicator */}
            {selectedIndustry !== 'all' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.75rem',
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem 0.625rem',
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  color: '#fdba74',
                }}>
                  <Filter style={{ width: '0.75rem', height: '0.75rem' }} />
                  Active filter: {getSelectedIndustryName()}
                </span>
                <button
                  onClick={() => setSelectedIndustry('all')}
                  style={{
                    padding: '0.375rem 0.625rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    cursor: 'pointer',
                    minHeight: '32px',
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          
          {/* Content Area - Scrollable */}
          <div
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '1.25rem',
              backgroundColor: '#1f2937',
            }}
          >
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  border: '3px solid #f97316',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: '#9ca3af', fontSize: '0.9375rem', margin: 0 }}>
                  Loading accreditations...
                </p>
              </div>
            ) : filteredAccreditations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredAccreditations.map(acc => {
                  const isSelected = selected.some(s => 
                    !s.is_custom && s.accreditation_id === acc.id
                  );
                  const isDisabled = selected.length >= maxSelection && !isSelected;
                  
                  return (
                    <button
                      key={acc.id}
                      onClick={() => !isDisabled && toggleAccreditation(acc)}
                      disabled={isDisabled}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        background: isSelected
                          ? 'linear-gradient(to right, rgba(234, 88, 12, 0.2), rgba(249, 115, 22, 0.2))'
                          : isDisabled
                          ? 'rgba(17, 24, 39, 0.2)'
                          : 'rgba(17, 24, 39, 0.3)',
                        borderColor: isSelected
                          ? 'rgba(249, 115, 22, 0.5)'
                          : isDisabled
                          ? '#374151'
                          : '#374151',
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected && !isDisabled) {
                          e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
                          e.currentTarget.style.borderColor = '#4b5563';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected && !isDisabled) {
                          e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.3)';
                          e.currentTarget.style.borderColor = '#374151';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div
                          style={{
                            flexShrink: 0,
                            width: '1.25rem',
                            height: '1.25rem',
                            borderRadius: '0.375rem',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelected ? '#f97316' : '#1f2937',
                            borderColor: isSelected ? '#f97316' : '#4b5563',
                          }}
                        >
                          {isSelected && (
                            <Check style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                          )}
                        </div>
                        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                          <h4 style={{
                            fontWeight: '600',
                            color: 'white',
                            fontSize: '0.9375rem',
                            marginBottom: '0.25rem',
                            marginTop: 0,
                          }}>
                            {acc.name}
                          </h4>
                          {acc.description && (
                            <p style={{
                              fontSize: '0.8125rem',
                              color: '#9ca3af',
                              marginBottom: 0,
                              marginTop: 0,
                              lineHeight: '1.4',
                            }}>
                              {acc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 1rem',
                backgroundColor: 'rgba(17, 24, 39, 0.3)',
                borderRadius: '0.75rem',
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#1f2937',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  <Filter style={{ width: '1.5rem', height: '1.5rem', color: '#6b7280' }} />
                </div>
                <p style={{ color: '#d1d5db', fontWeight: '500', marginBottom: '0.25rem' }}>
                  No accreditations found
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  No accreditations available
                </p>
              </div>
            )}
          </div>
          
          {/* Footer - FIXED: Better mobile sticky footer */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid #374151',
              backgroundColor: '#1f2937',
              flexShrink: 0,
              boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
              position: 'sticky',
              bottom: 0,
              width: '100%',
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
                  padding: '0.875rem 0.75rem',
                  backgroundColor: '#374151',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  minHeight: '48px',
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
                style={{
                  flex: 1,
                  padding: '0.875rem 0.75rem',
                  background: 'linear-gradient(to right, #ea580c, #f97316)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  minHeight: '48px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #f97316, #fb923c)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #ea580c, #f97316)';
                }}
              >
                Save ({selected.length})
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

        /* Hide scrollbar for selected badges */
        .selected-badges-scroll::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 640px) {
          div[style*="max-width: 560px"] {
            max-width: 100% !important;
          }
          
          .dropdown-mobile-close {
            display: block !important;
          }
          
          button, input, select {
            min-height: 48px;
          }
          
          select, input, button {
            font-size: 16px !important;
          }
          
          /* Better touch targets */
          button[style*="border-radius: 0.5rem"] {
            padding-top: 0.875rem;
            padding-bottom: 0.875rem;
          }
          
          /* Ensure footer is always visible */
          div[style*="position: sticky"][style*="bottom: 0"] {
            background-color: #1f2937;
            border-top: 1px solid #374151;
            z-index: 10;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          div[style*="max-width: 560px"] {
            max-width: 480px !important;
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
        
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>,
    document.body
  );
}