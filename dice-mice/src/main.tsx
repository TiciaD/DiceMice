import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameDataProvider } from './context/GameDataContext.tsx'
import { BrowserRouter } from 'react-router-dom'
import { UserDataProvider } from './context/UserDataProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <UserDataProvider>
        <GameDataProvider>
          <App />
        </GameDataProvider>
      </UserDataProvider>
    </BrowserRouter>
  </StrictMode>,
)
