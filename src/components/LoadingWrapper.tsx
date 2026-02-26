// File: src/components/LoadingWrapper.tsx
'use client';

import React, { useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';
import { getCategoriesWithProviderCounts } from '@/lib/supabase';
// Import other data fetching functions as needed
// import { getFeaturedProviders } from '@/lib/supabase';
// import { getStats } from '@/lib/supabase';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [dataLoaded, setDataLoaded] = useState({
    categories: false,
    providers: false,
    stats: false
  });

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
        
        setDataLoaded(prev => ({ ...prev, categories: true }));
        console.log('✅ Categories loaded:', categories.length);

        // You can add more data fetching here as needed
        // For example:
        // const providers = await getFeaturedProviders(true);
        // sessionStorage.setItem('cachedProviders', JSON.stringify({
        //   data: providers,
        //   timestamp: Date.now()
        // }));
        // setDataLoaded(prev => ({ ...prev, providers: true }));

        // const stats = await getStats(true);
        // sessionStorage.setItem('cachedStats', JSON.stringify({
        //   data: stats,
        //   timestamp: Date.now()
        // }));
        // setDataLoaded(prev => ({ ...prev, stats: true }));

      } catch (error) {
        console.error('❌ Error loading critical data:', error);
        
        // If fetch fails, try to use cached data
        const cached = sessionStorage.getItem('cachedCategories');
        if (cached) {
          console.log('📦 Using cached categories data');
          const { data } = JSON.parse(cached);
          setDataLoaded(prev => ({ ...prev, categories: true }));
        }
      }
    };

    // Start loading data immediately
    loadCriticalData();

    // Minimum loading time for showcase (2.5 seconds)
    // This ensures users see the beautiful animation
    const minLoadTime = setTimeout(() => {
      // Only hide loading if data is loaded or if we've waited long enough
      if (dataLoaded.categories) {
        setIsLoading(false);
      }
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

  // Effect to check if data is loaded and minimum time has passed
  useEffect(() => {
    if (dataLoaded.categories && isLoading) {
      // Data is loaded, but we might still be showing the loading screen
      // We'll let the minimum time timeout handle it
      console.log('📊 All critical data loaded, waiting for minimum time...');
    }
  }, [dataLoaded, isLoading]);

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
          // This will be called after the loading screen completes its animation
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