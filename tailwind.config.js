/** Design tokens de DASHU STORE. Cambiar la estética completa desde aquí. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Paleta inspirada en la caja DASHU: negro, café crema, rosado crema y blanco.
      colors: {
        ink: '#171210', // texto y botones principales (negro cálido)
        navy: { DEFAULT: '#110D0B', 700: '#241D19', 600: '#352B26' }, // superficies oscuras (hero, secciones negras)
        bone: '#FBF6F2', // fondo general (blanco crema)
        paper: '#FFFFFF',
        sand: { DEFAULT: '#EEDFD6', 300: '#DFCABF' }, // bordes y divisores
        gold: { DEFAULT: '#C9A27E', light: '#E2C6AB', deep: '#7C5638' }, // café crema (acento)
        blush: { DEFAULT: '#F3DCD2', light: '#FAEEE8', deep: '#B97F6C' }, // rosado crema
        muted: '#6B5E57',
        success: '#1F7A4D',
        danger: '#B42318',
        warning: '#B54708',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.04), 0 8px 24px -12px rgba(11,18,32,0.12)',
        lift: '0 2px 4px rgba(11,18,32,0.04), 0 24px 48px -20px rgba(11,18,32,0.28)',
        drawer: '-24px 0 64px -24px rgba(11,18,32,0.35)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
