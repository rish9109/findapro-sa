// File: src/components/ServiceCategoryDrawer.tsx - CONSISTENT DESKTOP & MOBILE
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

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
  position?: 'left' | 'right'; // Removed 'bottom' option for consistency
}

export default function ServiceCategoryDrawer({
  isOpen,
  onClose,
  serviceCategories,
  selectedCategoryId,
  onSelect,
  title = "Select Service Category",
  position = 'right' // Always side drawer
}: ServiceCategoryDrawerProps) {
  const [mounted, setMounted] = useState(false);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
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

  const handleSelect = (category: ServiceCategory) => {
    onSelect(category);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  // Consistent drawer styles - SAME for mobile and desktop
  const isLeft = position === 'left';

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
          ...(isLeft ? { left: 0 } : { right: 0 }),
          zIndex: 1000000,
          display: 'flex',
          flexDirection: 'column',
          width: '100%', // Full width on mobile
          maxWidth: '420px', // Same max width for all devices
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
            height: '100vh', // Full height always
            animation: isLeft 
              ? 'slideRight 0.3s ease-out'
              : 'slideLeft 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
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
              }}
            >
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: 'white', 
                margin: 0 
              }}>
                {title}
              </h2>
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
          </div>
          
          {/* Content Area - Scrollable */}
          <div
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '1.5rem',
              backgroundColor: '#1f2937',
            }}
          >
            {serviceCategories.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {serviceCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSelect(category)}
                    style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      width: '100%',
                      cursor: 'pointer',
                      background: selectedCategoryId === category.id
                        ? 'linear-gradient(to right, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2))'
                        : 'rgba(17, 24, 39, 0.3)',
                      borderColor: selectedCategoryId === category.id
                        ? 'rgba(249, 115, 22, 0.5)'
                        : '#374151',
                      ...(selectedCategoryId === category.id && {
                        boxShadow: '0 0 0 1px rgba(249, 115, 22, 0.3)',
                      }),
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategoryId !== category.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
                        e.currentTarget.style.borderColor = '#4b5563';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategoryId !== category.id) {
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
                          borderRadius: '9999px',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: selectedCategoryId === category.id ? '#f97316' : '#1f2937',
                          borderColor: selectedCategoryId === category.id ? '#f97316' : '#4b5563',
                        }}
                      >
                        {selectedCategoryId === category.id && (
                          <Check style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                        )}
                      </div>
                      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                        <h3 style={{ 
                          fontWeight: '600', 
                          color: 'white', 
                          fontSize: '0.875rem', 
                          marginBottom: '0.375rem',
                          marginTop: 0,
                        }}>
                          {category.name}
                        </h3>
                        {category.description && (
                          <p style={{ 
                            fontSize: '0.75rem', 
                            color: '#9ca3af', 
                            overflow: 'hidden', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical',
                            margin: 0,
                          }}>
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div
                  style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#1f2937',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <Check style={{ width: '1.75rem', height: '1.75rem', color: '#6b7280' }} />
                </div>
                <h3 style={{ color: '#d1d5db', fontWeight: '500', marginBottom: '0.5rem' }}>No categories found</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>No service categories available</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #374151',
              backgroundColor: '#1f2937',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.625rem 1.5rem',
                  backgroundColor: '#374151',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideRight {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes slideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          div[style*="max-width: 420px"] {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}