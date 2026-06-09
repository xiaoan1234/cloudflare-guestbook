import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // 开启 NuxtHub 并配置连接 D1
  modules: ['@nuxthub/core'],

  hub: {
    database: true
  },

  // 自动导入配置
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  // 路由配置
  pages: true,

  // TypeScript 配置
  typescript: {
    strict: true
  }
})
