/** Design tokens de DASHU STORE. Cambiar la estética completa desde aquí. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220',
        navy: { DEFAULT: '#131D33', 700: '#1B2A47', 600: '#26395E' },
        bone: '#F4EFE7',
        paper: '#FBF8F3',
        sand: { DEFAULT: '#E6DDCE', 300: '#D6CAB6' },
        gold: { DEFAULT: '#C3A06A', light: '#DCC296', deep: '#7A5C30' },
        muted: '#5A6072',
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
