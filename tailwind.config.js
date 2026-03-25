/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['"Noto Sans Georgian"',  'sans-serif'],
        serif: ['"Noto Serif Georgian"', 'serif'],
      },
      colors: {
        brand: {
          light:   '#f3f2ff',
          pale:    '#e9e7ff',
          DEFAULT: '#9B91FF',
          dark:    '#7b6ff0',
        },
        accent: {
          light:   '#fffef0',
          pale:    '#fff9c2',
          DEFAULT: '#FFDB00',
          dark:    '#e6c500',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                           to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
