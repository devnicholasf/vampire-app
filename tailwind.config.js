/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        // ─── Dark Fantasy UI System ───
        // Core palette used across all pages and components
        df: {
          deep:    '#050510', // Deepest backgrounds
          card:    '#0a0a1a', // Card/panel backgrounds
          input:   '#0d0d20', // Input field backgrounds
          
          red:     '#dc2626', // Primary accent red
          crimson: '#991b1b', // Darker crimson accent
          
          silver:  '#c0c0d0', // Primary text
          gold:    '#d4a647', // Gold accent text
          muted:   '#6b6b80', // Muted text
          
          'border-red':    '#7f1d1d', // Red border
          'border-silver': '#4a4a5a', // Silver/grey border
        },
        
        // Legacy semantic colors (kept for compatibility)
        primary: {
          DEFAULT: '#050510',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#050510',
        },
        
        red: {
          DEFAULT: '#DC2626',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        
        secondary: {
          DEFAULT: '#4C2B85',
          800: '#4C2B85',
          900: '#2D1B69',
          950: '#1A0F3D',
        },
        
        accent: {
          DEFAULT: '#dc2626',
        },
        
        // Dark Fantasy surface system
        background: {
          DEFAULT: '#050510',
          secondary: '#0a0a1a',
          tertiary: '#0d0d20',
          dark: '#020208',
        },
        
        surface: {
          DEFAULT: '#0a0a1a',
          dark: '#050510',
          card: '#0a0a1a',
          hover: '#0d0d20',
          light: '#14142a',
        },
        
        border: {
          primary: '#7f1d1d',
          secondary: '#4a4a5a',
          accent: '#dc2626',
          dark: '#2a2a3a',
        },
        
        text: {
          primary: '#FFFFFF',
          secondary: '#c0c0d0',
          muted: '#6b6b80',
          accent: '#dc2626',
        },
      },
      
      backgroundImage: {
        'gradient-vampire': 'linear-gradient(135deg, #050510 0%, #0a0a1a 50%, #0d0d20 100%)',
        'gradient-dark': 'linear-gradient(135deg, #050510 0%, #0a0a1a 100%)',
        'gradient-atmospheric': 'linear-gradient(180deg, #050510 0%, #0a0a1a 50%, #0d0d20 100%)',
        'gradient-red-subtle': 'radial-gradient(ellipse at 50% 30%, rgba(127, 29, 29, 0.08) 0%, transparent 70%)',
      },
      
      boxShadow: {
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-red-lg': '0 0 40px rgba(220, 38, 38, 0.12)',
        'glow-red-hover': '0 0 24px rgba(220, 38, 38, 0.3)',
        'card-df': '0 0 0 1px #4a4a5a, inset 0 1px 6px rgba(0, 0, 0, 0.5)',
        'card-df-hover': '0 0 0 1px #dc2626, 0 0 24px rgba(220, 38, 38, 0.3), inset 0 1px 6px rgba(0, 0, 0, 0.5)',
        'panel-df': '0 0 0 1px #4a4a5a, 0 0 40px rgba(220, 38, 38, 0.12), inset 0 0 80px rgba(0, 0, 0, 0.6)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
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
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 14px rgba(220, 38, 38, 0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(220, 38, 38, 0.3), 0 0 40px rgba(220, 38, 38, 0.1)' },
        },
      },
      
      borderRadius: {
        'vampire': '0.5rem',
      },
      
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
