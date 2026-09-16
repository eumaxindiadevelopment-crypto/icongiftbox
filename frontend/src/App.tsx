import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import { CurrencyProvider } from './context/CurrencyContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-autoplay.css";
import "lightgallery/css/lg-fullscreen.css";
import "lightgallery/css/lg-share.css";
import "lightgallery/css/lg-zoom.css";


import './assets/vendor/swiper/swiper-bundle.min.css'
import './assets/css/style.css'
import './assets/css/skin/skin-1.css'


//router
import Index from './router/Index'

function App() {
  return (
    <CurrencyProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <BrowserRouter basename='/'>
            <Index />
            <ToastContainer position="bottom-right" autoClose={2000} newestOnTop />
          </BrowserRouter>
        </CartProvider>
      </CustomerAuthProvider>
    </CurrencyProvider>
  )
}

export default App
