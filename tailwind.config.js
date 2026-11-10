/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#070a08", 900: "#0c110e", 800: "#131a15", 700: "#1c261f", 600: "#2a372e" },
        leaf: { 300: "#a7e3b5", 400: "#7bd389", 500: "#4fb36a", 700: "#2d6a4f" },
        grain: { 200: "#f6e3a8", 300: "#efd27e", 400: "#e9c46a", 500: "#d9a441" },
        clay: { 400: "#f4a261", 500: "#e76f51" },
        sky: { 400: "#6fb7e8" },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', "Georgia", "serif"],
        sans: ['"Inter Variable"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
