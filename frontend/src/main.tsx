import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GeneralProvider } from './context/GeneralContext.tsx'

createRoot(document.getElementById('root')!).render(
  <GeneralProvider>
    <App />
  </GeneralProvider>
)