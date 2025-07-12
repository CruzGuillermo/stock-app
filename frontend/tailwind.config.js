// tailwind.config.js
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        rise: 'rise 20s infinite ease-in',
      },
      keyframes: {
        rise: {
          '0%': { transform: 'translateY(0)', opacity: '0.1' },
          '50%': { opacity: '0.3' },
          '100%': { transform: 'translateY(-120vh) scale(1.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
