import tailwindcss from '@tailwindcss/vite'
import transformBeforeParse from './transformers'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-05',
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
  typescript: {
    // `registry/` and `scripts/` live outside `app/`, so Nuxt 4's split
    // tsconfigs don't pick them up by default.
    tsConfig: {
      include: ['../registry/**/*'],
    },
    nodeTsConfig: {
      include: ['../scripts/**/*', '../transformers/**/*'],
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
        path: '~~/registry/examples',
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
    database: {
      type: 'd1',
      bindingName: 'DB',
    },
  },
  icon: {
    // Render icon as svg to accommodate the class selector used by shadcn
    mode: 'svg',
    // Bundle the icons we actually use so they resolve synchronously. Without
    // this, SSR falls back to fetching them over HTTP, which @nuxt/icon 2.4.1
    // cannot do under Nitro 2.13 (it calls `$fetch.native`, which the
    // per-request server `$fetch` does not expose) — every icon then renders
    // empty on the server.
    clientBundle: {
      scan: true,
    },
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
  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        d1_databases:
        [{ binding: 'DB', database_id: 'a381028a-a45e-4f8c-ad0c-0a2a0baf1b25' }],
      },
    },
  },
})
