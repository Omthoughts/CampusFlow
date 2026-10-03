/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        background: '#F8FAFC',
        text: '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        md: '8px',
        lg: '14px',
      },
      spacing: {
        // Tailwind uses 4px base scale by default
      }
    },
  },
  plugins: [],
}
