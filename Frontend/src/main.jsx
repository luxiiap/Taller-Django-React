
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './shared/styles.css'
import App from './app/App'

const contenedorRaiz = document.getElementById('root')

createRoot(contenedorRaiz).render(
  <StrictMode>
    <App />
  </StrictMode>
)
