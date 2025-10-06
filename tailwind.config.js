/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amex: {
          blue: '#006FCF',
          gold: '#D4AF37',
          platinum: '#E5E4E2',
          green: '#00853F',
        },
      },
    },
  },
  plugins: [],
}