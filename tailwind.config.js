/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0b0c0e',
          900: '#111216',
          850: '#16171c',
          800: '#1c1e24',
          700: '#272a33',
        },
        surface: {
          50: '#fafafd',
          100: '#f4f5f8',
          200: '#ebecee',
        },
        lime: {
          accent: '#d7ff3b',
          accentHover: '#c8f526',
          accentDark: '#0e1005',
        }
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '26px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
