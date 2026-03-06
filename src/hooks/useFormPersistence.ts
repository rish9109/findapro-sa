// hooks/useFormPersistence.ts
import { useState, useEffect, useCallback } from 'react';

interface PersistedFormData {
  formData: any;
  selectedAccreditations: any[];
  selectedBusinessFeatures: any[];
  selectedSocialLinks: any[];
  serviceAreas: {
    primaryArea: string;
    additionalAreas: string[];
  };
  timestamp: number;
}

export function useFormPersistence(
  key: string,
  initialData: any,
  enabled: boolean
) {
  // Load saved data on mount
  useEffect(() => {
    if (!enabled) return;
    
    try {
      const saved = sessionStorage.getItem(`form_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved) as PersistedFormData;
        const fiveMinutes = 5 * 60 * 1000;
        
        // Only restore if less than 5 minutes old
        if (Date.now() - parsed.timestamp < fiveMinutes) {
          initialData.restore?.(parsed);
        } else {
          sessionStorage.removeItem(`form_${key}`);
        }
      }
    } catch (error) {
      console.error('Error restoring form data:', error);
    }
  }, [enabled, key]);

  // Save data on unmount or visibility change
  useEffect(() => {
    if (!enabled) return;

    const saveData = () => {
      try {
        const dataToSave: PersistedFormData = {
          formData: initialData.formData,
          selectedAccreditations: initialData.selectedAccreditations,
          selectedBusinessFeatures: initialData.selectedBusinessFeatures,
          selectedSocialLinks: initialData.selectedSocialLinks,
          serviceAreas: initialData.serviceAreas,
          timestamp: Date.now()
        };
        sessionStorage.setItem(`form_${key}`, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };

    // Save on page hide/close
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveData();
      }
    };

    // Save on beforeunload
    const handleBeforeUnload = () => {
      saveData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveData(); // Save on unmount
    };
  }, [enabled, key, initialData]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    sessionStorage.removeItem(`form_${key}`);
  }, [key]);

  return { clearSavedData };
}