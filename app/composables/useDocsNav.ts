export interface DocsNavLink {
  title: string
  path: string
  group: string
  label?: string
  page?: boolean
}

export interface DocsNavGroup {
  title: string
  children: DocsNavLink[]
}

/**
 * The docs navigation, shared by the sidebar and the search palette so both
 * stay in step with the content tree.
 */
export async function useDocsNav() {
  const { data } = await useAsyncData('navigation', () => queryCollectionNavigation('content'))

  const groups = computed<DocsNavGroup[]>(() =>
    (data.value?.[0]?.children ?? []).map(group => ({
      title: group.title,
      children: (group.children ?? [])
        .filter((doc: { path?: string }) => Boolean(doc.path))
        .map((doc: { title: string, path: string, label?: string, page?: boolean }) => ({
          title: doc.title,
          path: doc.path,
          label: doc.label,
          page: doc.page,
          group: group.title,
        })),
    })),
  )

  const links = computed<DocsNavLink[]>(() => groups.value.flatMap(group => group.children))

  return { groups, links }
}
