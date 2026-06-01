import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-baseline gap-1.5 mb-5">
              <span className="font-display font-bold text-lg tracking-[6px] text-white">DASHU</span>
              <span className="font-body text-[7px] tracking-[8px] text-white/40 uppercase">For Men</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/40 max-w-xs">
              Arquitectura para tu grooming. Cuidado facial premium para el hombre moderno.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-white/80 mb-5 uppercase tracking-wider">
              Navegación
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm hover:text-white transition-colors">Inicio</Link>
              <a href="/#producto" className="text-sm hover:text-white transition-colors">Producto</a>
              <a href="/#como-usar" className="text-sm hover:text-white transition-colors">Cómo Usar</a>
              <Link to="/tracking" className="text-sm hover:text-white transition-colors">Tracking</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-white/80 mb-5 uppercase tracking-wider">
              Legal
            </h4>
            <div className="flex flex-col gap-3">
              <span className="text-sm text-white/40 cursor-not-allowed">Términos y Condiciones</span>
              <span className="text-sm text-white/40 cursor-not-allowed">Política de Privacidad</span>
              <span className="text-sm text-white/40 cursor-not-allowed">Devoluciones</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-white/80 mb-5 uppercase tracking-wider">
              Contacto
            </h4>
            <div className="flex flex-col gap-3 text-sm text-white/40">
              <span>hola@dashu.cl</span>
              <span>Santiago, Chile</span>
              <div className="flex gap-4 mt-2">
                <a href="#" className="hover:text-white transition-colors text-sm">
                  IG
                </a>
                <a href="#" className="hover:text-white transition-colors text-sm">
                  TK
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="divider opacity-10 my-10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} DASHU FOR MEN. Todos los derechos reservados.</p>
          <p>Diseñado con dedicación en Santiago, Chile</p>
        </div>
      </div>
    </footer>
  )
}
