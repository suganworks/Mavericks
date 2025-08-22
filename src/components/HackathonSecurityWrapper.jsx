import React from 'react';
import useHackathonSecurity from '../hooks/useHackathonSecurity';

/**
 * Wrapper component that applies hackathon security measures to child components
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {string} props.hackathonId - Hackathon ID for end time validation
 * @param {Function} props.onWarning - Callback for security warnings
 * @param {Function} props.onAutoSubmit - Callback for auto-submission
 * @param {Function} props.onHackathonEnded - Callback when hackathon ends
 * @param {boolean} props.isActive - Whether security is active
 * @returns {React.ReactElement} Wrapped component with security measures
 */
const HackathonSecurityWrapper = ({
  children,
  hackathonId,
  onWarning = null,
  onAutoSubmit = null,
  onHackathonEnded = null,
  isActive = true
}) => {
  const { 
    tabSwitchWarnings, 
    isTabVisible, 
    isHackathonEnded, 
    securityMessage, 
    resetWarnings, 
    clearSecurityMessage 
  } = useHackathonSecurity({
    onWarning,
    onAutoSubmit,
    maxWarnings: 2,
    isActive,
    hackathonId,
    onHackathonEnded
  });

  return (
    <div className="hackathon-security-wrapper">
      {/* Security Status Bar */}
      {isActive && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Hackathon Security Mode</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Tab Switches:</span>
                <span className={`font-mono ${tabSwitchWarnings > 1 ? "text-red-400" : "text-yellow-400"}`}>
                  {tabSwitchWarnings}/2
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                <span className={isTabVisible ? "text-green-400" : "text-red-400"}>
                  {isTabVisible ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isHackathonEnded && (
                <span className="text-red-400 font-semibold">🚨 HACKATHON ENDED</span>
              )}
              <button
                onClick={clearSecurityMessage}
                className="text-gray-400 hover:text-white"
                title="Clear security message"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Message */}
      {securityMessage && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-40 bg-yellow-900/90 border border-yellow-500/50 rounded-lg px-4 py-2 text-yellow-200 text-sm shadow-lg">
          {securityMessage}
        </div>
      )}

      {/* Hackathon Ended Warning */}
      {isHackathonEnded && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-40 bg-red-900/90 border border-red-500/50 rounded-lg px-4 py-2 text-red-200 text-sm shadow-lg">
          🚨 Hackathon has ended. Submissions are now locked.
        </div>
      )}

      {/* Main Content */}
      <div className={isActive ? "pt-12" : ""}>
        {children}
      </div>

      {/* Security Controls (for debugging/development) */}
  {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-40 bg-gray-800 border border-gray-600 rounded-lg p-3 text-xs">
          <div className="text-gray-300 mb-2">Security Debug:</div>
          <div className="space-y-1 text-gray-400">
            <div>Warnings: {tabSwitchWarnings}</div>
            <div>Tab Visible: {isTabVisible ? "Yes" : "No"}</div>
            <div>Hackathon Ended: {isHackathonEnded ? "Yes" : "No"}</div>
            <div>Active: {isActive ? "Yes" : "No"}</div>
          </div>
          <button
            onClick={resetWarnings}
            className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
          >
            Reset Warnings
          </button>
        </div>
      )}
    </div>
  );
};

export default HackathonSecurityWrapper;
