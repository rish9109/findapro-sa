// File: src/components/ServiceAreaModal.tsx - UPDATED to fetch from provinces
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Plus, MapPin, Check, List } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ServiceAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAreas: string[];
  onSave: (areas: string[]) => void;
  maxAreas?: number;
}

export default function ServiceAreaModal({
  isOpen,
  onClose,
  initialAreas = [],
  onSave,
  maxAreas = 7,
}: ServiceAreaModalProps) {
  // State
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [provinces, setProvinces] = useState<{ id: string; name: string; code: string }[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const browseSearchRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);

  // Fetch provinces when modal opens
  useEffect(() => {
    if (isOpen && !isInitialized.current) {
      setSelectedAreas([...initialAreas]);
      setNewArea('');
      setError('');
      setBrowseSearch('');
      isInitialized.current = true;
      
      // Fetch provinces from database
      fetchProvinces();
      
      // Focus custom input with a slight delay
      const timer = setTimeout(() => {
        customInputRef.current?.focus();
      }, 150);
      
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      isInitialized.current = false;
    }
  }, [isOpen, initialAreas]);

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
  
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showBrowseModal) {
          setShowBrowseModal(false);
        } else {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, showBrowseModal, onClose]);

  // Focus browse search when browse modal opens
  useEffect(() => {
    if (showBrowseModal) {
      setTimeout(() => browseSearchRef.current?.focus(), 100);
    }
  }, [showBrowseModal]);
  
  // Memoize filtered provinces for browse modal
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
    customInputRef.current?.focus();
  }, [newArea, selectedAreas, maxAreas, sanitizeInput]);
  
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
    customInputRef.current?.focus();
  }, []);

  // Don't render if not open
  if (!isOpen) return null;
  
  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/70" 
          onClick={onClose}
        />
        
        {/* Modal Container - Fixed height to prevent resizing */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div 
            ref={modalRef}
            className="relative w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gray-800 px-4 md:px-6 py-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">Service Areas</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-gray-400">
                {selectedAreas.length > 0 
                  ? `${selectedAreas.length} area${selectedAreas.length !== 1 ? 's' : ''} selected` 
                  : 'Add your service areas'
                }
              </p>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex-shrink-0">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Browse Areas Button */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-white mb-3">
                  <span className="text-orange-400">Preconfigured Areas</span>
                  {isLoadingProvinces && (
                    <span className="ml-2 text-xs text-gray-400">Loading...</span>
                  )}
                </h4>
                
                <button
                  onClick={() => setShowBrowseModal(true)}
                  disabled={isLoadingProvinces}
                  className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg text-white flex items-center justify-between transition-colors mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    <span>Browse Provinces ({provinces.length})</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {selectedAreas.length}/{maxAreas}
                  </span>
                </button>
                
                <p className="text-xs text-gray-500">
                  Select from our list of provinces
                </p>
              </div>
              
              {/* Add custom area */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-orange-400">Add Custom Area</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
                    Optional
                  </span>
                </h4>
                
                <div className="flex gap-2">
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
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                  <button
                    onClick={addCustomArea}
                    disabled={!newArea.trim() || selectedAreas.length >= maxAreas || selectedAreas.includes(newArea.trim())}
                    className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium text-sm hover:from-orange-500 hover:to-orange-400 transition-all disabled:cursor-not-allowed"
                    aria-label="Add custom area"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to add custom area
                </p>
              </div>
              
              {/* Selected Areas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <span className="text-orange-400">Selected Areas</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-orange-300 font-medium">
                      {selectedAreas.length}/{maxAreas}
                    </span>
                    {selectedAreas.length > 0 && (
                      <button
                        onClick={clearAllAreas}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Areas list */}
                {selectedAreas.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAreas.map((area, index) => {
                      const isPreconfigured = provinces.some(province => province.name === area);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700 hover:border-orange-500/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 ${isPreconfigured ? 'text-orange-400' : 'text-blue-400'}`} />
                            <span className="text-gray-300 text-sm font-medium">{area}</span>
                            {!isPreconfigured && (
                              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                                Custom
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeArea(area)}
                            className="text-gray-400 hover:text-orange-400 transition-colors p-1"
                            aria-label={`Remove ${area}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-gray-700 rounded-lg bg-gradient-to-r from-gray-900/20 to-gray-800/10">
                    <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No areas selected yet</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Browse provinces or add custom areas
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-800 px-4 py-4 border-t border-gray-700 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={selectedAreas.length === 0 || isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium hover:from-orange-500 hover:to-orange-400 text-sm transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
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
      </div>

      {/* Browse Provinces Modal */}
      {showBrowseModal && (
        <div className="fixed inset-0 z-[60]">
          <div 
            className="fixed inset-0 bg-black/70" 
            onClick={() => setShowBrowseModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="sticky top-0 bg-gray-800 px-4 md:px-6 py-4 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <List className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-bold text-white">Browse Provinces</h3>
                  </div>
                  <button
                    onClick={() => setShowBrowseModal(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <p>{provinces.length} provinces available</p>
                  <p>{selectedAreas.length}/{maxAreas} selected</p>
                </div>
                
                {/* Search in browse modal */}
                <input
                  ref={browseSearchRef}
                  type="text"
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                  placeholder="Search provinces..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>
              
              {/* Provinces List */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {isLoadingProvinces ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading provinces...</p>
                  </div>
                ) : filteredProvinces.length === 0 ? (
                  <div className="text-center py-8">
                    <List className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No provinces found</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProvinces.map((province) => {
                      const isSelected = selectedAreas.includes(province.name);
                      const isDisabled = selectedAreas.length >= maxAreas && !isSelected;
                      
                      return (
                        <button
                          key={province.id}
                          onClick={() => toggleAreaFromBrowse(province.name)}
                          disabled={isDisabled}
                          className={`w-full px-4 py-3 text-left rounded-lg border flex items-center justify-between transition-colors
                            ${isSelected 
                              ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' 
                              : isDisabled
                                ? 'bg-gray-900/30 border-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 ${isSelected ? 'text-orange-400' : 'text-gray-500'}`} />
                            <span className="text-sm">{province.name}</span>
                            <span className="text-xs text-gray-500">({province.code})</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-800 px-4 py-4 border-t border-gray-700 flex-shrink-0">
                <button
                  onClick={() => setShowBrowseModal(false)}
                  className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}