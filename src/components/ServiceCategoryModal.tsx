// File: src/components/ServiceCategoryModal.tsx
'use client';

import { useState } from 'react';
import { X, Search, Check } from 'lucide-react';

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface ServiceCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCategories: ServiceCategory[];
  selectedCategoryId?: string;
  onSelect: (category: ServiceCategory) => void;
  title?: string;
}

export default function ServiceCategoryModal({
  isOpen,
  onClose,
  serviceCategories,
  selectedCategoryId,
  onSelect,
  title = "Select Service Category"
}: ServiceCategoryModalProps) {
  const [search, setSearch] = useState('');

  // Filter categories based on search
  const filteredCategories = serviceCategories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (category: ServiceCategory) => {
    onSelect(category);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 md:p-4 bg-black/70">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-gray-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-800 px-4 md:px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg md:text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm md:text-base"
            />
          </div>
        </div>
        
        {/* Categories List */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelect(category)}
                  className={`p-3 md:p-4 rounded-lg border text-left transition-all ${selectedCategoryId === category.id
                      ? 'bg-gradient-to-r from-orange-600/30 to-orange-500/30 border-orange-500'
                      : 'bg-gray-900/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedCategoryId === category.id && (
                          <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        )}
                        <h4 className="font-medium text-white text-sm md:text-base">
                          {category.name}
                        </h4>
                      </div>
                      {category.description && (
                        <p className="text-xs md:text-sm text-gray-400 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No categories found</p>
              <p className="text-sm text-gray-600 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 px-4 md:px-6 py-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 md:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm md:text-base transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}