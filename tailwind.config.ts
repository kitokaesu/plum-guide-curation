import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16130E",
        cream: "#FAF7F0",
        paper: "#FFFDF8",
        gold: "#A98554",
        goldSoft: "#EFE4D2",
        hairline: "#E4DCCB",
        muted: "#6E675C",
        moss: "#2F5D46",
        amber: "#8F6218",
        wine: "#8A2F2F",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "Times New Roman", "serif"],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      letterSpacing: {
        editorial: "0.24em",
      },
      boxShadow: {
        lift: "0 24px 60px -30px rgba(22, 19, 14, 0.35)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp .4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
