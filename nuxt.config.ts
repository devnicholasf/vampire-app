// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  
  modules: ['@nuxtjs/tailwindcss'],

  // SEO e performance
  app: {
    head: {
      title: 'Vampire RPG - Sistema de Campanhas',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistema de gerenciamento de campanhas de Vampire: The Masquerade' },
        { name: 'theme-color', content: '#DC2626' },
        { name: 'robots', content: 'index, follow' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&display=swap' }
      ]
    }
  },

  // TypeScript config
  typescript: {
    strict: true,
    typeCheck: false // Desabilitado para melhor performance
  },

  // Runtime config
  runtimeConfig: {
    // Chaves privadas (server-side)
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    databaseUrl: process.env.DATABASE_URL || '',
    
    public: {
      // Chaves públicas (client-side)
      apiBase: process.env.API_BASE || '/api',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  },

  // Configuração de build otimizada
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'supabase': ['@supabase/supabase-js'],
            'vue-vendor': ['vue', 'vue-router']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', '@supabase/supabase-js']
    }
  },

  // Configuração de imports otimizada
  imports: {
    global: true,
    dirs: ['composables']
  },

  // Configurações de performance
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false
  },

  // Configurações de nitro para produção
  nitro: {
    compressPublicAssets: true
  },

  // SSR habilitado (padrão Nuxt 4)
  ssr: true
})
