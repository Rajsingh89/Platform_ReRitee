/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        universe: {
          // Using CSS variables with fallback for alpha transparency
          900: 'rgb(var(--universe-900) / <alpha-value>)',
          800: 'rgb(var(--universe-800) / <alpha-value>)',
          700: 'rgb(var(--universe-700) / <alpha-value>)',
          foreground: 'rgb(var(--universe-foreground) / <alpha-value>)',
          muted: 'rgb(var(--universe-muted) / <alpha-value>)',
          accent: "#7EE787",
          // FIXED: Now uses the CSS variable so it can be Dark Purple in Light Mode
          highlight: 'rgb(var(--universe-highlight) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        serif: ['Charter', '"Bitstream Charter"', '"Sitka Text"', 'Cambria', '"Times New Roman"', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
