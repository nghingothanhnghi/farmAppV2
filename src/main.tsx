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
import { PostProvider } from './contexts/postContext.tsx'
import { ThemeProvider } from './contexts/themeContext.tsx'
import { PlantBatchProvider } from './contexts/plantBatchContext.tsx'
import Alert from './components/alert/alert.tsx'
import "./i18n";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AlertProvider>
            <Alert />
            <PlantBatchProvider>
              <CartProvider>
                <WishlistProvider>
                  <JackpotProvider>
                    <CheckoutDialogProvider>
                      <ProductProvider>
                        <PostProvider>
                          <App />
                        </PostProvider>
                      </ProductProvider>
                    </CheckoutDialogProvider>
                  </JackpotProvider>
                </WishlistProvider>
              </CartProvider>
            </PlantBatchProvider>
          </AlertProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)


