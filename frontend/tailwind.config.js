/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- YE LINE SABSE ZAROORI HAI (Iske bina switch nahi chalega)
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#60A5FA',
        },
        sidebar: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          active: '#2563EB',
        },
        // Chat special tags
        tag: {
          announcement: '#DBEAFE',
          announcementText: '#1E40AF',
          assignment: '#DCFCE7',
          assignmentText: '#166534',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}