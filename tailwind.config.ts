import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#102A43",
          gold: "#D9E2EC",
          black: "#0B1F3A",
          paper: "#FFFFFF",
          ink: "#0F172A",
          slate: "#486581",
          blush: "#F0F4F8",
        },
      },
      boxShadow: {
        glow: "0 18px 45px rgba(16, 42, 67, 0.35)",
        soft: "0 10px 30px rgba(16, 42, 67, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
