# Hackathon Security Features

This document outlines the security measures implemented for hackathon environment controls to ensure fairness and prevent cheating.

## Overview

The hackathon security system provides comprehensive protection against common cheating methods while maintaining a smooth user experience for legitimate participants.

## Security Features

### 1. Tab Switching Detection & Auto-Submit
- **Feature**: Monitors when users switch tabs or windows
- **Limit**: 2 warnings before auto-submission
- **Action**: Automatically submits the current assessment after 2 violations
- **Implementation**: Uses `document.visibilitychange` and `window.blur` events

### 2. Copy-Paste Prevention
- **Monaco Editor**: All copy-paste shortcuts are disabled
- **Keyboard Shortcuts**: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Insert, Shift+Insert
- **Context Menu**: Right-click context menu is disabled
- **Drag & Drop**: File drag and drop is prevented

### 3. Right-Click Prevention
- **Global**: Right-click is disabled throughout the hackathon interface
- **MCQ Section**: Text selection is prevented with `select-none` CSS class
- **Editor**: Context menu is completely disabled in Monaco Editor

### 4. Developer Tools Blocking
- **F12**: Function key F12 is blocked
- **Shortcuts**: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C are blocked
- **Feedback**: Users receive warning messages when attempting to use dev tools

### 5. Hackathon End Time Validation
- **Feature**: Validates hackathon end times against current time
- **Action**: Locks submissions after hackathon end time
- **Auto-Submit**: Automatically submits work when hackathon ends
- **Database**: Integrates with hackathon database schema

### 6. Additional Security Measures
- **Undo/Redo**: Disabled in code editor
- **Find/Replace**: Disabled in code editor
- **Select All**: Disabled in code editor
- **Save/Print**: Disabled in code editor
- **Multi-cursor**: Disabled in code editor
- **Auto-completion**: Disabled in code editor

## Components

### useHackathonSecurity Hook
```javascript
const { 
  tabSwitchWarnings, 
  isTabVisible, 
  isHackathonEnded, 
  securityMessage, 
  resetWarnings, 
  clearSecurityMessage 
} = useHackathonSecurity({
  onWarning: (warningCount, maxWarnings) => { /* handle warning */ },
  onAutoSubmit: () => { /* handle auto-submit */ },
  maxWarnings: 2,
  isActive: true,
  hackathonId: "hackathon-id",
  onHackathonEnded: () => { /* handle hackathon end */ }
});
```

### HackathonSecurityWrapper Component
```javascript
<HackathonSecurityWrapper
  hackathonId={hackathonId}
  onWarning={handleWarning}
  onAutoSubmit={handleAutoSubmit}
  onHackathonEnded={handleHackathonEnded}
  isActive={true}
>
  {/* Your hackathon content */}
</HackathonSecurityWrapper>
```

### Monaco Editor Security Configuration
```javascript
import { configureMonacoSecurity, getHackathonMonacoOptions } from '../utils/monacoSecurityConfig';

// In editor onMount
configureMonacoSecurity(editor, (violation) => {
  console.log(`Security violation: ${violation}`);
});

// Use secure options
<Editor options={getHackathonMonacoOptions()} />
```

## Implementation Details

### Security Status Bar
- Fixed position at top of screen
- Shows current security status
- Displays tab switch warnings
- Shows hackathon end status
- Provides clear button for messages

### Warning System
- Visual warnings with color-coded messages
- Automatic message clearing after 5 seconds
- Persistent status indicators
- Development mode debug panel

### Database Integration
- Fetches hackathon end times from database
- Validates against current server time
- Handles timezone differences
- Graceful fallback for missing data

## Usage Examples

### Basic Implementation
```javascript
import HackathonSecurityWrapper from '../components/HackathonSecurityWrapper';

function MyHackathonPage() {
  return (
    <HackathonSecurityWrapper
      hackathonId="123"
      onAutoSubmit={() => submitAssessment()}
      isActive={true}
    >
      <div>Your hackathon content here</div>
    </HackathonSecurityWrapper>
  );
}
```

### Custom Warning Handling
```javascript
const handleWarning = (warningCount, maxWarnings) => {
  setMessage(`Warning ${warningCount}/${maxWarnings}: Tab switching detected`);
};

const handleAutoSubmit = () => {
  setMessage("Auto-submitting due to security violations");
  submitAssessment();
};
```

## Configuration Options

### useHackathonSecurity Options
- `maxWarnings`: Number of warnings before auto-submit (default: 2)
- `isActive`: Whether security is enabled (default: true)
- `hackathonId`: Hackathon ID for end time validation
- `onWarning`: Callback for security warnings
- `onAutoSubmit`: Callback for auto-submission
- `onHackathonEnded`: Callback when hackathon ends

### Monaco Editor Options
- `contextmenu`: Disabled
- `quickSuggestions`: Disabled
- `suggestOnTriggerCharacters`: Disabled
- `acceptSuggestionOnEnter`: Off
- `tabCompletion`: Off
- `wordBasedSuggestions`: Disabled
- `parameterHints`: Disabled
- `suggest`: Disabled
- `hover`: Disabled
- `links`: Disabled
- `colorDecorators`: Disabled
- `lightbulb`: Disabled

## Security Considerations

### Limitations
- Client-side security can be bypassed by determined users
- Browser extensions may interfere with security measures
- Network-level monitoring may be required for complete security

### Recommendations
- Implement server-side validation for all submissions
- Use proctoring software for high-stakes events
- Monitor network traffic for suspicious activity
- Implement time-based submission validation
- Use secure browser environments when possible

### Best Practices
- Always validate submissions server-side
- Log all security violations for analysis
- Provide clear feedback to users about security measures
- Test security features thoroughly before deployment
- Have fallback mechanisms for technical issues

## Troubleshooting

### Common Issues
1. **Security not activating**: Check `isActive` prop and hackathon ID
2. **Warnings not showing**: Verify event listeners are properly attached
3. **Auto-submit not working**: Check callback functions are properly defined
4. **Editor security issues**: Ensure Monaco Editor is properly configured

### Debug Mode
In development mode, a debug panel appears in the bottom-right corner showing:
- Current warning count
- Tab visibility status
- Hackathon end status
- Security activation status
- Reset warnings button

## Future Enhancements

### Planned Features
- Screen recording capabilities
- Network activity monitoring
- Advanced proctoring integration
- Real-time admin monitoring
- Automated cheating detection
- Biometric verification options

### Integration Possibilities
- Third-party proctoring services
- Browser extension detection
- Hardware-level security measures
- AI-powered behavior analysis
- Blockchain-based submission verification
