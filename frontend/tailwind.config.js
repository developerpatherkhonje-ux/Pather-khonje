/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
      },
      colors: {
        "midnight-ocean": "#0A2E4D",
        "deep-steel-blue": "#123E63",
        "horizon-blue": "#2F6FED",
        "soft-gold": "#C6A75E",
        "ice-blue": "#F3F8FC",
        "mist-blue": "#E8F1F8",
        "slate-gray": "#6B7280",
        "near-black": "#0B0F14",
      },
    },
  },
  plugins: [],
};
