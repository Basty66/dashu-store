import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-1 mb-4">
              <span className="font-display font-bold text-xl tracking-[4px] text-white">DASHU</span>
              <span className="font-body text-[8px] tracking-[6px] text-white/60 mt-3">FOR MEN</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Arquitectura para tu grooming. Productos diseñados para el hombre moderno.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm hover:text-white transition-colors">Inicio</Link>
              <a href="/#producto" className="text-sm hover:text-white transition-colors">Producto</a>
              <a href="/#como-usar" className="text-sm hover:text-white transition-colors">Cómo Usar</a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contacto</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <span>hola@dashu.cl</span>
              <span>Santiago, Chile</span>
              <div className="flex gap-3 mt-2">
                <a href="#" className="hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">instagram</span>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">tiktok</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/40">
          &copy; {new Date().getFullYear()} DASHU FOR MEN. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
