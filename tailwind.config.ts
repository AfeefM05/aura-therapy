import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        earthBrown: "#8B6D5A", // Rich brown for primary elements
        warmTerracotta: "#D7956E", // Warm accent color
        creamBeige: "#F5EFE7", // Light background color
        oliveGreen: "#5A6B46", // Secondary color for contrast
        sandyTan: "#E6D5B8", // Subtle tan for cards and sections
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'warm': '0 4px 14px 0 rgba(139, 109, 90, 0.15)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#8B6D5A',
          secondary: '#5A6B46',
          accent: '#D7956E',
        },
      },
    ],
  },
};

export default config;