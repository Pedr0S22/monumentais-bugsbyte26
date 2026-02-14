/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lettyGreen: "#54c28c",
        lettyYellow: "#f3c969",
        lettyRed: "#f87171",
        slate: {
          900: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};
