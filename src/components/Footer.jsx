import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy text-white/30">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          <div>
            <Link to="/" className="font-display font-bold text-sm tracking-[6px] text-white/80 uppercase">
              DASHU
            </Link>
            <p className="text-xs text-white/25 leading-relaxed mt-4 max-w-xs">
              Cuidado capilar premium coreano para el hombre contemporáneo. Formulado con proteínas de rápida absorción.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-4">Navegación</p>
              <div className="flex flex-col gap-2.5">
                <Link to="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">Inicio</Link>
                <a href="/#producto" className="text-xs text-white/40 hover:text-white/70 transition-colors">Producto</a>
                <a href="/#ritual" className="text-xs text-white/40 hover:text-white/70 transition-colors">Ritual</a>
                <Link to="/tracking" className="text-xs text-white/40 hover:text-white/70 transition-colors">Tracking</Link>
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-4">Contacto</p>
              <div className="flex flex-col gap-2.5 text-xs text-white/40">
                <span>hola@dashufor men.cl</span>
                <span>Santiago, Chile</span>
              </div>
            </div>
            <div className="col-span-2 mt-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mb-3">Métodos de Pago</p>
              <div className="flex items-center gap-3 text-2xl text-white/15">
                <span title="Webpay Plus">W</span>
                <span title="Mercado Pago">MP</span>
                <span title="Visa">V</span>
                <span title="Mastercard">MC</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-white/15">
          <p>© {new Date().getFullYear()} DASHU FOR MEN. Todos los derechos reservados.</p>
          <p>Hecho en Chile 🇨🇱</p>
        </div>
      </div>
    </footer>
  )
}
