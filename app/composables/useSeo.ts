// ============================================
// useSeo - Gerenciamento de SEO
// ============================================

interface SeoData {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

export const useSeo = (data: SeoData = {}) => {
  const defaultTitle = 'Vampire RPG - Sistema de Campanhas'
  const defaultDescription = 'Sistema profissional de gerenciamento de campanhas de Vampire: The Masquerade'
  
  useSeoMeta({
    title: data.title || defaultTitle,
    description: data.description || defaultDescription,
    ogTitle: data.ogTitle || data.title || defaultTitle,
    ogDescription: data.ogDescription || data.description || defaultDescription,
    ogImage: data.ogImage || '/vampire-og.jpg',
    twitterCard: 'summary_large_image',
  })

  // Título dinâmico da página
  useHead({
    title: data.title || defaultTitle,
    titleTemplate: (title) => title === defaultTitle ? title : `${title} - Vampire RPG`
  })
}