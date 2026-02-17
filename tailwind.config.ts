import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // We are removing the complex wildcards to be safe
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Hardcoding Zinc-950 for safety
        foreground: "#fafafa",
        primary: "#d946ef",    // Neon Pink
        secondary: "#06b6d4",  // Neon Blue
        muted: "#27272a",
        border: "#27272a",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
