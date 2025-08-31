import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for auto-save functionality with debouncing
 * @param {Function} saveFunction - Function to call for saving
 * @param {any} data - Data to monitor for changes
 * @param {Object} options - Configuration options
 * @returns {Object} - Auto-save state and controls
 */
export const useAutoSave = (saveFunction, data, options = {}) => {
  const {
    delay = 2000, // 2 seconds delay (industry standard)
    immediate = true, // Save immediately on first change
    enabled = true, // Enable/disable auto-save
    onSaveStart = () => {},
    onSaveSuccess = () => {},
    onSaveError = () => {},
  } = options;

  const timeoutRef = useRef(null);
  const previousDataRef = useRef(null);
  const isSavingRef = useRef(false);
  const hasChangesRef = useRef(false);

  // Debounced save function
  const debouncedSave = useCallback(async () => {
    if (!enabled || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      hasChangesRef.current = false;
      onSaveStart();
      
      await saveFunction(data);
      
      onSaveSuccess();
      console.log('✅ Auto-save successful');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      onSaveError(error);
      hasChangesRef.current = true; // Mark as having unsaved changes
    } finally {
      isSavingRef.current = false;
    }
  }, [saveFunction, data, enabled, onSaveStart, onSaveSuccess, onSaveError]);

  // Check for data changes and trigger auto-save
  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    const previousData = previousDataRef.current;

    // Skip if no previous data (initial load)
    if (previousData === null) {
      previousDataRef.current = currentData;
      return;
    }

    // Check if data has changed
    if (currentData !== previousData) {
      hasChangesRef.current = true;
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for debounced save
      timeoutRef.current = setTimeout(() => {
        debouncedSave();
      }, immediate && previousData === JSON.stringify({}) ? 0 : delay);

      previousDataRef.current = currentData;
    }
  }, [data, debouncedSave, delay, immediate, enabled]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await debouncedSave();
  }, [debouncedSave]);

  // Force save on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Force save if there are unsaved changes
      if (hasChangesRef.current && enabled) {
        saveFunction(data).catch(console.error);
      }
    };
  }, []);

  return {
    isSaving: isSavingRef.current,
    hasUnsavedChanges: hasChangesRef.current,
    manualSave,
  };
};

export default useAutoSave;
