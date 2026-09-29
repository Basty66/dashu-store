import { motion } from 'framer-motion'
import { SectionHeading } from '../molecules/SectionHeading'

const tile = 'relative overflow-hidden rounded-4xl'
const appear = (i) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
})

// Recorte ampliado de la foto del producto para mostrar detalles (etiqueta, tapa, textura).
function Crop({ image, size, position, label, className = '', i }) {
  return (
    <motion.figure {...appear(i)} className={`${tile} group bg-navy ${className}`}>
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${image})`, backgroundSize: size, backgroundPosition: position }}
        role="img"
        aria-label={label}
      />
      <figcaption className="absolute bottom-4 left-4 rounded-full bg-ink/50 px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.14em] text-paper backdrop-blur-md">
        {label}
      </figcaption>
    </motion.figure>
  )
}

function Stat({ value, label, tone = 'paper', className = '', i }) {
  const tones = {
    paper: 'bg-paper text-ink border border-sand',
    gold: 'bg-gold text-ink',
    ink: 'bg-ink text-paper',
  }
  return (
    <motion.div {...appear(i)} className={`${tile} flex flex-col justify-between p-6 ${tones[tone]} ${className}`}>
      <p className="font-display text-5xl font-black leading-none lg:text-6xl" style={{ fontStretch: '120%' }}>{value}</p>
      <p className={`max-w-[16rem] text-sm leading-snug ${tone === 'ink' ? 'text-paper/65' : 'text-ink/70'}`}>{label}</p>
    </motion.div>
  )
}

export function Bento({ product }) {
  const image = product?.images?.[0] || '/img/product-hero.webp'
  const ingredients = (product?.ingredients || '')
    .split(',')
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))

  return (
    <section id="detalle" className="py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="En detalle" title="Pensada para el pelo que no obedece" description="Una fórmula de origen coreano que alisa sin calor y cuida la fibra mientras actúa." />
        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-6 lg:auto-rows-[200px]">
          <motion.figure {...appear(0)} className={`${tile} col-span-2 row-span-2 bg-navy md:col-span-3`}>
            <img src={image} alt={product?.title || 'Producto'} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]" />
          </motion.figure>
          <Stat i={1} value="10’" label="De aplicación. En casa o en la barbería, sin herramientas." className="col-span-1 md:col-span-2" />
          <Stat i={2} value="0°" label="Sin plancha ni secador caliente." tone="gold" className="col-span-1" />
          <Crop i={3} image={image} size="300%" position="50% 34%" label="Fórmula coreana" className="col-span-1 md:col-span-2" />
          <Stat i={4} value="3–4" label="Semanas de pelo lateral disciplinado." tone="ink" className="col-span-1" />
          <Crop i={5} image={image} size="340%" position="58% 88%" label="Textura en crema" className="col-span-1 md:col-span-2" />
          <motion.div {...appear(6)} className={`${tile} col-span-2 flex flex-col justify-between border border-sand bg-paper p-6 md:col-span-4`}>
            <p className="eyebrow text-gold-deep">Ingredientes destacados</p>
            <ul className="flex flex-wrap gap-2">
              {(ingredients.length ? ingredients : ['Cysteamine', 'Proteína de seda', 'Proteína de arroz', 'Aceite de baobab']).map((name) => (
                <li key={name} className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm">{name}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
