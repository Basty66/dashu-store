// Variantes livianas de las fotos del sitio (generadas al optimizarlas):
// /img/resultados/x.webp -> x-480.webp (480 px) + x.webp (960 px)
// /img/antes.webp        -> antes-800.webp (800 px) + antes.webp (1408 px)
const VARIANTS = [
  { test: /^\/img\/resultados\/[\w-]+\.webp$/, small: 480, large: 960 },
  { test: /^\/img\/(antes|despues)\.webp$/, small: 800, large: 1408 },
]

const variant = (src) => VARIANTS.find((v) => v.test.test(src))

export function imageSrcSet(src) {
  const v = variant(src)
  return v ? `${src.replace(/\.webp$/, `-${v.small}.webp`)} ${v.small}w, ${src} ${v.large}w` : undefined
}

// Versión chica cuando existe (miniaturas, tarjetas del carrusel).
export function smallImage(src) {
  const v = variant(src)
  return v ? src.replace(/\.webp$/, `-${v.small}.webp`) : src
}
