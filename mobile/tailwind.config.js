/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3182ce',
          light: '#4299e1',
          dark: '#2b6cb0',
        },
        accent: '#3b82f6',
        dark: {
          bg: '#1a202c',
          card: 'rgba(25, 30, 40, 0.75)',
          text: '#f7fafc',
        },
        light: {
          bg: '#ebf8ff',
          card: 'rgba(255, 255, 255, 0.85)',
          text: '#1e293b',
        },
      },
    },
  },
  plugins: [],
};
