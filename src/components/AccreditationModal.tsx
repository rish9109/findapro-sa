// File: src/components/AccreditationModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Search, Plus, Check, Award, Filter } from 'lucide-react';

interface AccreditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  initialSelection: any[];
  onSave: (selected: any[]) => void;
  maxSelection?: number;
  serviceCategoryId?: string; // To filter accreditations by service category
}

export default function AccreditationModal({
  isOpen,
  onClose,
  providerId,
  initialSelection,
  onSave,
  maxSelection = 10,
  serviceCategoryId
}: AccreditationModalProps) {
  const [search, setSearch] = useState('');
  const [accreditations, setAccreditations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>(initialSelection);
  const [customName, setCustomName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState<string[]>(['All Industries']);
  const [selectedSector, setSelectedSector] = useState<string>('All Industries');
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      setSelected(initialSelection);
      fetchServiceCategories();
      fetchAccreditations();
    }
  }, [isOpen, initialSelection]);
  
  const fetchServiceCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
        
      if (!error && data) {
        setServiceCategories(data);
        setSectors(['All Industries', ...data.map(cat => cat.name)]);
      }
    } catch (error) {
      console.error('Error fetching service categories:', error);
    }
  };
  
  const fetchAccreditations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('accreditations')
        .select('*')
        .eq('is_global', true);
      
      // If we have a service category, try to filter by it
      if (serviceCategoryId && serviceCategories.length > 0) {
        const category = serviceCategories.find(cat => cat.id === serviceCategoryId);
        if (category) {
          query = query.ilike('sector', `%${category.name}%`);
        }
      }
      
      const { data, error } = await query.order('name');
        
      if (error) throw error;
      setAccreditations(data || []);
      
    } catch (error) {
      console.error('Error fetching accreditations:', error);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Center modal properly for all screen sizes */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-2xl bg-gray-800 text-left shadow-2xl transition-all w-full max-w-4xl my-8 max-h-[90vh]">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-800 px-4 md:px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Select Accreditations</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Selection info */}
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
              <div className="flex flex-wrap gap-2 mt-2 max-h-16 overflow-y-auto">
                {selected.map(acc => (
                  <div
                    key={acc.id}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30"
                  >
                    <span className="text-xs text-orange-300 truncate max-w-[100px]">
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
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-900/50">
              <div className="flex gap-2 mb-2">
                <input
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
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search accreditations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Accreditation list - Better height calculation */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-300px)]">
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
                <p className="text-gray-500">No accreditations found</p>
                <p className="text-sm text-gray-600 mt-1">Try a different search or sector</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-800 px-4 py-4 border-t border-gray-700">
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
    </div>
  );
}