<script setup lang="ts">
// TODO: perhaps we can improve by tappign into `nuxt/mdc`'s shiki
import { createHighlighter } from 'shiki'

const props = withDefaults(defineProps<{
  code?: string
  lang?: string
}>(), {
  code: '',
  lang: 'vue',
})

const highlighter = await createHighlighter({
  themes: ['github-dark', 'github-light'],
  langs: ['vue', 'typescript'],
})

const html = ref('')

watch(props, async () => {
  html.value = ''
  html.value = highlighter.codeToHtml(props.code, {
    lang: props.lang,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  })
}, { immediate: true })
</script>

<template>
  <div class="p-4 [&_pre]:!bg-transparent text-sm" v-html="html" />
</template>

<style>
html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  /* background-color: var(--shiki-dark-bg) !important; */
  /* Optional, if you also want font styles */
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
