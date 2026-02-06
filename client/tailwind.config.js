/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#047857',
          light: '#d1fae5',
          dark: '#064e3b',
        },
        accent: {
          yellow: '#f59e0b',
          amber: '#fbbf24',
        },
      },
      boxShadow: {
        agri: '0 4px 20px -4px rgba(5, 150, 105, 0.15), 0 0 0 1px rgba(5, 150, 105, 0.06)',
        'agri-lg': '0 20px 40px -12px rgba(5, 150, 105, 0.2), 0 0 0 1px rgba(5, 150, 105, 0.08)',
      },
    },
  },
  plugins: [],
}
