import type { Config } from "tailwindcss";
import scrollbar from "tailwind-scrollbar";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      colors: {},
    },
  },
  plugins: [scrollbar({ nocompatible: true })],
} satisfies Config;
