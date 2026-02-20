import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "SF Mono",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        bb: {
          bg: "#0b0e14",
          panel: "#0f1318",
          surface: "#141a22",
          header: "#1a2332",
          border: "#1c2433",
          "border-bright": "#2a3548",
          orange: "#ff8c00",
          "orange-dim": "#cc7000",
          green: "#00d26a",
          red: "#ff3b3b",
          amber: "#ffc107",
          blue: "#4a9eff",
          cyan: "#00bcd4",
          yellow: "#e6db74",
          white: "#e8eaed",
          text: "#c8ccd0",
          muted: "#6b7d93",
          dim: "#3d4f63",
        },
        // Keep terminal alias for existing components
        terminal: {
          bg: "#0b0e14",
          surface: "#141a22",
          border: "#1c2433",
          "border-bright": "#2a3548",
          green: "#00d26a",
          red: "#ff3b3b",
          amber: "#ffc107",
          blue: "#4a9eff",
          dim: "#3d4f63",
          text: "#c8ccd0",
          muted: "#6b7d93",
        },
      },
      fontSize: {
        xxs: ["0.65rem", { lineHeight: "0.85rem" }],
      },
    },
  },
  plugins: [],
};

export default config;
