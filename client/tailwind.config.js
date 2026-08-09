/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: 'hsl(222, 47%, 7%)',
        cardBg: 'hsla(223, 47%, 12%, 0.65)',
        borderGlass: 'hsla(223, 30%, 25%, 0.35)',
        primaryGlow: 'hsla(252, 100%, 65%, 0.35)',
      }
    },
  },
  plugins: [],
  darkMode: 'class', // Hỗ trợ chế độ Dark Mode linh hoạt
}
