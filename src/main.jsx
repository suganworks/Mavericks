import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'

console.log('Main.jsx: Starting application...');

try {
  const rootElement = document.getElementById('root');
  console.log('Main.jsx: Root element found:', !!rootElement);
  
  if (rootElement) {
    const root = createRoot(rootElement);
    console.log('Main.jsx: React root created');
    
    root.render(
      <StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StrictMode>
    );
    console.log('Main.jsx: App rendered');
  } else {
    console.error('Main.jsx: Root element not found!');
  }
} catch (error) {
  console.error('Main.jsx: Error rendering app:', error);
}
