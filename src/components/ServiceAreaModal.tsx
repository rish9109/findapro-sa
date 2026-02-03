// File: src/components/ServiceAreaModal.tsx - CLEAN VERSION
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, MapPin, Search, Check } from 'lucide-react';

interface ServiceAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrimary?: string;
  initialCustomAreas: string[];
  onSave: (primary: string, customAreas: string[]) => void;
  maxCustomAreas?: number;
  cities?: { id: string; name: string; province_id: string }[];
}

export default function ServiceAreaModal({
  isOpen,
  onClose,
  initialPrimary = '',
  initialCustomAreas = [],
  onSave,
  maxCustomAreas = 10,
  cities = []
}: ServiceAreaModalProps) {
  const [primaryArea, setPrimaryArea] = useState(initialPrimary);
  const [customAreas, setCustomAreas] = useState<string[]>(initialCustomAreas);
  const [newArea, setNewArea] = useState('');
  const [search, setSearch] = useState('');
  const [showCityList, setShowCityList] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cityListRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setPrimaryArea(initialPrimary);
      setCustomAreas(initialCustomAreas);
      setSearch('');
      setShowCityList(false);
      setError('');
      
      // Focus search input with a slight delay
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialPrimary, initialCustomAreas]);
  
  // Close city list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityListRef.current && !cityListRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowCityList(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Memoize filtered cities for performance
  const filteredCities = useMemo(() => {
    if (!search.trim()) return [];
    return cities.filter(city =>
      city.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [cities, search]);
  
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 100);
  };
  
  const selectCity = (cityName: string) => {
    const sanitizedCity = sanitizeInput(cityName);
    setSearch('');
    setShowCityList(false);
    setError('');
    
    if (!primaryArea) {
      setPrimaryArea(sanitizedCity);
    } 
    else if (!customAreas.includes(sanitizedCity) && sanitizedCity !== primaryArea) {
      if (customAreas.length >= maxCustomAreas) {
        setError(`Maximum ${maxCustomAreas} additional areas allowed`);
        return;
      }
      setCustomAreas([...customAreas, sanitizedCity]);
    }
    
    setTimeout(() => searchInputRef.current?.focus(), 10);
  };
  
  const addCustomArea = () => {
    const sanitizedArea = sanitizeInput(newArea);
    
    if (!sanitizedArea) {
      setError('Please enter an area name');
      return;
    }
    
    if (customAreas.includes(sanitizedArea)) {
      setError('This area is already added');
      return;
    }
    
    if (sanitizedArea === primaryArea) {
      setError('This area is already set as primary');
      return;
    }
    
    if (customAreas.length >= maxCustomAreas) {
      setError(`Maximum ${maxCustomAreas} additional areas allowed`);
      return;
    }
    
    setCustomAreas([...customAreas, sanitizedArea]);
    setNewArea('');
    setError('');
    setTimeout(() => searchInputRef.current?.focus(), 10);
  };
  
  const removeCustomArea = (areaToRemove: string) => {
    if (areaToRemove === primaryArea) {
      setPrimaryArea('');
    } else {
      setCustomAreas(customAreas.filter(area => area !== areaToRemove));
    }
    setError('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showCityList && filteredCities.length > 0) {
        selectCity(filteredCities[0].name);
      } else if (newArea.trim()) {
        addCustomArea();
      } else if (search.trim() && !primaryArea) {
        const sanitized = sanitizeInput(search);
        if (sanitized) {
          setPrimaryArea(sanitized);
          setSearch('');
          setShowCityList(false);
        }
      }
    }
    
    if (e.key === 'Escape') {
      if (showCityList) {
        setShowCityList(false);
        setSearch('');
      } else {
        onClose();
      }
    }
  };
  
  const handleSave = () => {
    if (!primaryArea) {
      setError('Please select a primary service area');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      onSave(primaryArea, customAreas);
      onClose(); // Close modal after save
    } catch (err) {
      setError('Failed to save service areas. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPlaceholder = () => {
    return primaryArea 
      ? "Search for additional areas..." 
      : "Search for a primary service area...";
  };
  
  const clearSearch = () => {
    setSearch('');
    setShowCityList(false);
    setError('');
    searchInputRef.current?.focus();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/70 transition-opacity duration-300" 
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-800 px-4 md:px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Service Areas</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-400">
              {primaryArea 
                ? `Primary area: ${primaryArea}` 
                : 'Select your primary service area first'
              }
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-4">
            {/* Search Area */}
            <div className="py-4 border-b border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3">
                <span className="text-orange-400">Search Areas</span>
              </h4>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowCityList(true);
                      setError('');
                    }}
                    onFocus={() => setShowCityList(true)}
                    placeholder={getPlaceholder()}
                    className="w-full pl-10 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    onKeyDown={handleKeyDown}
                  />
                  {search && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* City suggestions */}
                {showCityList && search && (
                  <div 
                    ref={cityListRef}
                    className="absolute z-20 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto"
                  >
                    <div className="sticky top-0 bg-gray-800 px-3 py-2 border-b border-gray-700">
                      <p className="text-xs text-gray-400 font-medium">
                        {primaryArea ? 'Select additional areas:' : 'Select primary area:'}
                      </p>
                    </div>
                    {filteredCities.length > 0 ? (
                      filteredCities.map(city => {
                        const isPrimary = primaryArea === city.name;
                        const isAdded = customAreas.includes(city.name);
                        
                        return (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => selectCity(city.name)}
                            disabled={isPrimary || isAdded}
                            className={`w-full px-4 py-3 text-left text-sm border-b border-gray-800 last:border-b-0 flex items-center justify-between transition-colors
                              ${isPrimary 
                                ? 'bg-orange-500/20 text-orange-300 cursor-default' 
                                : isAdded 
                                  ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-300 hover:bg-gray-800'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-3 h-3 ${
                                isPrimary ? 'text-orange-400' : 
                                isAdded ? 'text-gray-500' : 
                                'text-gray-500'
                              }`} />
                              <span>{city.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isPrimary && (
                                <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded">
                                  Primary
                                </span>
                              )}
                              {isAdded && !isPrimary && (
                                <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                                  Added
                                </span>
                              )}
                              {!isPrimary && !isAdded && (
                                <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                                  {primaryArea ? 'Add' : 'Set as Primary'}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <Search className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No cities found for "{search}"</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Type a custom name and press Enter
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Primary Area Display */}
            {primaryArea && (
              <div className="py-4 border-b border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <span className="text-orange-400">Primary Service Area</span>
                  <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full">
                    Required
                  </span>
                </h4>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/30">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300 text-sm font-medium">{primaryArea}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPrimaryArea('');
                      setError('');
                    }}
                    className="text-orange-400 hover:text-orange-300 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-orange-300/70 mt-1">
                  Your main service location
                </p>
              </div>
            )}
            
            {/* Additional Areas */}
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <span className="text-orange-400">Additional Areas</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
                    Optional
                  </span>
                </h4>
                <span className="text-xs text-orange-300 font-medium">
                  {customAreas.length}/{maxCustomAreas}
                </span>
              </div>
              
              {/* Add custom area */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => {
                      setNewArea(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomArea()}
                    placeholder="Type a custom area name..."
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                  <button
                    onClick={addCustomArea}
                    disabled={!newArea.trim() || customAreas.length >= maxCustomAreas || newArea.trim() === primaryArea}
                    className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium text-sm hover:from-orange-500 hover:to-orange-400 transition-all disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to add custom area
                </p>
              </div>
              
              {/* Areas list */}
              {customAreas.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {customAreas.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-lg border border-gray-700 hover:border-orange-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm font-medium">{area}</span>
                      </div>
                      <button
                        onClick={() => removeCustomArea(area)}
                        className="text-gray-400 hover:text-orange-400 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-700 rounded-lg bg-gradient-to-r from-gray-900/20 to-gray-800/10">
                  <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No additional areas yet</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {primaryArea 
                      ? `Use search above to add areas near ${primaryArea}`
                      : 'Select a primary area first'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-800 px-4 py-4 border-t border-gray-700">
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
                disabled={!primaryArea || isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium hover:from-orange-500 hover:to-orange-400 text-sm transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : primaryArea ? (
                  `Save ${customAreas.length + 1} Area${customAreas.length + 1 !== 1 ? 's' : ''}`
                ) : (
                  'Save Areas'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}