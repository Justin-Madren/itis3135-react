import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Use the original website stylesheet so the pages match the non-React versions
import './styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
