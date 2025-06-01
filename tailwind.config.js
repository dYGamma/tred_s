// tailwind.config.js (в корне)

module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      // Можно добавить свои цвета или шрифты при желании
      colors: {
        // например, подписать «акцентный» синий:
        accent: {
          500: "#2563EB", // Tailwind blue-600
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
