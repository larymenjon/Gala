import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedDemoData } from './seed'

// Carrega dados de demonstração no primeiro acesso (sem backend configurado)
seedDemoData()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
