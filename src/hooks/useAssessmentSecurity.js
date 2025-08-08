import { useState, useEffect } from 'react';

/**
 * Custom hook for implementing assessment security features
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onWarning - Callback function when a warning is triggered
 * @param {Function} options.onAutoSubmit - Callback function when auto-submission is triggered
 * @param {number} options.maxWarnings - Maximum number of warnings before auto-submission (default: 2)
 * @param {boolean} options.isActive - Whether security measures are active (default: true)
 * @returns {Object} Security state and handlers
 */
const useAssessmentSecurity = ({
  onWarning,
  onAutoSubmit,
  maxWarnings = 2,
  isActive = true
}) => {
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  
  // Handle tab visibility changes
  useEffect(() => {
    if (!isActive) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false);
        setTabSwitchWarnings(prev => {
          const newCount = prev + 1;
          
          // Call warning callback
          if (onWarning && typeof onWarning === 'function') {
            onWarning(newCount, maxWarnings);
          }
          
          // Auto-submit after max warnings
          if (newCount >= maxWarnings) {
            if (onAutoSubmit && typeof onAutoSubmit === 'function') {
              onAutoSubmit();
            }
          }
          
          return newCount;
        });
      } else {
        setIsTabVisible(true);
      }
    };

    // Handle window blur (user switches to another window)
    const handleWindowBlur = () => {
      setIsTabVisible(false);
      setTabSwitchWarnings(prev => {
        const newCount = prev + 1;
        
        // Call warning callback
        if (onWarning && typeof onWarning === 'function') {
          onWarning(newCount, maxWarnings);
        }
        
        // Auto-submit after max warnings
        if (newCount >= maxWarnings) {
          if (onAutoSubmit && typeof onAutoSubmit === 'function') {
            onAutoSubmit();
          }
        }
        
        return newCount;
      });
    };

    // Register event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    
    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isActive, maxWarnings, onWarning, onAutoSubmit]);

  // Prevent right-click
  useEffect(() => {
    if (!isActive) return;
    
    const preventRightClick = (e) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('contextmenu', preventRightClick);
    
    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
    };
  }, [isActive]);

  // Prevent dev tools shortcuts
  useEffect(() => {
    if (!isActive) return;
    
    const preventDevTools = (e) => {
      // Prevent F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('keydown', preventDevTools);
    
    return () => {
      document.removeEventListener('keydown', preventDevTools);
    };
  }, [isActive]);

  return {
    tabSwitchWarnings,
    isTabVisible,
    resetWarnings: () => setTabSwitchWarnings(0)
  };
};

export default useAssessmentSecurity;