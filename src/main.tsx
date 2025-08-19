

// src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async' // <-- 1. Import this

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider> {/* <-- 2. Add this wrapper */}
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)