import { createSharedComposable, tryOnBeforeUnmount } from '@vueuse/core'
import { createHighlighter } from 'shiki'

export const useShiki = createSharedComposable(async () => {
  // TODO: perhaps we can improve by tappign into `nuxt/mdc`'s shiki
  const highlighter = await createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: ['vue', 'typescript'],
  })

  tryOnBeforeUnmount(() => {
    highlighter.dispose()
  })
  return highlighter
})
