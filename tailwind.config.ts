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
        terminal: {
          bg: "#0a0a0a",
          surface: "#111111",
          border: "#1e1e1e",
          "border-bright": "#2a2a2a",
          green: "#00ff88",
          red: "#ff4444",
          amber: "#ffaa00",
          blue: "#4488ff",
          dim: "#666666",
          text: "#e0e0e0",
          muted: "#888888",
        },
      },
    },
  },
  plugins: [],
};

export default config;
