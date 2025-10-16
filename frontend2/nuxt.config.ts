export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],  // Chỉ cần dòng này!
  tailwindcss: {
    exposeConfig: true,  // Tùy chọn: Làm config Tailwind có sẵn trong JS
    viewer: true,        // Tùy chọn: Bật Tailwind Viewer tại /_tailwind
  },
  // Không cần css hay compatibilityDate cho Nuxt 3
})