/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B493D',
          primary: '#126B58',
          light: '#F8FAF9',
          ink: '#172B27',
          border: '#E2E8E5',
        },
      },
      borderRadius: {
        card: '14px',
        button: '9px',
        choice: '12px',
        chip: '6px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
