import { Component, Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useStoreConfig } from './store/storeConfig'
import { StoreLayout } from './components/templates/StoreLayout'
import { Button } from './components/atoms/Button'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductPage from './pages/ProductPage'
import NotFound from './pages/NotFound'

const Checkout = lazy(() => import('./pages/Checkout'))
const OrderPage = lazy(() => import('./pages/OrderPage'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))
const Contact = lazy(() => import('./pages/Contact'))
const Terms = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Terms })))
const Privacy = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Privacy })))
const Returns = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Returns })))

const Seminars = lazy(() => import('./pages/Seminars'))
const SeminarPage = lazy(() => import('./pages/SeminarPage'))
const EnrollmentPage = lazy(() => import('./pages/EnrollmentPage'))
const Distributors = lazy(() => import('./pages/Distributors'))
const MockPayment = lazy(() => import('./pages/MockPayment'))
const CardDemo = lazy(() => import('./pages/CardDemo'))
const AdminApp = lazy(() => import('./pages/admin/AdminApp'))

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('Error de interfaz', error, info)
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bone p-6 text-center">
        <p className="display-md">Algo salió mal</p>
        <p className="max-w-sm text-muted">Tuvimos un problema al mostrar esta página. Tu carrito sigue guardado.</p>
        <Button onClick={() => window.location.reload()}>Recargar</Button>
      </div>
    )
  }
}

function LegacyOrderRedirect() {
  const { orderNumber } = useParams()
  return <Navigate to={`/seguimiento?pedido=${orderNumber}`} replace />
}

const Loading = () => <div className="min-h-[50vh]" aria-busy="true" />

export default function App() {
  // Ajustes de la tienda (envíos, distribuidores, anuncios, redes) desde Admin → Ajustes.
  useEffect(() => {
    void useStoreConfig.getState().load()
  }, [])
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="tienda" element={<Shop />} />
            <Route path="producto/:slug" element={<ProductPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="pedido/:orderNumber" element={<OrderPage />} />
            <Route path="seguimiento" element={<TrackOrder />} />
            <Route path="contacto" element={<Contact />} />
            <Route path="capacitaciones" element={<Seminars />} />
            <Route path="capacitaciones/:slug" element={<SeminarPage />} />
            <Route path="inscripcion/:code" element={<EnrollmentPage />} />
            <Route path="distribuidores" element={<Distributors />} />
            <Route path="terminos" element={<Terms />} />
            <Route path="privacidad" element={<Privacy />} />
            <Route path="devoluciones" element={<Returns />} />
            {import.meta.env.DEV && <Route path="pago-simulado" element={<MockPayment />} />}
            {(import.meta.env.DEV || import.meta.env.VITE_DEMOS) && <Route path="demo/tarjeta" element={<CardDemo />} />}
            <Route path="tracking" element={<Navigate to="/seguimiento" replace />} />
            <Route path="order/:orderNumber" element={<LegacyOrderRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
