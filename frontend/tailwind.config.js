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
        hoop: {
          orange: '#FF5722',
          amber: '#F59E0B',
          court: '#1E293B',
          dark: '#0B0F19',
          surface: '#111827',
          surfaceLight: '#1F2937',
          border: '#374151',
          ledGreen: '#10B981',
          ledRed: '#EF4444',
          ledYellow: '#FBBF24',
          ledCyan: '#06B6D4'
        }
      },
      fontFamily: {
        digital: ['"Orbitron"', '"Share Tech Mono"', 'ui-monospace', 'monospace'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'buzzer-flash': 'buzzerFlash 0.5s ease-in-out infinite',
      },
      keyframes: {
        buzzerFlash: {
          '0%, 100%': { backgroundColor: 'rgba(239, 68, 68, 0.9)' },
          '50%': { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}
