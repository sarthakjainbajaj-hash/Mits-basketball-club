/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          400: "#b91c1c",
          500: "#991b1b",
          600: "#7f1d1d",
          700: "#651111",
        },
        gold: {
          400: "#facc15",
          500: "#d4af37",
          600: "#a16207",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Cinzel", "serif"],
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.7s ease-out both",
        float: "float 6s ease-in-out infinite",
      },
      boxShadow: {
        premium:
          "0 12px 34px -16px rgba(2, 6, 23, 0.75), 0 6px 20px -10px rgba(153, 27, 27, 0.45)",
      },
    },
  },
  plugins: [],
};
