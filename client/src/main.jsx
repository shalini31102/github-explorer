import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
      ErrorBoundary wraps the entire app.
      Any unexpected crash in any component will be caught
      here and show the fallback UI instead of a white screen.
    */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)