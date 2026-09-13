/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B1F23",
        "ink-soft": "#252B31",
        paper: "#FAF9F6",
        "paper-dim": "#F0EEE8",
        teal: "#1F6F63",
        ochre: "#C77D02",
        brick: "#B3261E",
        slate: "#5B6472",
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
