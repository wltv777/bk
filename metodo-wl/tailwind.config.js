/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'wl-black': '#080810',
        'wl-dark': '#0d0d1a',
        'wl-card': '#111127',
        'wl-border': '#1e1e3a',
        'wl-blue': '#0066ff',
        'wl-blue-light': '#3385ff',
        'wl-blue-glow': '#0044cc',
        'wl-purple': '#7c3aed',
        'wl-purple-light': '#9d6aff',
        'wl-violet': '#4f46e5',
        'wl-gold': '#f59e0b',
        'wl-gold-light': '#fbbf24',
        'wl-gold-dark': '#d97706',
        'wl-neon': '#00d4ff',
        'wl-neon-green': '#00ff88',
        'wl-white': '#f8faff',
        'wl-gray': '#8892a4',
        'wl-gray-dark': '#4a5568',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-wl': 'linear-gradient(135deg, #0066ff 0%, #7c3aed 50%, #4f46e5 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-dark': 'linear-gradient(180deg, #080810 0%, #0d0d1a 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(17,17,39,0.9) 0%, rgba(13,13,26,0.9) 100%)',
        'gradient-hero': 'radial-gradient(ellipse at top, rgba(0,102,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(124,58,237,0.1) 0%, transparent 60%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(0,102,255,0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        'wl-glow': '0 0 30px rgba(0,102,255,0.3)',
        'wl-glow-purple': '0 0 30px rgba(124,58,237,0.3)',
        'wl-glow-gold': '0 0 30px rgba(245,158,11,0.3)',
        'wl-card': '0 4px 24px rgba(0,0,0,0.4)',
        'wl-card-hover': '0 8px 48px rgba(0,102,255,0.2)',
        'wl-neon': '0 0 20px rgba(0,212,255,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'particle': 'particle 10s linear infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0,102,255,0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0,102,255,0.6), 0 0 80px rgba(124,58,237,0.3)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100px) translateX(100px)', opacity: '0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
