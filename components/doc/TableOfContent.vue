<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const nuxtApp = useNuxtApp()
const { data } = useActivePage()
const { activeHeadings, updateHeadings } = useScrollspy()

const toc = computed(() => {
  const result: TocLink[] = [];

  (function flatten(links?: TocLink[]) {
    if (!links)
      return
    links.forEach((link) => {
      result.push(link)
      if (link.children?.length)
        flatten(link.children)
    })
  })(data.value?.body.toc?.links)

  return result
})

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    ...document.querySelectorAll('h2'),
    ...document.querySelectorAll('h3'),
  ])
})
</script>

<template>
  <div>
    <span class="text-[13px] flex items-center gap-2">On this page</span>

    <div class="relative">
      <ul class="mt-4 space-y-2">
        <li v-for="item in toc" :key="item.id" class="h-fit flex">
          <a
            :data-indent="item.depth === 3 ? '' : undefined"
            :data-active="activeHeadings.includes(item.id) ? '' : undefined"
            class="text-[13px] data-[indent]:ml-10 data-[active]:text-primary hover:text-primary transition-colors ml-5 h-5 inline-block truncate text-muted-foreground before:content-[''] before:absolute before:left-0 before:w-[1px] before:-translate-y-1 before:h-7 before:bg-primary before:opacity-5 before:transition data-[active]:before:opacity-100"
            :href="`#${item.id}`"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
