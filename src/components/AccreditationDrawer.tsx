// File: src/components/AccreditationDrawer.tsx - UPDATED WITH FIXED LAYOUT
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Search, Plus, Check, Award, Filter, Info } from 'lucide-react';
import BaseDrawer from './BaseDrawer';

interface AccreditationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  initialSelection: any[];
  onSave: (selected: any[]) => void;
  maxSelection?: number;
  serviceCategoryId?: string;
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
  const [search, setSearch] = useState('');
  const [accreditations, setAccreditations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>(initialSelection);
  const [customName, setCustomName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState<string[]>(['All Industries']);
  const [selectedSector, setSelectedSector] = useState<string>('All Industries');
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<any>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch service categories
  const fetchServiceCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
        
      if (!error && data) {
        setServiceCategories(data);
        setSectors(['All Industries', ...data.map(cat => cat.name)]);
        
        // Find the selected category if serviceCategoryId is provided
        if (serviceCategoryId) {
          const category = data.find(cat => cat.id === serviceCategoryId);
          if (category) {
            setSelectedServiceCategory(category);
            // Auto-filter by this category
            setSelectedSector(category.name);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching service categories:', error);
    }
  }, [serviceCategoryId]);
  
  // Fetch accreditations
  const fetchAccreditations = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('accreditations')
        .select('*')
        .eq('is_global', true);
      
      // Filter by selected sector
      if (selectedSector !== 'All Industries') {
        query = query.ilike('sector', `%${selectedSector}%`);
      }
      
      const { data, error } = await query.order('name');
        
      if (error) throw error;
      setAccreditations(data || []);
      
    } catch (error) {
      console.error('Error fetching accreditations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSector]);
  
  // Initialize when drawer opens
  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelection);
      fetchServiceCategories();
    }
  }, [isOpen, initialSelection, fetchServiceCategories]);
  
  // Fetch accreditations when service categories are loaded or sector changes
  useEffect(() => {
    if (isOpen && serviceCategories.length > 0) {
      fetchAccreditations();
    }
  }, [isOpen, serviceCategories, fetchAccreditations]);
  
  // Focus search input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isOpen]);
  
  const filteredAccreditations = accreditations.filter(acc => {
    const matchesSearch = search === '' || 
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesSector = selectedSector === 'All Industries' || 
      (acc.sector && acc.sector.includes(selectedSector));
    
    return matchesSearch && matchesSector;
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

  // Focus custom input when form opens
  useEffect(() => {
    if (showCustomForm) {
      setTimeout(() => customInputRef.current?.focus(), 300);
    }
  }, [showCustomForm]);

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Select Accreditations"
      icon={<Award className="w-5 h-5 text-orange-400" />}
      position="right"
      size="xl"
      showCloseButton={false}
    >
      {/* CHANGED: Added min-h-0 to ensure proper flexbox */}
      <div className="h-full flex flex-col min-h-0">
        {/* Scrollable Content Area - CHANGED: Added min-h-0 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            {/* Service Category Info */}
            {selectedServiceCategory && (
              <div className="mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-orange-300 font-medium">
                        Filtering by: {selectedServiceCategory.name}
                      </p>
                      <p className="text-xs text-orange-400/80 mt-1">
                        Showing accreditations relevant to this service category
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Selection Info */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">
                    Selected: <span className="font-semibold">{selected.length}/{maxSelection}</span>
                  </span>
                </div>
                
                {selected.length < maxSelection && (
                  <button
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom
                  </button>
                )}
              </div>
              
              {/* Selected badges */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {selected.map(acc => (
                    <div
                      key={acc.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30"
                    >
                      <span className="text-xs text-orange-300 truncate max-w-[120px]">
                        {acc.is_custom ? acc.custom_name : 'Certified'}
                      </span>
                      <button
                        onClick={() => removeAccreditation(acc.id)}
                        className="text-orange-400 hover:text-orange-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Custom form */}
            {showCustomForm && (
              <div className="mb-4 p-3 border border-gray-700 bg-gray-900/50 rounded-lg">
                <div className="flex gap-2 mb-2">
                  <input
                    ref={customInputRef}
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter custom accreditation name"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && addCustomAccreditation()}
                  />
                  <button
                    onClick={addCustomAccreditation}
                    disabled={!customName.trim()}
                    className="px-3 py-2 bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium text-sm"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Custom accreditations are saved to your profile only
                </p>
              </div>
            )}
            
            {/* Filters */}
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Sector filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search accreditations..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm"
                  />
                </div>
              </div>
              
              {/* Filter info */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {filteredAccreditations.length} accreditations found
                </p>
                {selectedSector !== 'All Industries' && (
                  <button
                    onClick={() => setSelectedSector('All Industries')}
                    className="text-xs text-orange-400 hover:text-orange-300"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
            
            {/* Accreditations List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                <p className="text-gray-400 mt-2">Loading accreditations...</p>
              </div>
            ) : filteredAccreditations.length > 0 ? (
              <div className="space-y-2">
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
                      className={`w-full p-3 rounded-lg border text-left transition-all ${isSelected
                          ? 'bg-gradient-to-r from-orange-600/30 to-orange-500/30 border-orange-500'
                          : isDisabled
                          ? 'bg-gray-900/30 border-gray-700 opacity-50 cursor-not-allowed'
                          : 'bg-gray-900/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'bg-gray-800 border-gray-600'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm mb-1 truncate">
                            {acc.name}
                          </h4>
                          {acc.description && (
                            <p className="text-xs text-gray-400 line-clamp-2">{acc.description}</p>
                          )}
                          {acc.sector && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-800 text-gray-300 rounded">
                              {acc.sector}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No accreditations found</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSector !== 'All Industries' 
                    ? `Try changing the sector filter or search term`
                    : `Try a different search term`}
                </p>
                {selectedSector !== 'All Industries' && (
                  <button
                    onClick={() => setSelectedSector('All Industries')}
                    className="mt-3 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Show all accreditations
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Cancel and Save - CHANGED: Added drawer-footer class */}
        <div className="flex-shrink-0 border-t border-gray-700 bg-gray-800 drawer-footer">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-medium hover:from-orange-500 hover:to-orange-400 text-sm transition-all"
              >
                Save ({selected.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseDrawer>
  );
}