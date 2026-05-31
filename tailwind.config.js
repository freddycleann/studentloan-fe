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
          950: 'var(--ink-950)',
          900: 'var(--ink-900)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          600: 'var(--ink-600)',
          500: 'var(--ink-500)',
        },
        gold: {
          50:  'var(--gold-50)',
          100: 'var(--gold-100)',
          200: 'var(--gold-200)',
          300: 'var(--gold-300)',
          400: 'var(--gold-400)',
          500: 'var(--gold-500)',
          600: 'var(--gold-600)',
          700: 'var(--gold-700)',
          800: 'var(--gold-800)',
          900: 'var(--gold-900)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', '"Noto Sans Thai"', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', '"Noto Sans Thai"', 'system-ui', 'sans-serif'],
        thai: ['"Noto Sans Thai"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: 'var(--shadow-gold)',
        'gold-strong': 'var(--shadow-gold-strong)',
        inset_gold: 'var(--shadow-inset-gold)',
      },
      backgroundImage: {
        'gold-gradient': 'var(--bg-gold-gradient)',
        'gold-shine': 'var(--bg-gold-shine)',
        'noise': 'var(--bg-noise)',
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
