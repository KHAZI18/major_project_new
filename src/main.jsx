import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerSW } from 'virtual:pwa-register';
import './index.css'
import App from './App.jsx'

// Extract Google Client ID from environment variables
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

// Clean up any stale service workers from old broken builds so users
// don't get a cached white-screen or unstyled version served to them.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => {
      // If the SW is from a different origin path it's stale — unregister it.
      if (reg.active && !reg.active.scriptURL.includes('/sw.js')) {
        reg.unregister();
      }
    });
  });
}

registerSW({
  immediate: true,
  onNeedRefresh() {
    // New content available — reload automatically (skipWaiting handles activation)
    window.location.reload();
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
