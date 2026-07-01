/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Manrope"', '"Inter"', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0F1C18',
          light: '#16261F',
          lighter: '#1E332B',
        },
        cream: '#FAF6EC',
        gold: {
          DEFAULT: '#C8A24A',
          light: '#E3C572',
          dark: '#9C7C32',
        },
        sage: '#8FA68E',
        rose: '#C16E5A',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(15, 28, 24, 0.08)',
        card: '0 8px 30px rgba(15, 28, 24, 0.12)',
      },
    },
  },
  plugins: [],
}

