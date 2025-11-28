import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { AlertProvider } from './contexts/alertContext.tsx'
import { AuthProvider } from './contexts/authContext.tsx'
import { JackpotProvider } from './contexts/jackpotContext.tsx'
import { CartProvider } from './contexts/cartContext.tsx'
import { CheckoutDialogProvider } from './contexts/CheckoutDialogContext.tsx'
import Alert from './components/alert/alert.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AlertProvider>
        <Alert />
        <AuthProvider>
          <CartProvider>
            <JackpotProvider>
              <CheckoutDialogProvider>
                <App />
              </CheckoutDialogProvider>
            </JackpotProvider>
          </CartProvider>
        </AuthProvider>
      </AlertProvider>
    </BrowserRouter>
  </StrictMode>,
)


