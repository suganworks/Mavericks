/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        header: ["Press Start 2P", "monospace"],
        body: ["VT323", "monospace"], // fixed typo from VT3232 → VT323
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".glass": {
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        },
        ".glass-select": {
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "white",
        },
        ".glass-accent": {
          background: "rgba(17, 25, 40, 0.75)",
          backdropFilter: "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.125)",
        },
      });
    }
  ],
};
