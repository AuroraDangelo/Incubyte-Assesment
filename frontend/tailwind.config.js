/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: '#17201D',
        concrete: '#E8EBE8',
        paper: '#F7F8F6',
        racing: { DEFAULT: '#0E5A45', dark: '#0A3F31', light: '#D5E6DF' },
        plate: '#F4C430',
        brake: '#B3261E',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
