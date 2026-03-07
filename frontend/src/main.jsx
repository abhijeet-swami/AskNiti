import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import { VoiceProvider } from './context/VoiceContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <VoiceProvider>
        <App />
      </VoiceProvider>
    </ThemeProvider>
  </StrictMode>,
)
