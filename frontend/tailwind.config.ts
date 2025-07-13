import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Aurum Vault Luxury Color System
        navy: {
          50: "#F8F9FB",
          100: "#E8EBF0",
          200: "#D1D8E2",
          300: "#A8B4C8",
          400: "#7A8BA3",
          500: "#4F617A",
          600: "#3D4B5F",
          700: "#2E3744",
          800: "#1D2128",
          900: "#161A20",
          950: "#0E1014",
        },
        gold: {
          50: "#FEFCF8",
          100: "#FDF9F0",
          200: "#F8F2E1",
          300: "#F0E4C1",
          400: "#E4CFA1",
          500: "#D5B978",
          600: "#C4A55E",
          700: "#A68B47",
          800: "#8A7138",
          900: "#6B5529",
        },
        // Legacy color system (maintained for compatibility)
        fill: {
          1: "rgba(255, 255, 255, 0.10)",
        },
        bankGradient: "#D5B978", // Updated to gold
        indigo: {
          500: "#6172F3",
          700: "#3538CD",
        },
        success: {
          25: "#F0FDF4",
          50: "#DCFCE7",
          100: "#DCFCE7",
          500: "#46D68C",
          600: "#16A34A",
          700: "#16A34A",
          900: "#14532D",
        },
        error: {
          25: "#FEF2F2",
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#FF5F56",
          600: "#DC2626",
          700: "#DC2626",
          900: "#7F1D1D",
        },
        warning: {
          25: "#FFFBEB",
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#FFB443",
          600: "#D97706",
          700: "#D97706",
          900: "#78350F",
        },
        pink: {
          25: "#FEF6FB",
          100: "#FCE7F6",
          500: "#EE46BC",
          600: "#DD2590",
          700: "#C11574",
          900: "#851651",
        },
        blue: {
          25: "#F5FAFF",
          100: "#D1E9FF",
          500: "#2E90FA",
          600: "#1570EF",
          700: "#175CD3",
          900: "#194185",
        },
        sky: {
          1: "#F3F9FF",
        },
        black: {
          1: "#161A20", // Updated to navy
          2: "#2E3744", // Updated to navy
        },
        gray: {
          25: "#F8FAFC",
          200: "#E2E8F0",
          300: "#CBD5E1",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "Monaco",
          "Inconsolata",
          "Roboto Mono",
          "Consolas",
          "monospace",
        ],
        serif: ["Times New Roman", "Times", "serif"],
      },
      fontSize: {
        "display-2xl": [
          "36px",
          { lineHeight: "40px", letterSpacing: "-0.3px", fontWeight: "700" },
        ],
        "display-xl": [
          "28px",
          { lineHeight: "32px", letterSpacing: "-0.2px", fontWeight: "600" },
        ],
        "display-lg": [
          "22px",
          { lineHeight: "28px", letterSpacing: "-0.1px", fontWeight: "600" },
        ],
        "body-xl": [
          "18px",
          { lineHeight: "26px", letterSpacing: "0px", fontWeight: "500" },
        ],
        "body-lg": [
          "16px",
          { lineHeight: "24px", letterSpacing: "0px", fontWeight: "500" },
        ],
        "body-md": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0px", fontWeight: "400" },
        ],
        "body-sm": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.1px", fontWeight: "400" },
        ],
        "body-xs": [
          "10px",
          { lineHeight: "14px", letterSpacing: "0.1px", fontWeight: "400" },
        ],
      },
      backgroundImage: {
        "aurum-gradient": "linear-gradient(135deg, #D5B978 0%, #E4CFA1 100%)",
        "navy-gradient": "linear-gradient(135deg, #161A20 0%, #2E3744 100%)",
        "metallic-gold":
          "linear-gradient(135deg, #D5B978 0%, #E4CFA1 25%, #F0E4C1 50%, #E4CFA1 75%, #D5B978 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        // Legacy gradients (updated)
        "bank-gradient": "linear-gradient(90deg, #D5B978 0%, #E4CFA1 100%)",
        "gradient-mesh": "url('/icons/gradient-mesh.svg')",
        "bank-green-gradient":
          "linear-gradient(90deg, #D5B978 0%, #E4CFA1 100%)",
      },
      backdropFilter: {
        "blur-sm": "blur(4px)",
        blur: "blur(8px)",
        "blur-md": "blur(12px)",
        "blur-lg": "blur(16px)",
        "blur-xl": "blur(24px)",
      },
      boxShadow: {
        form: "0px 1px 2px 0px rgba(22, 26, 32, 0.1)",
        chart:
          "0px 1px 3px 0px rgba(22, 26, 32, 0.15), 0px 1px 2px 0px rgba(22, 26, 32, 0.1)",
        profile:
          "0px 12px 16px -4px rgba(22, 26, 32, 0.15), 0px 4px 6px -2px rgba(22, 26, 32, 0.1)",
        creditCard: "8px 10px 16px 0px rgba(22, 26, 32, 0.1)",
        // Aurum Vault specific shadows
        glass: "0 8px 32px rgba(14, 16, 20, 0.3)",
        "glass-gold": "0 4px 16px rgba(213, 185, 120, 0.2)",
        "neuro-inset":
          "inset 1px 1px 2px rgba(255, 255, 255, 0.05), inset -1px -1px 2px rgba(0, 0, 0, 0.4)",
        "neuro-raised":
          "2px 2px 4px rgba(0, 0, 0, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.05)",
        luxury:
          "0 20px 40px rgba(22, 26, 32, 0.2), 0 8px 16px rgba(213, 185, 120, 0.1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "metallic-sheen": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "luxury-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(213, 185, 120, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(213, 185, 120, 0.1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "metallic-sheen": "metallic-sheen 3s ease-in-out infinite",
        "count-up": "count-up 0.6s ease-out",
        "luxury-pulse": "luxury-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
