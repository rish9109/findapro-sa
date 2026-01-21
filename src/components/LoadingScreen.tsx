// File: src/components/LoadingScreen.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isVisible?: boolean;
  messages?: string | string[];
  onComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isVisible = false, 
  messages = [], 
  onComplete
}) => {
  const [currentMessages, setCurrentMessages] = useState<string[]>([
    'Loading Find A Pro...',
    'Fetching professionals...',
    'Preparing your dashboard...'
  ]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (isVisible && messages.length > 0) {
      if (Array.isArray(messages)) {
        setCurrentMessages(messages);
      } else {
        setCurrentMessages([messages]);
      }
    }
    
    if (isVisible) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [isVisible, messages, onComplete]);

  useEffect(() => {
    if (!isVisible || !isMounted || currentMessages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % currentMessages.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isVisible, currentMessages.length, isMounted]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0a0b10] z-[9999] flex flex-col items-center justify-center text-center p-4 sm:p-6"
          style={{ backgroundColor: 'rgba(5, 6, 10, 0.98)' }}
        >
          {/* Logo */}
          <div className="mb-8 sm:mb-12 z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Find A Pro
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400 font-light tracking-wider uppercase"
            >
              Connecting you with verified professionals
            </motion.div>
          </div>

          {/* Geometric loader */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mb-8 sm:mb-10 z-10 flex items-center justify-center"
          >
            <div className="absolute w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute border-2 border-blue-500 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                style={{ width: '80%', height: '80%' }}
              />
              
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute border-2 border-purple-500 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                style={{ width: '60%', height: '60%' }}
              />
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute border-2 border-cyan-500 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                style={{ width: '40%', height: '40%' }}
              />
            </div>
            
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="font-black text-4xl sm:text-5xl text-white z-20"
              >
                F
              </motion.div>
            </div>
          </motion.div>

          {/* Single message with animation */}
          <div className="relative h-16 sm:h-20 w-full max-w-md sm:max-w-lg mx-auto mb-4 sm:mb-6 overflow-hidden flex items-center justify-center">
            <motion.div
              key={currentMessageIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="px-4 sm:px-6"
            >
              <span className="text-base sm:text-lg text-gray-300 font-medium">
                {currentMessages[currentMessageIndex]}
              </span>
            </motion.div>
          </div>

          {/* Bouncing dots loader */}
          <div className="flex justify-center gap-3 sm:gap-4 mt-2 sm:mt-4">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{ 
                  scale: [0.8, 1.3, 0.8],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.3
                }}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${
                  index === 0 ? 'bg-blue-500' :
                  index === 1 ? 'bg-amber-500' :
                  'bg-pink-500'
                }`}
              />
            ))}
          </div>

          {/* Domain reference */}
          <div className="absolute bottom-6 sm:bottom-8 text-xs sm:text-sm text-gray-500 font-medium tracking-wider">
            findapro.co.za
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;