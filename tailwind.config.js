/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes:{
        pulseBorder:{
          '0%': {boxShadow: '0 0 0 0 rgba(34, 197,0, 7)', opacity: 0},
          '70%': {boxShadow: '0 0 0 10px rgba(34,197,94,0)', opacity: 0.7},
          '100%': {boxShadow: '0 0 0 0 rgba(34,197,94,0)', opacity: 1},
        }
      },
      animation:{
        pulseBorder: 'pulseBorder 1.8s infinite'
      },
      colors: {
       customYellow: '#ffde02'
      }
    },
  },
  plugins: [],
}

