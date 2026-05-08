import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Acceso conveniente a tokens institucionales desde el chrome del editor.
        // El render del boletín NO usa estas utilidades — usa las CSS vars
        // institucionales de uatta.css para lograr fidelidad pixel-perfect.
        "u-red": "#e73439",
        "u-blue": "#0063af",
        "u-navy": "#25306b",
        "u-navy-deep": "#1c2557",
      },
      fontFamily: {
        sans: ["'Segoe UI'", "'Work Sans'", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
