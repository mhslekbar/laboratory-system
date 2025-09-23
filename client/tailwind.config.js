/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',                 // ← مهم جدًا
  content: [
    "./index.html",                  // ← أضف ملف الـ HTML
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        sticky: '20',   // use: z-sticky
        overlay: '900', // use: z-overlay
        modal: '1000',  // use: z-modal
      },
    },
  },
  plugins: [],
}