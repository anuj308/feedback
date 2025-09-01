import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration,
      isVisible: true
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration (if duration > 0)
    if (duration > 0 && type !== 'saving') {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Specific toast methods for common use cases
  const showSavingToast = useCallback((message = "Saving changes...") => {
    return showToast(message, 'saving', 0); // 0 duration means manual dismissal
  }, [showToast]);

  const showSuccessToast = useCallback((message = "Changes saved successfully!") => {
    return showToast(message, 'success', 3000);
  }, [showToast]);

  const showErrorToast = useCallback((message = "Failed to save changes") => {
    return showToast(message, 'error', 5000);
  }, [showToast]);

  return {
    toasts,
    showToast,
    hideToast,
    hideAllToasts,
    showSavingToast,
    showSuccessToast,
    showErrorToast
  };
};

export default useToast;
