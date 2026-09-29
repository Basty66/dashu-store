import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSeo } from '../hooks/useSeo'
import { Button } from '../components/atoms/Button'
import { CombGame } from '../components/organisms/CombGame'

export default function NotFound() {
  const [done, setDone] = useState(false)
  useSeo({ title: 'Página no encontrada' })
  return (
    <div className="relative overflow-hidden py-14 lg:py-20">
      <p aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-6 select-none text-center font-display font-black leading-none text-ink/[0.05]" style={{ fontSize: 'clamp(10rem, 34vw, 26rem)', fontStretch: '125%' }}>
        404
      </p>
      <div className="container-x relative grid items-center gap-10 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <p className="eyebrow text-gold-deep">Error 404</p>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="display-lg mt-3">¡Quedó impecable!</h1>
                <p className="mt-4 text-lg text-muted">Lo que hiciste en 10 segundos, DASHU Down Permanent lo hace en 10 minutos y dura semanas. La página igual no existe, pero tu pelo puede quedar así.</p>
              </motion.div>
            ) : (
              <motion.div key="play" exit={{ opacity: 0, y: -12 }}>
                <h1 className="display-lg mt-3">Esta página se despeinó</h1>
                <p className="mt-4 text-lg text-muted">No encontramos lo que buscabas. Mientras tanto, pasa el cursor (o el dedo) por el pelo y deja a este erizo bien peinado.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button to="/#comprar" variant={done ? 'gold' : 'primary'}>{done ? 'Quiero ese resultado' : 'Ir a la tienda'}</Button>
            <Button variant="secondary" to="/seguimiento">Seguir un pedido</Button>
          </div>
        </div>
        <CombGame onDone={() => setDone(true)} />
      </div>
    </div>
  )
}
