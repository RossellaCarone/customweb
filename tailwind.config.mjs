/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg':        '#0A0A0F',
        'surface':   '#2A2A3A',
        'ivory':     '#F0EBE1',
        'gold':      '#C8A96E',
        'accent':    '#FF4D2E',
      },
      fontFamily: {
        display:    ['"Editorial New"', 'serif'],
        mono:       ['"DM Mono"', 'monospace'],
        narrative:  ['"Fraunces"', 'serif'],
      },
    },
  },
  plugins: [],
};
