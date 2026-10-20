import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Earlier builds runtime-cached Supabase API responses (incl. signed-in data)
// in this Cache Storage bucket. The service worker no longer does; purge any
// copy left on devices that ran an old version.
if ('caches' in window) {
  caches.delete('supabase-api').catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
