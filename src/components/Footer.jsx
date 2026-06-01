import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy/95 text-white/25">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div>
            <Link to="/" className="font-display font-bold text-sm tracking-[6px] text-white/70 uppercase">DASHU</Link>
            <p className="text-xs text-white/20 leading-relaxed mt-3 max-w-xs">Cuidado capilar premium coreano para el hombre contemporáneo.</p>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:col-span-2">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium mb-3">Navegación</p>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">Inicio</Link>
                <a href="/#producto" className="text-xs text-white/30 hover:text-white/60 transition-colors">Producto</a>
                <a href="/#ritual" className="text-xs text-white/30 hover:text-white/60 transition-colors">Ritual</a>
                <Link to="/tracking" className="text-xs text-white/30 hover:text-white/60 transition-colors">Tracking</Link>
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium mb-3">Contacto</p>
              <div className="flex flex-col gap-2 text-xs text-white/30">
                <span>hola@dashuformen.cl</span>
                <span>Santiago, Chile</span>
              </div>
              <div className="flex items-center gap-3 mt-4 text-white/15">
                <span className="text-[11px] font-medium tracking-wide">Webpay</span>
                <span className="text-[11px] font-medium tracking-wide">MP</span>
                <span className="text-[11px] font-medium tracking-wide">Visa</span>
                <span className="text-[11px] font-medium tracking-wide">MC</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-white/12">
          <p>© {new Date().getFullYear()} DASHU FOR MEN</p>
          <p>Hecho en Chile</p>
        </div>
      </div>
    </footer>
  )
}
