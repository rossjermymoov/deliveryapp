/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kalsi: {
          blue: '#005696',
          dark: '#003366',
          orange: '#FF6B00',
          yellow: '#FFB800',
          light: '#F4F7FB'
        }
      }
    },
  },
  plugins: [],
}
