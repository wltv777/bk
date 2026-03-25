import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD700',
          dark: '#F5A623',
          light: '#FFE566',
        },
        accent: '#FF6B35',
        surface: {
          DEFAULT: '#111111',
          2: '#1A1A1A',
          3: '#222222',
        },
        success: '#00FF9D',
        warning: '#FF6B35',
        danger: '#FF3B30',
        muted: '#888888',
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'Impact', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'logo-gradient': 'linear-gradient(135deg, #FFD700 0%, #F5A623 50%, #FF6B35 100%)',
        'card-gradient': 'linear-gradient(135deg, #1A1A1A 0%, #111111 100%)',
        'primary-gradient': 'linear-gradient(135deg, #FFD700 0%, #F5A623 100%)',
        'danger-gradient': 'linear-gradient(135deg, #FF3B30 0%, #FF6B35 100%)',
        'success-gradient': 'linear-gradient(135deg, #00FF9D 0%, #00CC7A 100%)',
      },
      boxShadow: {
        'primary-glow': '0 0 20px rgba(255, 215, 0, 0.3)',
        'surface-glow': '0 4px 24px rgba(0, 0, 0, 0.6)',
        'fab': '0 8px 32px rgba(255, 215, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-sm': 'bounce 1s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
