/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        'phase-0': '#10b981',
        'phase-1': '#8b5cf6',
        'phase-2': '#f59e0b',
        'phase-3': '#ef4444',
        'phase-4': '#3b82f6',
        'sidebar': '#101828',
      }
    },
  },
  plugins: [],
}
