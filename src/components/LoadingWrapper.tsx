// File: src/components/LoadingWrapper.tsx
'use client';

import React, { useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';
import { getCategoriesWithProviderCounts } from '@/lib/supabase';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const loadCriticalData = async () => {
      try {
        // Fetch categories with provider counts (bypass cache)
        console.log('🔄 Fetching fresh categories data...');
        const categories = await getCategoriesWithProviderCounts(true);
        
        // Store in sessionStorage with timestamp
        sessionStorage.setItem('cachedCategories', JSON.stringify({
          data: categories,
          timestamp: Date.now()
        }));
        
        console.log('✅ Categories loaded:', categories.length);

      } catch (error) {
        console.error('❌ Error loading critical data:', error);
        
        // If fetch fails, try to use cached data
        const cached = sessionStorage.getItem('cachedCategories');
        if (cached) {
          console.log('📦 Using cached categories data');
        }
      }
    };

    // Start loading data immediately
    loadCriticalData();

    // Minimum loading time for showcase (2.5 seconds)
    const minLoadTime = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    // Maximum loading time (5 seconds) - force hide even if data isn't loaded
    const maxLoadTime = setTimeout(() => {
      console.log('⏰ Max load time reached, hiding loader');
      setIsLoading(false);
    }, 5000);

    return () => {
      clearTimeout(minLoadTime);
      clearTimeout(maxLoadTime);
    };
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
          'Fetching service categories...',
          'Counting active providers...',
          'Preparing your experience...',
          'Almost there...',
          'Ready to connect!'
        ]}
        simulateProgress={true}
        showcaseDuration={800}
        onComplete={() => {
          console.log('🎬 Loading complete, showing app');
        }}
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