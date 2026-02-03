// File: src/components/ServiceCategoryModal.tsx - DYNAMIC VISIBILITY SOLUTION
'use client';

import { useState, useRef, useEffect } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Filter categories based on search
  const filteredCategories = serviceCategories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (category: ServiceCategory) => {
    onSelect(category);
    onClose();
  };

  // Check if content overflows on mount and resize
  useEffect(() => {
    const checkOverflow = () => {
      if (modalRef.current) {
        const modalHeight = modalRef.current.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        // If modal is taller than 80% of viewport, it needs scrolling
        setIsOverflowing(modalHeight > viewportHeight * 0.8);
      }
    };

    if (isOpen) {
      // Small delay to ensure DOM is rendered
      setTimeout(checkOverflow, 10);
      window.addEventListener('resize', checkOverflow);
    }

    return () => window.removeEventListener('resize', checkOverflow);
  }, [isOpen, filteredCategories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop with click to close */}
      <div 
        className="fixed inset-0 bg-black/70" 
        onClick={onClose}
      />
      
      {/* Smart positioning container */}
      <div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">
        {/* 
          DYNAMIC MODAL:
          - On large screens: Shows more content (max-h-[85vh])
          - On small screens: Shows less but scrollable (max-h-[75vh])
          - Always visible: Never goes off-screen
        */}
        <div 
          ref={modalRef}
          className={`
            relative w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl overflow-hidden
            transition-all duration-200
            ${isOverflowing 
              ? 'max-h-[75vh] mt-4 mb-4'  // Smaller, with margins for scrolling
              : 'max-h-[85vh] my-auto'    // Larger, centered vertically
            }
          `}
        >
          {/* Header - Always visible at top */}
          <div className="sticky top-0 z-10 bg-gray-800 px-6 py-5 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </div>
          
          {/* 
            DYNAMIC CONTENT AREA:
            - Adjusts height based on available space
            - Always shows as much as possible without going off-screen
          */}
          <div className={`
            overflow-y-auto
            ${isOverflowing 
              ? 'max-h-[calc(75vh-160px)]'  // Less height when overflowing
              : 'max-h-[calc(85vh-160px)]'  // More height when fits
            }
          `}>
            <div className="p-6">
              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelect(category)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${selectedCategoryId === category.id
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
          
          {/* Footer - Always visible at bottom */}
          <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}