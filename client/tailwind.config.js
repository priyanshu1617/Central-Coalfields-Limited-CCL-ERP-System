/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ccl: {
          primary: '#002D62', // Deep Dark Blue
          accent: '#FF7F32',  // Coal Orange
          navy: '#0b192c',    // Dark Mode Navy
          navyLight: '#1e3e62',
          coal: '#151515',    // Pitch Coal Gray
          gold: '#FFD700',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 45, 98, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
