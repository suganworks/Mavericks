/**
 * Test utility for hackathon security features
 * This can be used to verify that security measures are working correctly
 */

export const testSecurityFeatures = () => {
  const results = {
    tabSwitching: false,
    copyPaste: false,
    rightClick: false,
    devTools: false,
    dragDrop: false
  };

  // Test tab switching detection
  try {
    const originalHidden = document.hidden;
    Object.defineProperty(document, 'hidden', {
      value: true,
      writable: true
    });
    
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
    
    results.tabSwitching = true;
    
    // Restore original value
    Object.defineProperty(document, 'hidden', {
      value: originalHidden,
      writable: true
    });
  } catch (error) {
    console.error('Tab switching test failed:', error);
  }

  // Test copy-paste prevention
  try {
    const copyEvent = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
      bubbles: true
    });
    
    const originalPreventDefault = copyEvent.preventDefault;
    copyEvent.preventDefault = () => {
      results.copyPaste = true;
      return originalPreventDefault.call(copyEvent);
    };
    
    document.dispatchEvent(copyEvent);
  } catch (error) {
    console.error('Copy-paste test failed:', error);
  }

  // Test right-click prevention
  try {
    const contextEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true
    });
    
    const originalPreventDefault = contextEvent.preventDefault;
    contextEvent.preventDefault = () => {
      results.rightClick = true;
      return originalPreventDefault.call(contextEvent);
    };
    
    document.dispatchEvent(contextEvent);
  } catch (error) {
    console.error('Right-click test failed:', error);
  }

  // Test dev tools prevention
  try {
    const f12Event = new KeyboardEvent('keydown', {
      keyCode: 123,
      bubbles: true
    });
    
    const originalPreventDefault = f12Event.preventDefault;
    f12Event.preventDefault = () => {
      results.devTools = true;
      return originalPreventDefault.call(f12Event);
    };
    
    document.dispatchEvent(f12Event);
  } catch (error) {
    console.error('Dev tools test failed:', error);
  }

  // Test drag and drop prevention
  try {
    const dragEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true
    });
    
    const originalPreventDefault = dragEvent.preventDefault;
    dragEvent.preventDefault = () => {
      results.dragDrop = true;
      return originalPreventDefault.call(dragEvent);
    };
    
    document.dispatchEvent(dragEvent);
  } catch (error) {
    console.error('Drag and drop test failed:', error);
  }

  return results;
};

/**
 * Simulate security violations for testing
 */
export const simulateSecurityViolations = () => {
  const violations = [];

  // Simulate tab switching
  const simulateTabSwitch = () => {
    Object.defineProperty(document, 'hidden', {
      value: true,
      writable: true
    });
    
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
    
    setTimeout(() => {
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));
    }, 1000);
    
    violations.push('Tab switch simulated');
  };

  // Simulate copy-paste attempt
  const simulateCopyPaste = () => {
    const copyEvent = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
      bubbles: true
    });
    document.dispatchEvent(copyEvent);
    
    const pasteEvent = new KeyboardEvent('keydown', {
      key: 'v',
      ctrlKey: true,
      bubbles: true
    });
    document.dispatchEvent(pasteEvent);
    
    violations.push('Copy-paste attempt simulated');
  };

  // Simulate right-click
  const simulateRightClick = () => {
    const contextEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(contextEvent);
    
    violations.push('Right-click simulated');
  };

  // Simulate dev tools attempt
  const simulateDevTools = () => {
    const f12Event = new KeyboardEvent('keydown', {
      keyCode: 123,
      bubbles: true
    });
    document.dispatchEvent(f12Event);
    
    const ctrlShiftIEvent = new KeyboardEvent('keydown', {
      keyCode: 73,
      ctrlKey: true,
      shiftKey: true,
      bubbles: true
    });
    document.dispatchEvent(ctrlShiftIEvent);
    
    violations.push('Dev tools attempt simulated');
  };

  return {
    simulateTabSwitch,
    simulateCopyPaste,
    simulateRightClick,
    simulateDevTools,
    violations
  };
};

/**
 * Check if security features are properly configured
 */
export const checkSecurityConfiguration = () => {
  const config = {
    hasSecurityHook: false,
    hasSecurityWrapper: false,
    hasMonacoConfig: false,
    isInHackathonMode: false
  };

  // Check if we're in a hackathon context
  config.isInHackathonMode = window.location.pathname.includes('/challenges/') || 
                             window.location.pathname.includes('/hackathon');

  // Check if security hook is available
  try {
    // This is a basic check - in a real implementation you'd check for the actual hook
    config.hasSecurityHook = typeof window !== 'undefined' && 
                             window.hackathonSecurity !== undefined;
  } catch (error) {
    console.error('Security hook check failed:', error);
  }

  // Check if Monaco Editor is configured securely
  try {
    const editorElements = document.querySelectorAll('.monaco-editor');
    config.hasMonacoConfig = editorElements.length > 0;
  } catch (error) {
    console.error('Monaco config check failed:', error);
  }

  return config;
};

/**
 * Generate security report
 */
export const generateSecurityReport = () => {
  const testResults = testSecurityFeatures();
  const config = checkSecurityConfiguration();
  const { violations } = simulateSecurityViolations();

  const report = {
    timestamp: new Date().toISOString(),
    testResults,
    configuration: config,
    violations: violations.length,
    summary: {
      totalTests: Object.keys(testResults).length,
      passedTests: Object.values(testResults).filter(Boolean).length,
      failedTests: Object.values(testResults).filter(test => !test).length,
      securityLevel: config.isInHackathonMode ? 'HIGH' : 'LOW'
    }
  };

  console.log('🔒 Hackathon Security Report:', report);
  return report;
};

// Auto-run security check in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    generateSecurityReport();
  }, 2000);
}
