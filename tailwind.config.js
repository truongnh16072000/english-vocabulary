/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /(bg|text|border|ring|decoration)-(indigo|teal|emerald)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'active', 'group-focus-within'],
    },
    {
      pattern: /(bg|border)-(indigo|teal|emerald)-(500|700)\/(30|50)/,
    }
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}
