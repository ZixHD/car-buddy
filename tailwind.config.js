/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // 'class' avoids a react-native-css-interop web crash ("Cannot manually set
  // color scheme, as dark mode is type 'media'") — NativeWind still syncs the
  // class to the OS/browser color-scheme preference automatically in this mode.
  darkMode: 'class',
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
