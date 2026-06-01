import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-soot text-white/30">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-20 lg:py-24">
        <div className="flex flex-col lg:flex-row justify-between gap-16">
          <div className="max-w-xs">
            <Link to="/" className="font-display font-bold text-sm tracking-[8px] text-white/70 uppercase">
              Dashu
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/25">
              Cuidado facial premium para el hombre contemporáneo. Formulado en Corea.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 lg:gap-20">
            <div>
              <p className="text-[11px] tracking-[0.15em] uppercase text-white/40 mb-5 font-medium">Navegación</p>
              <div className="flex flex-col gap-3">
                <Link to="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">Inicio</Link>
                <a href="/#producto" className="text-sm text-white/40 hover:text-white/70 transition-colors">Producto</a>
                <a href="/#como-usar" className="text-sm text-white/40 hover:text-white/70 transition-colors">Cómo Usar</a>
                <Link to="/tracking" className="text-sm text-white/40 hover:text-white/70 transition-colors">Tracking</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.15em] uppercase text-white/40 mb-5 font-medium">Contacto</p>
              <div className="flex flex-col gap-3 text-sm text-white/40">
                <span>hola@dashu.cl</span>
                <span>Santiago, Chile</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/20">
          <p>© {new Date().getFullYear()} Dashu For Men</p>
          <p>Hecho a mano en Chile</p>
        </div>
      </div>
    </footer>
  )
}
