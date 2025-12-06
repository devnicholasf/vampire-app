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
        // Sistema de cores baseado na arte oficial do Vampire: The Masquerade
        // Paleta extraída da imagem: roxos profundos, vermelhos sangue, magentas vibrantes
        
        vampire: {
          // Roxo Profundo - Backgrounds e bases
          purple: {
            DEFAULT: '#2D1B69',
            50: '#F8F6FF',
            100: '#EFEBFF', 
            200: '#DDD4FF',
            300: '#C4B1FF',
            400: '#A688FF',
            500: '#855CFF',
            600: '#7C3AED',
            700: '#6D28D9',
            800: '#4C2B85',
            900: '#2D1B69',
            950: '#1A0F3D',
          },
          
          // Vermelho Sangue - Ações críticas e alertas
          blood: {
            DEFAULT: '#8B0000',
            50: '#FFF5F5',
            100: '#FED7D7',
            200: '#FEB2B2',
            300: '#FC8181',
            400: '#F56565',
            500: '#E53E3E',
            600: '#C53030',
            700: '#9B2C2C',
            800: '#8B0000',
            900: '#742A2A',
            950: '#2D0A0A',
          },
          
          // Magenta Vibrante - Destaques e ações primárias
          magenta: {
            DEFAULT: '#E91E63',
            50: '#FDF2F8',
            100: '#FCE7F3',
            200: '#FBCFE8',
            300: '#F9A8D4',
            400: '#F472B6',
            500: '#EC4899',
            600: '#E91E63',
            700: '#BE185D',
            800: '#9D174D',
            900: '#831843',
            950: '#500724',
          },
          
          // Rosa Neon - Acentos e highlights
          neon: {
            DEFAULT: '#FF1744',
            50: '#FFF0F3',
            100: '#FFDDDD',
            200: '#FFC0CB',
            300: '#FF94A3',
            400: '#FF5722',
            500: '#FF1744',
            600: '#E00025',
            700: '#C1001D',
            800: '#A3001A',
            900: '#85001A',
            950: '#4A0009',
          }
        },
        
        // Cores semânticas usando azul escuro profissional
        primary: {
          DEFAULT: '#020618', // azul escuro profissional
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
          950: '#020618',
        },
        
        // Vermelho elegante para botões
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
          DEFAULT: '#4C2B85', // roxo mais claro e visível
          50: '#F8F6FF',
          100: '#EFEBFF',
          200: '#DDD4FF', 
          300: '#C4B1FF',
          400: '#A688FF',
          500: '#855CFF',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#4C2B85',
          900: '#2D1B69',
          950: '#1A0F3D',
        },
        
        accent: {
          DEFAULT: '#E91E63', // magenta para destaques
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4', 
          400: '#F472B6',
          500: '#E91E63',
          600: '#BE185D',
          700: '#9D174D',
          800: '#831843',
          900: '#4A0009',
        },
        
        // Cores de superfície usando harmonia roxo escuro + preto profundo
        background: {
          DEFAULT: '#000000', // preto profundo
          secondary: '#0A061F', // roxo muito escuro
          tertiary: '#120B2E', // roxo escuro
          dark: '#000000', // preto absoluto
        },
        
        surface: {
          DEFAULT: '#0A061F', // roxo muito escuro
          dark: '#000000', // preto profundo
          card: '#120B2E', // roxo escuro para cards
          hover: '#1A0F3D', // roxo médio para hover
          light: '#2D1B69', // roxo claro para elementos de destaque
        },
        
        // Sistema de bordas com tons roxos
        border: {
          primary: '#2D1B69', // roxo vampire principal
          secondary: '#4C2B85', // roxo mais claro
          accent: '#E91E63', // magenta para destaques
          dark: '#1A0F3D', // roxo escuro para bordas sutis
        },
        
        // Sistema de texto com melhor contraste
        text: {
          primary: '#FFFFFF',
          secondary: '#CBD5E1', // mais claro para melhor visibilidade
          muted: '#94A3B8', // mais claro que antes
          accent: '#E91E63',
        },
      },
      
      // Gradientes baseados na nova paleta
      backgroundImage: {
        'gradient-vampire': 'linear-gradient(135deg, #000000 0%, #020618 50%, #4C2B85 100%)',
        'gradient-professional': 'linear-gradient(135deg, #020618 0%, #0F172A 100%)',
        'gradient-purple': 'linear-gradient(135deg, #000000 0%, #2D1B69 100%)',
        'gradient-accent': 'linear-gradient(135deg, #E91E63 0%, #4C2B85 100%)',
        'gradient-dark': 'linear-gradient(135deg, #000000 0%, #020618 50%, #0F172A 100%)',
        'gradient-atmospheric': 'linear-gradient(180deg, #000000 0%, #020618 50%, #0F172A 100%)',
      },
      
      // Sombras com as novas cores
      boxShadow: {
        'glow-primary': '0 0 20px rgba(2, 6, 24, 0.6)',
        'glow-purple': '0 0 20px rgba(76, 43, 133, 0.5)', 
        'glow-accent': '0 0 20px rgba(233, 30, 99, 0.5)',
        'glow-blue': '0 0 30px rgba(2, 6, 24, 0.7)',
        'glow-red': '0 0 25px rgba(220, 38, 38, 0.6)',
        'glow-red-hover': '0 0 35px rgba(239, 68, 68, 0.8)',
        'card-vampire': '0 4px 20px rgba(76, 43, 133, 0.3)',
        'card-hover': '0 8px 30px rgba(233, 30, 99, 0.4)',
      },
      
      // Animações mantidas
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-hover': 'scaleHover 0.2s ease-in-out',
        'pulse-vampire': 'pulseVampire 2s infinite',
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
        scaleHover: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        pulseVampire: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      
      // Fontes mantidas
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

