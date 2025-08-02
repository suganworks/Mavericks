/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Header: ["Press Start 2P", "monospace"],
        body: ["VT3232", "monospace"],
    },
  },
},
  plugins: [],
}
