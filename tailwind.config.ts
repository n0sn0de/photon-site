import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#060d1f",
          secondary: "#0a1229",
          card: "#0d1633",
          "card-hover": "#111d40",
          elevated: "#132044",
        },
        text: {
          primary: "#e8eaf0",
          secondary: "#9ba3b8",
          muted: "#5c6478",
        },
        accent: {
          DEFAULT: "#01D7EB",
          dim: "#01b0c2",
          bright: "#33e4f5",
          glow: "rgba(1, 215, 235, 0.15)",
        },
        photon: "#01D7EB",
        atone: "#6b8acd",
        success: "#4ade80",
        danger: "#f87171",
        warning: "#fbbf24",
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.06)",
          accent: "rgba(1, 215, 235, 0.2)",
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
