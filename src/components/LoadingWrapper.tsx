// File: src/components/LoadingWrapper.tsx
'use client';

import React, { useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <LoadingScreen 
        isVisible={isLoading}
        messages={[
          'Loading Find A Pro...',
          'Fetching professionals...',
          'Preparing your dashboard...'
        ]}
        onComplete={() => setIsLoading(false)}
      />
      
      <div 
        className={`transition-all duration-500 ${
          isLoading 
            ? 'opacity-0 blur-sm scale-[0.98] pointer-events-none' 
            : 'opacity-100 blur-0 scale-100'
        }`}
        style={{ 
          minHeight: '100vh',
          transformOrigin: 'center'
        }}
      >
        {children}
      </div>
    </>
  );
};

export default LoadingWrapper;