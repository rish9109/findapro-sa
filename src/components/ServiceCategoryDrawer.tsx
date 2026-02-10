// File: src/components/ServiceCategoryDrawer.tsx - FINAL FIXED VERSION
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import BaseDrawer from './BaseDrawer';

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface ServiceCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCategories: ServiceCategory[];
  selectedCategoryId?: string;
  onSelect: (category: ServiceCategory) => void;
  title?: string;
}

export default function ServiceCategoryDrawer({
  isOpen,
  onClose,
  serviceCategories = [],
  selectedCategoryId,
  onSelect,
  title = "Select Service Category"
}: ServiceCategoryDrawerProps) {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter categories based on search
  const filteredCategories = (serviceCategories || []).filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (category: ServiceCategory) => {
    onSelect(category);
    onClose();
  };

  // Focus search input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  return (
    <BaseDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      position="right"
      size="lg"
      showCloseButton={false}
    >
      {/* CHANGED: Added min-h-0 to ensure proper flexbox behavior */}
      <div className="h-full flex flex-col min-h-0">
        {/* Content Area with Scroll - CHANGED: Added min-h-0 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Search Section */}
          <div className="px-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 px-1">
              {filteredCategories.length} of {(serviceCategories || []).length} categories
            </p>
          </div>

          {/* Categories List */}
          <div className="px-4 py-4">
            {filteredCategories.length > 0 ? (
              <div className="space-y-3">
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelect(category)}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${selectedCategoryId === category.id
                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50 ring-1 ring-orange-500/30'
                        : 'bg-gray-900/30 border-gray-700 hover:bg-gray-800/50 hover:border-gray-600'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${selectedCategoryId === category.id ? 'bg-orange-500 border-orange-500' : 'bg-gray-800 border-gray-600'}`}>
                        {selectedCategoryId === category.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm mb-1.5">{category.name}</h3>
                        {category.description && (
                          <p className="text-xs text-gray-400 line-clamp-2">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-gray-500" />
                </div>
                <h3 className="text-gray-300 font-medium mb-2">No categories found</h3>
                <p className="text-sm text-gray-500">Try a different search term</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Cancel Button - CHANGED: Added specific classes */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-700 bg-gray-800 drawer-footer">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors drawer-cancel-btn"
            >
              Cancel Selection
            </button>
          </div>
        </div>
      </div>
    </BaseDrawer>
  );
}