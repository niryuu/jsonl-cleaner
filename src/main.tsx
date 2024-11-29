import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DataCleaningApp from './DataCleaningApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataCleaningApp />
  </StrictMode>,
)
