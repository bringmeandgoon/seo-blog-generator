/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // 确保所有自定义颜色类都被生成
    {
      pattern: /^(bg|text|border|ring|shadow)-(primary|accent|dark)-(50|100|200|300|400|500|600|700|800|900|950)/,
      variants: ['hover', 'focus', 'active', 'before', 'after'],
    },
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#e6fff4',
          100: '#b3ffe0',
          200: '#80ffcc',
          300: '#4dffb8',
          400: '#1affa4',
          500: '#00D47E',
          600: '#00B86B',
          700: '#009956',
          800: '#007A44',
          900: '#005C33',
        },
        'accent': {
          50: '#e6fff4',
          100: '#b3ffe0',
          200: '#80ffcc',
          300: '#4dffb8',
          400: '#1affa4',
          500: '#00D47E',
          600: '#00B86B',
          700: '#009956',
          800: '#007A44',
          900: '#005C33',
        },
        'dark': {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#b0b0b0',
          300: '#8a8a8a',
          400: '#666666',
          500: '#444444',
          600: '#333333',
          700: '#222222',
          800: '#1a1a1a',
          900: '#111111',
          950: '#0a0a0a',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['Fira Code', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.375rem' }],
        'base': ['1rem', { lineHeight: '1.625rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.875rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.125rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '3.125rem' }],
        '6xl': ['3.75rem', { lineHeight: '3.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(251, 100%, 76%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355, 100%, 93%, 1) 0px, transparent 50%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'hover': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
        'inner-lg': 'inset 0 2px 10px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
