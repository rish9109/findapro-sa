// File: src/components/ServiceAreaModal.tsx
'use client';

import { useState, useEffect } from 'react';
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
  
  useEffect(() => {
    if (isOpen) {
      setPrimaryArea(initialPrimary);
      setCustomAreas(initialCustomAreas);
    }
  }, [isOpen, initialPrimary, initialCustomAreas]);
  
  // Filter cities based on search
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const selectCity = (cityName: string) => {
    if (!primaryArea) {
      setPrimaryArea(cityName);
    } else if (customAreas.length < maxCustomAreas && !customAreas.includes(cityName) && cityName !== primaryArea) {
      setCustomAreas([...customAreas, cityName]);
    }
    setSearch('');
    setShowCityList(false);
  };
  
  const addCustomArea = () => {
    const trimmedArea = newArea.trim();
    if (!trimmedArea || customAreas.includes(trimmedArea) || customAreas.length >= maxCustomAreas || trimmedArea === primaryArea) return;
    
    setCustomAreas([...customAreas, trimmedArea]);
    setNewArea('');
  };
  
  const removeCustomArea = (areaToRemove: string) => {
    if (areaToRemove === primaryArea) {
      setPrimaryArea('');
    } else {
      setCustomAreas(customAreas.filter(area => area !== areaToRemove));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showCityList && filteredCities.length > 0) {
        selectCity(filteredCities[0].name);
      } else {
        addCustomArea();
      }
    }
  };
  
  const handleSave = () => {
    if (!primaryArea) {
      alert('Please select a primary service area');
      return;
    }
    onSave(primaryArea, customAreas);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-4 bg-black/70">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-gray-800 shadow-2xl">
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
            Select areas where you provide services
          </p>
        </div>
        
        {/* Primary Area Selection */}
        <div className="px-4 py-4 border-b border-gray-700">
          <h4 className="text-sm font-medium text-white mb-3">Primary Service Area *</h4>
          <div className="relative mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={primaryArea}
                onChange={(e) => {
                  setPrimaryArea(e.target.value);
                  setSearch(e.target.value);
                  setShowCityList(true);
                }}
                onFocus={() => setShowCityList(true)}
                placeholder="Search for a city or area..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm"
              />
            </div>
            
            {/* City suggestions */}
            {showCityList && search && (
              <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredCities.length > 0 ? (
                  filteredCities.map(city => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => selectCity(city.name)}
                      className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 border-b border-gray-800 last:border-b-0 flex items-center justify-between"
                    >
                      <span>{city.name}</span>
                      {primaryArea === city.name && (
                        <Check className="w-4 h-4 text-orange-400" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No cities found. You can type a custom area.
                  </div>
                )}
              </div>
            )}
          </div>
          
          {primaryArea && (
            <div className="mt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <MapPin className="w-3 h-3 text-orange-400" />
                <span className="text-sm text-orange-300">{primaryArea}</span>
                <button
                  onClick={() => removeCustomArea(primaryArea)}
                  className="text-orange-400 hover:text-orange-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Areas */}
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Additional Areas</h4>
            <span className="text-xs text-gray-500">
              {customAreas.length}/{maxCustomAreas}
            </span>
          </div>
          
          {/* Add new area */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add another area..."
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm"
              />
              <button
                onClick={addCustomArea}
                disabled={!newArea.trim() || customAreas.length >= maxCustomAreas}
                className="px-4 py-3 bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can add suburbs, towns, or neighborhoods
            </p>
          </div>
          
          {/* Areas list */}
          {customAreas.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {customAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{area}</span>
                  </div>
                  <button
                    onClick={() => removeCustomArea(area)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border border-gray-700 rounded-lg bg-gray-900/30">
              <p className="text-gray-500 text-sm">No additional areas added</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 px-4 py-4 border-t border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!primaryArea}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium hover:from-orange-500 hover:to-orange-400 text-sm"
            >
              Save Areas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}