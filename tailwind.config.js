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
        
        // Cores semânticas usando a paleta vampire
        primary: {
          DEFAULT: '#8B0000', // vermelho sangue
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
        
        secondary: {
          DEFAULT: '#2D1B69', // roxo profundo
          50: '#F8F6FF',
          100: '#EFEBFF',
          200: '#DDD4FF', 
          300: '#C4B1FF',
          400: '#A688FF',
          500: '#2D1B69',
          600: '#1A0F3D',
          700: '#120B2E',
          800: '#0A061F',
          900: '#050310',
        },
        
        accent: {
          DEFAULT: '#FF1744', // rosa neon
          50: '#FFF0F3',
          100: '#FFDDDD',
          200: '#FFC0CB',
          300: '#FF94A3', 
          400: '#FF5722',
          500: '#FF1744',
          600: '#E00025',
          700: '#C1001D',
          800: '#A3001A',
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
        
        // Sistema de texto
        text: {
          primary: '#FFFFFF',
          secondary: '#E0E0E0', 
          muted: '#9E9E9E',
          accent: '#E91E63',
        },
      },
      
      // Gradientes baseados na nova paleta
      backgroundImage: {
        'gradient-vampire': 'linear-gradient(135deg, #000000 0%, #0A061F 30%, #8B0000 100%)',
        'gradient-blood': 'linear-gradient(135deg, #8B0000 0%, #E91E63 100%)',
        'gradient-purple': 'linear-gradient(135deg, #000000 0%, #2D1B69 100%)',
        'gradient-neon': 'linear-gradient(135deg, #E91E63 0%, #FF1744 100%)',
        'gradient-dark': 'linear-gradient(135deg, #000000 0%, #0A061F 50%, #120B2E 100%)',
        'gradient-atmospheric': 'linear-gradient(180deg, #000000 0%, #0A061F 50%, #120B2E 100%)',
      },
      
      // Sombras com as novas cores
      boxShadow: {
        'glow-magenta': '0 0 20px rgba(233, 30, 99, 0.5)',
        'glow-purple': '0 0 20px rgba(45, 27, 105, 0.5)', 
        'glow-blood': '0 0 20px rgba(139, 0, 0, 0.5)',
        'glow-neon': '0 0 30px rgba(255, 23, 68, 0.6)',
        'card-vampire': '0 4px 20px rgba(45, 27, 105, 0.3)',
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

