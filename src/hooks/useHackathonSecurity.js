import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for implementing hackathon security features
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onWarning - Callback function when a warning is triggered
 * @param {Function} options.onAutoSubmit - Callback function when auto-submission is triggered
 * @param {number} options.maxWarnings - Maximum number of warnings before auto-submission (default: 2)
 * @param {boolean} options.isActive - Whether security measures are active (default: true)
 * @param {string} options.hackathonId - Hackathon ID for end time validation
 * @param {Function} options.onHackathonEnded - Callback when hackathon has ended
 * @returns {Object} Security state and handlers
 */
const useHackathonSecurity = ({
  onWarning,
  onAutoSubmit,
  maxWarnings = 2,
  isActive = true,
  hackathonId = null,
  onHackathonEnded = null
}) => {
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [hackathonEndTime, setHackathonEndTime] = useState(null);
  const [isHackathonEnded, setIsHackathonEnded] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const warningTimeoutRef = useRef(null);
  
  // Fetch hackathon end time
  useEffect(() => {
    const fetchHackathonEndTime = async () => {
      if (!hackathonId) return;
      
      try {
        // For now, using mock data since the actual database schema isn't fully implemented
        // In a real implementation, you would query the hackathons table
        const mockHackathons = [
          {
            id: 1,
            end_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
          },
          {
            id: 2,
            end_at: new Date(Date.now() + 1000 * 60 * 60 * 1).toISOString(), // 1 hour from now
          },
          {
            id: 3,
            end_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(), // 9 days ago
          },
        ];
        
        const hackathon = mockHackathons.find(h => h.id.toString() === hackathonId.toString());
        if (hackathon) {
          setHackathonEndTime(new Date(hackathon.end_at));
        }
        
        // TODO: Replace with actual Supabase query when database schema is ready
        // const { data, error } = await supabase
        //   .from('hackathons')
        //   .select('end_at')
        //   .eq('id', hackathonId)
        //   .single();
        // 
        // if (error) throw error;
        // setHackathonEndTime(new Date(data.end_at));
        
      } catch (error) {
        console.error('Failed to fetch hackathon end time:', error);
      }
    };

    fetchHackathonEndTime();
  }, [hackathonId]);

  // Check if hackathon has ended
  useEffect(() => {
    if (!hackathonEndTime) return;

    const checkHackathonEnd = () => {
      const now = new Date();
      if (now >= hackathonEndTime && !isHackathonEnded) {
        setIsHackathonEnded(true);
        setSecurityMessage("âš ï¸ Hackathon has ended. Submissions are now locked.");
        if (onHackathonEnded && typeof onHackathonEnded === 'function') {
          onHackathonEnded();
        }
      }
    };

    checkHackathonEnd();
    const interval = setInterval(checkHackathonEnd, 1000); // Check every second

    return () => clearInterval(interval);
  }, [hackathonEndTime, isHackathonEnded, onHackathonEnded]);

  // Handle tab visibility changes
  useEffect(() => {
    if (!isActive || isHackathonEnded) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false);
        setTabSwitchWarnings(prev => {
          const newCount = prev + 1;
          
          // Clear any existing warning timeout
          if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
          }
          
          // Call warning callback
          if (onWarning && typeof onWarning === 'function') {
            onWarning(newCount, maxWarnings);
          }
          
          // Set warning message
          setSecurityMessage(`âš ï¸ Tab switching detected! Warning ${newCount}/${maxWarnings}. Your submission will be auto-submitted if you continue.`);
          
          // Auto-submit after max warnings
          if (newCount >= maxWarnings) {
            setSecurityMessage("ðŸš¨ Too many tab switches detected! Auto-submitting your work...");
            if (onAutoSubmit && typeof onAutoSubmit === 'function') {
              onAutoSubmit();
            }
          } else {
            // Clear warning message after 5 seconds
            warningTimeoutRef.current = setTimeout(() => {
              setSecurityMessage("");
            }, 5000);
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
        
        // Clear any existing warning timeout
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        
        // Call warning callback
        if (onWarning && typeof onWarning === 'function') {
          onWarning(newCount, maxWarnings);
        }
        
        // Set warning message
        setSecurityMessage(`âš ï¸ Window switching detected! Warning ${newCount}/${maxWarnings}. Your submission will be auto-submitted if you continue.`);
        
        // Auto-submit after max warnings
        if (newCount >= maxWarnings) {
          setSecurityMessage("ðŸš¨ Too many window switches detected! Auto-submitting your work...");
          if (onAutoSubmit && typeof onAutoSubmit === 'function') {
            onAutoSubmit();
          }
        } else {
          // Clear warning message after 5 seconds
          warningTimeoutRef.current = setTimeout(() => {
            setSecurityMessage("");
          }, 5000);
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
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isActive, maxWarnings, onWarning, onAutoSubmit, isHackathonEnded]);

  // Prevent right-click
  useEffect(() => {
    if (!isActive || isHackathonEnded) return;
    
    const preventRightClick = (e) => {
      e.preventDefault();
      setSecurityMessage("âš ï¸ Right-click is disabled in hackathon mode.");
      setTimeout(() => setSecurityMessage(""), 3000);
      return false;
    };
    
    document.addEventListener('contextmenu', preventRightClick);
    
    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
    };
  }, [isActive, isHackathonEnded]);

  // Prevent dev tools shortcuts
  useEffect(() => {
    if (!isActive || isHackathonEnded) return;
    
    const preventDevTools = (e) => {
      // Prevent F12
      if (e.keyCode === 123) {
        e.preventDefault();
        setSecurityMessage("âš ï¸ Developer tools are disabled in hackathon mode.");
        setTimeout(() => setSecurityMessage(""), 3000);
        return false;
      }
      
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        setSecurityMessage("âš ï¸ Developer tools are disabled in hackathon mode.");
        setTimeout(() => setSecurityMessage(""), 3000);
        return false;
      }
    };
    
    document.addEventListener('keydown', preventDevTools);
    
    return () => {
      document.removeEventListener('keydown', preventDevTools);
    };
  }, [isActive, isHackathonEnded]);

  // Prevent copy/paste shortcuts
  useEffect(() => {
    if (!isActive || isHackathonEnded) return;
    
    const preventCopyPaste = (e) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 88)) {
        e.preventDefault();
        setSecurityMessage("âš ï¸ Copy/paste is disabled in hackathon mode.");
        setTimeout(() => setSecurityMessage(""), 3000);
        return false;
      }
      
      // Prevent Ctrl+Insert, Shift+Insert
      if ((e.ctrlKey && e.keyCode === 45) || (e.shiftKey && e.keyCode === 45)) {
        e.preventDefault();
        setSecurityMessage("âš ï¸ Copy/paste is disabled in hackathon mode.");
        setTimeout(() => setSecurityMessage(""), 3000);
        return false;
      }
    };
    
    document.addEventListener('keydown', preventCopyPaste);
    
    return () => {
      document.removeEventListener('keydown', preventCopyPaste);
    };
  }, [isActive, isHackathonEnded]);

  // Prevent drag and drop
  useEffect(() => {
    if (!isActive || isHackathonEnded) return;
    
    const preventDragDrop = (e) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('dragstart', preventDragDrop);
    document.addEventListener('drop', preventDragDrop);
    document.addEventListener('dragover', preventDragDrop);
    
    return () => {
      document.removeEventListener('dragstart', preventDragDrop);
      document.removeEventListener('drop', preventDragDrop);
      document.removeEventListener('dragover', preventDragDrop);
    };
  }, [isActive, isHackathonEnded]);

  return {
    tabSwitchWarnings,
    isTabVisible,
    isHackathonEnded,
    securityMessage,
    resetWarnings: () => setTabSwitchWarnings(0),
    clearSecurityMessage: () => setSecurityMessage("")
  };
};

export default useHackathonSecurity;
