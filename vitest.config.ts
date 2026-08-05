import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Mirrors Nuxt 4's aliases: `@`/`~` point at the app source dir,
      // `~~` at the project root.
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    exclude: ['**/node_modules/**', '**/dist/**', '**/.{git,nuxt,output,claude}/**'],
  },
})
