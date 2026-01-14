import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { AlertProvider } from './contexts/alertContext.tsx'
import { AuthProvider } from './contexts/authContext.tsx'
import { JackpotProvider } from './contexts/jackpotContext.tsx'
import { CartProvider } from './contexts/cartContext.tsx'
import { WishlistProvider } from './contexts/wishlistContext.tsx'
import { CheckoutDialogProvider } from './contexts/checkoutDialogContext.tsx'
import { ProductProvider } from './contexts/productContext.tsx'
import { ThemeProvider } from './contexts/themeContext.tsx'
import Alert from './components/alert/alert.tsx'
import "./i18n";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AlertProvider>
          <Alert />
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <JackpotProvider>
                  <CheckoutDialogProvider>
                    <ProductProvider>
                      <App />
                    </ProductProvider>
                  </CheckoutDialogProvider>
                </JackpotProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </AlertProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)


