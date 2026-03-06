import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#0f0f18",
          card: "#12121d",
          "card-hover": "#181828",
          elevated: "#1a1a2e",
        },
        text: {
          primary: "#e8e6e1",
          secondary: "#9b9a97",
          muted: "#5c5b58",
        },
        accent: {
          DEFAULT: "#d4a039",
          dim: "#b8892f",
          bright: "#f0c050",
          glow: "rgba(212, 160, 57, 0.15)",
        },
        photon: "#d4a039",
        atone: "#6b8acd",
        success: "#4ade80",
        danger: "#f87171",
        warning: "#fbbf24",
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.06)",
          accent: "rgba(212, 160, 57, 0.2)",
        },
      },
      fontFamily: {
        display: ["Instrument Serif", "Georgia", "serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ["DM Mono", "Fira Code", "monospace"],
      },
      maxWidth: {
        container: "1200px",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
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
      },
    },
  },
  plugins: [],
};

export default config;
