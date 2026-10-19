import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A0F1E",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155"
        },
        indigo: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 4px 24px -6px rgba(15, 23, 42, 0.12)",
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 32px -8px rgba(15,23,42,0.08)",
        glow: "0 0 0 1px rgba(99,102,241,0.12), 0 8px 32px -8px rgba(99,102,241,0.32)"
      },
    }
  },
  plugins: []
};

export default config;
