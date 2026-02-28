/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A2A43',
        orange: '#F27A21',
        neutral: '#F4F6F8',
      },
    },
  },
  plugins: [],
}
