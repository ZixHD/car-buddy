/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Severity colors for DTC / reminder status. Always paired with an icon or
        // label in the UI — never used as the only signal (accessibility requirement).
        safe: '#16a34a',
        soon: '#d97706',
        stop: '#dc2626',
      },
    },
  },
  plugins: [],
};
