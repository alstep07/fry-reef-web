import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        baseBlue: "#0052FF",
        baseBlueLight: "#E5E9FF",
        baseBg: "#020617",
        baseCard: "#0B1120",
      },
      borderRadius: {
        xl: "1rem",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      backgroundColor: {
        light: {
          primary: "#FFFFFF",
          secondary: "#F9FAFB",
          tertiary: "#F3F4F6",
        },
      },
      textColor: {
        light: {
          primary: "#1F2937",
          secondary: "#6B7280",
        },
      },
    },
  },
  plugins: [],
};

export default config;



