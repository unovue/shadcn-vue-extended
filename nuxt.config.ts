import tailwindcss from '@tailwindcss/vite'
import transformBeforeParse from './transformers'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  appConfig: {
    website: 'https://extended.shadcn-vue.com',
    repo: 'https://github.com/unovue/shadcn-vue-extended',
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
  ],
  eslint: {
    config: {
      standalone: false,
    },
  },
  components: {
    dirs: [
      {
        path: '~/components/mdc',
        global: true,
      },
      {
        path: '~/components/helper',
      },
      '~/components',
      {
        path: '~/registry/examples',
        pathPrefix: false,
        isAsync: true,
        global: true,
      },
    ],
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
        },
      },
    },
  },
  icon: {
    // Render icon as svg to accommodate the class selector used by shadcn
    mode: 'svg',
  },
  shadcn: {
    prefix: '',
  },
  colorMode: {
    classSuffix: '',
  },
  hooks: {
    'content:file:beforeParse': (ctx) => {
      transformBeforeParse(ctx)
    },
  },
})
