/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sentinel: {
          navy: "#1E3A5F",
          teal: "#0D7377",
          "navy-dark": "#162B46",
          "navy-light": "#2C5282",
        },
        decision: {
          allow: "#1E8449",
          deny: "#C0392B",
          flag: "#E67E22",
        },
        risk: {
          low: "#27AE60",
          medium: "#F39C12",
          high: "#E74C3C",
        },
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
}
