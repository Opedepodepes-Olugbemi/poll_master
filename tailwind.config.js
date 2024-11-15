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
        reddit: {
          orange: '#FF4500',
          dark: '#1A1A1B',
          light: '#DAE0E6',
          hover: '#FF5414',
          card: '#FFFFFF',
          'card-dark': '#272729',
          'text-dark': '#D7DADC',
        },
      },
      fontFamily: {
        reddit: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'reddit': '0 2px 4px 0 rgba(28,28,28,0.2)',
        'reddit-dark': '0 2px 4px 0 rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
}
