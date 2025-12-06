// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  
  modules: ['@nuxtjs/tailwindcss'],

  app: {
    head: {
      title: 'Vampire RPG - Sistema de Campanhas',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistema de gerenciamento de campanhas de Vampire: The Masquerade' }
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
      apiBase: process.env.API_BASE || '/api'
    }
  },

  // Configuração de build
  vite: {
    optimizeDeps: {
      include: ['vue', 'vue-router']
    }
  },

  // Configuração de imports (Nuxt 4 best practice)
  imports: {
    // Permitir auto-import apenas para globals do Nuxt
    global: true,
    // Desabilitar auto-import de composables customizados
    dirs: []
  },

  // SSR habilitado (padrão Nuxt 4)
  ssr: true
})
