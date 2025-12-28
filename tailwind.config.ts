import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, friendly palette for elderly users
        primary: {
          50: "#fef7f0",
          100: "#fdeee0",
          200: "#fad9bc",
          300: "#f6be8c",
          400: "#f19a5a",
          500: "#ec7d36",
          600: "#dd632c",
          700: "#b84c26",
          800: "#933e25",
          900: "#773521",
          DEFAULT: "#ec7d36",
        },
        secondary: {
          50: "#f0f9f4",
          100: "#dbf0e3",
          200: "#bae0cb",
          300: "#8cc9a8",
          400: "#5aab80",
          500: "#389064",
          600: "#28734f",
          700: "#215c41",
          800: "#1d4a36",
          900: "#193d2e",
          DEFAULT: "#389064",
        },
        accent: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          DEFAULT: "#8b5cf6",
        },
        warm: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          DEFAULT: "#fef3c7",
        },
        danger: {
          DEFAULT: "#dc2626",
          light: "#fef2f2",
        },
      },
      fontSize: {
        base: ["1.125rem", { lineHeight: "1.75" }],
        lg: ["1.25rem", { lineHeight: "1.75" }],
        xl: ["1.5rem", { lineHeight: "2" }],
        "2xl": ["1.875rem", { lineHeight: "2.25" }],
        "3xl": ["2.25rem", { lineHeight: "2.5" }],
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.08)",
        glow: "0 0 40px -10px rgba(236, 125, 54, 0.3)",
        card: "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-soft": "bounceSoft 1.4s infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSoft: {
          "0%, 80%, 100%": { transform: "scale(0.8)", opacity: "0.5" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
