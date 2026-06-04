import { useState } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import CartFly from './components/CartFly'
import WhatsAppButton from './components/WhatsAppButton'
import SplashScreen from './components/SplashScreen'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Returns from './pages/Returns'
import Contact from './pages/Contact'
import ProductDetail from './pages/ProductDetail'
import { Home as HomeIcon } from 'lucide-react'

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
      {children}
    </motion.div>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const location = useLocation()

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <CartFly />
      <WhatsAppButton />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<OrderTracking />} />
              <Route path="/checkout/failure" element={<Checkout />} />
              <Route path="/checkout/pending" element={<OrderTracking />} />
              <Route path="/order/:orderNumber" element={<OrderTracking />} />
              <Route path="/tracking" element={<OrderTracking />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/terminos" element={<Terms />} />
              <Route path="/privacidad" element={<Privacy />} />
              <Route path="/devoluciones" element={<Returns />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="*" element={
                <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <p className="text-6xl font-black text-navy opacity-10">404</p>
                    <h1 className="text-xl font-bold text-navy">Página no encontrada</h1>
                    <p className="text-sm text-stone">La página que buscas no existe o fue movida.</p>
                    <Link to="/" className="btn-primary inline-flex items-center gap-2 text-sm mt-4">
                      <HomeIcon size={14} /> Volver al Inicio
                    </Link>
                  </motion.div>
                </div>
              } />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
