import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        bark: {
          light: '#c4956a',
          DEFAULT: '#8B5E3C',
          dark: '#5C3317',
        },
        soil: {
          light: '#c4a882',
          DEFAULT: '#8B7355',
          dark: '#5C4A2A',
        },
        night: {
          DEFAULT: '#0a0f1e',
          soft: '#111827',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 70%, #15803d 100%)',
        'dawn-gradient':   'linear-gradient(180deg, #f97316 0%, #fb923c 30%, #fbbf24 60%, #86efac 100%)',
        'dusk-gradient':   'linear-gradient(180deg, #1e1b4b 0%, #7c3aed 30%, #f97316 70%, #052e16 100%)',
        'night-gradient':  'linear-gradient(180deg, #0a0f1e 0%, #111827 50%, #052e16 100%)',
      },
      animation: {
        'sway':     'sway 5s ease-in-out infinite',
        'float':    'float 6s ease-in-out infinite',
        'firefly':  'firefly 8s ease-in-out infinite',
        'grow-up':  'growUp 0.8s ease-out forwards',
        'fade-in':  'fadeIn 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '50%':       { transform: 'rotate(1.5deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
        firefly: {
          '0%':   { opacity: '0',   transform: 'translate(0, 0)' },
          '25%':  { opacity: '1',   transform: 'translate(20px, -30px)' },
          '50%':  { opacity: '0.5', transform: 'translate(-10px, -60px)' },
          '75%':  { opacity: '0.8', transform: 'translate(30px, -40px)' },
          '100%': { opacity: '0',   transform: 'translate(0, 0)' },
        },
        growUp: {
          '0%':   { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(34,197,94,0.3)' },
          '50%':       { boxShadow: '0 0 20px 6px rgba(34,197,94,0.6)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
