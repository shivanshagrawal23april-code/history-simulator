/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090909",
        surface: "#121212",
        card: "#1B1B1B",
        gold: {
          DEFAULT: "#D4AF37",
          soft: "rgba(212,175,55,0.12)",
          border: "rgba(212,175,55,0.35)",
        },
        primary: "#FFFFFF",
        secondary: "#B0B0B0",
        line: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.45)",
        glow: "0 0 40px rgba(212,175,55,0.15)",
      },
      backgroundImage: {
        "gold-radial":
          "radial-gradient(ellipse at top, rgba(212,175,55,0.08), transparent 60%)",
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out both",
        slideUp: "slideUp 0.6s ease-out both",
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        pulseGold: "pulseGold 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(212,175,55,0)" },
          "50%": { boxShadow: "0 0 30px rgba(212,175,55,0.2)" },
        },
      },
    },
  },
  plugins: [],
};
