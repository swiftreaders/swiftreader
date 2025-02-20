import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enables manual dark mode switching
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        hovertext: "var(--color-hovertext)",
      },
      backgroundImage: {
        "sr-gradient": "linear-gradient(90deg, #8e1dff, #4254ff)", // Custom gradient
        "admin-gradient": "linear-gradient(90deg, #8c52ff, #ff914d)", // Custom gradient
      },
    },
  },
  plugins: [],
} satisfies Config;
