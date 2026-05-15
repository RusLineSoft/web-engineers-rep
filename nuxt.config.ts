// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    "@/assets/main.css"
  ],

  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt'
  ],

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI
  },

  pinia: {
    storesDirs: ['./stores/**', './custom-folder/stores/**'],
  },

  nitro: {
    imports: {
      presets: [
        {
          from: 'mongoose',
          imports: ['model', 'Schema'], 
        },
      ],
    },
  },
})
