/** @type {import('tailwindcss').Config} */
export default app= {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",  // App Router Pages
      "./components/**/*.{js,ts,jsx,tsx}",  // Components
      "./src/**/*.{js,ts,jsx,tsx}",  // Source Directory
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  