import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Landing from './pages/Landing'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import Admin from './pages/Admin'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fff8f5' }}>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderNumber" element={<OrderTracking />} />
          <Route path="/tracking" element={<OrderTracking />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
