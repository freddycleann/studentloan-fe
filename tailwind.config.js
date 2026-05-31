/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080604',
          900: '#0d0a06',
          800: '#13100a',
          700: '#1c1810',
          600: '#2a2418',
          500: '#3a3220',
        },
        gold: {
          50:  '#fdf7e2',
          100: '#fbeec0',
          200: '#f5dc8a',
          300: '#ecc857',
          400: '#dcb240',
          500: '#c8992a',
          600: '#a87a1c',
          700: '#7e5a14',
          800: '#553c0d',
          900: '#2f2106',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Noto Sans Thai"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Noto Sans Thai"', 'system-ui', 'sans-serif'],
        thai: ['"Noto Sans Thai"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(220,178,64,0.25), 0 10px 40px -10px rgba(220,178,64,0.35)',
        'gold-strong': '0 0 0 1px rgba(220,178,64,0.45), 0 20px 60px -10px rgba(220,178,64,0.55)',
        inset_gold: 'inset 0 1px 0 0 rgba(255,221,140,0.1), inset 0 -1px 0 0 rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gold-gradient':
          'linear-gradient(135deg, #f5dc8a 0%, #dcb240 35%, #a87a1c 70%, #f5dc8a 100%)',
        'gold-shine':
          'linear-gradient(120deg, rgba(245,220,138,0) 30%, rgba(245,220,138,0.6) 50%, rgba(245,220,138,0) 70%)',
        'noise':
          "radial-gradient(circle at 20% 10%, rgba(220,178,64,0.08), transparent 40%), radial-gradient(circle at 80% 90%, rgba(220,178,64,0.06), transparent 45%)",
      },
      animation: {
        shimmer: 'shimmer 6s linear infinite',
        'fade-up': 'fadeUp 0.4s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
