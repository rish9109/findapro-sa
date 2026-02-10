// File: src/components/BaseDrawer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  position?: 'right' | 'left' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  showOverlay?: boolean;
}

export default function BaseDrawer({
  isOpen,
  onClose,
  children,
  title,
  icon,
  position = 'right',
  size = 'md',
  showCloseButton = false,
  showOverlay = true,
}: BaseDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Size classes
  const sizeClasses = {
    sm: position === 'right' || position === 'left' ? 'w-full max-w-sm' : 'h-full max-h-96',
    md: position === 'right' || position === 'left' ? 'w-full max-w-md' : 'h-full max-h-[32rem]',
    lg: position === 'right' || position === 'left' ? 'w-full max-w-lg' : 'h-full max-h-[40rem]',
    xl: position === 'right' || position === 'left' ? 'w-full max-w-xl' : 'h-full max-h-[48rem]',
    full: position === 'right' || position === 'left' ? 'w-full max-w-2xl' : 'h-full max-h-[90vh]',
  };

  // Position classes
  const positionClasses = {
    right: 'right-0 top-0 h-full',
    left: 'left-0 top-0 h-full',
    bottom: 'left-0 bottom-0 w-full',
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const drawerVariants = {
    hidden: {
      x: position === 'right' ? '100%' : position === 'left' ? '-100%' : 0,
      y: position === 'bottom' ? '100%' : 0,
    },
    visible: {
      x: 0,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 300,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              key="overlay"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
          )}
          
          {/* Drawer */}
          <motion.div
            key="drawer"
            ref={drawerRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerVariants}
            className={`fixed ${positionClasses[position]} ${sizeClasses[size]} bg-gray-800 shadow-2xl flex flex-col`}
          >
            {/* Header */}
            {title && (
              <div className="sticky top-0 z-10 bg-gray-800 px-4 md:px-6 py-4 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}