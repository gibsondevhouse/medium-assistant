/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode for the theme engine
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', 'Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Google Native / Material 3 Baseline
        'surface-100': 'var(--surface-100)',
        'surface-200': 'var(--surface-200)',
        'surface-300': 'var(--surface-300)',
        'surface-800': 'var(--surface-800)', // Darkest
        'surface-900': 'var(--surface-900)',

        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-accent': 'var(--brand-accent)',

        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none', // Allow full width for magazine layout
            color: 'var(--text-primary)',
            a: {
              color: 'var(--brand-primary)',
              '&:hover': {
                color: 'var(--brand-accent)',
              },
            },
            h1: { color: 'var(--text-primary)', fontFamily: 'Merriweather, serif' },
            h2: { color: 'var(--text-primary)', fontFamily: 'Merriweather, serif' },
            h3: { color: 'var(--text-primary)' },
            h4: { color: 'var(--text-primary)' },
            strong: { color: 'var(--text-primary)' },
            code: { color: 'var(--brand-accent)' },
            blockquote: {
              borderLeftColor: 'var(--brand-accent)',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}