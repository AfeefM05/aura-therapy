/** @type {import('postcss-load-config').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Make sure Tailwind scans the `src/` directory
  ],
  plugins: {
    '@tailwindcss/postcss': {},
  },

};
export default config;
