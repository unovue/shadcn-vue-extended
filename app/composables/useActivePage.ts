import type { ContentCollectionItem } from '@nuxt/content'

export function useActivePage() {
  const route = useRoute()
  // data will be fetch in `pages/docs/[...slug].vue`
  const { data } = useNuxtData<ContentCollectionItem | null>(route.path)

  return {
    data,
  }
}
