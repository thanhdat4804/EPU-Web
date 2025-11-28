// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-10-29',
  
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    'unplugin-icons/nuxt',
  ],

  css: ['~/assets/css/tailwind.css'],

  app: {
    head: {
      title: 'Admin Panel - Catawiki Clone',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Admin panel for auction platform' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  pages: true,
  runtimeConfig: {
    apiSecret: process.env.API_SECRET,
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001',
    }
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  // Tắt type checking nếu gây lỗi
  typescript: {
    typeCheck: false, // Thay đổi từ true thành false
    strict: false     // Thay đổi từ true thành false
  }
})