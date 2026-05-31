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
          950: 'rgb(var(--ink-950) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
        },
        gold: {
          50:  'rgb(var(--gold-50) / <alpha-value>)',
          100: 'rgb(var(--gold-100) / <alpha-value>)',
          200: 'rgb(var(--gold-200) / <alpha-value>)',
          300: 'rgb(var(--gold-300) / <alpha-value>)',
          400: 'rgb(var(--gold-400) / <alpha-value>)',
          500: 'rgb(var(--gold-500) / <alpha-value>)',
          600: 'rgb(var(--gold-600) / <alpha-value>)',
          700: 'rgb(var(--gold-700) / <alpha-value>)',
          800: 'rgb(var(--gold-800) / <alpha-value>)',
          900: 'rgb(var(--gold-900) / <alpha-value>)',
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
